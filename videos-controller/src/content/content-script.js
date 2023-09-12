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
    const setDragAndDrop = (parentElement, ...childElements) => {
        // const shadowElement = targetElement.cloneNode(true);
        // targetElement.style.display = "none";
        // parentElement.appendChild(shadowElement);

        parentElement.style.position = "absolute";
        parentElement.addEventListener("dragover", (event) => {
            event.preventDefault(); // This can enable drag icon
        });
        parentElement.addEventListener("dragleave", (event) => {
            //
        });
        parentElement.addEventListener("drop", (event) => {
            const dropDataId = event.dataTransfer.getData("text/plain");
            const dropElement = document.getElementById(dropDataId);
            const dropRect = dropElement.getBoundingClientRect();
            const targetRect = event.target.getBoundingClientRect();
            const position = {
                top: event.clientY - (dropRect.width / 2) - targetRect.top ,
                left: event.clientX - (dropRect.height / 2) -  targetRect.left,
            }
            dropElement.style.opacity = "1";
            dropElement.style.top = `${position.top}px`;
            dropElement.style.left = `${position.left}px`;
        });

        for (const childElement of childElements) {
            childElement.style.position = "absolute";
            childElement.addEventListener("dragstart", (event) => {
                event.target.style.opacity = "0.3";
                event.dataTransfer.clearData();
                event.dataTransfer.setData("text/plain", event.target.id);
            });
            childElement.addEventListener("drag", (event) => {
                //
            });
            childElement.addEventListener("dragend", (event) => {
                event.target.style.opacity = "1";
                const parentRect = parentElement.getBoundingClientRect();
                const targetRect = event.target.getBoundingClientRect();
                const position = {
                    top: event.clientY - (targetRect.width / 2) - parentRect.top ,
                    left: event.clientX - (targetRect.height / 2) -  parentRect.left,
                };
                event.target.style.top = `${position.top}px`;
                event.target.style.left = `${position.left}px`;
            });
        }
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
        inVideoCont.id = "in-video-container";
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
        inVideoCont.style.fontSize = "1.3em";
        inVideoCont.style.fontWeight = "bold";
        inVideoCont.style.cursor = "move";
        inVideoCont.draggable = true;
        overlayVideoCont.appendChild(inVideoCont);
        speedSpan.id = "speed-span";
        speedSpan.textContent = `${displaySpeed}`
        inVideoCont.appendChild(speedSpan);
        setDragAndDrop(overlayVideoCont, inVideoCont);
        
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
            case "Enter": if (!event.altKey) break;
            case "KeyF":
                if (event.ctrlKey) break;
                if (!activeVideo) break;
                await common.toggleFullscreen(document, activeVideo); 
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