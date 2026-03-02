import { Viewport } from "pixi-viewport";

/**
 * UIManager — управление HTML UI (header, footer, модалки)
 * Отделен от Pixi сцены для независимой работы
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

  constructor() {
    this.setupEventListeners();
    this.startTime = Date.now();
  }

  /**
   * Подключить кнопки управления камерой
   */
  public connectControls(viewport: Viewport) {
    this.zoomInBtn.addEventListener("click", () => {
      const currentZoom = viewport.scale.x;
      const newZoom = Math.min(currentZoom + 0.2, 3);
      viewport.scale.set(newZoom);
    });

    this.zoomOutBtn.addEventListener("click", () => {
      const currentZoom = viewport.scale.x;
      const newZoom = Math.max(currentZoom - 0.2, 1);
      viewport.scale.set(newZoom);
    });

    this.resetBtn.addEventListener("click", () => {
      viewport.position.set(0, 0);
      viewport.scale.set(1);
    });
  }

  /**
   * Назначить callback на перезагрузку
   */
  public onRestart(callback: () => void) {
    this.restartPopupBtn.addEventListener("click", () => {
      callback();
      this.hideWin();
    });
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
    this.timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      const timeStr = `⏰ ${minutes}:${seconds.toString().padStart(2, "0")}`;
      this.timerEl.textContent = timeStr;
    }, 100);
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
    // Информация
    this.infoBtn.addEventListener("click", () => {
      this.infoPopup.classList.remove("hidden");
    });

    // Закрыть информацию
    this.closeInfoBtn.addEventListener("click", () => {
      this.infoPopup.classList.add("hidden");
    });

    // Закрыть модалку при клике вне контента
    this.infoPopup.addEventListener("click", (e) => {
      if (e.target === this.infoPopup) {
        this.infoPopup.classList.add("hidden");
      }
    });

    this.winPopup.addEventListener("click", (e) => {
      if (e.target === this.winPopup) {
        return; // Не закрывать на клик вне - нужно нажать кнопку
      }
    });

    // Запретить скрыть победный экран случайно (только через кнопку)
    this.winPopup.addEventListener("click", (e) => {
      if (e.target !== this.restartPopupBtn) {
        e.stopPropagation();
      }
    });
  }
}

export default UIManager;
