import { Container, Sprite, Graphics, Text } from "pixi.js";
import { getEngine } from "../getEngine";
import { GameScreen } from "./gameScreen";
import { setUsername } from "../utils/player";
import { initFirebase, subscribeTop20 } from "../../firebaseClient";

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

  private inputBox: Graphics;
  private inputText: Text;
  private username: string = "";

  private leaderboardContainer: Container;
  private leaderboardEntries: Text[] = [];
  private unsubLeaderboard: (() => void) | null = null;

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
    this.popupBg.drawRoundedRect(0, 0, 400, 420, 20);
    this.popupBg.endFill();
    this.instructionPopup.addChild(this.popupBg);

    this.titleText = new Text("🎮 Game Info & Leaderboard", {
      fontFamily: "Arial",
      fontSize: 40,
      fontWeight: "bold",
      fill: 0xffd700,
      align: "center",
    });
    this.titleText.anchor.set(0.5, -0.2);
    this.instructionPopup.addChild(this.titleText);

    this.instructionText = new Text(
        "- Place towers on 5 available spots.\n" +
        "- Each spot can hold only ONE tower.\n" +
        "- Choose from 3 tower types:\n" +
        "   • Simple Tower (Free)\n" +
        "   • Cannon Tower (200 coins)\n" +
        "   • Fire Tower (250 coins)\n" +
        "- Defeat enemies to earn 20 coins per kill.\n" +
         "- If you place a tower on a spot, you cannot change it or upgrade it during that entire round\n" +
        "- There are 3 waves: Easy, Medium, Hard.\n" +
        "- Stronger towers deal more damage per hit.\n" +
        "- Defeat as many enemies as possible for a high score and victory!\n\n" +
        "Tap close to start your battle!\n\n" +
        "👉 Enter username below to start:",
      {
        fontFamily: "Arial",
        fontSize: 25,
        fill: 0xffffff,
        align: "center",
        wordWrap: true,
        wordWrapWidth: 300,
      }
    );
    this.instructionText.anchor.set(0.5, -0.2);
    this.instructionPopup.addChild(this.instructionText);

    this.inputBox = new Graphics();
    this.inputBox.beginFill(0xffffff, 1);
    this.inputBox.lineStyle(2, 0x000000);
    this.inputBox.drawRoundedRect(0, 0, 300, 40, 8);
    this.inputBox.endFill();
    this.inputBox.eventMode = "static";
    this.inputBox.cursor = "text";
    this.instructionPopup.addChild(this.inputBox);

    this.inputText = new Text("Enter username...", {
      fontFamily: "Arial",
      fontSize: 18,
      fill: 0x555555,
    });
    this.inputText.anchor.set(0, 0.5);
    this.instructionPopup.addChild(this.inputText);

    this.leaderboardContainer = new Container();
    this.instructionPopup.addChild(this.leaderboardContainer);

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
      if (this.username.trim().length === 0) {
        alert("⚠️ Please enter a username first!");
        return;
      }
      setUsername(this.username.trim());
      this.hidePopup();
      engine.navigation.showScreen(GameScreen);
      if (this.unsubLeaderboard) {
        this.unsubLeaderboard();
        this.unsubLeaderboard = null;
      }
    });

    window.addEventListener("keydown", (e) => {
      if (!this.instructionPopup.visible) return;

      if (e.key === "Backspace") {
        this.username = this.username.slice(0, -1);
      } else if (e.key.length === 1) {
        this.username += e.key;
      } else if (e.key === "Enter") {
        if (this.username.trim().length > 0) {
          setUsername(this.username.trim());
          if (this.unsubLeaderboard) {
            this.unsubLeaderboard();
            this.unsubLeaderboard = null;
          }
          this.hidePopup();
          engine.navigation.showScreen(GameScreen);
        }
      }
      this.updateInputText();
    });
  }

  public resize(width: number, height: number) {
    this.menuLogo.width = width;
    this.menuLogo.height = height;

    this.startBtn.position.set(width / 2, height / 1.4);
    this.towerLogo.position.set(width / 2, height / 2.3);

    this.popupBg.width = width * 0.7;
    this.popupBg.height = height * 0.75;

    this.instructionPopup.position.set(
      width / 2 - this.popupBg.width / 2,
      height / 2 - this.popupBg.height / 2
    );

    this.titleText.position.set(this.popupBg.width / 2, 20);

    this.instructionText.style.wordWrapWidth = this.popupBg.width - 40;
    this.instructionText.position.set(this.popupBg.width / 2, 70);

    this.inputBox.position.set(
      this.popupBg.width / 2 - this.inputBox.width / 2,
      this.popupBg.height - 160
    );
    this.inputText.position.set(this.inputBox.x + 10, this.inputBox.y + 20);

    this.closeBtn.position.set(this.popupBg.width - 30, 30);

    this.leaderboardContainer.position.set(20, 170);
  }

  private updateInputText() {
    if (this.username.length === 0) {
      this.inputText.text = "Enter username...";
      this.inputText.style.fill = 0x555555;
    } else {
      this.inputText.text = this.username;
      this.inputText.style.fill = 0x000000;
    }
  }

  private showPopup() {
    this.instructionPopup.visible = true;
    initFirebase().then(() => {
      if (this.unsubLeaderboard) return;
      this.unsubLeaderboard = subscribeTop20((rows) => {
        
        this.leaderboardEntries.forEach((t) => {
          if (t.parent) t.parent.removeChild(t);
        });
        this.leaderboardEntries = [];
        rows.forEach((r: any, idx: number) => {
          const txt = new Text(`${idx + 1}. ${r.name ?? "Anonymous"} — ${r.score ?? 0}`, {
            fontSize: 18,
            fill: 0xffffff,
          });
          txt.position.set(0, idx * 26);
          this.leaderboardContainer.addChild(txt);
          this.leaderboardEntries.push(txt);
        });
      });
    });
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
