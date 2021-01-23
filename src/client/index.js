import dom from './dom.js';

var socket = io();
var game = undefined;
var userID = localStorage.userID || (localStorage.userID = Math.random().toString(36).substr(2));
var userName = localStorage.userName;

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

function connectUser() {
    socket.emit('user', { id: userID, name: userName });
}
