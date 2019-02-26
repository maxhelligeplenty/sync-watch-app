'use strict';
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const http_1 = require("http");

const app = express();

app.use(express.static(__dirname + '/dist/sync-watch-application'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/sync-watch-application/index.html'));
});

const server = http_1.createServer(app);
const io = socketIO(server);

server.listen(process.env.PORT || 8080);

var Event;
(function (Event) {
    Event["CONNECT"] = "connect";
    Event["DISCONNECT"] = "disconnect";
    Event["SYNC_TIME"] = "sync-time";
    Event["NEW_VIDEO"] = "new-video";
    Event["ASK_VIDEO_INFORMATION"] = "ask-video-info";
    Event["SYNC_VIDEO_INFORMATION"] = "sync-video-info";
    Event["STATE"] = "state";
    Event["PLAY"] = "play";
    Event["PAUSE"] = "pause";
    Event["JOIN"] = "join";
    Event["SEND_MESSAGE"] = "send-message";
    Event["PLAY_NEW_VIDEO"] = "play-new-video";
    Event["SEND_MAIL"] = "send-mail";
    Event["SYNC_CURRENT_ROOM_MEMBER"] = "sync-current-room-member";
    Event["ALERT_MEMBERS_NEW_USER"] = "alert-members-new-user";
    Event["GET_USER_ROLE"] = "get-user-role";
    Event["ASK_VIDEO_TIME"] = "ask-video-time";
    Event["SYNC_TIME_ON_JOIN"] = "sync-time-on-join";
    Event["ASK_STATUS"] = "ask-status";
    Event["SYNC_STATUS"] = "sync-status";
})(Event = exports.Event || (exports.Event = {}));

io.on(Event.CONNECT, function (socket) {
    var room = '';
    var username = '';
    socket.on(Event.JOIN, function (r, c) {
        socket.join(r);
        room = r;
        username = c;
        io.to(room).emit(Event.SEND_MESSAGE, {
            content: username + ' connected'
        });
    });
    socket.on(Event.SEND_MESSAGE, function (m) {
        io.to(room).emit(Event.SEND_MESSAGE, m);
    });
    socket.on(Event.DISCONNECT, function () {
        io.to(room).emit(Event.SEND_MESSAGE, {
            content: username + ' disconnected'
        });
    });
    socket.on(Event.PLAY, function () {
        io.to(room).emit(Event.PLAY);
    });
    socket.on(Event.PAUSE, function () {
        io.to(room).emit(Event.PAUSE);
    });
    socket.on(Event.SYNC_TIME, function (t) {
        socket.to(room).emit(Event.SYNC_TIME, t);
    });
    socket.on(Event.NEW_VIDEO, function (i) {
        io.to(room).emit(Event.NEW_VIDEO, i);
    });
    socket.on(Event.PLAY_NEW_VIDEO, function (id) {
        io.to(room).emit(Event.PLAY_NEW_VIDEO, id);
    });
    // TODO emit to HOST user so just one client send info
    socket.on(Event.ASK_VIDEO_INFORMATION, function (socketId) {
        io.to(room).emit(Event.ASK_VIDEO_INFORMATION, socketId);
    });
    socket.on(Event.SYNC_VIDEO_INFORMATION, function (v, socketId) {
        socket.broadcast.to(socketId).emit(Event.SYNC_VIDEO_INFORMATION, v);
    });
    socket.on(Event.ALERT_MEMBERS_NEW_USER, function (u) {
        io.to(room).emit(Event.ALERT_MEMBERS_NEW_USER, u);
    });
    socket.on(Event.SYNC_CURRENT_ROOM_MEMBER, function (u, socketId) {
        socket.to(socketId).emit(Event.SYNC_CURRENT_ROOM_MEMBER, u);
    });
    socket.on(Event.GET_USER_ROLE, function (u) {
        io.to(room).emit(Event.GET_USER_ROLE, u);
    });
    socket.on(Event.ASK_VIDEO_TIME, function (socketId) {
        io.to(room).emit(Event.ASK_VIDEO_TIME, socketId);
    });
    socket.on(Event.SYNC_TIME_ON_JOIN, function (socketId, t) {
        socket.to(socketId).emit(Event.SYNC_TIME_ON_JOIN, t);
    });
    socket.on(Event.ASK_STATUS, function (socketId) {
        io.to(room).emit(Event.ASK_STATUS, socketId);
    });
    socket.on(Event.SYNC_STATUS, function (socketId, s) {
        socket.to(socketId).emit(Event.SYNC_STATUS, s);
    });
});

setInterval(function () {
    var date = new Date();
    var hour = date.getHours();
    if(hour >= 10 && hour <= 2)
    {
        http_1.get("http://sync-watch-application.herokuapp.com");
    }
}, 300000);
