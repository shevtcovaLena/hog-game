import { Viewport } from "pixi-viewport";

/**
 * UIManager — управление HTML UI (header, footer, модалки)
 */
class UIManager {
  private startTime: number = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // DOM элементы
  private timerEl = document.getElementById("timer")!;
  private scoreEl = document.getElementById("score")!;
  private winPopup = document.getElementById("win-popup")!;
  private infoPopup = document.getElementById("info-popup")!;
  private zoomInBtn = document.getElementById("zoom-in")!;
  private zoomOutBtn = document.getElementById("zoom-out")!;
  private resetBtn = document.getElementById("reset-btn")!;
  private infoBtn = document.getElementById("info-btn")!;
  private restartPopupBtn = document.getElementById("restart-popup-btn")!;
  private closeInfoBtn = document.getElementById("close-info-btn")!;

  // bound handlers for removal
  private zoomInHandler: EventListener | null = null;
  private zoomOutHandler: EventListener | null = null;
  private resetHandler: EventListener | null = null;
  private infoBtnHandler: EventListener | null = null;
  private closeInfoHandler: EventListener | null = null;
  private infoPopupClickHandler: EventListener | null = null;
  private winPopupClickHandler: EventListener | null = null;
  private restartPopupHandler: EventListener | null = null;

  constructor() {
    this.setupEventListeners();
    this.startTime = Date.now();
  }

  /**
   * Подключить кнопки управления камерой
   */
  public connectControls(viewport: Viewport) {
    this.zoomInHandler = (e: Event) => {
      void e;
      const currentZoom = viewport.scale.x;
      const newZoom = Math.min(currentZoom + 0.2, 3);
      viewport.scale.set(newZoom);
    };
    this.zoomOutHandler = (e: Event) => {
      void e;
      const currentZoom = viewport.scale.x;
      const newZoom = Math.max(currentZoom - 0.2, 1);
      viewport.scale.set(newZoom);
    };
    this.resetHandler = (e: Event) => {
      void e;
      viewport.position.set(0, 0);
      viewport.scale.set(1);
    };

    this.zoomInBtn.addEventListener("click", this.zoomInHandler);
    this.zoomOutBtn.addEventListener("click", this.zoomOutHandler);
    this.resetBtn.addEventListener("click", this.resetHandler);
  }

  /**
   * Назначить callback на перезагрузку
   */
  public onRestart(callback: () => void) {
    this.restartPopupHandler = (e: Event) => {
      void e;
      callback();
      this.hideWin();
    };
    this.restartPopupBtn.addEventListener("click", this.restartPopupHandler);
  }

  /**
   * Показать финальный экран
   */
  public showWin() {
    this.stopTimer();
    this.winPopup.classList.remove("hidden");
  }

  /**
   * Спрятать финальный экран
   */
  public hideWin() {
    this.winPopup.classList.add("hidden");
  }

  /**
   * Обновить счетчик найденных предметов
   */
  public updateScore(current: number, total: number) {
    this.scoreEl.textContent = `🎯 ${current}/${total}`;
  }

  /**
   * Начать отсчет времени
   */
  public startTimer() {
    this.startTime = Date.now();
    // once per second is sufficient for the timer
    this.timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      const timeStr = `⏰ ${minutes}:${seconds.toString().padStart(2, "0")}`;
      this.timerEl.textContent = timeStr;
    }, 1000);
  }

  /**
   * Остановить отсчет времени
   */
  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Очистить UI при перезагрузке
   */
  public reset() {
    this.stopTimer();
    this.startTime = Date.now();
    this.timerEl.textContent = "⏰ 0:00";
    this.scoreEl.textContent = "🎯 0/6";
    this.updateScore(0, 6);
  }

  /**
   * Подключить обработчики событий
   */
  private setupEventListeners() {
    this.infoBtnHandler = (e: Event) => {
      void e;
      this.infoPopup.classList.remove("hidden");
    };
    this.infoBtn.addEventListener("click", this.infoBtnHandler);

    this.closeInfoHandler = (e: Event) => {
      void e;
      this.infoPopup.classList.add("hidden");
    };
    this.closeInfoBtn.addEventListener("click", this.closeInfoHandler);

    this.infoPopupClickHandler = (e: Event) => {
      if (e.target === this.infoPopup) {
        this.infoPopup.classList.add("hidden");
      }
    };
    this.infoPopup.addEventListener("click", this.infoPopupClickHandler);

    this.winPopupClickHandler = (e: Event) => {
      if ((e.target as HTMLElement) !== this.restartPopupBtn) {
        e.stopPropagation();
      }
    };
    this.winPopup.addEventListener("click", this.winPopupClickHandler);
  }

  /**
   * Удалить все слушатели и остановить таймер при уничтожении игры
   */
  public dispose() {
    this.stopTimer();

    try {
      if (this.infoBtnHandler) {
        this.infoBtn.removeEventListener("click", this.infoBtnHandler);
      }

      if (this.closeInfoHandler) {
        this.closeInfoBtn.removeEventListener("click", this.closeInfoHandler);
      }

      if (this.infoPopupClickHandler) {
        this.infoPopup.removeEventListener("click", this.infoPopupClickHandler);
      }

      if (this.winPopupClickHandler) {
        this.winPopup.removeEventListener("click", this.winPopupClickHandler);
      }

      if (this.zoomInHandler) {
        this.zoomInBtn.removeEventListener("click", this.zoomInHandler);
      }

      if (this.zoomOutHandler) {
        this.zoomOutBtn.removeEventListener("click", this.zoomOutHandler);
      }

      if (this.resetHandler) {
        this.resetBtn.removeEventListener("click", this.resetHandler);
      }

      if (this.restartPopupHandler) {
        this.restartPopupBtn.removeEventListener(
          "click",
          this.restartPopupHandler,
        );
      }
    } catch (e) {
      console.warn("Error during UIManager disposal:", e);
    }
  }
}

export default UIManager;
