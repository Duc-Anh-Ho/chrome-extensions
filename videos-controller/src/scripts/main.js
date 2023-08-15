import { VIDEO, REGEX } from "../constants/constants.js";
$(document).ready(() => {
    const videos = $("video"); // $$("video")
    const speedInp = $("#speed");
    const resetBtn = $("#reset-btn");
    const closeBtn = $("#close-btn");
    let video = { ...VIDEO };

    // TODO: move to common.js
    function setSpeed() {
        chrome.storage.sync.get(["video"], (result) => {
            video = result.video || { ...VIDEO };
            speedInp.val((video.speed / 100).toFixed(2));
        });
    }
    function storeVideo(video) {
        chrome.storage.sync.set({ video });
    }
    function requestAction(action) {
        chrome.runtime.sendMessage({ action });
    }
    

    setSpeed();

    speedInp.on("input", () => {
        let tmp = speedInp.val().replace(REGEX.CHR, ""); // Num amd dot only
        speedInp.val(tmp);
    });

    speedInp.on("change", () => {
        const intSpeed = parseInt(speedInp.val() * 100);
        const isValidSpeed = !isNaN(intSpeed) && intSpeed >= 0 && intSpeed < 1000;
        if (isValidSpeed) {
            video.speed = intSpeed;
        }
        storeVideo(video);
        setSpeed();
        requestAction("updateSpeed");
    });

    resetBtn.on("click", () => {
        storeVideo(VIDEO);
        setSpeed();
        requestAction("updateSpeed");
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "updateSpeed") {
            setSpeed();
        }
    });

    closeBtn.on("click", () => {
        window.close();
    });

    $(document).on("keydown", (e) => {
        if (e.shiftKey && e.code === "Slash") {
            console.log("here");
        }
    });
});
