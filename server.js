"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

const express = require('express');
const path = require('path');

const video_sync_server_1 = require("./video-sync-server");
const app = new video_sync_server_1.VideoSyncServer().getApp();
exports.app = app;

app.use(express.static(__dirname + '/dist/sync-watch-application'));

app.get('/*', function(req,res) {

    res.sendFile(path.join(__dirname+'/dist/sync-watch-application/index.html'));
});