export class Sound {
    
    constructor() {
        this.$start = new Audio('/audio/start.mp3');
        this.$correct = new Audio('/audio/correct.mp3');
        this.$finish = new Audio('/audio/finish.mp3');
    }

    start() {
        this.tryPlay(this.$start);
    }

    correct() {
        this.tryPlay(this.$correct);
    }

    finish() {
        this.tryPlay(this.$finish);
    }

    tryPlay(audio) {
        try {
            audio.play();
        } catch { }
    }
}
