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
        if (speed === "+") {
            videosConfig.speed = Math.min(videosConfig.speed + videosConfig.step, videosConfig.MAX_SPEED);
        } else if (speed === "-") {
            videosConfig.speed = Math.max(videosConfig.speed - videosConfig.step, 0);
        } else {
            videosConfig.speed = speed;
        }
        await common.setStorage({ videosConfig });
        await setDisplayInVideo(parentActiveVideo, videosConfig.speed);
    }, 100, 50);
    const setPosition = common.throttleDebounced(async (position) => { 
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.position = position;
        await common.setStorage({ videosConfig });
    }, 100, 100);
    const setDragAndDrop = (element, parentElement) => {
        parentElement.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        pren
        parentElement.addEventListener("dragleave", (e) => {
            console.log("here: line #36"); // TODO: ⬅️ DELETE 
        });
        element.addEventListener("dragstart", (e) => {
            element.style.opacity = "0.2";
            e.dataTransfer.setData("text/plain", e.target.id);
        });
        element.addEventListener("drag", (e) => {
            element.style.opacity = "0.2";
        });
        element.addEventListener("dragend", (e) => {
            element.style.opacity = "0.8";
            if (e.dataTransfer.getData("text/plain") === e.target.id) {
                const parentRect = parentElement.getBoundingClientRect();
                const rect = element.getBoundingClientRect();
                const position = {
                    top: e.clientY - (rect.width / 2) - parentRect.top ,
                    left: e.clientX - (rect.height / 2) -  parentRect.left,
                };
                element.style.top = `${position.top}px`;
                element.style.left = `${position.left}px`;
            }
        });
    };
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
        removeCoverInVideo();
        if (!parentVideo) return;
        const overlayVideoCont = document.createElement("div");
        const inVideoCont = document.createElement("div");
        const speedSpan = document.createElement("span");
        const displaySpeed = (speed / 100).toFixed(2);
        overlayVideoCont.id = "overlay-video-container";
        overlayVideoCont.style.position = "absolute";
        overlayVideoCont.style.zIndex = "1";
        overlayVideoCont.style.top = `${activeVideo.offsetTop}px`;
        overlayVideoCont.style.left = `${activeVideo.offsetLeft}px`;
        overlayVideoCont.style.height = `${activeVideo.offsetHeight}px`;
        overlayVideoCont.style.width = `${activeVideo.offsetWidth}px`;
        overlayVideoCont.appendChild(inVideoCont);
        inVideoCont.style.position = "absolute";
        // inVideoCont.style.top = "3em";
        // inVideoCont.style.left = "1.25em";
        inVideoCont.style.top = "3em";
        inVideoCont.style.left = "1.25em";
        inVideoCont.style.height = "fit-content";
        inVideoCont.style.width = "fit-content";
        inVideoCont.style.padding = "0.2em";
        inVideoCont.style.opacity = "0.8"; // TODO: Change to dynamic input
        inVideoCont.style.backgroundColor = COLOR.GREEN;
        inVideoCont.style.borderRadius = "0.8em";
        inVideoCont.style.color = COLOR.BLACK;
        inVideoCont.style.fontSize = "1.3em";
        inVideoCont.style.fontWeight = "bold";
        inVideoCont.style.cursor = "move";
        inVideoCont.draggable = true;
        inVideoCont.appendChild(speedSpan);
        speedSpan.id = "speed-span";
        speedSpan.textContent = `${displaySpeed}`
        setDragAndDrop(inVideoCont, overlayVideoCont);
        
        // inVideoCont.addEventListener("mouseenter",showMore);
        // inVideoCont.addEventListener("mouseout",showLess);

        parentVideo.insertAdjacentElement("afterbegin", overlayVideoCont);
        // setDisplayTimer(10000);
    };
    const removeCoverInVideo = () => {
        const overlayVideoCont = document.getElementById("overlay-video-container");
        if (overlayVideoCont) overlayVideoCont.remove();
    };
    const setDisplayTimer = (delay) => {
        if(displayTimer) clearTimeout(displayTimer);
        displayTimer = setTimeout(() => {
            removeCoverInVideo();
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
                if (e.shiftKey) setSpeed("+");
                break;
            case "Comma":
                if (e.shiftKey) setSpeed("-");
                break;
            case "Slash":
                if (e.shiftKey) await common.requestAction(ACTION.CREATE_NOTIFICATION);
                break;
            case "KeyP":
            case "KeyK":
                if (e.ctrlKey) break;
                if (!activeVideo) break;
                activeVideo.paused ? activeVideo.play() : activeVideo.pause();
                break;
            case "KeyM":
                if (e.ctrlKey) break;
                if (!activeVideo) break;
                activeVideo.muted = !activeVideo.muted;
                break;
            case "Enter": if (!e.altKey) break;
            case "KeyF":
                if (e.ctrlKey) break;
                if (!activeVideo) break;
                await common.toggleFullscreen(document, activeVideo); 
                break;
            case "Digit0":
                if (e.shiftKey) setSpeed(0);
                break;
            case "Digit1":
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