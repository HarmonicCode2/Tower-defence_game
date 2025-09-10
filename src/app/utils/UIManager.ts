import { Container, Graphics, Text } from "pixi.js";
import { GameScreen } from "../screens/gameScreen";
import { GAME_CONSTANTS } from "./constants";

export class UIManager {
    private uiContainer: Container;
    private hudContainer: Container;
    private gameScreen: GameScreen;
    public towerMenu: Container;
    public selectedSpot: {x: number; y: number} | null = null;
    
    private coinText!: Text;
    private heartText!: Text;
    private hitsText!: Text;
    private waveText!: Text;

    constructor(
        uiContainer: Container, 
        hudContainer: Container,
        gameScreen: GameScreen,
    ) {
        this.uiContainer = uiContainer;
        this.hudContainer = hudContainer;
        this.gameScreen = gameScreen;
        this.towerMenu = new Container();
        this.towerMenu.visible = false;
        this.uiContainer.addChild(this.towerMenu);
    }

    createHUD() {
        const hudBg = new Graphics();
        hudBg.beginFill(0x000000, 0.4);
        hudBg.drawRoundedRect(400, 10, 500, 50, 10);
        hudBg.endFill();
        this.hudContainer.addChild(hudBg);

        this.heartText = new Text(`❤ 3`, {
            fill: 0xff0000,
            fontSize: 20,
        });
        this.heartText.position.set(420, 20);
        this.hudContainer.addChild(this.heartText);

        this.coinText = new Text(`🪙 1000`, { fill: 0xffff00, fontSize: 20 });
        this.coinText.position.set(550, 20);
        this.hudContainer.addChild(this.coinText);

        this.hitsText = new Text(`💥 0`, { fill: 0xffffff, fontSize: 20 });
        this.hitsText.position.set(680, 20);
        this.hudContainer.addChild(this.hitsText);

        this.waveText = new Text(`💀 0/3`, { 
            fill: 0xffffff, 
            fontSize: 20 
        });
        this.waveText.position.set(800, 20);
        this.hudContainer.addChild(this.waveText);
    }

    updateHUD(coins: number, lives: number, hits: number, currentWave: number, totalWaves: number) {
        this.coinText.text = `🪙 ${coins}`;
        this.heartText.text = `❤ ${lives}`;
        this.hitsText.text = `💥 ${hits}`;
        this.waveText.text = `💀 ${currentWave}/${totalWaves}`;
    }

    createUI() {
        const pauseBtn = new Graphics();
        pauseBtn.beginFill(0x555555);
        pauseBtn.drawRoundedRect(20, 650, 90, 40, 5);
        pauseBtn.endFill();
        this.uiContainer.addChild(pauseBtn);

        const pauseText = new Text("PAUSE", {
            fontFamily: "Arial",
            fontSize: 20,
            fill: 0xffffff,
            align: "center",
        });

        pauseText.x = 35 + 40 / 2 - pauseText.width / 2;
        pauseText.y = 650 + 40 / 2 - pauseText.height / 2;
        this.uiContainer.addChild(pauseText);

        const startWaveBtn = new Graphics();
        startWaveBtn.beginFill(0xaa0000);
        startWaveBtn.drawRoundedRect(130, 650, 100, 40, 5);
        startWaveBtn.endFill();
        startWaveBtn.interactive = true;
        startWaveBtn.cursor = "pointer";

        const startText = new Text("Start Wave", {
            fill: 0xffffff,
            fontSize: 14,
        });
        startText.position.set(140, 660);
        this.uiContainer.addChild(startText);

        startWaveBtn.on("pointerdown", () => {
            this.gameScreen.startWave();
        });

        const soundBtn = new Graphics();
        soundBtn.beginFill(0x5555ff);
        soundBtn.drawRoundedRect(240, 650, 40, 40, 5);
        soundBtn.endFill();
        soundBtn.interactive = true;
        soundBtn.cursor = "pointer";
        
        const soundIcon = new Text("🔊", {
            fontSize: 20,
        });
        soundIcon.position.set(250, 655);
        
        soundBtn.on("pointerdown", () => {
            const soundEnabled = this.gameScreen.toggleSound();
            soundIcon.text = soundEnabled ? "🔊" : "🔇";
        });

        this.uiContainer.addChild(startWaveBtn, soundBtn, soundIcon);
    }

    createTowerMenu() {
        const bg = new Graphics();
        bg.beginFill(0x333333, 0.8);
        bg.drawRoundedRect(0, 0, 180, 60, 10);
        bg.endFill();
        this.towerMenu.addChild(bg);

        const simpleBtn = new Graphics();
        simpleBtn.beginFill(0xaaaaaa);
        simpleBtn.drawRoundedRect(10, 10, 50, 40, 5);
        simpleBtn.endFill();
        simpleBtn.interactive = true;
        simpleBtn.cursor = "pointer";
        const simpleText = new Text("Simple", { fontSize: 12, fill: 0xffffff });
        simpleText.position.set(15, 20);
        this.towerMenu.addChild(simpleBtn, simpleText);
        simpleBtn.on("pointerdown", () => this.gameScreen.placeTowerOption("simple"));

        const cannonBtn = new Graphics();
        cannonBtn.beginFill(0x8888ff);
        cannonBtn.drawRoundedRect(65, 10, 50, 40, 5);
        cannonBtn.endFill();
        cannonBtn.interactive = true;
        cannonBtn.cursor = "pointer";
        const cannonText = new Text("Cannon", { fontSize: 12, fill: 0xffffff });
        cannonText.position.set(70, 20);
        this.towerMenu.addChild(cannonBtn, cannonText);
        cannonBtn.on("pointerdown", () => this.gameScreen.placeTowerOption("cannon"));

        const fireBtn = new Graphics();
        fireBtn.beginFill(0xff4444);
        fireBtn.drawRoundedRect(120, 10, 50, 40, 5);
        fireBtn.endFill();
        fireBtn.interactive = true;
        fireBtn.cursor = "pointer";
        const fireText = new Text("Fire", { fontSize: 12, fill: 0xffffff });
        fireText.position.set(130, 20);
        this.towerMenu.addChild(fireBtn, fireText);
        fireBtn.on("pointerdown", () => this.gameScreen.placeTowerOption("fire"));

        this.towerMenu.visible = false;
    }

