import { Container, Graphics, Text, Application } from "pixi.js";

export class WinPopup {
  private container = new Container();

  get view() {
    return this.container;
  }

  show(app: Application) {
    this.container.removeChildren();

    const overlay = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });

    const text = new Text("Поздравляем!\nВсе предметы найдены 🎉", {
      fill: 0xffffff,
      fontSize: 36,
      align: "center",
    });

    text.anchor.set(0.5);
    text.position.set(app.screen.width / 2, app.screen.height / 2);

    this.container.addChild(overlay, text);
  }

  resize(app: Application) {
    this.show(app);
  }
}
