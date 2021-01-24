import { Line } from './line.js';

export class Canvas {

    constructor(state) {
        this.objects = [];
        this.state = {
            objects: []
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
    }

    createObject(state) {
        switch(state.type) {
            case 'line':
                return new Line(state);
                break;
        }
    }

    render() {
        for (var i = this.state.objects.length; i < this.objects.length; ++i) {
            this.objects[i].setState({ remove: true });
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