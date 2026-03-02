import { Application, Assets, Container, Texture, Spritesheet } from "pixi.js";
import Camera from "./core/Camera";
import Background from "./world/Background";
import ItemManager from "./world/ItemManager";
import UIManager from "./ui/UIManager";

class Game {
  private app = new Application();
  private world = new Container();
  private ui!: UIManager;

  private background!: Background;
  private camera!: Camera;
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

    this.world.addChild(this.background.view);
    this.app.stage.addChild(this.world);

    const resizeWorld = () => {
      const sw = this.app.screen.width;
      const sh = this.app.screen.height;
      const scale = this.background.computeScale(sw, sh);
      this.world.scale.set(scale);
      this.world.position.set(sw / 2, sh / 2);
    };
    this.resizeWorld = resizeWorld;

    this.ui = new UIManager(this.app);
    this.app.stage.addChild(this.ui.view);

    this.camera = new Camera(
      this.app,
      this.world,
      () => {
        const s = this.world.scale.x;
        return {
          width: this.background.worldWidth * s,
          height: this.background.worldHeight * s,
        };
      },
      // dynamic min zoom: farthest view is limited so background always covers screen
      () => {
        const sw = this.app.screen.width;
        const sh = this.app.screen.height;
        const baseScale = this.background.computeScale(sw, sh);
        const scaledWidth = this.background.worldWidth * baseScale;
        const scaledHeight = this.background.worldHeight * baseScale;

        const minZoomX = sw / scaledWidth;
        const minZoomY = sh / scaledHeight;
        return Math.max(minZoomX, minZoomY);
      },
    );

    this.spawnItems();

    window.addEventListener("resize", () => {
      resizeWorld();
      this.camera.clamp();
    });

    resizeWorld();
    this.camera.clamp();

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
    this.camera.clamp();
    this.spawnItems();
  }

  private resizeWorld: () => void = () => {};
}

export default Game;
