import { AlertType } from './../alert/data/alert-types.enum';
import {Component, Input, OnInit} from "@angular/core";
import {SyncVideoInterface} from "../../interface/sync-video.interface";
import {Message} from "../../interface/message.interface";
import {Event} from "../../interface/event.interface";
import {isNullOrUndefined} from "util";
import {VideoInfoInterface} from "../../interface/video-info.interface";
import {UserEnum, UserInterface} from "../../interface/user.interface";
import {PlaylistInterface} from "../../interface/playlist.interface";
import {YoutubeVideoDataService} from "../../service/youtube-video-data.service";
import * as socketIo from "socket.io-client";
import * as copy from "copy-to-clipboard";
import * as rug from "random-username-generator";
import {Router} from "@angular/router";
import { AlertService } from '../alert/alert.service';

// const SERVER_URL = process.env.REACT_APP_SOCKET_URL || '/';

const SERVER_URL = "localhost:8080";

@Component({
    selector: "video-room",
    templateUrl: "./video-room.component.html",
    styleUrls: ["./video-room.component.scss"]
})
export class VideoRoomComponent implements OnInit {
    @Input() public room: string = "whatHappened";

    public newVideoUrl: string;
    public syncData: SyncVideoInterface;
    public videoHistoryList: Array<PlaylistInterface> = [];
    public messages: Array<Message> = [];
    public newMessage: string;
    public currentRoomMember: Array<UserInterface> = [];

    public videoId: string = "m3eMBErXMYE";

    private isReady: boolean = false;
    private user: UserInterface;
    private socket;


    constructor(private youtubeVideoDataService: YoutubeVideoDataService,
                private router: Router, private alertService:AlertService) {
    }

    public ngOnInit(): void {
    }

    public addNewVideoUrl(url: string): void {
        if (!isNullOrUndefined(url)) {
            let videoId: string = this.getVideoId(url);
            this.youtubeVideoDataService.getVideoInfoById(videoId).subscribe((res: any) => {
                let videoData: PlaylistInterface = {
                    videoId: videoId,
                    videoData: {
                        thumbnail: res.items[0].snippet.thumbnails.default.url,
                        title: res.items[0].snippet.localized.title.substring(0, 25) +
                        (res.items[0].snippet.localized.title.length > 24 ? "..." : "")
                    }
                };
                this.alertService.add({message: 'Added new video to playlist', type: AlertType.neutral, dismiss: 3000});
                this.syncData.socket.emit(Event.NEW_VIDEO, videoData);
            });
            this.newVideoUrl = undefined;
        }
    }

    public copyInviteLinkToClipboard(): void {
        this.alertService.add({message: 'Copied link to clipboard !', type: AlertType.neutral, dismiss: 5000});
        copy(document.location.href);
    }

    public navigateToStartPage(): void {
        this.syncData.socket.emit().destroy();
        this.router.navigateByUrl("/start");
    }

    public savePlayer(player: YT.Player): void {
        this.initIoConnection();
        this.syncData = {
            videoId: this.videoId,
            player: player,
            socket: this.socket,
            room: this.room,
        };
        this.syncData.player.playVideo();
        this.isReady = true;
    }

    public onStateChange(): void {
        this.changeState(this.syncData.player.getPlayerState());
    }

    public sendMessage(text: string): void {
        if (!isNullOrUndefined(text)) {
            let message: Message = {
                from: this.user,
                content: text
            };
            this.syncData.socket.emit(Event.SEND_MESSAGE, message);
            this.newMessage = undefined;
        }
    }

    public playNewVideoById(id: string): void {
        this.syncData.socket.emit(Event.PLAY_NEW_VIDEO, id);
    }

