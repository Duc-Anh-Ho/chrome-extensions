import { VIDEO, REGEX } from "../constants/constants.js";
$(document).ready(() => {
    const videos = $("video"); // $$("video")
    const speedInp = $("#speed");
    const resetBtn = $("#reset-btn");
    const closeBtn = $("#close-btn");
    let video = { ...VIDEO };
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "changeSpeed") {
            chrome.storage.sync.get(["video"], result => {
                video = result.video || { ...VIDEO };
                speedInp.val((video.speed / 100).toFixed(2));
            });
        }
    });

    chrome.storage.sync.get(["video"], result => {
        video = result.video || { ...VIDEO };
        speedInp.val((video.speed / 100).toFixed(2));
    });

    speedInp.on("input", () => {
        // Num inp only
        let tmp = speedInp.val().replace(REGEX.CHR, "");
        speedInp.val(tmp);
    });

    speedInp.on("change", () => {
        const intSpeed = parseInt(speedInp.val() * 100);
        const isValidSpeed = !isNaN(intSpeed) && intSpeed >= 0 && intSpeed < 1000;
        if (isValidSpeed) {
            video.speed = intSpeed;
        }
        chrome.storage.sync.set({ video: video });
        chrome.runtime.sendMessage({ action: "changeSpeed" })
        chrome.storage.sync.get(["video"], result => {
            video = result.video || { ...VIDEO };
            speedInp.val((video.speed / 100).toFixed(2));
        });
    });

    resetBtn.on("click", () => {
        chrome.storage.sync.set({ video: VIDEO });
        chrome.runtime.sendMessage({ action: "changeSpeed" });
        chrome.storage.sync.get(["video"], result => {
            video = result.video || { ...VIDEO };
            speedInp.val((video.speed / 100).toFixed(2));
        });
    });

    closeBtn.on("click", () => {
        window.close();
    })

    $(document).on("keydown", e => {
        if (e.shiftKey && e.code === "Slash") {
            console.log("here");
        }
    });
});
