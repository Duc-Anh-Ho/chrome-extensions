import { VIDEOS_CONFIG, REGEX } from "../constants/constants.js";
import common from "./common.js";

$(document).ready(() => {
    // Videos Controller
    const videos = $("video"); // $$("video")
    const speedInp = $("#speed");
    const resetBtn = $("#reset-btn");
    let videosConfig = { ...VIDEOS_CONFIG };
    const storeVideo = (videosConfig) => {
        chrome.storage.sync.set({ videosConfig});
    };
    const setSpeed = () => {
        chrome.storage.sync.get(["videosConfig"], (result) => {
            videosConfig = result.videosConfig || { ...VIDEOS_CONFIG };
            speedInp.val((videosConfig.speed / 100).toFixed(2));
        });
    };
    const isValidSpeed = (speed) => {
        const { MIN_SPEED, MAX_SPEED } = VIDEOS_CONFIG;
        return !isNaN(speed) && speed >= MIN_SPEED && speed < MAX_SPEED;
    }

    setSpeed();
    speedInp.on("input", common.regexInput(REGEX.CHR));
    speedInp.on("change", (e) => {
        const intSpeed = parseInt(speedInp.val() * 100);
        if (isValidSpeed(intSpeed)) {
            videosConfig.speed = intSpeed;
        }
        storeVideo(videosConfig);
        common.requestAction("updateSpeed");
        setSpeed();
    });
    resetBtn.on("click", () => {
        storeVideo(VIDEOS_CONFIG);
        common.requestAction("updateSpeed");
        setSpeed();
    });
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "updateSpeed") {
            setSpeed();
        }
    });

    // Mode Controller
    const modeCheckbox = $("#design-mode");
    const storeMode = (modeConfig) => {
        chrome.storage.sync.set({ modeConfig});
    };
    // Else
    const closeBtn = $("#close-btn");
    
    closeBtn.on("click", () => {
        window.close();
    });

    const clearNotifications = () => {
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
    };

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
