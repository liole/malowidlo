import dom from '../dom.js';
import { applyTransform, extractTransformScale } from '../utils.js';

export class Line {

    constructor(state) {
        this.state = {
            points: [],
            color: '#000',
            width: 0.5
        };
        this.innerState = {
            transform: undefined
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    setInnerState(state) {
        Object.assign(this.innerState, state);
        this.modified = true;
    }

    setTransform(transform) {
        this.setInnerState({ transform });
    }

    persistTransform() {
        var points = this.state.points
            .map(p => this.innerState.transform ? applyTransform(p, this.innerState.transform) : p);
        this.setState({ points, width: this.getWidth() });
        this.setTransform(undefined);
        return this.state;
    }

    getPath() {
        return this.state.points
            .map(p => this.innerState.transform ? applyTransform(p, this.innerState.transform) : p)
            .map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`)
            .join(' ');
    }

    getWidth() {
        return this.innerState.transform ? extractTransformScale(this.innerState.transform) * this.state.width : this.state.width;
    }

    remove() {
        if (this.$path) {
            this.$path.remove();
            this.$path = undefined;
        }
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (!this.$path) {
            this.$path = dom.svg('path',{
                style: `fill: none; stroke: ${this.state.color}; stroke-linecap: round; stroke-linejoin: round`
            });
            dom('#canvas').append(this.$path);
        }

        this.$path.set('d', this.getPath());
        this.$path.set('stroke-width', this.getWidth());

        this.modified = false;
    }

}