"use strict";
import common from "../scripts/common.js";
import { VIDEOS_CONFIG, ACTION } from "../constants/constants.js";

console.info("Content script loaded!");
const main = async () => {
    // VIDEO controllers
    const increaseSpeed = async () => {
        let storage = await common.getStorage(["videosConfig"]);
        let videosConfig = storage.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.speed = Math.min(videosConfig.speed + videosConfig.step, videosConfig.MAX_SPEED - 1);
        console.log("videosConfig:", videosConfig);
        await common.setStorage({ videosConfig });
    }
    const decreaseSpeed = async () => {
        let storage = await common.getStorage(["videosConfig"]);
        let videosConfig = storage.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.speed = Math.max(videosConfig.speed - videosConfig.step, 0);
        await common.setStorage({ videosConfig });
    }
    document.addEventListener("click", async (e) => {
        common.setLastPlayedVideo(document); // Refresh/Update 
    });
    document.addEventListener("keydown", async (e) => {
        // console.log("e.code:", e.code); // TODO: DELETE HERE
        // Refresh/Update variables
        common.setLastPlayedVideo(document);
        let videos = common.getVideos(document); 
        // if (!videos?.length) return;

        switch (e.code) {
            case "Period":
                if (!e.shiftKey) break;
                await increaseSpeed();
                break;
            case "Comma":
                if (!e.shiftKey) break;
                await decreaseSpeed();
                break;
            case "Slash":
                if (!e.shiftKey) break;
                await common.requestAction(ACTION.CREATE_NOTIFICATION);
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
        videos_loop: for (const video of videos) {
            let activeVideo = common.isPlaying(video) ? video : common.getLastPlayedVideo(document);
            switch (e.code) {
                case "Period":
                    if (!e.shiftKey) break;
                    break;
                case "Comma":
                    if (!e.shiftKey) break;
                    break;
                // case "Space":
                case "KeyP":
                case "KeyK":
                    activeVideo === video ? video.paused ? video.play() : video.pause() : video.pause();
                    break;
                case "KeyM":
                    video.muted = activeVideo === video ? !video.muted : true;
                    break;
                case "Enter":
                    if (!e.altKey) break;
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