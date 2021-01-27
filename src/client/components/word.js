import dom from '../dom.js';
import { applyMask } from '../utils.js';

export class Word {

    constructor(state, userID) {
        this.userID = userID;
        this.state = {
            word: null
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
            var mask = applyMask(this.state.word, '_');
            dom('#wordMask').innerText = mask;
        }

        var isDrawing = this.state.drawing == this.userID;
        var isGuessed = this.state.guessed.map(g => g.id).includes(this.userID);
        var showWord = isDrawing || isGuessed;
        dom('#wordInput').disabled = showWord ? 'disabled' : '';
        if (showWord) {
            dom('#wordInput').value = this.state.word;
        }
    }

}