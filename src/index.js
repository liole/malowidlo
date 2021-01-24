var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var storage = require('./memoryStorage.js');

app.use('/', express.static(__dirname + '/client'));

io.on('connection', (socket) => {
    console.log(`A new socket connected. (ID=${socket.id})`);

    socket.on('user', data => {
        var user = {
            socket: socket.id,
            name: data.name
        };
        storage.createUser(data.id, user);
        console.log(`User ${data.id}[${data.name}] is connected. (ID=${socket.id})`);

        // restore broken connection
        var gameID = storage.findGame(game => game.players.includes(data.id));
        if (gameID) {
            socket.join(gameID);
        }
    });

    socket.on('create', (data, callback) => {
        var userID = storage.findUser(user => user.socket == socket.id);
        if (userID) {
            var game = {
                players: [userID]
            };
            var id = Math.random().toString(36).substr(2);
            storage.deletePlayerFromGames(userID);
            storage.createGame(id, game);
            socket.join(id);
            console.log(`A new game created by user ${userID}. (ID=${id})`);
            callback({ id });
        }
    });

    socket.on('join', (data, callback) => {
        var userID = storage.findUser(user => user.socket == socket.id);
        if (userID) {
            var game = storage.getGame(data.id);
            if (game) {
                socket.join(data.id);
                if (!game.players.includes(userID)) {
                    storage.deletePlayerFromGames(userID);
                    storage.updateGame(data.id, game => game.players.push(userID));
                    var user = storage.getUser(userID);
                    socket.to(data.id).emit('new-player', { id: userID, name: user.name });
                }
                console.log(`User ${userID} joind game ${data.id}.`);
                callback(game);
            } else {
                callback({ error: `Game ${data.id} not found.` });
            }
        }
    });

    socket.on('event', data => {
        var gameID = storage.findGame(game => game.players.includes(data.id));
        if (gameID) {
            socket.to(gameID).emit('event', data);
        }
    });

    socket.on('request-sync', data => {
        var userID = storage.findUser(user => user.socket == socket.id);
        if (userID) {
            var game = storage.getGame(data.id);
            if (game && game.players.length) {
                var user = storage.getUser(game.players.find(p => p != userID));
                if (user) {
                    io.to(user.socket).emit('request-sync');
                }
            }
        }
    });

    socket.on('sync', data => {
        socket.to(data.id).emit('sync', data);
    });

    socket.on('disconnect', reason => {
        console.log(`Socket is disconnected. (ID=${socket.id})`);
    });
});

var port = process.env.PORT || 19313;

http.listen(port, () => {
    console.log('listening on *:' + port);
});
