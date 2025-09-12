import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { MenuScreen } from "./app/screens/MenuScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";
import { initFirebase } from "./firebaseClient";


import "@pixi/sound";
// In your main file or MenuScreen
await initFirebase(); // initialize Firebase
console.log("Firebase initialized!");

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: "#1E1E1E",
    resizeOptions: { minWidth: 768, minHeight: 1024, letterbox: false },
  });

  userSettings.init();
  initFirebase().catch(console.error);

  await engine.navigation.showScreen(LoadScreen);

  await engine.navigation.showScreen(MenuScreen);

})();
