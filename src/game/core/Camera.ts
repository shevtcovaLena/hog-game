import { Application, Container, FederatedPointerEvent } from "pixi.js";

export class Camera {
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private app: Application,
    private world: Container,
    private getWorldSize: () => { width: number; height: number },
  ) {
    this.enableDrag();
  }

  move(dx: number, dy: number) {
    this.world.position.x += dx;
    this.world.position.y += dy;
    this.clamp();
  }

  clamp() {
    const { width, height } = this.getWorldSize();

    const halfW = width / 2;
    const halfH = height / 2;

    const sw = this.app.screen.width;
    const sh = this.app.screen.height;

    if (width <= sw) {
      this.world.position.x = sw / 2;
    } else {
      const minX = sw - halfW;
      const maxX = halfW;
      this.world.position.x = Math.max(
        minX,
        Math.min(maxX, this.world.position.x),
      );
    }

    if (height <= sh) {
      this.world.position.y = sh / 2;
    } else {
      const minY = sh - halfH;
      const maxY = halfH;
      this.world.position.y = Math.max(
        minY,
        Math.min(maxY, this.world.position.y),
      );
    }
  }

  private enableDrag() {
    this.world.eventMode = "static";
    this.world.cursor = "grab";

    this.world.on("pointerdown", (e: FederatedPointerEvent) => {
      this.dragging = true;
      this.lastX = e.global.x;
      this.lastY = e.global.y;
      this.world.cursor = "grabbing";
    });

    this.world.on("pointermove", (e: FederatedPointerEvent) => {
      if (!this.dragging) return;

      const dx = e.global.x - this.lastX;
      const dy = e.global.y - this.lastY;

      this.move(dx, dy);

      this.lastX = e.global.x;
      this.lastY = e.global.y;
    });

    const stop = () => {
      this.dragging = false;
      this.world.cursor = "grab";
    };

    this.world.on("pointerup", stop);
    this.world.on("pointerupoutside", stop);
  }
}

export default Camera;
