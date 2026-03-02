import { Container, Graphics, Text, Application } from "pixi.js";

export class WinPopup {
  private container = new Container();

  get view() {
    return this.container;
  }

  show(app: Application, onRestart?: () => void) {
    this.container.removeChildren();

    const overlay = new Graphics()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x000000, alpha: 0.7 });

    const text = new Text({
      text: "Поздравляем!\nВсе предметы найдены 🎉",
      style: {
        fill: 0xffffff,
        fontSize: 36,
        align: "center",
      },
    });

    text.anchor.set(0.5);
    text.position.set(app.screen.width / 2, app.screen.height / 2 - 60);

    // Restart button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = app.screen.width / 2 - buttonWidth / 2;
    const buttonY = app.screen.height / 2 + 60;

    const buttonBg = new Graphics()
      .rect(buttonX, buttonY, buttonWidth, buttonHeight)
      .fill({ color: 0x4caf50 });
    buttonBg.eventMode = "static";
    buttonBg.cursor = "pointer";

    const buttonText = new Text({
      text: "Перезапустить",
      style: {
        fill: 0xffffff,
        fontSize: 20,
        align: "center",
      },
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(app.screen.width / 2, buttonY + buttonHeight / 2);

    if (onRestart) {
      buttonBg.on("pointertap", onRestart);
      buttonBg.on("pointerover", () => {
        buttonBg
          .clear()
          .rect(buttonX, buttonY, buttonWidth, buttonHeight)
          .fill({ color: 0x45a049 });
      });
      buttonBg.on("pointerout", () => {
        buttonBg
          .clear()
          .rect(buttonX, buttonY, buttonWidth, buttonHeight)
          .fill({ color: 0x4caf50 });
      });
    }

    this.container.addChild(overlay, text, buttonBg, buttonText);
  }

  updateLayout(app: Application) {
    if (this.container.children.length > 0) {
      const overlay = this.container.getChildAt(0) as Graphics;
      overlay
        .clear()
        .rect(0, 0, app.screen.width, app.screen.height)
        .fill({ color: 0x000000, alpha: 0.7 });

      // Update text and button positions
      if (this.container.children.length > 1) {
        const text = this.container.getChildAt(1) as Text;
        text.position.set(app.screen.width / 2, app.screen.height / 2 - 60);
      }
      if (this.container.children.length > 3) {
        const buttonText = this.container.getChildAt(3) as Text;
        buttonText.position.set(
          app.screen.width / 2,
          app.screen.height / 2 + 85,
        );
      }
    }
  }
}
