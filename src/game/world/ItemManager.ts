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
    this.items.forEach((item) => item.destroy());
    this.items = [];
    this.container.destroy({ children: true });
  }

  private spawnRandomItems() {
    const objectKeys = Object.keys(this.atlasTextures).filter((key) =>
      key.startsWith("obj-lvl-0/"),
    );

    if (objectKeys.length < this.count) {
      console.warn("Не хватает объектов в атласе для spawnRandomItems");
    }

    const selectedKeys = this.selectRandomTexture(this.count);

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

  private selectRandomTexture(count: number): string[] {
    const textureNames = Object.keys(this.atlasTextures);
    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      const name =
        textureNames[Math.floor(Math.random() * textureNames.length)];
      selected.push(name);
    }

    return [...new Set(selected)];
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

        // Обновить счетчик в UI
        const collected = this.count - this.items.length;
        if (this.onItemCollected) {
          this.onItemCollected(collected, this.count);
        }

        // Проверить завершение
        if (this.items.length === 0) {
          this.onComplete();
        }
      }
    };

    this.ticker.add(anim);
  }
}

export default ItemManager;
