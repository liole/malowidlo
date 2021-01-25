import { Canvas } from './components/canvas.js';
import { Players } from './components/players.js';
import dom from './dom.js';

export class Game {

    constructor(gameSettings, userID) {
        this.pushSync = () => {};
        this.pushEvent = event => {};
        this.userID = userID;
        this.state = {
            settings: gameSettings,
            users: [],
            canvas: {
                objects: []
            },
            current: {
                drawing: null,
                guessed: []
            }
        };
        this.canvas = new Canvas(this.state.canvas);
        this.players = new Players(this.state);
    }

    handle(event) {
        switch (event.type) {
            case 'start': 
                this.state.current.drawing = this.state.users[0].id;
                break;
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
        this.players.setState(this.state);
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
        dom('#waiting-start-box').classList[ this.state.current.drawing ? 'add' : 'remove' ]('hide');
        this.canvas.render();
        this.players.render();
    }

}