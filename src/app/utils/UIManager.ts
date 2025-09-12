import { Container, Graphics, Text } from "pixi.js";
import { GameScreen } from "../screens/gameScreen";
import { GAME_CONSTANTS } from "./constants";
import { subscribeTop20, LeaderboardEntry } from "../../firebaseClient";

export class UIManager {
    private uiContainer: Container;
    private hudContainer: Container;
    private gameScreen: GameScreen;
    public towerMenu: Container;
    public selectedSpot: { x: number; y: number } | null = null;

    private coinText!: Text;
    private heartText!: Text;
    private hitsText!: Text;
    private waveText!: Text;

    private leaderboardPopup!: Container;
    private leaderboardEntries: Text[] = [];
    private leaderboardUnsubscribe: (() => void) | null = null;

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

        this.createLeaderboardPopup();
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
        // const pauseBtn = new Graphics();
        // pauseBtn.beginFill(0x555555);
        // pauseBtn.drawRoundedRect(20, 650, 90, 40, 5);
        // pauseBtn.endFill();
        // this.uiContainer.addChild(pauseBtn);

        // const pauseText = new Text("PAUSE", {
        //     fontFamily: "Arial",
        //     fontSize: 20,
        //     fill: 0xffffff,
        //     align: "center",
        // });

        // pauseText.x = 35 + 40 / 2 - pauseText.width / 2;
        // pauseText.y = 650 + 40 / 2 - pauseText.height / 2;
        // this.uiContainer.addChild(pauseText);


        const startWaveBtn = new Graphics();
        startWaveBtn.beginFill(0xaa0000);
        // startWaveBtn.drawRoundedRect(0, 0, 100, 40, 5);
        startWaveBtn.endFill();
        startWaveBtn.interactive = true;
        startWaveBtn.cursor = "pointer";

        // const startText = new Text("Start Wave", {
        //     fill: 0xffffff,
        //     fontSize: 14,
        // });
        // startText.position.set(140, 660);
        // this.uiContainer.addChild(startText);

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

        const leaderboardBtn = new Graphics();
        leaderboardBtn.beginFill(0x00aa00);
        leaderboardBtn.drawRoundedRect(300, 650, 160, 40, 5);
        leaderboardBtn.endFill();
        leaderboardBtn.interactive = true;
        leaderboardBtn.cursor = "pointer";

        const leaderboardText = new Text("Show Leaderboard", {
            fill: 0xffffff,
            fontSize: 14,
        });
        leaderboardText.position.set(305, 660);
        this.uiContainer.addChild(leaderboardText);

        leaderboardBtn.on("pointerdown", () => {
            this.showLeaderboard();
        });
        leaderboardBtn.addChild(leaderboardText);

        this.uiContainer.addChild(leaderboardBtn);

        this.uiContainer.addChild(startWaveBtn, soundBtn, soundIcon, leaderboardBtn);
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
        this.createRestartButton(120);

        this.showLeaderboard();
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
        this.createRestartButton(120);

