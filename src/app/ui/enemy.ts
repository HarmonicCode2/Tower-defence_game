import { Graphics } from "pixi.js";

export class Enemy extends Graphics {
    public health: number;
    public maxHealth: number;
    public speed: number;
    public healthBar: Graphics;
    public worth: number;
    public takesHits: number;

    constructor(health: number, speed: number, worth: number, takesHits: number = 1) {
        super();
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.worth = worth;
        this.takesHits = takesHits;

        this.beginFill(0xffcc99);
        this.drawCircle(0, -15, 10);
        this.endFill();

        this.beginFill(0x0000ff);
        this.drawRect(-5, -5, 10, 20);
        this.endFill();

        this.beginFill(0x333333);
        this.drawRect(-5, 15, 4, 10);
        this.drawRect(1, 15, 4, 10);
        this.endFill();

        this.beginFill(0x0000ff);
        this.drawRect(-10, -5, 5, 15);
        this.drawRect(5, -5, 5, 15);
        this.endFill();

        this.healthBar = new Graphics();
        this.updateHealthBar();
        this.addChild(this.healthBar);
    }

    updateHealthBar() {
        this.healthBar.clear();
        const width = 30;
        const healthRatio = this.health / this.maxHealth;

        this.healthBar.beginFill(0x000000);
        this.healthBar.drawRect(-width / 2, -30, width, 5);
        this.healthBar.endFill();

        this.healthBar.beginFill(
            healthRatio > 0.5 ? 0x00ff00 : healthRatio > 0.25 ? 0xffff00 : 0xff0000
        );
        this.healthBar.drawRect(-width / 2, -30, width * healthRatio, 5);
        this.healthBar.endFill();
    }

    takeDamage(damage: number): boolean {
        this.health -= damage;
        this.updateHealthBar();
        return this.health <= 0;
    }
}
