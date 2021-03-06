import dom from '../dom.js';
import { applyMask, findLast, randomChar } from '../utils.js';

export class Chat {

    constructor(state, userID) {
        this.userID = userID;
        this.state = {
            messages: [],
            users: []
        };
        this.rendered = 0;
        this.users = [];
        this.setState(state);
    }
    
    setState(state) {
        Object.assign(this.state, state);
        this.updateUsersCache();
        this.modified = true;
    }

    updateUsersCache() {
        for (var user of this.state.users) {
            this.users[user.id] = user.name;
        }
    }

    render() {
        if (!this.modified) {
            return;
        }

        var $root = dom('#chat');

        for (var i = this.rendered; i < this.state.messages.length; ++i, ++this.rendered) {
            var message = this.state.messages[i];
            switch (message.type) {
                case 'break':
                    var $break = dom.new('div', { className: 'chat-break' });
                    $root.append($break);
                    var $drawing = dom.new('div', { className: 'chat-row drawing' }, [
                        dom.new('div', { className: 'chat-name', innerText: this.users[message.user] })]);
                    $root.append($drawing);
                    break;
                case 'word':
                    var $word = dom.new('div', { className: 'chat-row word' }, [
                        dom.new('div', { className: 'chat-message', innerText: message.value })]);
                    $root.append($word);
                    break;
                case 'guess':
                case 'close-guess':
                case 'guessed':
                    var value = message.value;
                    var extraClasses = '';
                    if (message.type != 'guess' && message.user != this.userID) {
                        var drawing = findLast(this.state.messages, m => m.type == 'break', i);
                        if (!drawing || drawing.user != this.userID) {
                            value = applyMask(value, () => randomChar());
                            extraClasses += ' blur';
                        }
                    }
                    var $message = dom.new('div', { className: `chat-row ${message.type}` }, [
                        dom.new('div', { className: 'chat-name', innerText: this.users[message.user] }),
                        dom.new('div', { className: 'chat-message' + extraClasses, innerText: value })]);
                    $root.append($message);
            }
        }
        
        this.modified = false;
    }

}