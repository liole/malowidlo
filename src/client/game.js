import { Canvas } from './components/canvas.js';

export class Game {

    constructor(gameSettings) {
        this.pushSync = () => {};
        this.pushEvent = event => {};
        this.state = {
            settings: gameSettings,
            users: [],
            canvas: {
                objects: []
            }
        };
        this.canvas = new Canvas(this.state);
    }

    handle(event) {
        switch (event.type) {
            case 'draw-start':
                var obj = {
                    type: 'line',
                    color: '#000',
                    width: 0.5,
                    points: [ event.point ]
                };
                this.state.canvas.objects.push(obj);
                break;
            case 'draw-move':
                var lastIndex = this.state.canvas.objects.length - 1;
                this.state.canvas.objects[lastIndex].points.push(event.point);
                break;
            default:
                return;
        }
        if (!event.id) {
            this.pushEvent(event);
        }
        this.sync();
    }

    addUser(user) {
        this.state.users.push({
            score: 0,
            ...user
        });
        this.queueRender();
    }

    sync(state) {
        if (state) {
            Object.assign(this.state, state);
        }
        this.canvas.setState(this.state.canvas);
        this.queueRender();
    }

    queueRender() {
        if (this.frame) return;
        this.frame = requestAnimationFrame(timestamp => {
            this.render();
            this.frame = undefined;
        });
    }

    render() {
        this.canvas.render();
    }

}