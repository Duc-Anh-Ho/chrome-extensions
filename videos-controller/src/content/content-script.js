"use strict";
import common, { isInputting, setStorage } from "../scripts/common.js";
import { VIDEOS_CONFIG, ACTION, COLOR } from "../constants/constants.js";

console.info("Content script loaded!");

const main = async () => {
    // VIDEO controllers
    let activeVideo = null;
    let displayTimer = null;
    let isFullScreen = common.isFullScreen(document);
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
            await createDisplayInVideo(activeVideo, videosConfig);
        },
        100,
        50
    );
    const setPosition =  async (position) => {
        const storage = await common.getStorage(["videosConfig"]);
        const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
        videosConfig.position = position;
        await common.setStorage({ videosConfig });
    };
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
         // NOTE: Must dialog tag because fullscreen can add top-rate
        const overlayVideoCont = isFullScreen ? document.createElement("dialog") : document.createElement("div");
        const position = common.getRelativePosition(document, video);
        const controllerOffset = common.remToPx(6);
        overlayVideoCont.id = id;
        overlayVideoCont.style.backgroundColor = "transparent";
        overlayVideoCont.style.border = "none";
        overlayVideoCont.style.boxShadow = "none";
        overlayVideoCont.style.zIndex = "9999";
        overlayVideoCont.style.padding = "0";
        overlayVideoCont.style.margin = "0";
        overlayVideoCont.style.position = isFullScreen ? "fixed" : "absolute";
        overlayVideoCont.style.top = isFullScreen ? "0px" : `${position.top}px`;
        overlayVideoCont.style.left = isFullScreen ? "0px" : `${position.left}px`;
        overlayVideoCont.style.height = isFullScreen ? "93%" : `${position.height - controllerOffset}px`;
        overlayVideoCont.style.width = isFullScreen ? "100%" : `${position.width}px`;
        overlayVideoCont.style.maxHeight = "100vh";
        overlayVideoCont.style.maxWidth = "100vw";
        // overlayVideoCont.style.pointerEvents = "none";
        return overlayVideoCont;
    };
    const createInVideoCont = (id, config) => {
        const inVideoCont = document.createElement("div");
        inVideoCont.id = id;
        inVideoCont.style.position = "absolute";
        inVideoCont.style.top = `${config.position.top}`;
        inVideoCont.style.left = `${config.position.left}`;
        inVideoCont.style.height = "fit-content";
        inVideoCont.style.width = "fit-content";
        inVideoCont.style.padding = "0.2em";
        inVideoCont.style.opacity = "0.8"; // TODO: Change to dynamic input
        inVideoCont.style.backgroundColor = COLOR.GREEN;
        inVideoCont.style.borderRadius = "0.6em";
        inVideoCont.style.color = COLOR.BLACK;
        inVideoCont.style.fontSize = "15px";
        inVideoCont.style.fontWeight = "bold";
        inVideoCont.style.pointerEvents = "auto";
        return inVideoCont;
    };
    const createShadowRoot = (elem) => {
        return elem.attachShadow ? elem.attachShadow({ mode: "open" }) : null;
    };
    const createSpeedSpan = (id, config) => {
        const speedSpan = document.createElement("span");
        const speed = (config.speed / 100).toFixed(2);
        speedSpan.id = id;
        speedSpan.textContent = `${speed}`;
        return speedSpan;
    };
    const createDisplayInVideo = async (video, config) => {
        removeCoverInVideo();
        if (!video) return;
        isFullScreen = common.isFullScreen(document);
        const parentVideo = video.parentNode;
        const overlayVideoCont = createOverlayVideoCont("overlay-video-container", video);
        const inVideoCont = createInVideoCont("in-video-container", config);
        const speedSpan = createSpeedSpan("speed-span", config);
        inVideoCont.append(speedSpan);
        parentVideo.prepend(overlayVideoCont);
        common.createDragAndDrop(overlayVideoCont, inVideoCont);
        if (isFullScreen) {
            overlayVideoCont.showModal();
        } else {
            const shadowRoot = createShadowRoot(overlayVideoCont);
            shadowRoot.append(inVideoCont);
            document.body.prepend(overlayVideoCont);
        }
        setDisplayTimer(2000); //TODO: Optional choice
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
    const runner = window.setInterval(() => {
        syncPlaybackRate();
    }, 750);
    // Change input shortcut
    const INPUTs = common.getInput(document);
    let index = 0;
    const changeInput = common.throttleDebounced(
        async () => {
            console.log("INPUTs:", INPUTs);
            if (!INPUTs.length) return;
            INPUTs[index].focus();
            index++;
            if (index > INPUTs.length) index = 0;
        },
        500,
        300
    );
    // Events
    document.addEventListener("click", async (event) => {
        // Refresh/Update
        common.setLastPlayedVideo(document);
        syncPlaybackRate();
    });
    document.addEventListener("scroll", (event) => {
        syncPlaybackRate();
    });
    document.addEventListener("keydown", async (event) => {
        common.setLastPlayedVideo(document); // Refresh/Update variables
        syncPlaybackRate();
        switch (event.code) {
            case "Slash":
                // TEST
                // if (event.shiftKey) await common.requestAction(ACTION.CREATE_NOTIFICATION); 
                // Change input
                if (event.shiftKey && event.ctrlKey) changeInput();
                break;
            default:
                break;
        }
        if (isInputting(event)) return; // Prevents shortcut While Inputing
        switch (event.code) {
            case "Period":
                if (event.shiftKey) setSpeed("+");
                break;
            case "Comma":
                if (event.shiftKey) setSpeed("-");
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
                await common.toggleFullscreen(document, activeVideo);
                removeCoverInVideo();
                break;
            case "KeyF":
                if (event.ctrlKey) break;
                if (!activeVideo) break;
                if (location.host.includes("youtube")) break; // TODO: Change to optional
                await common.toggleFullscreen(document, activeVideo);
                removeCoverInVideo();
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
            case "Escape":
                removeCoverInVideo();
                break;
            case "Backquote":
                if (event.shiftKey) removeCoverInVideo();
            default:
                break;
        }
    });
};

export { main };
