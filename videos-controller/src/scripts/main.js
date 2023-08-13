import { VIDEO, REGEX } from "../constants/constants.js";
$(document).ready(() => {
    const videos = $("video"); // $$("video")
    const speedInp = $("#speed");
    const resetBtn = $("#reset-btn");
    let video = { ...VIDEO };
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("message.resetInput:", message.resetInput);
        if (message.resetInput) {
            speedInp.val((VIDEO.speed / 100).toFixed(2));
        }
    });

    chrome.storage.sync.get(["video"], result => {
        video = parseInt(result.video) || { ... VIDEO};
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
        speedInp.val((video.speed / 100).toFixed(2))
        chrome.storage.sync.set({ video: video });
    });

    resetBtn.on("click", () => {;
        chrome.runtime.sendMessage({ resetInput: true });
        chrome.storage.sync.set({ video: VIDEO }, () => {
            location.reload();
        });
    });

    $(document).on("keydown", e => {
        if (e.shiftKey && e.code === "Slash") {
            console.log("here");
        }
    });
});
