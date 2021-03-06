import dom from '../dom.js';

export class Results {

    constructor(state) {
        this.state = {
            users: [],
            settings: {
                turnDuration: 80
            },
            current: {
                guessed: [],
                word: ''
            }
        };
        this.innerState = {
            scores: []
        };
        this.users = [];
        this.modified = false;
        this.setState(state);
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.updateUsersCache();
    }

    setInnerState(state) {
        Object.assign(this.innerState, state);
        this.modified = true;
    }

    updateUsersCache() {
        for (var user of this.state.users) {
            this.users[user.id] = user.name;
        }
    }

    calculate() {
        var scores = [];

        var turnDuration = this.state.settings.turnDuration;
        var timestamps = this.state.current.guessed.map(g => g.timestamp);
        var minTimestamp = timestamps.length ?  Math.min(...timestamps) : 0;
        var maxTimestamp = timestamps.length ?  Math.max(...timestamps) : turnDuration;
        var guessesRange = maxTimestamp - minTimestamp;

        for (var user of this.state.users) {
            var score = {
                id: user.id,
                value: 0
            };
            var guessed = this.state.current.guessed.find(u => u.id == user.id);
            if (guessed) {
                var absolutePoints = Math.round(40 * (turnDuration - guessed.timestamp) / turnDuration);
                var relativePoints = guessesRange ? Math.round(40 * (maxTimestamp - guessed.timestamp) / guessesRange) : 40;
                score.value += 20 + absolutePoints + relativePoints;
            }
            scores.push(score);
        }

        var guessingScores = scores.filter(s => s.id != this.state.current.drawing).map(s => s.value);
        var drawingScore = scores.find(s => s.id == this.state.current.drawing);
        drawingScore.value = Math.round(Math.sqrt(guessingScores.map(s => s*s).reduce((p, c) => p + c) / guessingScores.length));

        scores.sort((p1, p2) => p2.value - p1.value);

        this.setInnerState({ scores });
    }

    apply() {
        var users = this.state.users;
        for (var user of users) {
            var userScore = this.innerState.scores.find(u => u.id == user.id);
            user.score += userScore.value;
        }
        this.setInnerState({ scores: [] });
        return users;
    }

    render() {
        if (!this.modified) {
            return;
        }

        if (this.innerState.scores.length) {
            var $root = dom('#turnScoreList');
            $root.clear();
            
            for (var score of this.innerState.scores) {
                var $score = dom.new('div', { className: `score-row ${score.value > 0 ? 'success' : ''}` }, [
                    dom.new('div', { className: 'score-name', innerText: this.users[score.id] }),
                    dom.new('div', { className: 'score-value', innerText: score.value }),
                ]);
                $root.append($score);
            }
        }

        this.modified = false;
    }

}