"use strict";
import common from "../scripts/common.js";
import { VIDEOS_CONFIG, COLOR, ACTION } from "../constants/constants.js";

console.log("Background script loaded!");

// Video Controller
chrome.storage.sync.get(["videosConfig"], (result) => {
    let videosConfig = result.videosConfig || { ...VIDEOS_CONFIG };
    let speedTxt = (videosConfig.speed / 100).toFixed(2).toString();
    common.setBadgeText(speedTxt, COLOR.GREEN);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.videosConfig) {
        const speedTxt = (changes.videosConfig.newValue.speed / 100).toFixed(2).toString();
        common.setBadgeText(speedTxt, COLOR.GREEN);
    }
});

// Notifications
const clearNotifications = async () => {
    await chrome.notifications.getAll(async (notifications) => {
        for (const notificationId in notifications) {
            await chrome.notifications.clear(notificationId, (isCleared) => {
                if (isCleared) {
                    console.log(`Notification ${notificationId} cleared.`);
                } else {
                    console.error(`Notification ${notificationId} could not be cleared.`);
                }
            });
        }
    });
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action) {
        case ACTION.SHOW_PAGE_ACTION:
            await common.dissableAction(sender.tab.id);
            break;
        case ACTION.CREATE_NOTIFICATION:
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
            await chrome.notifications.create(notiId, notiConfig, (id) => {
                console.log("Created Basic Notification:", id);
            });

            await chrome.notifications.create(notiId, notiConfig_2, (id) => {
                console.log("Created Image Notification:", id);
            });
            await chrome.notifications.onClicked.addListener(notiClick);
            break;
        case ACTION.CLEAR_NOTIFICATIONS:
            await clearNotifications();
            break;
        default:
            console.log("message:", message); // TODO: <-- DELETE
            break;
    }
});

// Context menu
const contextConfig = {
    title: "Selected: %s",
    contexts: ["page", "selection"],
    id: "context-menu-id",
};
const contextClick = (info, tab) => {
    if (info.menuItemId === "context-menu-id") {
        console.log("info.selectionText:", info.selectionText);
        console.log("typeof info.selectionText:", typeof info.selectionText);
        console.log("Context menu clicked!");
    }
};

common.createContextMenu(contextConfig, contextClick);

