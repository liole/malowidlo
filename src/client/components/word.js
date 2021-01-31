import dom from '../dom.js';
import { applyMask } from '../utils.js';

export class Word {

    constructor(state, userID) {
        this.userID = userID;
        this.state = {
            word: null,
            letters: [],
        };
        this.setState(state);
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (this.state.word) {
            var mask = applyMask(this.state.word, (c, i) =>
                this.state.letters.includes(i) ? c : '_');
            dom('#wordMask').innerText = mask;
        } else {
            dom('#wordMask').innerText = '';
            dom('#wordInput').value = '';
        }

        var isDrawing = this.state.drawing == this.userID;
        var isGuessed = this.state.guessed.map(g => g.id).includes(this.userID);
        var showWord = isDrawing || isGuessed;
        dom('#wordInput').disabled = (showWord || !this.state.word) ? 'disabled' : '';
        dom('#wordInput').classList[isGuessed ? 'add' : 'remove']('guessed');
        if (showWord) {
            dom('#wordInput').value = this.state.word;
        }

        this.modified = false;
    }

}