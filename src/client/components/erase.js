import dom from '../dom.js';

export class Erase {

    constructor(state) {
        this.state = {
            points: [],
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
        if (this.$group) {
            this.$group.parentElement.append(...[...this.$group.children].slice(1));
            this.$group.remove();
            this.$group = undefined;
        }
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (!this.$group) {
            this.id = Math.random().toString(36).substr(2);
            this.$path = dom.svg('path',{
                style: `fill: none; stroke: black; stroke-width: ${this.state.width}; stroke-linecap: round; stroke-linejoin: round`
            });
            this.$mask = dom.svg('mask', { id: this.id }, [
                dom.svg('rect', { style: `x: -5000%; y:-5000%; width: 10100%; height: 10100%; fill: white` }),
                this.$path
            ]);

            this.$group = dom.svg('g', {}, [this.$mask, ...dom('#canvas').children]);
            this.$group.set('mask', `url(#${this.id})`);
            dom('#canvas').append(this.$group);
        }

        this.$path.set('d', this.getPath());

        this.modified = false;
    }

}