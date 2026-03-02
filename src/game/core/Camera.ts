import { Application, Container, FederatedPointerEvent } from "pixi.js";

export class Camera {
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  // zoom state
  private currentZoom = 1.0;
  private maxZoom = 3.0;

  // touch state for pinch detection
  private touchDistance = 0;
  private lastTouchDistance = 0;

  constructor(
    private app: Application,
    private world: Container,
    private getWorldSize: () => { width: number; height: number },
    private getMinZoom: () => number, // callback to get dynamic min zoom
  ) {
    this.enableDrag();
    this.enableZoom();
  }

  move(dx: number, dy: number) {
    this.world.position.x += dx;
    this.world.position.y += dy;
    this.clamp();
  }

  /**
   * Apply zoom to the world, centered on the given screen point (optional).
   * Zoom is clamped between dynamic minZoom (to prevent showing empty space)
   * and maxZoom.
   */
  zoom(factor: number, screenX?: number, screenY?: number) {
    const minZoom = this.getMinZoom();
    const oldZoom = this.currentZoom;
    this.currentZoom = Math.max(
      minZoom,
      Math.min(this.maxZoom, this.currentZoom * factor),
    );

    const zoomRatio = this.currentZoom / oldZoom;
    this.world.scale.set(this.world.scale.x * zoomRatio);

    // if center point provided, adjust position to keep that world point centered
    if (screenX !== undefined && screenY !== undefined) {
      const cx = this.app.screen.width / 2;
      const cy = this.app.screen.height / 2;
      const dx = (screenX - cx) * (1 - zoomRatio);
      const dy = (screenY - cy) * (1 - zoomRatio);
      this.world.position.x += dx;
      this.world.position.y += dy;
    }

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

  private enableZoom() {
    // mouse wheel zoom
    this.app.canvas.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY; // negative = zoom out, positive = zoom in
        const factor = delta > 0 ? 1.1 : 0.9;
        this.zoom(factor, e.clientX, e.clientY);
      },
      { passive: false },
    );

    // touch pinch zoom
    this.app.canvas.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const dx = touch2.clientX - touch1.clientX;
          const dy = touch2.clientY - touch1.clientY;
          this.touchDistance = Math.sqrt(dx * dx + dy * dy);

          if (this.lastTouchDistance > 0) {
            // calculate pinch factor
            const factor =
              this.touchDistance / this.lastTouchDistance > 1 ? 1.05 : 0.95;
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            this.zoom(factor, centerX, centerY);
          }
          this.lastTouchDistance = this.touchDistance;
        }
      },
      { passive: true },
    );

    // reset touch distance on end
    this.app.canvas.addEventListener("touchend", () => {
      this.lastTouchDistance = 0;
    });
  }
}

export default Camera;