    private initIoConnection(): void {
        this.socket = socketIo();

        this.socket.on(Event.CONNECT, () => {
            this.syncData.clientId = this.socket.id;
            this.user = {
                id: this.syncData.clientId,
                name: rug.generate(),
                role: "member",
                status: UserEnum.JOINING
            };
            this.syncData.socket.emit(Event.JOIN, this.syncData.room, this.user.name);
            this.syncData.socket.emit(Event.ALERT_MEMBERS_NEW_USER, this.user);
            this.syncData.socket.emit(Event.ASK_VIDEO_INFORMATION, this.socket.id);
        });

        this.socket.on(Event.SEND_MESSAGE, (message: Message) => {
            this.messages.push(message);
        });

        this.socket.on(Event.PLAY_NEW_VIDEO, (id: string) => {
            this.syncData.player.loadVideoById({
                videoId: id
            });
        });

        this.socket.on(Event.PLAY, () => {
            this.syncData.player.playVideo();
        });

        this.socket.on(Event.PAUSE, () => {
            this.syncData.player.pauseVideo();
        });

        this.socket.on(Event.SYNC_TIME, (time: number) => {
            this.syncVideoTime(time);
        });

        this.socket.on(Event.NEW_VIDEO, (videoData: PlaylistInterface) => {
            this.videoHistoryList.unshift(videoData);
        });

        this.socket.on(Event.ASK_VIDEO_INFORMATION, (socketId: string) => {
            let videoInfo: VideoInfoInterface = {
                url: this.syncData.player.getVideoUrl(),
                time: this.syncData.player.getCurrentTime()
            };
            this.syncData.socket.emit(Event.SYNC_VIDEO_INFORMATION, videoInfo, socketId);
        });

        this.socket.on(Event.SYNC_VIDEO_INFORMATION, (videoInfo: VideoInfoInterface) => {
            this.syncData.player.loadVideoById({
                videoId: this.getVideoId(videoInfo.url)
            });
        });

        this.socket.on(Event.ALERT_MEMBERS_NEW_USER, (user: UserInterface) => {
            this.currentRoomMember.push(user);
            this.syncData.socket.emit(Event.SYNC_CURRENT_ROOM_MEMBER, this.user, user.id);
        });

        this.socket.on(Event.SYNC_CURRENT_ROOM_MEMBER, (user: UserInterface) => {
            this.currentRoomMember.push(user);
        });

        this.socket.on(Event.ASK_VIDEO_TIME, (socketId: string) => {
            this.syncData.socket.emit(Event.SYNC_TIME_ON_JOIN, socketId, this.syncData.player.getCurrentTime());
        });

        this.socket.on(Event.SYNC_TIME_ON_JOIN, (time: number) => {
            this.syncVideoTime(time);
        });

        this.socket.on(Event.ASK_STATUS, (socketId: string) => {
            this.syncData.socket.emit(Event.SYNC_TIME_ON_JOIN, socketId, this.syncData.player.getPlayerState());
        });

        this.socket.on(Event.SYNC_STATUS, (status: number) => {
            this.changeState(status);
        });
    }

    private syncVideoTime(time: number): void {
        if (this.syncData.player.getCurrentTime() < time - 1 || this.syncData.player.getCurrentTime() > time + 1) {
            this.syncData.player.seekTo(time, true);
        }
    }

    private changeState(state: number): void {
        if (this.isReady) {
            switch (state) {
                case -1:
                    break;
                case 1:
                    if (this.user.status === UserEnum.JOINING) {
                        this.user.status = UserEnum.JOINED;
                        this.syncData.socket.emit(Event.ASK_VIDEO_TIME, this.user.id);
                    } else if (this.user.status === UserEnum.SEEKING) {
                        this.syncData.socket.emit(Event.SYNC_TIME, this.syncData.player.getCurrentTime());
                        this.user.status = UserEnum.JOINED;
                    }
                    this.syncData.socket.emit(Event.PLAY);
                    break;
                case 2:
                    this.syncData.socket.emit(Event.PAUSE);
                    break;
                case 3:
                    if (this.user.status !== UserEnum.JOINING) {
                        this.user.status = UserEnum.SEEKING;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    private getVideoId(url): string {
        if (!isNullOrUndefined(url) && !isNullOrUndefined(this.syncData.player)) {
            const idRegex: RegExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
            const videoId: string = url.split(idRegex)[1];
            return videoId;
        }
    }
}
