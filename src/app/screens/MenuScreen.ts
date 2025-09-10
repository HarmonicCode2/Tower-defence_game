import { Container, Sprite } from "pixi.js";
import{getEngine} from "../getEngine";
import { GameScreen } from "./gameScreen";

export class MenuScreen extends Container {
  public static assetBundles = ["main"]; 
  private menuLogo: Sprite;
  private startBtn:Sprite;
  private towerLogo:Sprite;


  constructor() {
    super();
    const engine =getEngine();

    this.menuLogo = Sprite.from("menu-bg.svg");
    this.menuLogo.anchor.set(0);
    this.addChild(this.menuLogo);

    this.towerLogo=Sprite.from ("tower-logo.svg");
    this.towerLogo.anchor.set(0.5);
    this.towerLogo.scale.set(2);
    this.addChild(this.towerLogo);

    

    this.startBtn=Sprite.from("startbtn.svg");
    this.startBtn.anchor.set(0.5);
    this.addChild(this.startBtn);

    this.startBtn.eventMode="static";
    this.startBtn.cursor="pointer";
    
    this.startBtn.on("pointertap", () => {
      engine.navigation.showScreen(GameScreen);
    });

    

  }

  public resize(width: number, height: number) {
   this.menuLogo.width=width;
   this.menuLogo.height=height;

   this.startBtn.position.set(width/2,height/1.4);
   this.towerLogo.position.set(width/2,height/2.3);
   

  }

  public async show() {
    this.alpha = 1;
  }

  public async hide() {
    this.alpha = 0;
  }
}