    createTowerInfoPanel() {
        const panel = new Graphics();
        panel.beginFill(0x000000, 0.6);
        panel.drawRoundedRect(10, 100, 200, 200, 10);
        panel.endFill();
        this.uiContainer.addChild(panel);

        const title = new Text("Tower Information", { 
            fill: 0xffffff, 
            fontSize: 18, 
            fontWeight: "bold" 
        });
        title.position.set(20, 110);
        this.uiContainer.addChild(title);

        const simpleTower = new Text("Simple Tower:", { 
            fill: 0xaaaaaa, 
            fontSize: 16 
        });
        simpleTower.position.set(20, 140);
        this.uiContainer.addChild(simpleTower);

        const simpleInfo = new Text("Damage: 1\nPrice: Free", { 
            fill: 0xffffff, 
            fontSize: 14 
        });
        simpleInfo.position.set(20, 160);
        this.uiContainer.addChild(simpleInfo);

        const cannonTower = new Text("Cannon Tower:", { 
            fill: 0x8888ff, 
            fontSize: 16 
        });
        cannonTower.position.set(20, 190);
        this.uiContainer.addChild(cannonTower);

        const cannonInfo = new Text("Damage: 2\nPrice: 200 coins", { 
            fill: 0xffffff, 
            fontSize: 14 
        });
        cannonInfo.position.set(20, 210);
        this.uiContainer.addChild(cannonInfo);

        const fireTower = new Text("Fire Tower:", { 
            fill: 0xff4444, 
            fontSize: 16 
        });
        fireTower.position.set(20, 240);
        this.uiContainer.addChild(fireTower);

        const fireInfo = new Text("Damage: 3\nPrice: 300 coins", { 
            fill: 0xffffff, 
            fontSize: 14 
        });
        fireInfo.position.set(20, 260);
        this.uiContainer.addChild(fireInfo);
    }

    showTowerMenu(x: number, y: number) {
        this.towerMenu.visible = true;
        this.towerMenu.position.set(x - 90, y - 80);
    }

    hideTowerMenu() {
        this.towerMenu.visible = false;
    }

    showLowBalanceMessage() {
        const message = new Text("Not enough coins!", {
            fill: 0xff0000,
            fontSize: 20,
            fontWeight: "bold"
        });
        message.anchor.set(0.5);
        message.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, GAME_CONSTANTS.BASE_HEIGHT / 2);
        this.uiContainer.addChild(message);

        setTimeout(() => {
            this.uiContainer.removeChild(message);
        }, 1000);
    }

    showGameOver(totalEnemiesDefeated: number) {
        const overlay = new Graphics();
        overlay.beginFill(0x000000, 0.7);
        overlay.drawRect(0, 0, GAME_CONSTANTS.BASE_WIDTH, GAME_CONSTANTS.BASE_HEIGHT);
        overlay.endFill();
        this.uiContainer.addChild(overlay);

        const gameOverText = new Text("GAME OVER", {
            fill: 0xff0000,
            fontSize: 60,
        });
        gameOverText.anchor.set(0.5);
        gameOverText.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, GAME_CONSTANTS.BASE_HEIGHT / 2);
        this.uiContainer.addChild(gameOverText);

        const scoreText = new Text(`Final Score: ${totalEnemiesDefeated} hits`, {
            fill: 0xffffff,
            fontSize: 30,
        });
        scoreText.anchor.set(0.5);
        scoreText.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, GAME_CONSTANTS.BASE_HEIGHT / 2 + 50);
        this.uiContainer.addChild(scoreText);
    }

    showVictory(totalEnemiesDefeated: number) {
        const overlay = new Graphics();
        overlay.beginFill(0x000000, 0.7);
        overlay.drawRect(0, 0, GAME_CONSTANTS.BASE_WIDTH, GAME_CONSTANTS.BASE_HEIGHT);
        overlay.endFill();
        this.uiContainer.addChild(overlay);

        const victoryText = new Text("VICTORY!", {
            fill: 0x00ff00,
            fontSize: 60,
        });
        victoryText.anchor.set(0.5);
        victoryText.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, GAME_CONSTANTS.BASE_HEIGHT / 2);
        this.uiContainer.addChild(victoryText);

        const scoreText = new Text(`Final Score: ${totalEnemiesDefeated} hits`, {
            fill: 0xffffff,
            fontSize: 30,
        });
        scoreText.anchor.set(0.5);
        scoreText.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, GAME_CONSTANTS.BASE_HEIGHT / 2 + 50);
        this.uiContainer.addChild(scoreText);
    }

    public onResize(width: number, height: number, scaleFactor: number): void {
        console.log("UI Manager resized", width, height, scaleFactor);
    }
}