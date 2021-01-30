import dom from './dom.js';
import { levDist } from './utils.js';
import { Canvas } from './components/canvas.js';
import { Players } from './components/players.js';
import { Words } from './components/words.js';
import { Word } from './components/word.js';
import { Chat } from './components/chat.js';
import { Timer } from './components/timer.js';
import { Score } from './components/score.js';
import { Colors } from './components/colors.js';

const closeThreshold = 0.3;
const scoreVisibilityTimeout = 3000;

export class Game {

    constructor(gameSettings, userID) {
        this.pushSync = () => {};
        this.pushEvent = event => {};
        this.userID = userID;
        this.state = {
            settings: gameSettings || {
                turnDuration: 80,
                numberOfChoices: 3,
                words: []
            },
            users: [],
            messages: [],
            canvas: {
                objects: []
            },
            current: {
                drawing: null,
                guessed: [],
                word: null,
                elapsed: 0,
                color: '#000000'
            },
        };
        this.canvas = new Canvas(this.state.canvas);
        this.players = new Players(this.state);
        this.words = new Words(this.state.settings, e => this.handle(e));
        this.word = new Word(this.state.current, this.userID);
        this.chat = new Chat(this.state, this.userID);
        this.timer = new Timer(this.state.current, this.state.settings, () => this.tick());
        this.score = new Score(this.state);
        this.colors = new Colors(this.state.current, e => this.handle(e));
    }

    handle(event) {
        var userID = event.id || this.userID;
        switch (event.type) {
            case 'start': 
                this.resetCurrentState();
                break;
            case 'word':
                this.state.current.word = event.value;
                break;
            case 'guess':
                if (!event.value) return;
                var result = this.processGuess(event.value, userID);
                this.registerMessage(result, userID, event.value);
                break;
            case 'color':
                this.state.current.color = event.value;
                break;
            case 'draw-start':
                if (!this.canDraw(userID)) return;
                var obj = {
                    type: 'line',
                    color: this.state.current.color,
                    width: 0.5,
                    points: [ event.point ]
                };
                this.state.canvas.objects.push(obj);
                break;
            case 'draw-move':
                if (!this.canDraw(userID)) return;
                var lastIndex = this.state.canvas.objects.length - 1;
                this.state.canvas.objects[lastIndex].points.push(event.point);
                break;
            case 'undo':
                if (!this.canDraw(userID)) return;
                this.state.canvas.objects.pop(); 
                break;
            case 'clear':
                this.state.canvas.objects = [];
                break;
            default:
                return;
        }
        if (!event.id) {
            this.pushEvent(event);
        }
        this.sync();
    }

    resetCurrentState() {
        var index = this.state.users.findIndex(u => u.id == this.state.current.drawing);
        index = (index + 1) % this.state.users.length;

        this.state.current = {
            drawing: this.state.users[index].id,
            guessed: [],
            word: null,
            elapsed: 0,
            color: '#000000'
        };

        this.state.canvas = {
            objects: []
        };
        
        this.registerMessage('break', this.state.current.drawing);
    }

    processGuess(value, userID) {
        var testing = value.toLowerCase();
        var expecting = this.state.current.word.toLowerCase();
        var result = 'guess';
        if (testing == expecting) {
            result = 'guessed';
            this.state.current.guessed.push({
                id: userID,
                timestamp: this.state.current.elapsed
            });
        } else if (levDist(testing, expecting) / expecting.length < closeThreshold) {
            result = 'close-guess';
        }
        return result;
    }

    registerMessage(type, user, value) {
        this.state.messages.push({ value, user, type });
    }

    tick() {
        this.state.current.elapsed++;
        this.sync();
    }

    nextRound() {
        this.state.users = this.score.apply();
        this.resetCurrentState();
        this.sync();
    }

    canDraw(userID = this.userID) {
        return (userID == this.state.current.drawing) && this.state.current.word;
    }

    isTurnFinished() {
        return this.state.current.drawing &&
            (this.state.current.elapsed >= this.state.settings.turnDuration ||
            this.state.current.guessed.length == this.state.users.length - 1);
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
            this.words.settings = this.state.settings;
            this.timer.settings = this.state.settings;
        }

        this.canvas.setState(this.state.canvas);
        this.players.setState(this.state);
        this.word.setState(this.state.current);
        this.chat.setState(this.state);
        this.timer.setState(this.state.current);
        this.score.setState(this.state);
        this.colors.setState(this.state.current);

        if (this.isTurnFinished()) {
            this.timer.stop();
            this.score.calculate();
            setTimeout(() => this.nextRound(), scoreVisibilityTimeout);
        } else if (this.state.current.drawing && this.state.current.word) {
            this.timer.start();
        }

        if (this.state.current.drawing == this.userID) {
            this.words.generateWords();
        }

        this.queueRender();
    }

    queueRender() {
        if (this.frame) return;
        this.frame = requestAnimationFrame(timestamp => {
            this.render();
            this.frame = undefined;
        });
    }

    renderBoxState(box, state) {
        dom(box.startsWith('#') ? box : `#${box}-box`).classList[ state ? 'remove' : 'add' ]('hide');
    }

    render() {
        var waitingForStart = !this.state.current.drawing;
        var waitingForOther = this.state.current.drawing && this.state.current.drawing != this.userID && !this.state.current.word;
        var waitingForSelf = this.state.current.drawing && this.state.current.drawing == this.userID && !this.state.current.word;

        if (waitingForStart) {
            dom('#startGame').disabled = this.state.users.length < 2 ? 'disabled' : '';
        }
        if (waitingForOther) {
            dom('#waitingForName').innerText = (this.state.users.find(u => u.id == this.state.current.drawing) || {}).name;
        }

        this.renderBoxState('waiting-start', waitingForStart);
        this.renderBoxState('waiting-choice', waitingForOther);
        this.renderBoxState('words-choice', waitingForSelf);
        this.renderBoxState('turn-score', this.isTurnFinished());
        this.renderBoxState('#toolbox', this.canDraw());

        this.canvas.render();
        this.players.render();
        this.words.render();
        this.word.render();
        this.chat.render();
        this.timer.render();
        this.score.render();
        this.colors.render();
    }

}