import { Application, Assets, Container, Texture, Spritesheet } from "pixi.js";
import { Viewport } from "pixi-viewport";
import Background from "./world/Background";
import ItemManager from "./world/ItemManager";
import UIManager from "./ui/UIManager";

class Game {
  private app = new Application();
  private world!: Viewport;
  private worldContent!: Container;
  private ui!: UIManager;

  private background!: Background;
  private itemsManager!: ItemManager;
  private textures!: Record<string, Texture>;

  private readonly ITEMS_COUNT = 6;

  // bound handlers so they can be removed on destroy
  private handleResize = () => this.onScreenChange();
  private handleOrientation = () => this.onScreenChange();

  async start() {
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
    });
    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    // Загрузка атласа с текстурами предметов
    const atlas = await Assets.load<Spritesheet>("/assets/level0_items.json");
    if (!atlas?.textures) {
      console.error("Ошибка: атлас не загрузился или не содержит текстур");
      throw new Error(
        "Не удалось загрузить атлас предметов (/assets/level0_items.json)",
      );
    }
    this.textures = atlas.textures;

    // Загрузка фонового изображения
    const bgTexture = await Assets.load("/assets/back_lv0.webp");
    if (!bgTexture) {
      console.error("Ошибка: фоновое изображение не загрузилось");
      throw new Error(
        "Не удалось загрузить фоновое изображение (/assets/back_lv0.webp)",
      );
    }
    this.background = new Background(bgTexture);

    this.world = new Viewport({
      screenWidth: this.app.screen.width,
      screenHeight: this.app.screen.height,
      worldWidth: this.app.screen.width,
      worldHeight: this.app.screen.height,
      events: this.app.renderer.events,
    });

    // Базовые плагины для управления
    this.world.drag().pinch().wheel().decelerate();
    this.world.clamp({ direction: "all" });
    this.world.clampZoom({ minScale: 1, maxScale: 3 });

    // Одновременный контейнер для масштабирования всего содержимого
    this.worldContent = new Container();
    this.worldContent.addChild(this.background.view);
    this.world.addChild(this.worldContent);
    this.app.stage.addChild(this.world);

    // Инициализировать UI Manager
    this.ui = new UIManager();
    this.ui.connectControls(this.world);
    this.ui.onRestart(() => this.restart());

    // Resize + orientation
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleOrientation);
    this.onScreenChange();

    // Запустить первый уровень
    this.spawnItems();
    this.ui.startTimer();
  }

  /**
   * Уничтожить игру и убрать все слушатели/ресурсы
   */
  public destroy() {
    try {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("orientationchange", this.handleOrientation);
    } catch (e) {
      console.warn("Error during Game disposal:", e);
    }

    if (this.itemsManager) {
      this.itemsManager.cleanup();
    }

    if (this.ui && typeof this.ui.dispose === "function") {
      this.ui.dispose();
    }

    try {
      // destroy PIXI application and free textures
      const appWithDestroy = this.app as unknown as {
        destroy?: (removeView?: boolean) => void;
      };
      if (appWithDestroy.destroy) appWithDestroy.destroy(true);
    } catch (e) {
      console.warn("Error during PIXI app destruction:", e);
    }
  }

  private spawnItems() {
    // Очистить предыдущие предметы
    if (this.itemsManager) {
      this.worldContent.removeChild(this.itemsManager.view);
      this.itemsManager.cleanup();
    }

    // Спавнить новые
    this.itemsManager = new ItemManager(
      this.textures,
      this.background,
      this.ITEMS_COUNT,
      this.app.ticker,
      () => this.endGame(),
      (collected, total) => this.ui.updateScore(collected, total),
    );
    this.worldContent.addChild(this.itemsManager.view);

    // Обновить UI
    this.ui.updateScore(0, this.ITEMS_COUNT);
  }

  private endGame() {
    this.ui.showWin();
  }

  private restart() {
    this.ui.reset();
    this.spawnItems();
    this.ui.startTimer();
  }

  private onScreenChange() {
    const container = document.getElementById("pixi-container")!;
    const rect = container.getBoundingClientRect();
    const sw = rect.width;
    const sh = rect.height; // ← реальная высота flex:1!

    this.app.renderer.resize(sw, sh);
    this.resizeWorld(sw, sh);
  }

  /**
   * Пересчитать размер мира при заданной ширине/высоте экрана
   */
  private resizeWorld(sw: number, sh: number) {
    // масштабируем контейнер содержимого под размер экрана
    const scale = this.background.computeScale(sw, sh);
    this.worldContent.scale.set(scale);
    this.worldContent.position.set(0, 0);

    // обновляем viewport размеры в соответствии с масштабом
    this.world.resize(sw, sh);
    const scaledW = this.background.worldWidth * scale;
    const scaledH = this.background.worldHeight * scale;
    this.world.worldWidth = scaledW;
    this.world.worldHeight = scaledH;

    // переопределяем клэмпинг с новыми размерами
    this.world.clamp({ direction: "all" });
  }
}

export default Game;
