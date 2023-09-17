"use strict";
import common, { isInputting } from "../scripts/common.js";
import { VIDEOS_CONFIG, ACTION, COLOR } from "../constants/constants.js";

console.info("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    let activeVideo = null;
    let displayTimer = null;
    let isFullScreen = false;
    const setSpeed = common.throttleDebounced(
        async (speed) => {
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
            await createDisplayInVideo(activeVideo, videosConfig.speed);
        },
        100,
        50
    );
    const setPosition = common.throttleDebounced(
        async (position) => {
            const storage = await common.getStorage(["videosConfig"]);
            const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
            videosConfig.position = position;
            await common.setStorage({ videosConfig });
        },
        100,
        100
    );
    const syncPlaybackRate = common.throttleDebounced(
        async (speed) => {
            const videos = common.getVideos(document);
            if (!videos?.length) {
                await common.requestAction(ACTION.HIDE_PAGE_ACTION);
                return;
            }
            const storage = await common.getStorage(["videosConfig"]);
            const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
            speed = speed || videosConfig.speed;
            for (const video of videos) {
                if (common.isPlaying(video)) {
                    activeVideo = video;
                    activeVideo.playbackRate = (speed / 100).toFixed(2);
                    await common.requestAction(ACTION.SHOW_PAGE_ACTION);
                    return;
                }
            }
            activeVideo = common.getLastPlayedVideo(document);
            await common.requestAction(ACTION.HIDE_PAGE_ACTION);
        },
        650,
        300
    );
    const createOverlayVideoCont = (id, video) => {
        const overlayVideoCont = document.createElement("div");
        overlayVideoCont.id = id;
        overlayVideoCont.style.top = `${video.offsetTop}px`;
        overlayVideoCont.style.left = `${video.offsetLeft}px`;
        overlayVideoCont.style.height = `${video.offsetHeight}px`;
        overlayVideoCont.style.width = `${video.offsetWidth}px`;
        return overlayVideoCont;
    };
    const createInVideoCont = (id) => {
        const inVideoCont = document.createElement("div");
        inVideoCont.id = id;
        inVideoCont.style.position = "absolute";
        inVideoCont.style.top = "3em";
        inVideoCont.style.left = "1.25em";
        inVideoCont.style.height = "fit-content";
        inVideoCont.style.width = "fit-content";
        inVideoCont.style.padding = "0.2em";
        inVideoCont.style.opacity = "0.8"; // TODO: Change to dynamic input
        inVideoCont.style.backgroundColor = COLOR.GREEN;
        inVideoCont.style.borderRadius = "0.8em";
        inVideoCont.style.color = COLOR.BLACK;
        inVideoCont.style.fontSize = "1.2em";
        inVideoCont.style.fontWeight = "bold";
        return inVideoCont;
    };
    const createSpeedSpan = (id, speed) => {
        const speedSpan = document.createElement("span");
        speedSpan.id = id;
        speedSpan.textContent = `${speed}`;
        return speedSpan;
    
    }  
    const createDisplayInVideo = async (video, speed) => {
        removeCoverInVideo();
        if (!video) return;
        const displaySpeed = (speed / 100).toFixed(2);
        const parentVideo = video.parentNode;
        const overlayVideoCont = createOverlayVideoCont("overlay-video-container", video);
        const inVideoCont = createInVideoCont("in-video-container");
        const speedSpan = createSpeedSpan("speed-span", displaySpeed);
        const isFullScreen = common.isFullScreen(document);
        // overlayVideoCont.style.position = isFullScreen ? "fixed" : "absolute";
        inVideoCont.appendChild(speedSpan);
        common.createDragAndDrop(overlayVideoCont, inVideoCont);
        parentVideo.insertAdjacentElement("afterbegin", overlayVideoCont);
        if (isFullScreen) await common.enableFullScreen(document, overlayVideoCont)
        
        // inVideoCont.addEventListener("mouseenter",showMore);
        // inVideoCont.addEventListener("mouseout",showLess);

        setDisplayTimer(10000);
    };
    const removeCoverInVideo = () => {
        const overlayVideoCont = document.getElementById("overlay-video-container");
        if (overlayVideoCont) overlayVideoCont.remove();
    };
    const setDisplayTimer = (delay) => {
        if (displayTimer) clearTimeout(displayTimer);
        displayTimer = setTimeout(() => {
            removeCoverInVideo();
        }, delay);
    };
    // Auto Sync
    common.syncStorage("sync", "videosConfig", syncPlaybackRate);
    let runner = window.setInterval(() => {
        syncPlaybackRate();
    }, 750);
    // Events
    document.addEventListener("click", async (event) => {
        // Refresh/Update
        common.setLastPlayedVideo(document);
        syncPlaybackRate();
    });
    addEventListener("scroll", (event) => {
        syncPlaybackRate();
    });

    document.addEventListener("keydown", async (event) => {
        // Refresh/Update variables
        common.setLastPlayedVideo(document);
        syncPlaybackRate();
        if (isInputting(event)) return; // Prevents shortcut While Inputing
        switch (event.code) {
            case "Period":
                if (event.shiftKey) setSpeed("+");
                break;
            case "Comma":
                if (event.shiftKey) setSpeed("-");
                break;
            case "Slash":
                if (event.shiftKey) await common.requestAction(ACTION.CREATE_NOTIFICATION);
                break;
            case "KeyP":
            case "KeyK":
                if (event.ctrlKey) break;
                if (!activeVideo) break;
                activeVideo.paused ? activeVideo.play() : activeVideo.pause();
                break;
            case "KeyM":
                if (event.ctrlKey) break;
                if (!activeVideo) break;
                activeVideo.muted = !activeVideo.muted;
                break;
            case "Enter":
                if (!event.altKey) break;
                isFullScreen = await common.toggleFullscreen(document, activeVideo);
                break;
            case "KeyF":
                if (event.ctrlKey) break;
                if (!activeVideo) break;
                if (location.host.includes("youtube")) break; // TODO: Change to optional
                isFullScreen = await common.toggleFullscreen(document, activeVideo);
                break;
            case "Digit0":
                if (event.shiftKey) setSpeed(0);
                break;
            case "Digit1":
                if (event.shiftKey) setSpeed(100);
                break;
            case "Digit2":
                if (event.shiftKey) setSpeed(200);
                break;
            case "Digit3":
                if (event.shiftKey) setSpeed(300);
                break;
            case "Digit4":
                if (event.shiftKey) setSpeed(400);
                break;
            case "Digit5":
                if (event.shiftKey) setSpeed(500);
                break;
            default:
                break;
        }
    });
};

export { main };
