"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const video_sync_server_1 = require("./video-sync-server");
const server = new video_sync_server_1.VideoSyncServer().getApp();
exports.server = server;
