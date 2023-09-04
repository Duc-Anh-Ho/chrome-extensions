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
        videosConfig.speed = Math.min(videosConfig.speed + videosConfig.step, videosConfig.MAX_SPEED - 1);
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
        speed = speed || videosConfig.speed;
        for (const video of videos) {
            activeVideo = common.isPlaying(video) ? video : common.getLastPlayedVideo(document);
            activeVideo.playbackRate = (speed / 100).toFixed(2);
            // video.playbackRate = (speed / 100).toFixed(2);
        }
    }, 300, 50);

    // Auto Sync
    common.syncStorage("sync", "videosConfig", syncPlaybackRate); 
    window.setInterval(() => {
        syncPlaybackRate();
    }, 500);

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
        let videos = common.getVideos(document); 
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
        if (!videos?.length) return;
        videos_loop: for (const video of videos) {
            // let activeVideo = common.isPlaying(video) ? video : common.getLastPlayedVideo(document);
            switch (e.code) {
                // Pause Fn
                // case "Space":
                case "KeyP":
                case "KeyK":
                    activeVideo === video ? video.paused ? video.play() : video.pause() : video.pause();
                    break;
                // Mute Fn
                case "KeyM":
                    video.muted = activeVideo === video ? !video.muted : true;
                    break;
                // Fullscreen Fn
                case "Enter": if (!e.altKey) break;
                case "KeyF":
                    if (activeVideo === video) {
                        await common.toggleFullscreen(document, video);
                        break videos_loop; // For 2 videos playing
                    }
                    break;
                default:
                    break;
            }
        }
    });
}

export { main };