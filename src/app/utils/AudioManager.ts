export class AudioManager {
    private bgm: HTMLAudioElement | null = null;
    private soundEnabled: boolean = true;

    constructor() {
        this.setupAudio();
    }

    private setupAudio() {
        try {
            this.bgm = new Audio('main/sounds/bgm-main.mp3');
            this.bgm.loop = true;
            this.bgm.volume = 0.5;
            this.bgm.load();
        } catch (error) {
            console.error("Failed to load background music:", error);
        }
    }

    playBackgroundMusic() {
        if (!this.soundEnabled) return;
        
        if (this.bgm) {
            this.bgm.play().catch(error => {
                console.error("Failed to play background music:", error);
            });
        }
    }

    pauseBackgroundMusic() {
        if (this.bgm) {
            this.bgm.pause();
        }
    }

    resumeBackgroundMusic() {
        if (!this.soundEnabled) return;
        
        if (this.bgm) {
            this.bgm.play().catch(error => {
                console.error("Failed to resume background music:", error);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.resumeBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
        return this.soundEnabled;
    }
}