import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Sprite, Texture } from "pixi.js";

export class LoadScreen extends Container {
  public static assetBundles = ["preload"];
  private pixiLogo: Sprite;
  private progressBar: Graphics;
  private progressBg: Graphics;
  private progressWidth: number;
  private progressHeight: number;

  constructor() {
    super();

    this.pixiLogo = new Sprite({
      texture: Texture.from("logo.svg"),
    });
    this.pixiLogo.anchor.set(0.5);
    this.addChild(this.pixiLogo);

    this.progressWidth = 400;
    this.progressHeight = 20;

    this.progressBg = new Graphics()
      .roundRect(0, 0, this.progressWidth, this.progressHeight, 10)
      .fill({ color: 0x3d3d3d, alpha: 0.5 });
    this.addChild(this.progressBg);

    this.progressBar = new Graphics()
      .roundRect(0, 0, 0, this.progressHeight, 10)
      .fill({ color: 0xe72264, alpha: 0.8 });
    this.addChild(this.progressBar);
  }

  public onLoad(progress: number) {
    const fillWidth = (this.progressWidth * progress) / 100;
    this.progressBar.clear()
      .roundRect(0, 0, fillWidth, this.progressHeight, 10)
      .fill({ color: 0xe72264, alpha: 0.8 });
  }

  public resize(width: number, height: number) {
    this.pixiLogo.position.set(width / 2, height / 2);
    this.pixiLogo.width = width;
    this.pixiLogo.height = height;

    this.progressBg.position.set((width - this.progressWidth) / 2, height - this.progressHeight - 40);
    this.progressBar.position.set((width - this.progressWidth) / 2, height - this.progressHeight - 40);
  }

  public async show() {
    this.alpha = 1;
  }

  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.7,
      ease: "linear",
      delay: 1,
    });
  }
}
