import dom from './dom.js';
import { Game } from './game.js';
import { addVectors, getTransformObject, getVector, multVector } from './utils.js';

var socket = io();
var game = undefined;
var gameID = location.hash.substr(1);
var userID = localStorage.userID || (localStorage.userID = Math.random().toString(36).substr(2));
var userName = localStorage.userName;
var isDown = false;
var transformOrigin = undefined;
var scaleCurrent = undefined;

window.addEventListener('hashchange', () => {
    var newGameID = location.hash.substr(1);
    if (gameID != newGameID) {
        location.reload();
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

dom('#createGame').on('click', async e => {
    createGame({
        turnDuration: +dom('#turnDuration').value,
        numberOfChoices: +dom('#numberOfChoices').value,
        words: (dom('#wordsList').value || await (await fetch('words.txt')).text())
            .split(',').map(w => w.trim()).filter(w => w),
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

dom().on('keyup', e => {
    if (!game) return;
    if (e.ctrlKey && e.code == 'KeyZ') {
        game.handle({
            type: 'undo'
        });
    }
    if (e.altKey && e.code == 'KeyW') {
        dom('#word-container').classList.toggle('top');
    }
    if (e.key == 'Alt' && (transformOrigin || scaleCurrent)) {
        game.handle({
            type: 'transform-apply'
        });
        transformOrigin = undefined;
        scaleCurrent = undefined;
        isDown = false;
    }
});

dom('#clear').on('click', e => {
    if (game) {
        game.handle({ type: 'clear' });
    }
});

dom('#startGame').on('click', startGame);

dom('#surface').on('mousedown', handleDown, { passive: false });
dom('#surface').on('touchstart', handleDown, { passive: false });

dom().on('mouseup', handleUp, { passive: false });
dom().on('touchend', handleUp, { passive: false });

dom().on('mousemove', handleMove, { passive: false });
dom().on('touchmove', handleMove, { passive: false });

dom().on('wheel', handleScroll);

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


function getPoint(e, touchIndex = 0) {
    if (e.touches && e.touches.length <= touchIndex) {
        touchIndex = 0;
    }
    var rect = dom('#canvas').getBoundingClientRect();
    return {
        x: +(100 * ((e.touches ? e.touches[touchIndex].clientX : (e.clientX + touchIndex*100)) - rect.x) / rect.width).toFixed(2),
        y: +(50 * ((e.touches ? e.touches[touchIndex].clientY : (e.clientY + touchIndex*100)) - rect.y) / rect.height).toFixed(2)
    };
}

function getTransform(e) {
    var transformCurrent = [getPoint(e, 0), getPoint(e, 1)];
    var localOrigin = [...(transformOrigin || transformCurrent)];
    if (scaleCurrent) {
        localOrigin[1] = addVectors(localOrigin[0], multVector(getVector(...localOrigin), scaleCurrent));
    }
    return getTransformObject(localOrigin, transformCurrent);
}

function handleScroll(e) {
    if (!game || !e.altKey || e.deltaMode) return;
    if (!scaleCurrent) {
        scaleCurrent = 1
    }

    const scaleCoef = 1.1;
    var absoluteScroll = e.deltaY / window.devicePixelRatio / 100;
    var currentScroll = Math.log(scaleCurrent) / Math.log(scaleCoef);
    scaleCurrent = Math.pow(scaleCoef, currentScroll + absoluteScroll);

    game.handle({
        type: 'transform-preview',
        value: getTransform(e)
    });
}

function handleDown(e) {
    if (game) {
        isDown = true;
        game.handle({
            type: 'draw-start',
            point: getPoint(e)
        });
        transformOrigin = undefined;
        scaleCurrent = undefined;
        e.stopPropagation();
        e.preventDefault();
    }
}

function handleUp(e) {
    if (game && isDown) {
        isDown = false;
        if (transformOrigin) {
            game.handle({
                type: 'transform-apply'
            });
            transformOrigin = undefined;
            scaleCurrent = undefined;
        } else {
            game.handle({
                type: 'draw-stop'
            });
        }
        e.stopPropagation();
        e.preventDefault();
    }
    if (game && !game.canDraw()) {
        dom('#wordInput').focus();
    }
}

function handleMove(e) {
    if (game && isDown) {
        if (transformOrigin) {
            game.handle({
                type: 'transform-preview',
                value: getTransform(e)
            });
        } else if (e.touches && e.touches.length > 1 || e.altKey) {
            transformOrigin = [getPoint(e, 0), getPoint(e, 1)];
            game.handle({
                type: 'undo'
            });
        } else {
            game.handle({
                type: 'draw-move',
                point: getPoint(e)
            });
        }
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
            setTimeout(() => {
                // if no state received in 1 second, reset the game (no active players)
                if (!game.state.settings.words.length) {
                    location.hash = '';
                }
            }, 1000);
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