        this.showLeaderboard();
    }


    private createLeaderboardPopup() {
        this.leaderboardPopup = new Container();
        this.leaderboardPopup.visible = false;

        const bg = new Graphics();
        bg.beginFill(0x1e1e1e, 0.95);
        bg.drawRoundedRect(
            GAME_CONSTANTS.BASE_WIDTH / 2 - 200,
            100,
            400,
            500,
            20
        );
        bg.endFill();
        this.leaderboardPopup.addChild(bg);

        const title = new Text("🏆 Leaderboard (Top 20)", {
            fontFamily: "Arial",
            fontSize: 28,
            fill: 0xffd700,
            fontWeight: "bold",
        });
        title.anchor.set(0.5, 0);
        title.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, 120);
        this.leaderboardPopup.addChild(title);

        const closeBtn = new Graphics();
        closeBtn.beginFill(0xff0000);
        closeBtn.drawCircle(GAME_CONSTANTS.BASE_WIDTH / 2 + 180, 120, 15);
        closeBtn.endFill();
        closeBtn.interactive = true;
        closeBtn.cursor = "pointer";

        const closeText = new Text("X", {
            fontSize: 16,
            fill: 0xffffff,
            fontWeight: "bold"
        });
        closeText.anchor.set(0.5);
        closeText.position.set(GAME_CONSTANTS.BASE_WIDTH / 2 + 180, 120);

        closeBtn.on("pointerdown", () => {
            this.hideLeaderboard();
        });

        this.leaderboardPopup.addChild(closeBtn, closeText);

        this.uiContainer.addChild(this.leaderboardPopup);
    }

    public showLeaderboard() {
        this.leaderboardPopup.visible = true;

        this.clearLeaderboardEntries();

        const loadingText = new Text("Loading leaderboard...", {
            fontSize: 20,
            fill: 0xffffff,
        });
        loadingText.anchor.set(0.5);
        loadingText.position.set(
            GAME_CONSTANTS.BASE_WIDTH / 2,
            200
        );
        this.leaderboardPopup.addChild(loadingText);
        this.leaderboardEntries.push(loadingText);

        if (this.leaderboardUnsubscribe) {
            this.leaderboardUnsubscribe();
        }

        this.leaderboardUnsubscribe = subscribeTop20((rows: LeaderboardEntry[]) => {
            this.clearLeaderboardEntries();

            if (rows.length === 0) {
                // const noScoresText = new Text("No scores yet - be the first!", {
                //     fontSize: 20,
                //     fill: 0xffffff,
                // });
                // noScoresText.anchor.set(0.5);
                // noScoresText.position.set(
                //     GAME_CONSTANTS.BASE_WIDTH / 2,
                //     200
                // );

                return;
            }

            rows.forEach((entry: LeaderboardEntry, idx: number) => {
                const name = entry.name || "Anonymous";
                const score = entry.score || 0;

                const rankText = new Text(
                    `${idx + 1}.`,
                    {
                        fontSize: 18,
                        fill: 0xffffff,
                    }
                );
                rankText.position.set(
                    GAME_CONSTANTS.BASE_WIDTH / 2 - 180,
                    170 + idx * 22
                );

                const nameText = new Text(
                    name,
                    {
                        fontSize: 18,
                        fill: 0x88ff88,
                    }
                );
                nameText.position.set(
                    GAME_CONSTANTS.BASE_WIDTH / 2 - 150,
                    170 + idx * 22
                );

                const scoreText = new Text(
                    score.toString(),
                    {
                        fontSize: 18,
                        fill: 0xffff00,
                    }
                );
                scoreText.position.set(
                    GAME_CONSTANTS.BASE_WIDTH / 2 + 150,
                    170 + idx * 22
                );

                this.leaderboardPopup.addChild(rankText);
                this.leaderboardPopup.addChild(nameText);
                this.leaderboardPopup.addChild(scoreText);

                this.leaderboardEntries.push(rankText, nameText, scoreText);
            });

            const refreshBtn = new Graphics();
            refreshBtn.beginFill(0x0077ff);
            refreshBtn.drawRoundedRect(
                GAME_CONSTANTS.BASE_WIDTH / 2 - 40,
                600,
                80,
                30,
                5
            );
            refreshBtn.endFill();
            refreshBtn.interactive = true;
            refreshBtn.cursor = "pointer";

            const refreshText = new Text("Refresh", {
                fontSize: 14,
                fill: 0xffffff
            });
            refreshText.anchor.set(0.5);
            refreshText.position.set(GAME_CONSTANTS.BASE_WIDTH / 2, 615);

            refreshBtn.on("pointerdown", () => {
                this.refreshLeaderboard();
            });

            this.leaderboardPopup.addChild(refreshBtn, refreshText);
            this.leaderboardEntries.push(refreshBtn as any, refreshText);
        });
    }

    public hideLeaderboard() {
        this.leaderboardPopup.visible = false;
        if (this.leaderboardUnsubscribe) {
            this.leaderboardUnsubscribe();
            this.leaderboardUnsubscribe = null;
        }
        this.clearLeaderboardEntries();
    }

    public refreshLeaderboard() {
        this.hideLeaderboard();
        this.showLeaderboard();
    }


    private clearLeaderboardEntries() {
        this.leaderboardEntries.forEach((entry) => {
            if (entry.parent) {
                entry.parent.removeChild(entry);
            }
        });
        this.leaderboardEntries = [];
    }

    public onResize(width: number, height: number, scaleFactor: number): void {
        console.log("UI Manager resized", width, height, scaleFactor);
    }
    private createRestartButton(yOffset: number = 120) {
        const restartBtn = new Graphics();
        restartBtn.beginFill(0x0077ff);
        restartBtn.drawRoundedRect(
            GAME_CONSTANTS.BASE_WIDTH / 2 - 80,
            GAME_CONSTANTS.BASE_HEIGHT / 2 + yOffset,
            160,
            50,
            10
        );
        restartBtn.endFill();
        restartBtn.interactive = true;
        restartBtn.cursor = "pointer";

        const restartText = new Text("Restart", {
            fill: 0xffffff,
            fontSize: 20,
            fontWeight: "bold"
        });
        restartText.anchor.set(0.5);
        restartText.position.set(
            GAME_CONSTANTS.BASE_WIDTH / 2,
            GAME_CONSTANTS.BASE_HEIGHT / 2 + yOffset + 25
        );

        restartBtn.on("pointerdown", () => {
            window.location.reload();
        });

        this.uiContainer.addChild(restartBtn, restartText);
    }

}