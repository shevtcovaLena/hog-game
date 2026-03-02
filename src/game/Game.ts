import { Application, Assets, Container, Texture, Spritesheet } from "pixi.js";
import Camera from "./core/Camera";
import Background from "./world/Background";
import ItemManager from "./world/ItemManager";
import UIManager from "./ui/UIManager";

class Game {
  private app = new Application();
  private world = new Container();

  async start() {
    await this.app.init({ resizeTo: window, antialias: true });
    document.getElementById("pixi-container")!.appendChild(this.app.canvas);

    const atlas = await Assets.load<Spritesheet>("/assets/level0_items.json");
    if (!atlas || !atlas.textures) {
      throw new Error("Не удалось загрузить level0 атлас с текстурами!");
    }
    const textures: Record<string, Texture> = atlas.textures;

    const bgTexture = await Assets.load("/assets/back_lv0.webp");
    const background = new Background(bgTexture);

    this.world.addChild(background.view);
    this.app.stage.addChild(this.world);

    const resizeWorld = () => {
      const sw = this.app.screen.width;
      const sh = this.app.screen.height;
      const scale = background.computeScale(sw, sh);
      this.world.scale.set(scale);
      this.world.position.set(sw / 2, sh / 2);
    };

    const ui = new UIManager(this.app);
    this.app.stage.addChild(ui.view);

    const camera = new Camera(this.app, this.world, () => {
      const s = this.world.scale.x;
      return {
        width: background.worldWidth * s,
        height: background.worldHeight * s,
      };
    });

    const items = new ItemManager(
      textures,
      background,
      6,
      this.app.ticker,
      () => ui.showWin(),
    );
    this.world.addChild(items.view);

    const onResize = () => {
      resizeWorld();
      camera.clamp();
    };
    window.addEventListener("resize", onResize);

    resizeWorld();
    camera.clamp();

    console.log("Game started");
  }
}

export default Game;
