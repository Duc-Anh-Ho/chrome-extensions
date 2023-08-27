"use strict";
import common from "../scripts/common.js";
import { ACTION } from "../constants/constants.js";

console.log("Content script loaded!");

const main = async () => {
    // await common.requestAction(ACTION.SHOW_PAGE_ACTION)
    // await common.requestAction(ACTION.HIDE_PAGE_ACTION)
    const videos = document.querySelectorAll("video"); // $$("video")
    const activeVideo = document.querySelector("video:active");
    for (const video of videos) {
        document.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "ShiftLeft":
                case "ShiftRight":
                    break;
                case "Space":
                case "KeyK":
                    video.paused ? video.play() : video.pause();
                    break;
                case "KeyM":
                    video.muted = !video.muted;
                    break;
                default:
                    break;
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        console.log("e.code:", e.code);
        if (e.shiftKey && e.code === "Slash") {
            common.requestAction(ACTION.CREATE_NOTIFICATION);
        }
        if (e.code === "Numpad0") {
            common.requestAction(ACTION.CLEAR_NOTIFICATIONS);
        }
        if (e.code === "Digit1") {
            common.requestAction(ACTION.CLEAR_NOTIFICATIONS);
        }
    });
}

export { main };