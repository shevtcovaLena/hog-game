/**
 * Хак для скрытия верхних вкладок Safari на iPhone в landscape режиме
 */
export function initSafariBarsHide() {
  // Проверяем, что это iPhone Safari
  if (!/iPhone.*Safari/.test(navigator.userAgent)) {
    return;
  }

  function manageSafariTrigger() {
    const isLandscape = window.innerWidth > window.innerHeight;
    let safariTrigger = document.getElementById("safariTrigger");
    const gameContainer = document.querySelector(
      ".game-container",
    ) as HTMLElement;

    if (isLandscape) {
      // Вычисляем синхронную высоту для всех элементов
      const triggerHeight = Math.max(200, window.innerHeight * 0.35);

      // Создаём/обновляем триггер
      if (!safariTrigger) {
        safariTrigger = document.createElement("div");
        safariTrigger.id = "safariTrigger";
        document.body.insertBefore(safariTrigger, document.body.firstChild);
      }

      safariTrigger.style.cssText = `
        height: ${triggerHeight}px;
        position: absolute; 
        top: 0; 
        width: 100%; 
        pointer-events: none;
        z-index: -1;
      `;

      // Синхронный padding для контейнера
      if (gameContainer) {
        gameContainer.style.paddingTop = `${triggerHeight}px`;
      }
    } else {
      // Удаляем в portrait
      if (safariTrigger) {
        safariTrigger.remove();
      }
      if (gameContainer) {
        gameContainer.style.paddingTop = "";
      }
    }
  }

  function forceHideSafariUI() {
    // Сначала создаём триггер
    manageSafariTrigger();

    const safariTrigger = document.getElementById("safariTrigger");
    if (!safariTrigger) return;

    // Делаем body достаточно высоким
    document.body.style.minHeight = window.innerHeight * 1.6 + "px";

    // Читаем точную высоту триггера
    const triggerHeight = parseInt(safariTrigger.style.height) || 200;

    // ✅ КЛЮЧЕВАЯ ПРОКРУТКА: точно на высоту триггера
    window.scrollTo(0, triggerHeight);
  }

  // События
  window.addEventListener("load", forceHideSafariUI);
  window.addEventListener("orientationchange", () =>
    setTimeout(forceHideSafariUI, 500),
  );
  window.addEventListener("resize", manageSafariTrigger);

  // Немедленный вызов
  if (document.readyState === "complete") {
    forceHideSafariUI();
  }
}
