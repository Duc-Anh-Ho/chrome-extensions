"use strict";
import common, { isPlaying } from "../scripts/common.js";
import { ACTION } from "../constants/constants.js";

console.info("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    document.addEventListener("click", async (e) => {
        common.setLastPlayedVideo(document); // Refresh/Update 
    });
    document.addEventListener("keydown", async (e) => {
        console.log("e.code:", e.code);
        // Refresh/Update variables
        common.setLastPlayedVideo(document);
        let videos = common.getVideos(document); 
        if (!videos?.length) return;
        videos_loop: for (const video of videos) {
            let activeVideo = common.isPlaying(video) ? video : common.getLastPlayedVideo(document);
            switch (e.code) {
                case "Period":
                    if (!e.shiftKey) break;
                    console.log("here: line #24"); // TODO: <-- DELETE 
                    break;
                case "Comma":
                    if (!e.shiftKey) break;
                    console.log("here: line #28"); // TODO: <-- DELETE 
                    break;
                // case "Space":
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
        // CONFIGURATION
        switch (e.code) {
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
    });
}

export { main };