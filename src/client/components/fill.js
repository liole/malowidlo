import dom from '../dom.js';
import { createDrwaingContext, drawSvg } from '../utils.js';

const pixelDensity = 20;
const tolerance = 20;

export class Fill {

    constructor(state) {
        this.state = {
            point: { x: 0, y: 0 },
            color: '#000'
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    remove() {
        if (this.$mask) {
            this.$mask.remove();
            this.$mask = undefined;
        }
    }

    async render() {
        if (!this.modified) {
            return;
        }

        if (!this.$mask) {
            var $canvas = dom('#canvas');
            var rect = { width: 100 * pixelDensity, height: 50 * pixelDensity };
            var point = {
                x: Math.round(this.state.point.x * pixelDensity),
                y: Math.round(this.state.point.y * pixelDensity)
            };

            this.$mask = dom.svg('image');
            this.$mask.set('width', 100);
            this.$mask.set('height', 50);

            var ctx = createDrwaingContext(rect.width, rect.height);
            await drawSvg(ctx, $canvas, 0, 0, rect.width, rect.height);

            ctx.fillStyle = this.state.color;
            var mask = floodFill.getMask(point.x, point.y, tolerance, ctx, true, undefined, tolerance / 2);
            var fillUrl = mask.toDataURL();

            this.$mask.set('href', fillUrl);
            $canvas.append(this.$mask);
        }

        this.modified = false;
    }

}