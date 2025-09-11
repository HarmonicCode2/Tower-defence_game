import { Container, Sprite, Graphics, Text } from "pixi.js";
import { getEngine } from "../getEngine";
import { GameScreen } from "./gameScreen";

export class MenuScreen extends Container {
  public static assetBundles = ["main"];
  private menuLogo: Sprite;
  private startBtn: Sprite;
  private towerLogo: Sprite;

  private instructionPopup: Container;
  private popupBg: Graphics;
  private overlay: Graphics;
  private closeBtn: Graphics;
  private titleText: Text;
  private instructionText: Text;

  constructor() {
    super();
    const engine = getEngine();

    this.menuLogo = Sprite.from("menu-bg.svg");
    this.menuLogo.anchor.set(0);
    this.addChild(this.menuLogo);

    this.towerLogo = Sprite.from("tower-logo.svg");
    this.towerLogo.anchor.set(0.5);
    this.towerLogo.scale.set(2);
    this.addChild(this.towerLogo);

    this.startBtn = Sprite.from("startbtn.svg");
    this.startBtn.anchor.set(0.5);
    this.addChild(this.startBtn);

    this.startBtn.eventMode = "static";
    this.startBtn.cursor = "pointer";

    this.instructionPopup = new Container();
    this.instructionPopup.visible = false;
    this.addChild(this.instructionPopup);

    this.overlay = new Graphics();
    this.overlay.beginFill(0x000000, 0.6);
    this.overlay.drawRect(0, 0, 100, 100);
    this.overlay.endFill();
    this.instructionPopup.addChild(this.overlay);

    this.popupBg = new Graphics();
    this.popupBg.beginFill(0x1e1e1e, 0.95);
    this.popupBg.drawRoundedRect(0, 0, 400, 350, 20);
    this.popupBg.endFill();
    this.instructionPopup.addChild(this.popupBg);

    this.titleText = new Text("🎮 Game Instructions", {
      fontFamily: "Arial",
      fontSize: 50,
      fontWeight: "bold",
      fill: 0xffd700,
      align: "center",
    });
    this.titleText.anchor.set(0.5, -0.3);
    this.instructionPopup.addChild(this.titleText);

    this.instructionText = new Text(
      "- Place towers on 5 available spots.\n" +
        "- Each spot can hold only ONE tower.\n" +
        "- Choose from 3 tower types:\n" +
        "   • Simple Tower (Free)\n" +
        "   • Cannon Tower (200 coins)\n" +
        "   • Fire Tower (300 coins)\n" +
        "- Defeat enemies to earn 20 coins per kill.\n" +
        "- There are 3 waves: Easy, Medium, Hard.\n" +
        "- Stronger towers deal more damage per hit.\n" +
        "- Defeat as many enemies as possible for a high score and victory!\n\n" +
        "Tap close to start your battle!",
      {
        fontFamily: "Arial",
        fontSize: 25,
        fill: 0xffffff,
        align: "left",
        wordWrap: true,
        wordWrapWidth: 360,
      }
    );
    this.instructionText.anchor.set(0.5, -0.3);
    this.instructionPopup.addChild(this.instructionText);

    this.closeBtn = new Graphics();
    this.closeBtn.beginFill(0xff4444);
    this.closeBtn.drawCircle(0, 0, 20);
    this.closeBtn.endFill();
    this.closeBtn.eventMode = "static";
    this.closeBtn.cursor = "pointer";
    this.instructionPopup.addChild(this.closeBtn);

    this.startBtn.on("pointertap", () => {
      this.showPopup();
    });

    this.closeBtn.on("pointertap", () => {
      this.hidePopup();
      engine.navigation.showScreen(GameScreen);
    });
  }

  public resize(width: number, height: number) {
    this.menuLogo.width = width;
    this.menuLogo.height = height;

    this.startBtn.position.set(width / 2, height / 1.4);
    this.towerLogo.position.set(width / 2, height / 2.3);



    this.popupBg.width = width * 0.7;
    this.popupBg.height = height * 0.65;

    this.instructionPopup.position.set(
      width / 2 - this.popupBg.width / 2,
      height / 2 - this.popupBg.height / 2
    );

    this.titleText.position.set(this.popupBg.width / 2, 20);

    this.instructionText.style.wordWrapWidth = this.popupBg.width - 40;
    this.instructionText.position.set(this.popupBg.width / 2, 60);

    this.closeBtn.position.set(this.popupBg.width - 30, 30);
  }

  private showPopup() {
    this.instructionPopup.visible = true;
  }

  private hidePopup() {
    this.instructionPopup.visible = false;
  }

  public async show() {
    this.alpha = 1;
  }

  public async hide() {
    this.alpha = 0;
  }
}
