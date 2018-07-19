var PORT = process.env.PORT || 3000;
var moment = require("moment");
var now = moment();
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

function getCurrentUsers(socket) {
    var info = clientInfo[socket.id];
    var users = [];
    if (typeof info === 'undefined') {
        return;
    }
    Object.keys(clientInfo).forEach(function (socketID) {
        var userInfo = clientInfo[socketID];
        if (userInfo.room == info.room) {
            users.push(userInfo.name);
        }

    });
    socket.emit('message', {
        name: 'System',
        timeStamp: moment().valueOf,
        text: 'Users in this room ' + users.join(', ')
    });
}

io.on('connection', function (socket) {
    console.log("User has connected via socket.io!");

    socket.on('disconnect', function () {
        var userData = clientInfo[socket.id];
        if (typeof userData !== 'undefined') {
            socket.leave(userData.room);
            io.to().emit('message', {
                name: 'System',
                timeStamp: moment().valueOf,
                text: userData.name + ' has left!!'
            });
            delete clientInfo[socket.id];
        }
    });

    socket.on('joinRoom', function (req) {
        clientInfo[socket.id] = req;
        socket.join(req.room);
        socket.broadcast.to(req.room).emit('message', {
            name: 'System',
            timeStamp: moment().valueOf,
            text: req.name + ' has joined!!'
        });
    });

    socket.on('message', function (message) {
        console.log("Message recieved!!", message.text);
        if (message.text == '@currentUsers') {
            getCurrentUsers(socket);
        } else {
            message.timeStamp = moment().valueOf;
            io.to(clientInfo[socket.id].room).emit('message', message);
        }

    });

    socket.emit('message', {
        name: 'System',
        text: 'Welcome to my chat application',
        timeStamp: moment().valueOf()
    });

});

http.listen(PORT, function () {
    console.log("Server started!!");
});