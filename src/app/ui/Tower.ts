import { Graphics, Container } from "pixi.js";
import { Axe } from "./projectiles/Axe";
import { CannonBall } from "./projectiles/CannonBall";
import { FireBall } from "./projectiles/FireBall";
import { Enemy } from "./enemy";

export class Tower extends Graphics {
    public cooldown = 0;
    public shootRate = 90;
    public range = 120;
    private rangeCircle: Graphics;
    public gameProjectiles: any[];
    public maxProjectiles = 5;
    public type: "simple" | "cannon" | "fire";
    public damage: number;

    constructor(x: number, y: number, damage: number, gameProjectiles: any[], type: "simple" | "cannon" | "fire") {
        super();
        this.x = x;
        this.y = y;
        this.gameProjectiles = gameProjectiles;
        this.type = type;
        this.damage = damage;

        if (type === "simple") {
            this.beginFill(0x5c4033);
            this.drawRect(-15, -40, 30, 40);
            this.endFill();

            this.beginFill(0xaaaaaa);
            this.drawRect(-10, -60, 20, 20);
            this.endFill();
        } 
        else if (type === "cannon") {
            this.beginFill(0x444444);
            this.drawCircle(0, -20, 20);
            this.endFill();

            this.beginFill(0x222222);
            this.drawRect(-8, -40, 16, 15);
            this.endFill();
        } 
        else if (type === "fire") {
            this.beginFill(0xaa0000);
            this.drawPolygon([0, -60, -20, -30, 20, -30]);
            this.endFill();

            this.beginFill(0xff6600);
            this.drawCircle(0, -40, 10);
            this.endFill();
        }

        this.rangeCircle = new Graphics();
        this.rangeCircle.beginFill(0x00ff00, 0.1);
        this.rangeCircle.lineStyle(2, 0x00ff00, 0.4);
        this.rangeCircle.drawCircle(0, -20, this.range);
        this.rangeCircle.endFill();
        this.rangeCircle.visible = false;
        this.addChild(this.rangeCircle);

        this.interactive = true;
        this.cursor = "pointer";
        this.on("pointerdown", () => {
            this.rangeCircle.visible = !this.rangeCircle.visible;
        });
    }

    update(enemies: Enemy[], mapContainer: Container) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        if (this.gameProjectiles.length >= this.maxProjectiles) return;

        const target = enemies.find(
            (e) => Math.hypot(e.x - this.x, e.y - this.y) < this.range
        );
        if (!target) return;

        let projectile: any;
        if (this.type === "simple") {
            projectile = new Axe(this.x, this.y - 20, target, this.damage);
        } else if (this.type === "cannon") {
            projectile = new CannonBall(this.x, this.y - 20, target, this.damage);
        } else {
            projectile = new FireBall(this.x, this.y - 20, target, this.damage);
        }

        mapContainer.addChild(projectile);
        this.gameProjectiles.push(projectile);

        this.cooldown = this.shootRate;
    }
}