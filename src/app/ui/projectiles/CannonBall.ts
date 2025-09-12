import { Graphics } from "pixi.js";

export class CannonBall extends Graphics {
    public speed = 7;
    public target: Graphics;
    public damage: number;

    constructor(startX: number, startY: number, target: Graphics, damage: number) {
        super();
        this.target = target;
        this.damage = damage;

        this.beginFill(0x333333);
        this.drawCircle(0, 0, 6);
        this.endFill();

        this.x = startX;
        this.y = startY;
    }

    update() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.speed) return true;

        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
        return false;
    }
}
