"use strict";
import { VIDEOS_CONFIG, REGEX } from "../constants/constants.js";
import common from "./common.js";


document.addEventListener("DOMContentLoaded", async () => {
    // Videos Controller
    const speedInp = document.getElementById("speed");
    const resetBtn = document.getElementById("reset-btn");
    let videosConfig;
    const isValidSpeed = (speed) => {
        const { MIN_SPEED, MAX_SPEED } = VIDEOS_CONFIG;
        return !isNaN(speed) && speed >= MIN_SPEED && speed < MAX_SPEED;
    };
    const setSpeed = async () => {
        let storage = await common.getStorage(["videosConfig"])
        videosConfig = storage.videosConfig || { ...VIDEOS_CONFIG };;
        speedInp.value = (videosConfig.speed / 100).toFixed(2);
    };

    setSpeed(); // Init
    speedInp.addEventListener("input", common.regexInput(REGEX.CHR));
    speedInp.addEventListener("change", async (e) => {
        const intSpeed = parseInt(speedInp.value * 100);
        if (isValidSpeed(intSpeed)) {
            videosConfig.speed = intSpeed;
        }
        await common.setStorage({ videosConfig });
        setSpeed();
    });
    resetBtn.addEventListener("click", async () => {
        videosConfig = { ...VIDEOS_CONFIG };
        await common.setStorage({ videosConfig });
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
});xx
