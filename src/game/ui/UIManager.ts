import { Application, Container } from "pixi.js";
import { WinPopup } from "./WinPopup";

class UIManager {
  private container = new Container();
  private winPopup = new WinPopup();

  constructor(private app: Application) {
    this.container.addChild(this.winPopup.view);

    window.addEventListener("resize", () => {
      this.winPopup.resize(this.app);
    });
  }

  get view() {
    return this.container;
  }

  showWin() {
    this.winPopup.show(this.app);
  }
}

export default UIManager;
