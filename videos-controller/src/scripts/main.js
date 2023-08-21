"use strict";
import { VIDEOS_CONFIG, REGEX } from "../constants/constants.js";
import common from "./common.js";

console.log("Main script loaded!");

document.addEventListener("DOMContentLoaded", () => {
    // Videos Controller
    const videos = document.querySelectorAll("video"); // $$("video")
    const speedInp = document.getElementById("speed");
    const resetBtn = document.getElementById("reset-btn");
    let videosConfig = { ...VIDEOS_CONFIG };
    const storeVideo = async (videosConfig) => {
        await chrome.storage.sync.set({ videosConfig });
    };
    const setSpeed = async () => {
        await chrome.storage.sync.get(["videosConfig"], (result) => {
            videosConfig = result.videosConfig || { ...VIDEOS_CONFIG };
            speedInp.value = (videosConfig.speed / 100).toFixed(2);
        });
    };
    const isValidSpeed = (speed) => {
        const { MIN_SPEED, MAX_SPEED } = VIDEOS_CONFIG;
        return !isNaN(speed) && speed >= MIN_SPEED && speed < MAX_SPEED;
    };

    setSpeed();
    speedInp.addEventListener("input", common.regexInput(REGEX.CHR));
    speedInp.addEventListener("change", (e) => {
        const intSpeed = parseInt(speedInp.value * 100);
        if (isValidSpeed(intSpeed)) {
            videosConfig.speed = intSpeed;
        }
        storeVideo(videosConfig);
        setSpeed();
    });
    resetBtn.addEventListener("click", () => {
        storeVideo(VIDEOS_CONFIG);
        setSpeed();
    });
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "sync" && changes.videosConfig) {
            setSpeed();
        }
    });

    // Mode Controller
    const modeCheckbox = document.getElementById("design-mode");
    const storeMode = async (modeConfig) => {
        await chrome.storage.sync.set({ modeConfig });
    };
    // Else
    const closeBtn = document.getElementById("close-btn");
    closeBtn.addEventListener("click", () => {
        window.close();
    });
});
