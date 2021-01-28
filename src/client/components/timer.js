import dom from '../dom.js';

export class Timer {

    constructor(state, settings, tick) {
        this.settings = settings;
        this.tick = tick;
        this.state = {
            elapsed: 0
        };
        this.interval = undefined;
        this.setState(state);
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    start() {
        if (!this.interval) {
            this.interval = setInterval(() => this.tick(), 1000);
        }
    }

    stop() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    render() {
        if (!this.modified) {
            return;
        }
        
        var left = this.settings.turnDuration - this.state.elapsed;
        var percent = 100 * left / this.settings.turnDuration;

        dom('#timer').innerText = left;
        dom('#timerProgress').style.width = `${percent}%`;

        dom('#timer').classList[ (percent < 20) ? 'add' : 'remove' ]('warning');
        dom('#timerProgress').classList[ (percent < 20) ? 'add' : 'remove' ]('warning');

        dom('#timer').classList[ (percent < 10) ? 'add' : 'remove' ]('danger');
        dom('#timerProgress').classList[ (percent < 10) ? 'add' : 'remove' ]('danger');


        this.modified = false;
    }

}