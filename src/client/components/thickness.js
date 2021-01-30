import dom from '../dom.js';

export class Thickness {

    constructor(state, handle) {
        this.handle = handle;
        this.state = {
            thickness: 0.5
        };
        this.innerState = {
            thickness: 0.5,
            changing: false,
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

    onChange() {
        this.handle({
            type: 'thickness',
            value: Math.pow(this.$thickness.value, 2) / 1000
        });
        this.setInnerState({ changing: false });
    }

    onInput() {
        this.setInnerState({
            thickness: Math.pow(this.$thickness.value, 2) / 1000,
            changing: true
        });
        this.render(); // TODO: queueRender
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (!this.$thickness) {
            this.$thickness = dom('#thickness');
            this.$thickness.on('change', () => this.onChange());
            this.$thickness.on('input', () => this.onInput());
        }

        if (this.innerState.changing) {
            if (!this.$preview) {
                this.$preview = dom.svg('circle', { 
                    style: `fill: ${this.state.color || '#fff8'}; stroke: #0008; stroke-width: 0.1`
                });
                this.$preview.set('cx', 50);
                this.$preview.set('cy', 25);
                dom('#canvas').append(this.$preview);
            }
            this.$preview.set('r', this.innerState.thickness / 2);
        } else {
            if (this.$preview) {
                this.$preview.remove();
                this.$preview = undefined;
            }
            if (Math.round(this.state.thickness * 10) != this.$thickness.value) {
                this.$thickness.value = Math.round(Math.sqrt(this.state.thickness * 1000));
            }
        }


        this.modified = false;
    }

}