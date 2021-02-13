import dom from '../dom.js';

const palette = [
    '#000000', '#ffffff', '',
    '#7f7f7f', '#c3c3c3', '#880015',
    '#ffaec9', '#ed1c24', '#b97a57',
    '#ff7f27', '#ffc90e', '#fff200',
    '#b5e61d', '#22b14c', '#efe4b0',
    '#00a2e8', '#99d9ea', '#3f48cc',
    '#c8bfe7', '#a349a4', '#7092be'
];

export class Colors {

    constructor(state, handle) {
        this.handle = handle;
        this.state = {
            color: '#000000',
            tool: 'brush'
        };
        this.setState(state);
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    onChoice(color) {
        return e => {
            this.handle({
                type: 'color',
                value: color
            });
            e.stopPropagation();
            e.preventDefault();
        }
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (!this.$colors) {
            this.$colors = {};
            var $root = dom('#colors');
            for (var color of palette) {
                var $color = dom.new('div', { className: 'color-option', style: `background-color: ${color}` });
                $color.on('click', this.onChoice(color));
                $root.append($color);
                this.$colors[color] = $color;
            }
        }
        
        for (var color in this.$colors) {
            this.$colors[color].classList[color == this.state.color ? 'add' : 'remove']('selected');
        }
        
        dom.all('.tool-button').forEach(btn => btn.classList.remove('selected'));
        dom(`#${this.state.tool}`).classList.add('selected');

        this.modified = false;
    }

}