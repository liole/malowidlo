import dom from '../dom.js';

export class Line {

    constructor(state) {
        this.state = {
            points: [],
            color: '#000',
            width: 0.5
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    getPath() {
        return this.state.points
            .map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`)
            .join(' ');
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
                style: `fill: none; stroke: ${this.state.color}; stroke-width: ${this.state.width}; stroke-linecap: round; stroke-linejoin: round`
            });
            dom('#canvas').append(this.$path);
        }

        this.$path.set('d', this.getPath());

        this.modified = false;
    }

}