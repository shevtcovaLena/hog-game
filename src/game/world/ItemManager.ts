import { Container, Sprite, Texture, Ticker } from "pixi.js";
import Background from "./Background";

class ItemManager {
  private container = new Container();
  private items: Sprite[] = [];
  private tapHandlers = new WeakMap<Sprite, () => void>();
  private animMap = new WeakMap<Sprite, () => void>();

  constructor(
    private atlasTextures: Record<string, Texture>,
    private bg: Background,
    private count: number,
    private ticker: Ticker,
    private onComplete: () => void,
    private onItemCollected?: (current: number, total: number) => void,
  ) {
    if (!this.atlasTextures) {
      throw new Error("ItemManager: atlasTextures is undefined");
    }
    this.spawnRandomItems();
  }

  get view() {
    return this.container;
  }

  /**
   * Очистить все предметы и контейнер (перед перезапуском)
   */
  cleanup() {
    this.items.forEach((item) => {
      const tap = this.tapHandlers.get(item);
      if (tap) {
        item.off("pointertap", tap);
      }

      const anim = this.animMap.get(item);
      if (anim) {
        this.ticker.remove(anim);
      }

      if (!item.destroyed) item.destroy();
    });

    this.items = [];

    if (!this.container.destroyed) {
      this.container.removeChildren();
      this.container.destroy();
    }
  }

  private spawnRandomItems() {
    const objectKeys = Object.keys(this.atlasTextures).filter((key) =>
      key.startsWith("obj-lvl-0/"),
    );

    if (objectKeys.length === 0) {
      throw new Error("ItemManager: no obj-lvl-0 textures found in atlas");
    }

    if (objectKeys.length < this.count) {
      console.warn("Не хватает объектов в атласе для spawnRandomItems");
    }

    const selectedKeys = this.selectRandomTexture(this.count, objectKeys);

    const worldWidth = this.bg.worldWidth;
    const worldHeight = this.bg.worldHeight;
    const padding = 50;

    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;

    selectedKeys.forEach((key) => {
      const item = new Sprite(this.atlasTextures[key]);
      item.anchor.set(0.5);
      item.interactive = true;
      item.eventMode = "static";
      item.cursor = "pointer";

      const offsetX = (Math.random() - 0.5) * (worldWidth - padding * 2);
      const offsetY = (Math.random() - 0.5) * (worldHeight - padding * 2);
      const x = centerX + offsetX;
      const y = centerY + offsetY;

      item.position.set(x, y);

      const tapHandler = () => this.collect(item);
      this.tapHandlers.set(item, tapHandler);
      item.on("pointertap", tapHandler);

      this.container.addChild(item);
      this.items.push(item);
    });
  }

  private selectRandomTexture(count: number, available: string[]): string[] {
    const pool = [...available];

    if (pool.length >= count) {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, count);
    }

    const result = [...pool];
    while (result.length < count) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      result.push(pick);
    }
    return result;
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
        this.animMap.delete(item);

        if (!item.destroyed) item.destroy();
        this.items = this.items.filter((i) => i !== item);

        const collected = this.count - this.items.length;
        if (this.onItemCollected) {
          this.onItemCollected(collected, this.count);
        }

        if (this.items.length === 0) {
          this.onComplete();
        }
      }
    };

    this.animMap.set(item, anim);
    this.ticker.add(anim);
  }
}

export default ItemManager;
