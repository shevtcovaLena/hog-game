import { Application, Assets, Sprite } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({ resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const bgTexture = await Assets.load("/assets/back_lv0.webp");
  const background = new Sprite(bgTexture);

  background.anchor.set(0.5);
  // background.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(background);

  const resizeBackground = () => {
    const scale = Math.max(
      app.screen.width / background.texture.width,
      app.screen.height / background.texture.height,
    );

    background.scale.set(scale);
    background.position.set(app.screen.width / 2, app.screen.height / 2);
  };

  // Первичная настройка
  resizeBackground();

  // При изменении окна
  app.ticker.add(() => {
    resizeBackground();
  });
})();
