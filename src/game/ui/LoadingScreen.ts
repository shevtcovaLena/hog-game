class LoadingScreen {
  private screen: HTMLElement;
  private barFill: HTMLElement;
  private percentEl: HTMLElement;
  private textEl: HTMLElement;

  constructor() {
    this.screen = document.getElementById("loading-screen")!;
    this.barFill = document.getElementById("loading-bar-fill")!;
    this.percentEl = document.getElementById("loading-percent")!;
    this.textEl = this.screen.querySelector(".loading-text")!;
  }

  /**
   * Обновить прогресс (0-100)
   */
  public update(percent: number, text?: string): void {
    const clamped = Math.max(0, Math.min(100, percent));
    this.barFill.style.width = `${clamped}%`;
    this.percentEl.textContent = `${Math.round(clamped)}%`;
    if (text) {
      this.textEl.textContent = text;
    }
  }

  /**
   * Скрыть с анимацией
   */
  public hide(callback?: () => void): void {
    this.screen.classList.add("hidden");
    // Удаляем из DOM после анимации (опционально)
    setTimeout(() => {
      if (this.screen.parentNode) {
        this.screen.parentNode.removeChild(this.screen);
      }
      callback?.();
    }, 500);
  }

  /**
   * Показать ошибку
   */
  public showError(message: string, onRetry?: () => void): void {
    this.screen.classList.add("error");
    this.textEl.textContent = message;

    if (onRetry) {
      const btn = document.createElement("button");
      btn.id = "loading-retry-btn";
      btn.textContent = "🔄 Обновить";
      btn.addEventListener("click", () => onRetry());
      this.screen.appendChild(btn);
    }
  }
}

export default LoadingScreen;
