import { Application, Assets, Container, Texture, Spritesheet } from "pixi.js";
import { Viewport } from "pixi-viewport";
import Background from "./world/Background";
import ItemManager from "./world/ItemManager";
import UIManager from "./ui/UIManager";

class Game {
  private app = new Application();
  private world!: Viewport; // viewport as camera
  private worldContent!: Container; // container for content to scale together
  private ui!: UIManager;

  private background!: Background;
  private itemsManager!: ItemManager;
  private textures!: Record<string, Texture>;

  async start() {
    await this.app.init({ resizeTo: window, antialias: true });
    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    const atlas = await Assets.load<Spritesheet>("/assets/level0_items.json");
    if (!atlas || !atlas.textures) {
      throw new Error("Не удалось загрузить level0 атлас с текстурами!");
    }
    this.textures = atlas.textures;

    const bgTexture = await Assets.load("/assets/back_lv0.webp");
    this.background = new Background(bgTexture);

    this.world = new Viewport({
      screenWidth: this.app.screen.width,
      screenHeight: this.app.screen.height,
      worldWidth: this.app.screen.width,
      worldHeight: this.app.screen.height,
      events: this.app.renderer.events,
    });

    // ✅ Базовые плагины для управления
    this.world.drag().pinch().wheel().decelerate();
    this.world.clamp({ direction: "all" });
    this.world.clampZoom({ minScale: 1, maxScale: 3 });

    // ✅ Одновременный контейнер для масштабирования всего содержимого
    this.worldContent = new Container();
    this.worldContent.addChild(this.background.view);
    this.world.addChild(this.worldContent);
    this.app.stage.addChild(this.world);

    // ✅ UI поверх viewport
    this.ui = new UIManager(this.app);
    this.app.stage.addChild(this.ui.view);

    // ✅ Resize + первый запуск
    const resizeWorld = () => {
      const sw = this.app.screen.width;
      const sh = this.app.screen.height;

      // масштабируем контейнер содержимого под размер экрана
      const scale = this.background.computeScale(sw, sh);
      this.worldContent.scale.set(scale);
      this.worldContent.position.set(0, 0);

      // обновляем viewport размеры в асортинар с масштабом
      this.world.resize(sw, sh);
      const scaledW = this.background.worldWidth * scale;
      const scaledH = this.background.worldHeight * scale;
      this.world.worldWidth = scaledW;
      this.world.worldHeight = scaledH;

      // переопределяем клэмпинг с новыми размерами
      this.world.clamp({ direction: "all" });
    };
    this.resizeWorld = resizeWorld;

    window.addEventListener("resize", () => this.resizeWorld());
    this.resizeWorld();

    this.spawnItems();
  }

  private spawnItems() {
    if (this.itemsManager) {
      this.worldContent.removeChild(this.itemsManager.view);
    }
    this.itemsManager = new ItemManager(
      this.textures,
      this.background,
      6,
      this.app.ticker,
      () => this.endGame(),
    );
    this.worldContent.addChild(this.itemsManager.view);
  }

  private endGame() {
    console.log("Game ended - all items collected!");
    this.ui.showWin(() => this.restart());
  }

  private restart() {
    console.log("Restarting game...");
    this.ui.hideWin();
    this.spawnItems();
  }

  private resizeWorld: () => void = () => {};
}

export default Game;
