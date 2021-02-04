import { Line } from './line.js';

export class Canvas {

    constructor(state) {
        this.objects = [];
        this.state = {
            objects: [],
            transform: undefined
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
        if (this.state.transform) {
            this.objects.forEach(o => o.setTransform(this.state.transform));
        }
    }

    persistTransform() {
        this.setState({
            objects: this.objects.map(o => o.persistTransform()),
            transform: undefined
        });
        return this.state;
    }

    createObject(state) {
        switch(state.type) {
            case 'line':
                return new Line(state);
                break;
        }
    }

    render() {
        for (var obj of this.objects.splice(this.state.objects.length)) {
            obj.remove();
        }

        for (var i = this.objects.length; i < this.state.objects.length; ++i) {
            var objectState = this.state.objects[i];
            this.objects.push(this.createObject(objectState));
        }

        if (this.objects.length) {
            var lastIndex = this.objects.length - 1;
            this.objects[lastIndex].setState(this.state.objects[lastIndex]);
        }

        for (var obj of this.objects) {
            obj.render();
        }
    }

}