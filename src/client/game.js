import dom from './dom.js';
import { Canvas } from './components/canvas.js';
import { Players } from './components/players.js';
import { Words } from './components/words.js';
import { Word } from './components/word.js';
import { Chat } from './components/chat.js';

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
                word: null
            }
        };
        this.canvas = new Canvas(this.state.canvas);
        this.players = new Players(this.state);
        this.words = new Words(this.state.settings, e => this.handle(e));
        this.word = new Word(this.state.current, this.userID);
        this.chat = new Chat(this.state, this.userID);
    }

    handle(event) {
        var userID = event.id || this.userID;
        switch (event.type) {
            case 'start': 
                this.resetCurrentState();
                this.registerMessage('break', this.state.current.drawing);
                break;
            case 'word':
                this.state.current.word = event.value;
                break;
            case 'guess':
                var result = this.processGuess(event.value, userID);
                this.registerMessage(result, userID, event.value);
                break;
            case 'draw-start':
                if (!this.canDraw(userID)) return;
                var obj = {
                    type: 'line',
                    color: '#000',
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
        };
    }

    processGuess(value, userID) {
        var result = 'guess';
        if (value == this.state.current.word) {
            result = 'guessed';
            this.state.current.guessed.push({
                id: userID
            });
        } else if (false) { // TODO: calculate if words are close
            result = 'close-guess';
        }
        return result;
    }

    registerMessage(type, user, value) {
        this.state.messages.push({ value, user, type });
    }

    canDraw(userID = this.userID) {
        return (userID == this.state.current.drawing) && this.state.current.word;
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

        // TODO: move to inner state of 'words'
        if (this.state.current.drawing == this.userID) {
            this.words.generateWords();
        }

        this.canvas.setState(this.state.canvas);
        this.players.setState(this.state);
        this.word.setState(this.state.current);
        this.chat.setState(this.state);
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
        dom(`#${box}-box`).classList[ state ? 'remove' : 'add' ]('hide');
    }

    render() {
        var waitingForOther = this.state.current.drawing && this.state.current.drawing != this.userID && !this.state.current.word;
        var waitingForSelf = this.state.current.drawing && this.state.current.drawing == this.userID && !this.state.current.word;

        if (waitingForOther) {
            dom('#waitingForName').innerText = (this.state.users.find(u => u.id == this.state.current.drawing) || {}).name;
        }

        this.renderBoxState('waiting-start', !this.state.current.drawing);
        this.renderBoxState('waiting-choice', waitingForOther);
        this.renderBoxState('words-choice', waitingForSelf);

        this.canvas.render();
        this.players.render();
        this.words.render();
        this.word.render();
        this.chat.render();
    }

}