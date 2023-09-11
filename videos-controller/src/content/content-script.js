"use strict";
import common, { isInputting } from "../scripts/common.js";
import { VIDEOS_CONFIG, ACTION, COLOR } from "../constants/constants.js";

console.info("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    let activeVideo = null;
    let parentActiveVideo = null;
    let displayTimer = null;
    const setSpeed = common.throttleDebounced(async (speed) => {
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        if (speed === "increase") {
            videosConfig.speed = Math.min(videosConfig.speed + videosConfig.step, videosConfig.MAX_SPEED);
        } else if (speed === "decrease") {
            videosConfig.speed = Math.max(videosConfig.speed - videosConfig.step, 0);
        } else {
            videosConfig.speed = speed;
        }
        await common.setStorage({ videosConfig });
        await setDisplayInVideo(parentActiveVideo, videosConfig.speed);
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
        activeVideo = common.getLastPlayedVideo(document);
        parentActiveVideo = activeVideo.parentNode;
        await common.requestAction(ACTION.HIDE_PAGE_ACTION);
    }, 650, 300);
    const setDisplayInVideo = async (parentVideo, speed) => {
        removeDisplayInVideo();
        if (!parentVideo) return;
        const displayInVideoCont = document.createElement("div");
        const displaySpeedSpan = document.createElement("span");;
        const displaySpeed = (speed / 100).toFixed(2);
        displayInVideoCont.id = "display-in-video-container";
        displayInVideoCont.style.position = "absolute";
        displayInVideoCont.style.zIndex = "1"
        displayInVideoCont.style.top = "5em";
        displayInVideoCont.style.left = "0em";
        displayInVideoCont.style.height = "fit-content";
        displayInVideoCont.style.width = "fit-content";
        displayInVideoCont.style.padding = "0.2em";
        displayInVideoCont.style.opacity = "0.8"; // TODO: Change to dynamic input
        displayInVideoCont.style.backgroundColor = COLOR.GREEN;
        displayInVideoCont.style.borderRadius = "8px";
        displayInVideoCont.style.color = "black";
        displayInVideoCont.style.fontSize = "1.3em";
        displayInVideoCont.style.fontWeight = "bold";
        displayInVideoCont.draggable = true;
        displayInVideoCont.style.cursor = "move";
        displayInVideoCont.appendChild(displaySpeedSpan);
        displaySpeedSpan.id = "display-speed-span";
        displaySpeedSpan.textContent = `${displaySpeed}`;
        // displayInVideoCont.addEventListener("mouseenter",showMore);
        // displayInVideoCont.addEventListener("mouseout",showLess);
        parentVideo.insertAdjacentElement("afterbegin", displayInVideoCont);
        setDisplayTimer(10000);
    };
    const removeDisplayInVideo = () => {
        const displayInVideo = document.getElementById("display-in-video-container");
        if (displayInVideo) displayInVideo.remove();
    };
    const setDisplayTimer = (delay) => {
        if(displayTimer) clearTimeout(displayTimer);
        displayTimer = setTimeout(() => {
            removeDisplayInVideo();
        }, delay);
    }
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
        if (isInputting(e)) return; // Prevents shortcut While Inputing
        switch (e.code) {
            case "Period":
                if (e.shiftKey) {
                    setSpeed("increase");
                }
                break;
            case "Comma":
                if (e.shiftKey) {
                    setSpeed("decrease");
                }
                break;
            case "Slash":
                if (e.shiftKey) await common.requestAction(ACTION.CREATE_NOTIFICATION);
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
                if (e.shiftKey) setSpeed(0);
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