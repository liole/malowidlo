import dom from '../dom.js';

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
            var mask = this.state.word.replace(/\p{L}/uig, '_');
            dom('#wordMask').innerText = mask;
        }

        var isDrawing = this.state.drawing == this.userID;
        dom('#wordInput').disabled = isDrawing ? 'disabled' : '';
        if (isDrawing) {
            dom('#wordInput').value = this.state.word;
        }
    }

}