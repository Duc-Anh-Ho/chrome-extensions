"use strict";
import common from "../scripts/common.js";
import { VIDEOS_CONFIG, ACTION } from "../constants/constants.js";

console.info("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    let activeVideo;
    const increaseSpeed = common.throttleDebounced(async () => {
        let storage = await common.getStorage(["videosConfig"]);
        let videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.speed = Math.min(videosConfig.speed + videosConfig.step, videosConfig.MAX_SPEED);
        await common.setStorage({ videosConfig });
    }, 200, 50);
    const decreaseSpeed = common.throttleDebounced(async () => {
        let storage = await common.getStorage(["videosConfig"]);
        let videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.speed = Math.max(videosConfig.speed - videosConfig.step, 0);
        await common.setStorage({ videosConfig });
    }, 200, 50);
    const resetSpeed = common.throttleDebounced(async() => {
        let videosConfig = { ...VIDEOS_CONFIG };
        await common.setStorage({ videosConfig });
    }, 200, 50);
    const syncPlaybackRate = common.throttleDebounced(async (speed) => {
        let storage = await common.getStorage(["videosConfig"]);
        let videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        let videos = common.getVideos(document);
        if (!videos?.length) return;
        speed = speed || videosConfig.speed;
        videos_loop:for (const video of videos) {
            // activeVideo = common.isPlaying(video) ? video : common.getLastPlayedVideo(document);
            // video.playbackRate = (speed / 100).toFixed(2);
            if (common.isPlaying(video)) {
                activeVideo = video;
                break videos_loop;
            } else {
                activeVideo = common.getLastPlayedVideo(document)
            }
        }
        activeVideo.playbackRate = (speed / 100).toFixed(2);
    }, 500, 200);

    // Auto Sync
    common.syncStorage("sync", "videosConfig", syncPlaybackRate); 
    window.setInterval(() => {
        syncPlaybackRate();
    }, 750);

    // Events
    document.addEventListener("click", async (e) => {
        // Refresh/Update 
        common.setLastPlayedVideo(document); 
        syncPlaybackRate();
    });
    addEventListener("scroll", (e) => {
        syncPlaybackRate();
    });
    document.addEventListener("keydown", async (e) => {
        // Refresh/Update variables
        common.setLastPlayedVideo(document);
        syncPlaybackRate();
        switch (e.code) {
            case "Period":
                if (e.shiftKey) increaseSpeed();
                break;
            case "Comma":
                if (e.shiftKey) decreaseSpeed();
                break;
            case "Slash":
                if (e.shiftKey) await common.requestAction(ACTION.CREATE_NOTIFICATION);
                break;
            case "KeyP":
            case "KeyK":
                activeVideo.paused ? activeVideo.play() : activeVideo.pause();
                break;
            case "KeyM":
                activeVideo.muted = !activeVideo.muted ;
                break;
            case "Enter": if (!e.altKey) break;
            case "KeyF":
                await common.toggleFullscreen(document, activeVideo); 
                break;
            case "Digit0":
                if (e.shiftKey) resetSpeed();
                break;
            case "Digit1":
                await common.requestAction(ACTION.CLEAR_NOTIFICATIONS);
                break;
            case "Digit2":
                await common.requestAction(ACTION.SHOW_PAGE_ACTION);
                break;
            case "Digit3":
                await common.requestAction(ACTION.HIDE_PAGE_ACTION);
                break;
            default:
                break;
        }
    });
}

export { main };