import dom from '../dom.js';

export class Words {

    constructor(settings, handle) {
        this.settings = settings;
        this.handle = handle;
        this.state = {
            choices: []
        };
        this.modified = false;
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.modified = true;
    }

    generateWords() {
        if (this.state.choices.length) return;

        var words = [...this.settings.words];
        var choices = Array.from({ length: this.settings.numberOfChoices },
            (_, i) => ~~(Math.random() * (this.settings.words.length - i)))
            .map(i => words.splice(i, 1)[0]);
        this.setState({ choices });
    }

    onChoice(word) {
        return e => {
            this.setState({ choices: [] });
            this.handle({
                type: 'word',
                value: word
            });
        }
    }

    render() {
        if (!this.modified) {
            return;
        }

        var $root = dom('#wordListButtons');
        $root.clear();
        this.$words = [];
        
        for (var word of this.state.choices) {
            var $word = dom.new('button', { innerText: word });
            $word.on('click', this.onChoice(word));
            $root.append($word);
            this.$words.push($word);
        }

        this.modified = false;
    }

}