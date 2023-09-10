"use strict";
import common from "../scripts/common.js";
import { VIDEOS_CONFIG, ACTION } from "../constants/constants.js";

console.info("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    let activeVideo = null;
    let parentActiveVideo = null;
    const increaseSpeed = common.throttleDebounced(async () => {
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.speed = Math.min(videosConfig.speed + videosConfig.step, videosConfig.MAX_SPEED);
        await common.setStorage({ videosConfig });
    }, 100, 50);
    const decreaseSpeed = common.throttleDebounced(async () => {
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.speed = Math.max(videosConfig.speed - videosConfig.step, 0);
        await common.setStorage({ videosConfig });
    }, 100, 50);
    const setSpeed = common.throttleDebounced(async (speed) => {
        const videosConfig = { ...VIDEOS_CONFIG };
        videosConfig.speed = speed;
        await common.setStorage({ videosConfig });
    }, 100, 50);
    const resetSpeed = common.throttleDebounced(async() => {
        const videosConfig = { ...VIDEOS_CONFIG };
        await common.setStorage({ videosConfig });
    }, 100, 50);
    const syncPlaybackRate = common.throttleDebounced(async (speed) => {
        const videos = common.getVideos(document);
        if (!videos?.length) {
            await common.requestAction(ACTION.HIDE_PAGE_ACTION);
            return;
        };
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        speed = speed || videosConfig.speed;
        for (const video of videos) {
            if (common.isPlaying(video)) {
                activeVideo = video;
                parentActiveVideo = activeVideo.parentNode;
                activeVideo.playbackRate = (speed / 100).toFixed(2);
                await common.requestAction(ACTION.SHOW_PAGE_ACTION);
                return;
            }
        }
        activeVideo = common.getLastPlayedVideo(document)
        parentActiveVideo = activeVideo.parentNode;
        await common.requestAction(ACTION.HIDE_PAGE_ACTION);
    }, 650, 300);
    const setDisplayInVideo = async (parentVideo) => {
        await removeDisplayInVideo();
        clearTimeout(timerRemoveDisplay);
        if (!parentVideo) return;
        const resetTimer = true;
        const displayInVideoCont = document.createElement("div");
        const displaySpeedSpan = document.createElement("span");
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        const displaySpeed = (videosConfig.speed / 100).toFixed(2);
        displayInVideoCont.id = "display-in-video-container";
        displayInVideoCont.style.position = "absolute";
        displayInVideoCont.style.zIndex = "1"
        displayInVideoCont.style.top = "10px";
        displayInVideoCont.style.left = "10px";
        displayInVideoCont.style.height = "fit-content";
        displayInVideoCont.style.width = "fit-content";
        displayInVideoCont.style.padding = "5px";
        displayInVideoCont.style.opacity = "0.8"; // TODO: Change to dynamic input
        displayInVideoCont.style.backgroundColor = "Black";
        displayInVideoCont.style.borderRadius = "8px";
        displayInVideoCont.style.color = "FloralWhite";
        displayInVideoCont.style.fontSize = "12px";
        displayInVideoCont.style.fontWeight = "bold";
        displayInVideoCont.draggable = true;
        displayInVideoCont.style.cursor = "move";
        displayInVideoCont.appendChild(displaySpeedSpan);
        displaySpeedSpan.id = "display-speed-span";
        displaySpeedSpan.textContent = `${displaySpeed}`;
        // displayInVideoCont.addEventListener("mouseenter",showMore);
        // displayInVideoCont.addEventListener("mouseout",showLess);
        parentVideo.insertAdjacentElement("afterbegin", displayInVideoCont);
        let timerRemoveDisplay = setTimeout((() => {
            removeDisplayInVideo();
        }, 1000));
    };
    const removeDisplayInVideo = async () => {
        const displayInVideo = document.getElementById("display-in-video-container");
        if (displayInVideo) {
            console.log("here: line #94"); // TODO: ⬅️ DELETE 
            displayInVideo.remove();}
    };
    // Auto Sync
    common.syncStorage("sync", "videosConfig", syncPlaybackRate); 
    let runner = window.setInterval(() => {
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
                if (e.shiftKey) {
                    increaseSpeed();
                    await setDisplayInVideo(parentActiveVideo);
                }
                break;
            case "Comma":
                if (e.shiftKey) {
                    decreaseSpeed();
                    await setDisplayInVideo(parentActiveVideo);
                }
                break;
            case "Slash":
                // if (e.shiftKey) await common.requestAction(ACTION.CREATE_NOTIFICATION);
                break;
            case "KeyP":
            case "KeyK":
                if (!activeVideo) break;
                activeVideo.paused ? activeVideo.play() : activeVideo.pause();
                break;
            case "KeyM":
                if (!activeVideo) break;
                activeVideo.muted = !activeVideo.muted;
                break;
            case "Enter": if (!e.altKey) break;
            case "KeyF":
                if (!activeVideo) break;
                await common.toggleFullscreen(document, activeVideo); 
                break;
            case "Digit0":
                if (e.shiftKey) resetSpeed();
                break;
            case "Digit1":
                if (e.altKey) await setDisplayInVideo(parentActiveVideo);
                if (e.shiftKey) setSpeed(100);
                break;
            case "Digit2":
                if (e.shiftKey) setSpeed(200);
                break;
            case "Digit3":
                if (e.shiftKey) setSpeed(300);
                break;
            case "Digit4":
                if (e.shiftKey) setSpeed(400);
                break;
            case "Digit5":
                if (e.shiftKey) setSpeed(500);
                break;
            default:
                break;
        }
    });
};

export { main };