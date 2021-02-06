import dom from '../dom.js';

const playerRowHeight = 33;

export class Players {

    constructor(state) {
        this.state = {
            users: []
        };
        this.setState(state);
    }

    setState(state) {
        Object.assign(this.state, state);
    }

    render() {
        if (!this.$players) {
            this.$players = [];
        }

        var orderedPlayers = [...this.state.users]
            .sort((p1, p2) => p2.score - p1.score);

        for (var [i, player] of orderedPlayers.entries()) {
            var $player = this.$players.find(p => p.id == player.id);
            if (!$player) {
                var name = dom.new('div', { className: 'player-name' });
                var score = dom.new('div', { className: 'player-score' });
                var row = dom.new('div', { className: 'player-row' }, [
                    name, score
                ]);
                dom('#players').append(row);
                $player = { id: player.id, row, name, score };
                this.$players.push($player);
            }
            $player.row.style.top = `${playerRowHeight * i}px`;
            $player.name.innerText = player.name;
            $player.score.innerText = player.score;
            
            var isDrawing = this.state.current.drawing == player.id;
            $player.row.classList[ isDrawing ? 'add' : 'remove']('drawing');

            var hasGuessed = this.state.current.guessed.map(g => g.id).includes(player.id);
            $player.row.classList[ hasGuessed ? 'add' : 'remove']('guessed');
        }

        if (this.state.current.drawing) {
            var currentUserIndex = this.state.users.findIndex(u => u.id == this.state.current.drawing);
            dom('.round-container').style.top = `${this.state.users.length * playerRowHeight + 10}px`;
            dom('.round-container').show();
            dom('#round').innerText = this.state.current.round;
            dom('#sub-round').innerText = `${currentUserIndex + 1}/${this.state.users.length}`;
        }
    }

}