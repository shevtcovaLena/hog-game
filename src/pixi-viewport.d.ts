declare module 'pixi-viewport' {
  import { Container } from 'pixi.js';

  interface ViewportOptions {
    screenWidth: number;
    screenHeight: number;
    worldWidth: number;
    worldHeight: number;
    interaction?: any;
  }

  class Viewport extends Container {
    constructor(options: ViewportOptions);
    drag(): this;
    pinch(): this;
    wheel(): this;
    decelerate(): this;
    clamp(opts?: any): this;
    clampZoom(opts?: any): this;
    resize(width: number, height: number): this;
    worldWidth: number;
    worldHeight: number;
  }

  export default Viewport;
}
