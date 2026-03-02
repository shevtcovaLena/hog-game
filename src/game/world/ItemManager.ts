import { Container, Sprite, Texture, Ticker } from "pixi.js";
import Background from "./Background";

class ItemManager {
  private container = new Container();
  private items: Sprite[] = [];

  constructor(
    private atlasTextures: Record<string, Texture>,
    private bg: Background,
    private count: number,
    private ticker: Ticker,
    private onComplete: () => void,
  ) {
    if (!this.atlasTextures) {
      throw new Error("ItemManager: atlasTextures is undefined");
    }
    this.spawnRandomItems();
  }

  get view() {
    return this.container;
  }

  private spawnRandomItems() {
    const objectKeys = Object.keys(this.atlasTextures).filter((key) =>
      key.startsWith("obj-lvl-0/"),
    );

    if (objectKeys.length < this.count) {
      console.warn("Не хватает объектов в атласе для spawnRandomItems");
    }

    const selectedKeys = objectKeys
      .sort(() => Math.random() - 0.5)
      .slice(0, this.count);

    const worldWidth = this.bg.worldWidth;
    const worldHeight = this.bg.worldHeight;
    const padding = 50;

    // background без якоря: (0,0) это левый верхний угол
    // центр фона в координатах спрайта: (worldWidth/2, worldHeight/2)
    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;

    selectedKeys.forEach((key) => {
      const item = new Sprite(this.atlasTextures[key]);
      item.anchor.set(0.5);
      item.interactive = true;
      item.eventMode = "static";
      item.cursor = "pointer";

      // позиция относительно центра фона с паддингом
      const offsetX = (Math.random() - 0.5) * (worldWidth - padding * 2);
      const offsetY = (Math.random() - 0.5) * (worldHeight - padding * 2);
      const x = centerX + offsetX;
      const y = centerY + offsetY;

      item.position.set(x, y);

      item.on("pointertap", () => this.collect(item));

      this.container.addChild(item);
      this.items.push(item);
    });

    console.log("Spawned items:", this.items.length, selectedKeys);
  }

  private collect(item: Sprite) {
    item.eventMode = "none";

    let t = 0;
    const anim = () => {
      t += 0.08;
      item.scale.set(1 - t);
      item.alpha = 1 - t;

      if (t >= 1) {
        this.ticker.remove(anim);
        item.destroy();
        this.items = this.items.filter((i) => i !== item);

        if (this.items.length === 0) {
          this.onComplete();
        }
      }
    };

    this.ticker.add(anim);
  }
}

export default ItemManager;
