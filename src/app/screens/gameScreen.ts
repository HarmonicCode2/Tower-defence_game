import { Container, Graphics, Ticker } from "pixi.js";
import { Enemy } from "../ui/enemy";
import { Tower } from "../ui/Tower";
import { Axe } from "../ui/projectiles/Axe";
import { CannonBall } from "../ui/projectiles/CannonBall";
import { FireBall } from "../ui/projectiles/FireBall";
import { AudioManager } from "../utils/AudioManager";
import { GAME_CONSTANTS } from "../utils/constants";
import { UIManager } from "../utils/UIManager";
import { submitScore, initFirebase } from "../../firebaseClient";

export class GameScreen extends Container {
    private hudContainer: Container;
    private mapContainer: Container;
    private uiContainer: Container;
    private audioManager: AudioManager;
    private uiManager: UIManager;

    private enemies: Enemy[] = [];
    private enemyIndices: number[] = [];
    private enemyMinDistance = 35;

    private baseWidth = 1280;
    private baseHeight = 720;
    private scaleFactor = 1;

    private towers: Tower[] = [];
    private towerSpots: Graphics[] = [];

    private arrows: Axe[] = [];        
    private cannonBalls: CannonBall[] = [];
    private fireBalls: FireBall[] = [];

    private coins: number = 0;
    private lives: number = 3;
    private currentWave: number = 0;
    private enemiesInWave: number = 0;
    private enemiesDefeated: number = 0;
    private totalEnemiesDefeated: number = 0;
    private waveActive: boolean = false;
    private waveCooldown: number = 0;
    private totalHits: number = 0;

    private gameOver: boolean = false;
    private paused: boolean = false;
    private firebaseInitialized: boolean = false;

