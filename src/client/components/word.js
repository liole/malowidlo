import dom from '../dom.js';
import { applyMask } from '../utils.js';

export class Word {

    constructor(state, userID) {
        this.userID = userID;
        this.state = {
            current: {
                word: null,
                letters: []
            }
        };
        this.setState(state);
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    isTurnFinished() {
        return this.state.current.drawing &&
            (this.state.current.elapsed >= this.state.settings.turnDuration ||
            this.state.current.guessed.length == this.state.users.length - 1);
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (this.state.current.word) {
            var mask = applyMask(this.state.current.word, (c, i) =>
                this.state.current.letters.includes(i) ? c : '_');
            dom('#wordMask').innerText = mask;
        } else {
            dom('#wordMask').innerText = '';
            dom('#wordInput').value = '';
        }

        var isDrawing = this.state.current.drawing == this.userID;
        var isGuessed = this.state.current.guessed.map(g => g.id).includes(this.userID);
        var showWord = isDrawing || isGuessed || this.isTurnFinished();
        dom('#wordInput').disabled = (showWord || !this.state.current.word) ? 'disabled' : '';
        dom('#wordInput').classList[isGuessed ? 'add' : 'remove']('guessed');
        if (showWord) {
            dom('#wordInput').value = this.state.current.word;
        }

        this.modified = false;
    }

}