'use strict';
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const http_1 = require("http");
const event_interface_1 = require("../sync-watch-application/model/event.interface");

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static(__dirname + '/dist/sync-watch-application'));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/sync-watch-application/index.html'));
});

const server = http_1.createServer(app);
const io = socketIO(server);

server.listen(PORT, function () {
    console.log('Running video server on port %s', PORT);
});

io.on(event_interface_1.Event.CONNECT, function (socket) {
    console.log('connected');
    var room = '';
    var username = '';
    socket.on(event_interface_1.Event.JOIN, function (r, c) {
        socket.join(r);
        room = r;
        username = c;
        io.to(room).emit(event_interface_1.Event.SEND_MESSAGE, {
            content: username + ' connected'
        });
        console.log('connected');
    });
    socket.on(event_interface_1.Event.SEND_MESSAGE, function (m) {
        io.to(room).emit(event_interface_1.Event.SEND_MESSAGE, m);
    });
    socket.on(event_interface_1.Event.DISCONNECT, function () {
        io.to(room).emit(event_interface_1.Event.SEND_MESSAGE, {
            content: username + ' disconnected'
        });
        console.log('disconnected');
    });
    socket.on(event_interface_1.Event.PLAY, function () {
        socket.to(room).emit(event_interface_1.Event.PLAY);
    });
    socket.on(event_interface_1.Event.PAUSE, function () {
        socket.to(room).emit(event_interface_1.Event.PAUSE);
    });
    socket.on(event_interface_1.Event.SYNC_TIME, function (t) {
        socket.to(room).emit(event_interface_1.Event.SYNC_TIME, t);
    });
    socket.on(event_interface_1.Event.NEW_VIDEO, function (i) {
        io.to(room).emit(event_interface_1.Event.NEW_VIDEO, i);
    });
    socket.on(event_interface_1.Event.PLAY_NEW_VIDEO, function (id) {
        io.to(room).emit(event_interface_1.Event.PLAY_NEW_VIDEO, id);
    });
    // TODO emit to HOST user so just one client send info
    socket.on(event_interface_1.Event.ASK_VIDEO_INFORMATION, function (socketId) {
        io.to(room).emit(event_interface_1.Event.ASK_VIDEO_INFORMATION, socketId);
    });
    socket.on(event_interface_1.Event.SYNC_VIDEO_INFORMATION, function (v, socketId) {
        socket.broadcast.to(socketId).emit(event_interface_1.Event.SYNC_VIDEO_INFORMATION, v);
    });
    socket.on(event_interface_1.Event.ALERT_MEMBERS_NEW_USER, function (u) {
        io.to(room).emit(event_interface_1.Event.ALERT_MEMBERS_NEW_USER, u);
    });
    socket.on(event_interface_1.Event.SYNC_CURRENT_ROOM_MEMBER, function (u, socketId) {
        socket.to(socketId).emit(event_interface_1.Event.SYNC_CURRENT_ROOM_MEMBER, u);
    });
    socket.on(event_interface_1.Event.GET_USER_ROLE, function (u) {
        io.to(room).emit(event_interface_1.Event.GET_USER_ROLE, u);
    });
    socket.on(event_interface_1.Event.ASK_VIDEO_TIME, function (socketId) {
        io.to(room).emit(event_interface_1.Event.ASK_VIDEO_TIME, socketId);
    });
    socket.on(event_interface_1.Event.SYNC_TIME_ON_JOIN, function (socketId, t) {
        socket.to(socketId).emit(event_interface_1.Event.SYNC_TIME_ON_JOIN, t);
    });
    socket.on(event_interface_1.Event.ASK_STATUS, function (socketId) {
        io.to(room).emit(event_interface_1.Event.ASK_STATUS, socketId);
    });
    socket.on(event_interface_1.Event.SYNC_STATUS, function (socketId, s) {
        socket.to(socketId).emit(event_interface_1.Event.SYNC_STATUS, s);
    });
});