    constructor() {
        super();

        this.mapContainer = new Container();
        this.addChild(this.mapContainer);

        this.hudContainer = new Container();
        this.addChild(this.hudContainer);

        this.uiContainer = new Container();
        this.addChild(this.uiContainer);

        this.audioManager = new AudioManager();
        this.uiManager = new UIManager(
            this.uiContainer, 
            this.hudContainer,
            this
        );

        this.initFirebase();

        this.createBackground();
        this.createPath();
        this.createTowerSpots();
        this.createTrees();
        this.createBuildings();
        this.uiManager.createHUD();
        this.uiManager.createUI();
        this.uiManager.createTowerMenu();
        this.uiManager.createTowerInfoPanel();

        Ticker.shared.add(() => {
            if (this.gameOver || this.paused) return;
            this.updateWave();
            this.moveEnemies();
            this.updateTowers();
            this.updateProjectiles();
        });

        this.resize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => {
            this.resize(window.innerWidth, window.innerHeight);
        });
    }

    private async initFirebase() {
        try {
            await initFirebase();
            this.firebaseInitialized = true;
            console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
        }
    }

    public resize(width: number, height: number) {
        const scaleX = width / this.baseWidth;
        const scaleY = height / this.baseHeight;
        this.scaleFactor = Math.min(scaleX, scaleY);
        this.scale.set(this.scaleFactor);
        this.position.set(
            (width - this.baseWidth * this.scaleFactor) / 2,
            (height - this.baseHeight * this.scaleFactor) / 2
        );
    }

    private async triggerGameOver() {
        this.gameOver = true;
        this.uiManager.showGameOver(this.totalEnemiesDefeated);
        
        if (this.firebaseInitialized) {
            try {
               await submitScore(this.getUsername(), this.totalEnemiesDefeated);
                console.log("Score submitted successfully:", this.totalEnemiesDefeated);
            } catch (error) {
                console.error("Failed to submit score:", error);
            }
        } else {
            console.warn("Firebase not initialized, score not submitted");
        }
    }

    private async triggerVictory() {
        this.gameOver = true;
        this.uiManager.showVictory(this.totalEnemiesDefeated);
        
        if (this.firebaseInitialized) {
            try {
               await submitScore(this.getUsername(), this.totalEnemiesDefeated);
                console.log("Score submitted successfully:", this.totalEnemiesDefeated);
            } catch (error) {
                console.error("Failed to submit score:", error);
            }
        } else {
            console.warn("Firebase not initialized, score not submitted");
        }
    }
    private getUsername(): string {
  return localStorage.getItem("username") || "Anonymous";
}


    public startWave() {
        if (!this.waveActive && this.currentWave < GAME_CONSTANTS.WAVES.length) {
            this.createEnemies(GAME_CONSTANTS.WAVES[this.currentWave]);
            this.waveActive = true;
            this.uiManager.updateHUD(this.coins, this.lives, this.totalHits, this.currentWave + 1, GAME_CONSTANTS.WAVES.length);
        }
    }

    public toggleSound(): boolean {
        return this.audioManager.toggleSound();
    }

    public placeTowerOption(towerType: string) {
        if (!this.uiManager.selectedSpot) return;
        
        let cost = 0;
        let damage = 0;
        
        switch (towerType) {
            case "simple":
                cost = 0;
                damage = 1;
                break;
            case "cannon":
                cost = 200;
                damage = 2;
                break;
            case "fire":
                cost = 250;
                damage = 3;
                break;
        }
        
        if (this.coins >= cost) {
            const tower = new Tower(
                this.uiManager.selectedSpot.x, 
                this.uiManager.selectedSpot.y, 
                damage, 
                this.getProjectilesArray(towerType),
                towerType as "simple" | "cannon" | "fire"
            );
            
            this.towers.push(tower);
            this.mapContainer.addChild(tower);
            
            this.coins -= cost;
            this.uiManager.hideTowerMenu();
            this.uiManager.updateHUD(this.coins, this.lives, this.totalHits, this.currentWave + 1, GAME_CONSTANTS.WAVES.length);
            
            this.uiManager.selectedSpot = null;
        } else {
            this.uiManager.showLowBalanceMessage();
        }
    }

    private getProjectilesArray(towerType: string): any[] {
        switch (towerType) {
            case "simple": return this.arrows;
            case "cannon": return this.cannonBalls;
            case "fire": return this.fireBalls;
            default: return this.arrows;
        }
    }

    private createBackground() {
        const bg = new Graphics();
        bg.beginFill(0x7ec850);
        bg.drawRect(0, 0, GAME_CONSTANTS.BASE_WIDTH, GAME_CONSTANTS.BASE_HEIGHT);
        bg.endFill();
        this.mapContainer.addChild(bg);
    }

    private createPath() {
        const path = new Graphics();
        path.beginFill(0xe0c048);
        path.drawRoundedRect(200, 0, 120, 720, 30);
        path.drawRoundedRect(200, 400, 1000, 120, 50);
        path.endFill();
        this.mapContainer.addChild(path);
    }

    private createTowerSpots() {
        for (const spot of GAME_CONSTANTS.TOWER_SPOTS) {
            const axeIndicator = new Graphics();
            axeIndicator.beginFill(0xaaaaaa);
            axeIndicator.drawRect(-4, -10, 8, 10);
            axeIndicator.endFill();

            axeIndicator.beginFill(0x8b4513);
            axeIndicator.drawRect(-1, 0, 2, 10);
            axeIndicator.endFill();

            axeIndicator.x = spot.x;
            axeIndicator.y = spot.y;
            axeIndicator.interactive = true;
            axeIndicator.cursor = "pointer";

            axeIndicator.on("pointerdown", () => {
                this.uiManager.selectedSpot = { x: axeIndicator.x, y: axeIndicator.y };
                this.uiManager.showTowerMenu(axeIndicator.x, axeIndicator.y);
                axeIndicator.visible = false;
            });

            this.mapContainer.addChild(axeIndicator);
            this.towerSpots.push(axeIndicator);
        }
    }

    private createTrees() {
        const makeTree = (x: number, y: number) => {
            const tree = new Graphics();
            tree.beginFill(0x2d7d2d);
            tree.drawCircle(x, y, 30);
            tree.endFill();
            tree.beginFill(0x6b4226);
            tree.drawRect(x - 5, y + 25, 10, 20);
            tree.endFill();
            this.mapContainer.addChild(tree);
        };

        makeTree(100, 100);
        makeTree(350, 150);
        makeTree(500, 600);
        makeTree(700, 200);
        makeTree(1000, 590);
    }

    private createBuildings() {
        const house = new Graphics();
        house.beginFill(0x8b5a2b);
        house.drawRect(0, 0, 80, 60);
        house.endFill();

        house.beginFill(0x704214);
        house.drawPolygon([0, 0, 80, 0, 40, -50]);
        house.endFill();

        house.x = 1180;
        house.y = 430;
        this.mapContainer.addChild(house);

        const windmill = new Graphics();
        windmill.beginFill(0xf5deb3);
        windmill.drawRect(400, 200, 60, 100);
        windmill.endFill();
        windmill.beginFill(0xd2b48c);
        windmill.drawPolygon([400, 200, 460, 200, 430, 160]);
        windmill.endFill();
        this.mapContainer.addChild(windmill);
    }

    private createEnemies(waveData: any) {
        const offsetSpacing = 20;

        for (let i = 0; i < waveData.count; i++) {
            const enemy = new Enemy(waveData.health, waveData.speed, waveData.worth, waveData.takesHits);

            enemy.x = GAME_CONSTANTS.PATH_POINTS[0].x + (i % 2 === 0 ? -offsetSpacing : offsetSpacing);
            enemy.y = GAME_CONSTANTS.PATH_POINTS[0].y - Math.floor(i / 2) * offsetSpacing;

            this.mapContainer.addChild(enemy);
            this.enemies.push(enemy);
            this.enemyIndices.push(0);
        }

        this.enemiesInWave = waveData.count;
        this.enemiesDefeated = 0;
        this.waveActive = true;
    }

    private updateWave() {
    if (!this.waveActive) {
        this.waveCooldown--;

        if (this.waveCooldown <= 0 && this.currentWave < GAME_CONSTANTS.WAVES.length) {
            this.createEnemies(GAME_CONSTANTS.WAVES[this.currentWave]);
            this.waveActive = true;
            this.uiManager.updateHUD(this.coins, this.lives, this.totalHits, this.currentWave + 1, GAME_CONSTANTS.WAVES.length);
        }
        return;
    }

    if (this.enemies.length === 0) {
        this.waveActive = false;
        this.currentWave++;

        if (this.currentWave >= GAME_CONSTANTS.WAVES.length) {
            this.triggerVictory();
        } else {
            this.waveCooldown = 180;
        }
    }
}

    private moveEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            let index = this.enemyIndices[i];

            const target = GAME_CONSTANTS.PATH_POINTS[index + 1];
            if (!target) {
                this.mapContainer.removeChild(enemy);
                this.enemies.splice(i, 1);
                this.enemyIndices.splice(i, 1);

                this.lives--;
                this.enemiesDefeated++;
                this.uiManager.updateHUD(this.coins, this.lives, this.totalHits, this.currentWave + 1, GAME_CONSTANTS.WAVES.length);

                if (this.lives <= 0) {
                    this.triggerGameOver();
                }
                continue;
            }

            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const distToTarget = Math.sqrt(dx * dx + dy * dy);

            if (i > 0) {
                const prev = this.enemies[i - 1];
                const dxPrev = prev.x - enemy.x;
                const dyPrev = prev.y - enemy.y;
                const distPrev = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);
                if (distPrev < this.enemyMinDistance) continue;
            }

            if (distToTarget < enemy.speed) {
                enemy.x = target.x;
                enemy.y = target.y;
                this.enemyIndices[i]++;
            } else {
                enemy.x += (dx / distToTarget) * enemy.speed;
                enemy.y += (dy / distToTarget) * enemy.speed;
            }
        }
    }

    private updateTowers() {
        for (const tower of this.towers) {
            tower.update(this.enemies, this.mapContainer);
        }
    }

    private updateProjectiles() {
        this.updateProjectileArray(this.arrows);
        this.updateProjectileArray(this.cannonBalls);
        this.updateProjectileArray(this.fireBalls);
    }

    private updateProjectileArray(projectiles: (Axe | CannonBall | FireBall)[]) {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];

            const reached = projectile.update();

            if (reached && this.enemies.includes(projectile.target as Enemy)) {
                const enemy = projectile.target as Enemy;

                if (enemy.takeDamage(projectile.damage)) {
                    this.mapContainer.removeChild(enemy);
                    const enemyIndex = this.enemies.indexOf(enemy);
                    this.enemies.splice(enemyIndex, 1);
                    this.enemyIndices.splice(enemyIndex, 1);

                    this.coins += enemy.worth;
                    this.enemiesDefeated++;
                    this.totalEnemiesDefeated++;
                    this.totalHits++;
                    this.uiManager.updateHUD(
                        this.coins,
                        this.lives,
                        this.totalHits,
                        this.currentWave + 1,
                        GAME_CONSTANTS.WAVES.length
                    );
                }
            }

            if (reached) {
                this.mapContainer.removeChild(projectile);
                projectiles.splice(i, 1);
            }
        }
    }

    public getEnemies(): Enemy[] {
        return this.enemies;
    }

    public addCoins(amount: number) {
        this.coins += amount;
        this.uiManager.updateHUD(this.coins, this.lives, this.totalHits, this.currentWave + 1, GAME_CONSTANTS.WAVES.length);
    }

    public incrementHits() {
        this.totalHits++;
        this.uiManager.updateHUD(this.coins, this.lives, this.totalHits, this.currentWave + 1, GAME_CONSTANTS.WAVES.length);
    }

    public incrementEnemiesDefeated() {
        this.enemiesDefeated++;
        this.totalEnemiesDefeated++;
    }
}   
