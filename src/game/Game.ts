import { Application, Assets, Texture, Spritesheet } from "pixi.js";
import Viewport from "pixi-viewport";
import Background from "./world/Background";
import ItemManager from "./world/ItemManager";
import UIManager from "./ui/UIManager";

class Game {
  private app = new Application();
  // viewport used as world container
  private world!: Viewport;
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

    // viewport creation after background dimensions known
    this.world = new Viewport({
      screenWidth: this.app.screen.width,
      screenHeight: this.app.screen.height,
      worldWidth: this.background.worldWidth,
      worldHeight: this.background.worldHeight,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interaction: (this.app.renderer as any).events,
    });

    this.world.drag().pinch().wheel().decelerate();
    this.world.clamp({ direction: "all" });
    this.world.clampZoom({ minScale: 1, maxScale: 3 });

    this.world.addChild(this.background.view);
    this.app.stage.addChild(this.world);

    const resizeWorld = () => {
      const sw = this.app.screen.width;
      const sh = this.app.screen.height;
      const scale = this.background.computeScale(sw, sh);

      this.world.scale.set(scale);
      this.world.position.set(sw / 2, sh / 2);

      this.world.resize(sw, sh);
      this.world.worldWidth = this.background.worldWidth * scale;
      this.world.worldHeight = this.background.worldHeight * scale;
      this.world.clamp();
      this.world.clampZoom({ minScale: scale, maxScale: 3 });
    };
    this.resizeWorld = resizeWorld;

    this.ui = new UIManager(this.app);
    this.app.stage.addChild(this.ui.view);

    this.spawnItems();

    window.addEventListener("resize", () => {
      resizeWorld();
      this.world.clamp();
    });

    resizeWorld();
    this.world.clamp();

    console.log("Game started");
  }

  private spawnItems() {
    if (this.itemsManager) {
      this.world.removeChild(this.itemsManager.view);
    }
    this.itemsManager = new ItemManager(
      this.textures,
      this.background,
      6,
      this.app.ticker,
      () => this.endGame(),
    );
    this.world.addChild(this.itemsManager.view);
  }

  private endGame() {
    console.log("Game ended - all items collected!");
    this.ui.showWin(() => this.restart());
  }

  private restart() {
    console.log("Restarting game...");
    this.ui.hideWin();
    this.resizeWorld();
    this.world.clamp();
    this.spawnItems();
  }

  private resizeWorld: () => void = () => {};
}

export default Game;
