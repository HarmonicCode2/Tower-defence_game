import { Graphics } from "pixi.js";

export class Axe extends Graphics {
    public speed = 3;
    public target: Graphics;
    public damage: number = 1;

    constructor(startX: number, startY: number, target: Graphics, damage: number = 1) {
        super();
        this.target = target;
        this.damage = damage;

        this.beginFill(0x8b4513);
        this.drawRect(-2, -15, 4, 30);
        this.endFill();

        this.beginFill(0xaaaaaa);
        this.moveTo(0, -20);
        this.lineTo(6, -10);
        this.lineTo(-6, -10);
        this.closePath();
        this.endFill();

        this.beginFill(0xff0000);
        this.moveTo(0, 15);
        this.lineTo(5, 25);
        this.lineTo(-5, 25);
        this.closePath();
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

        this.rotation = Math.atan2(dy, dx) + Math.PI / 2;
        return false;
    }
}
