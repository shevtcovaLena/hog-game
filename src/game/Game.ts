import { Application, Assets, Container, Texture, Spritesheet } from "pixi.js";
import { Viewport } from "pixi-viewport";
import Background from "./world/Background";
import ItemManager from "./world/ItemManager";
import UIManager from "./ui/UIManager";
import LoadingScreen from "./ui/LoadingScreen";

class Game {
  private app = new Application();
  private world!: Viewport;
  private worldContent!: Container;
  private ui!: UIManager;
  private loader!: LoadingScreen;

  private background!: Background;
  private itemsManager!: ItemManager;
  private textures!: Record<string, Texture>;

  private readonly ITEMS_COUNT = 6;

  // bound handlers so they can be removed on destroy
  private handleResize = () => this.onScreenChange();
  private handleOrientation = () => this.onScreenChange();

  async start() {
    // 1. СОЗДАЁМ ЛОАДЕР ПЕРВЫМ (до всего)
    this.loader = new LoadingScreen(); // ← ДОБАВИТЬ

    // 2. Инициализируем приложение
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      backgroundColor: 0x1a1a1a, // ← ИЗМЕНИТЬ с 0x000000 на 0x1a1a1a
    });

    try {
      // 4. Загрузка с прогрессом
      this.loader.update(10, "Загрузка текстур..."); // ← ДОБАВИТЬ

      const atlas = await Assets.load<Spritesheet>("/assets/level0_items.json");
      if (!atlas?.textures) {
        throw new Error("Атлас не загрузился");
      }
      this.textures = atlas.textures;

      this.loader.update(50, "Загрузка фона..."); // ← ДОБАВИТЬ

      const bgTexture = await Assets.load("/assets/back_lv0.webp");
      if (!bgTexture) {
        throw new Error("Фон не загрузился");
      }
      this.background = new Background(bgTexture);

      this.loader.update(70, "Инициализация мира..."); // ← ДОБАВИТЬ

      // 5. Инициализация мира (без изменений)
      this.world = new Viewport({
        screenWidth: this.app.screen.width,
        screenHeight: this.app.screen.height,
        worldWidth: this.app.screen.width,
        worldHeight: this.app.screen.height,
        events: this.app.renderer.events,
      });

      this.world.drag().pinch().wheel().decelerate();
      this.world.clamp({ direction: "all" });
      this.world.clampZoom({ minScale: 1, maxScale: 3 });

      this.worldContent = new Container();
      this.worldContent.addChild(this.background.view);
      this.world.addChild(this.worldContent);
      this.app.stage.addChild(this.world);

      this.loader.update(90, "Настройка UI..."); // ← ДОБАВИТЬ

      // 6. UI (без изменений)
      this.ui = new UIManager();
      this.ui.connectControls(this.world);
      this.ui.onRestart(() => this.restart());

      // 7. Resize listeners (без изменений)
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("orientationchange", this.handleOrientation);
      this.onScreenChange();

      this.loader.update(100, "Готово!"); // ← ДОБАВИТЬ

      // 8. ТЕПЕРЬ добавляем canvas в DOM (перенести сюда)
      document.getElementById("pixi-container")!.appendChild(this.app.canvas); // ← ПЕРЕНЕСТИ СЮДА

      // 9. Скрываем лоадер
      this.loader.hide(); // ← ДОБАВИТЬ

      // 10. Запуск уровня (без изменений)
      this.spawnItems();
      this.ui.startTimer();
    } catch (error) {
      // 11. Обработка ошибок
      console.error("Ошибка загрузки:", error);
      this.loader.showError("Не удалось загрузить игру", () => {
        window.location.reload();
      }); // ← ДОБАВИТЬ весь блок catch
    }
  }

  /**
   * Уничтожить игру и убрать все слушатели/ресурсы
   */
  public destroy() {
    try {
      this.loader?.hide();
    } catch (e) {
      console.error("Error hiding loader during Game destruction:", e);
    }

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
