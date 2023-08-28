"use strict";
import { VIDEOS_CONFIG, REGEX } from "../constants/constants.js";
import common from "./common.js";


document.addEventListener("DOMContentLoaded", async () => {
    // Videos Controller
    const speedInp = document.getElementById("speed");
    const resetBtn = document.getElementById("reset-btn");
    const isValidSpeed = (speed) => {
        const { MIN_SPEED, MAX_SPEED } = VIDEOS_CONFIG;
        return !isNaN(speed) && speed >= MIN_SPEED && speed < MAX_SPEED;
    };
    const setSpeed = async (speed) => {
        let storage = await common.getStorage(["videosConfig"])
        let videosConfig = storage.videosConfig || { ...VIDEOS_CONFIG };;
        let displaySpeed = speed || videosConfig.speed;
        speedInp.value = (displaySpeed / 100).toFixed(2);
    };

    await setSpeed(); // Init
    common.syncStorage("sync", "videosConfig", setSpeed); // Sync
    // Events
    speedInp.addEventListener("input", common.regexInput(REGEX.CHR));
    speedInp.addEventListener("change", async (e) => {
        let storage = await common.getStorage(["videosConfig"]);
        let videosConfig = storage.videosConfig || { ...VIDEOS_CONFIG };
        const intSpeed = parseInt(speedInp.value * 100);
        if (isValidSpeed(intSpeed)) {
            videosConfig.speed = intSpeed;
            await common.setStorage({ videosConfig });
        } else {
            speedInp.value = (videosConfig.speed / 100).toFixed(2);
        }
    });
    resetBtn.addEventListener("click", async () => {
        let videosConfig = { ...VIDEOS_CONFIG };
        await common.setStorage({ videosConfig });
    });

    // Mode Controller
    const modeCheckbox = document.getElementById("design-mode");
    const storeMode = async (modeConfig) => {
        await common.setStorage({ modeConfig });
    };
    // Else
    const closeBtn = document.getElementById("close-btn");
    closeBtn.addEventListener("click", () => {
        window.close();
    });
});
