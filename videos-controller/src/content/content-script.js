"use strict";
import common from "../scripts/common.js";
import { ACTION } from "../constants/constants.js";

console.log("Content script loaded!");

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

document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.code === "Slash") {
        common.requestAction(ACTION.CREATE_NOTIFICATION);
    }
    if (e.code === "Numpad0") {
        clearNotifications();
    }
});