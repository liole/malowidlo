export class Sound {
    
    constructor() {
        this.$start = new Audio('/audio/start.mp3');
        this.$correct = new Audio('/audio/correct.mp3');
        this.$finish = new Audio('/audio/finish.mp3');
    }

    start() {
        this.$start.play();
    }

    correct() {
        this.$correct.play();
    }

    finish() {
        this.$finish.play();
    }

}
