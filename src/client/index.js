import dom from './dom.js';
import { Game } from './game.js';

var socket = io();
var game = undefined;
var gameID = location.hash.substr(1);
var userID = localStorage.userID || (localStorage.userID = Math.random().toString(36).substr(2));
var userName = localStorage.userName;
var isDown = false;

document.addEventListener("DOMContentLoaded", e => { 
    if (!userName) {
        dom('#userName').focus();
    }
});

socket.on('connect', () => {
    if (!userName) {
        dom('#user-name-box').classList.remove('hide');
        dom('#userName').focus();
    } else {
        connectUser();
    }
});

dom('#userName').on('keyup', e => {
    if (e.key== 'Enter') {
        userName = (localStorage.userName = dom('#userName').value);
        connectUser();
        dom('#user-name-box').classList.add('hide');
    }
});

dom('#createGame').on('click', e => {
    createGame({
        turnDuration: +dom('#turnDuration').value,
        numberOfChoices: +dom('#numberOfChoices').value,
        words: dom('#wordsList').value.split(',').map(w => w.trim()).filter(w => w),
    });
});

dom('#wordInput').on('keyup', e => {
    if (e.key== 'Enter' && game) {
        game.handle({
            type: 'guess',
            value: dom('#wordInput').value
        });
        dom('#wordInput').value = '';
    }
});

dom('#startGame').on('click', startGame);

dom('#surface').on('mousedown', handleDown);
dom('#surface').on('touchstart', handleDown);

dom().on('mouseup', handleUp);
dom().on('touchend', handleUp);

dom().on('mousemove', handleMove);
dom().on('touchmove', handleMove);

socket.on('event', event => {
    game.handle(event);
});

socket.on('request-sync', () => {
    game.pushSync();
});

socket.on('sync', state => {
    game.sync(state);
});

socket.on('new-player', player => {
    game.addUser(player);
});


function getPoint(e) {
    var rect = dom('#canvas').getBoundingClientRect();
    return {
        x: 100 * ((e.touches ? e.touches[0].clientX : e.clientX) - rect.x) / rect.width,
        y: 50 * ((e.touches ? e.touches[0].clientY : e.clientY) - rect.y) / rect.height
    };
}

function handleDown(e) {
    if (game) {
        isDown = true;
        game.handle({
            type: 'draw-start',
            point: getPoint(e)
        });
        e.stopPropagation();
        e.preventDefault();
    }
}

function handleUp(e) {
    if (game && isDown) {
        isDown = false;
        game.handle({
            type: 'draw-stop'
        });
        e.stopPropagation();
        e.preventDefault();
    }
    if (game && !game.canDraw()) {
        dom('#wordInput').focus();
    }
}

function handleMove(e) {
    if (game && isDown) {
        game.handle({
            type: 'draw-move',
            point: getPoint(e)
        });
        e.stopPropagation();
        e.preventDefault();
    }
}

function connectUser() {
    socket.emit('user', { id: userID, name: userName });
    connectGame();
}

function connectGame() {
    if (gameID) {
        joinGame();
    } else {
        dom('#game-settings-box').classList.remove('hide');
    }
}

function createGame(gameSettings) {
    socket.emit('create', {}, ({ id }) => {
        location.hash = '#' + id;
        gameID = id;
        initGame(gameSettings);
    });
    dom('#game-settings-box').classList.add('hide');
}

function joinGame() {
    socket.emit('join', { id: gameID }, ({ type, error }) => {
        if (!error) {
            initGame();
            socket.emit('request-sync', { id: gameID });
        } else {
            alert(error);
        }
    });
}

function initGame(gameSettings) {
    game = new Game(gameSettings, userID);
    game.pushSync = () => socket.emit('sync', { ...game.state, id: gameID });
    game.pushEvent = event => socket.emit('event', { ...event, id: userID });
    game.addUser({
        id: userID,
        name: userName
    });
    game.queueRender();
    window.game = game; // for debugging
}

function startGame() {
    game.handle({
        type: 'start'
    });
}