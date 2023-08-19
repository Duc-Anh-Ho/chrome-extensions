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
    function clearNotifications() {
        chrome.notifications.getAll((notifications) => {
            for (const notificationId in notifications) {
                chrome.notifications.clear(notificationId, (isCleared) => {
                    if (isCleared) {
                        console.log(`Notification ${notificationId} cleared.`);
                    } else {
                        console.error(`Notification ${notificationId} could not be cleared.`);
                    }
                });
            }
        });
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
            const notiId = `notification-id-${Date.now()}`;
            const notiClick = (id) => {
                console.log("Notification clicked:", id);
            };

            const notiConfig = {
                type: "basic",
                iconUrl: "../../assets/imgs/Logo_VBAKC_48.png",
                title: "Notification Basic",
                message: "TEST",
            };

            const notiConfig_2 = {
                type: "image",
                iconUrl: "../../assets/imgs/Logo_VBAKC_48.png",
                imageUrl: "../../assets/imgs/Logo_VBAKC_48.png",
                title: "Notification Image",
                message: "TEST",
            };

            // chrome.notifications.create(notiId, notiConfig, (id) => {
            //     console.log("Created Nofication ID:", id);
            // });

            chrome.notifications.create(notiId, notiConfig_2, (id) => {
                console.log("Created Nofication:", id);
            });

            chrome.notifications.onClicked.addListener(notiClick);
        }
        if (e.code === "Numpad0") {
            clearNotifications();
        }
    });
});
