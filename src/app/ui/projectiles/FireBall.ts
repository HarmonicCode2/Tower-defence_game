import { Graphics } from "pixi.js";

export class FireBall extends Graphics {
    public speed = 8;
    public target: Graphics;
    public damage: number;

    constructor(startX: number, startY: number, target: Graphics, damage: number) {
        super();
        this.target = target;
        this.damage = damage;

        const gradientColors = [0xff4500, 0xffa500, 0xffff00];
        for (let i = 0; i < gradientColors.length; i++) {
            this.beginFill(gradientColors[i], 1 - i * 0.3);
            this.drawCircle(0, 0, 10 - i * 3);
            this.endFill();
        }

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
