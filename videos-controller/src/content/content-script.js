"use strict";
import common from "../scripts/common.js";
import { ACTION } from "../constants/constants.js";

console.log("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    let videos = common.getVideos(document); 
    common.setLastPlayedVideo(document);
    document.addEventListener("click", async (e) => {
        common.setLastPlayedVideo(document); // Refresh/Update 
    });
    document.addEventListener("keydown", async (e) => {
        console.log("e.code:", e.code);
        // Refresh/Update variables
        videos = common.getVideos(document); 
        common.setLastPlayedVideo(document);
        if (!videos?.length) return;
        videos_loop: for (const [index, video] of videos.entries()) {
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
                    video.paused ? video.play() : video.pause();
                    break;
                case "KeyM":
                    video.muted = !video.muted;
                    break;
                case "Enter":
                    if (!e.altKey) break;
                case "KeyF":
                    console.log("common.isPlaying(video):", common.isPlaying(video));
                    if (common.isPlaying(video)) {
                        common.toggleFullscreen(document, video);
                        break videos_loop;
                    } else if (videos.length - 1  === index) {
                        let activeVideo = common.getLastPlayedVideo(document) || common.getActiveVideo(document) ;
                        if (activeVideo) common.toggleFullscreen(document, activeVideo);
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