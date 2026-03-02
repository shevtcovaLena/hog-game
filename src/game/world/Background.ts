import { Sprite, type Texture } from "pixi.js";

class Background {
  private sprite: Sprite;
  readonly baseWidth: number;
  readonly baseHeight: number;

  constructor(texture: Texture) {
    this.baseWidth = texture.width;
    this.baseHeight = texture.height;

    this.sprite = new Sprite(texture);
    // this.sprite.anchor.set(0.5);
  }

  get view(): Sprite {
    return this.sprite;
  }

  computeScale(screenW: number, screenH: number): number {
    const sx = screenW / this.baseWidth;
    const sy = screenH / this.baseHeight;
    return Math.max(sx, sy);
  }

  get worldWidth(): number {
    return this.baseWidth;
  }

  get worldHeight(): number {
    return this.baseHeight;
  }
}

export default Background;
