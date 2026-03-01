import { Application, Assets, Sprite, Container } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({ resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const bgTexture = await Assets.load("/assets/back_lv0.webp");
  const background = new Sprite(bgTexture);
  background.anchor.set(0.5);

  const gameWorld = new Container();
  gameWorld.addChild(background);
  app.stage.addChild(gameWorld);

  const resizeBackground = () => {
    const scale = Math.max(
      app.screen.width / background.texture.width,
      app.screen.height / background.texture.height,
    );
    background.scale.set(scale);
    background.position.set(app.screen.width / 2, app.screen.height / 2);
  };

  const clampPosition = () => {
    const worldWidth = background.texture.width * background.scale.x;
    const worldHeight = background.texture.height * background.scale.y;
    const halfWidth = worldWidth / 2;
    const halfHeight = worldHeight / 2;
    const screenCenterX = app.screen.width / 2;
    const screenCenterY = app.screen.height / 2;

    gameWorld.position.x = Math.max(
      -halfWidth + screenCenterX,
      Math.min(halfWidth - screenCenterX, gameWorld.position.x),
    );
    gameWorld.position.y = Math.max(
      -halfHeight + screenCenterY,
      Math.min(halfHeight - screenCenterY, gameWorld.position.y),
    );
  };

  gameWorld.interactive = true;
  gameWorld.cursor = "grab";

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  gameWorld.on("pointerdown", (event) => {
    dragging = true;
    gameWorld.cursor = "grabbing";
    lastX = event.global.x;
    lastY = event.global.y;
  });

  gameWorld.on("pointermove", (event) => {
    if (dragging) {
      const deltaX = event.global.x - lastX;
      const deltaY = event.global.y - lastY;
      gameWorld.position.x += deltaX;
      gameWorld.position.y += deltaY;
      lastX = event.global.x;
      lastY = event.global.y;
    }
  });

  gameWorld.on("pointerup", () => {
    dragging = false;
    gameWorld.cursor = "grab";
  });

  gameWorld.on("pointerupoutside", () => {
    dragging = false;
    gameWorld.cursor = "grab";
  });

  // Запуск
  resizeBackground();
  app.ticker.add(() => {
    resizeBackground();
    clampPosition();
  });
})();
