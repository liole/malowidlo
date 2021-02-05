import dom from '../dom.js';

export class Transform {

    constructor(state) {
        this.state = {
            a: [[1, 0], [0, 1]],
            b: { x: 0, y: 0 }
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    remove() {
        if (this.$group) {
            this.$group.parentElement.append(...this.$group.children);
            this.$group.remove();
            this.$group = undefined;
        }
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (!this.$group) {
            this.$group = dom.svg('g', {}, [...dom('#canvas').children]);
            dom('#canvas').append(this.$group);
        }

        this.$group.set('transform', `matrix(${this.state.a[0][0]} ${this.state.a[1][0]} ${this.state.a[0][1]} ${this.state.a[1][1]} ${this.state.b.x} ${this.state.b.y})`);

        this.modified = false;
    }

}
