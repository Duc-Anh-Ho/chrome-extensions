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
        case ACTION.HIDE_PAGE_ACTION:
            const enableIcons = { 
                "16" : "../../assets/imgs/Logo_VBAKC_18_grey.png",
                "48" : "../../assets/imgs/Logo_VBAKC_48_grey.png",
                "128" : "../../assets/imgs/Logo_VBAKC_128_grey.png"
            }
            await common.dissableAction(sender.tab.id);
            await common.setIcon(enableIcons, sender.tab.id);
            break;
        case ACTION.SHOW_PAGE_ACTION:
            const disableIcons = { 
                "16" : "../../assets/imgs/Logo_VBAKC_18_grey.png",
                "48" : "../../assets/imgs/Logo_VBAKC_48_grey.png",
                "128" : "../../assets/imgs/Logo_VBAKC_128_grey.png"
            }
            await common.dissableAction(sender.tab.id);
            await common.setIcon(disableIcons, sender.tab.id);
            break;
        case ACTION.CREATE_NOTIFICATION:
            // const notiConfig = {
            //     type: "basic",
            //     iconUrl: "../../assets/imgs/Logo_VBAKC_48.png",
            //     title: "Notification Basic",
            //     message: "TEST",
            // };
            const notiConfig_2 = {
                type: "image",
                iconUrl: "../../assets/imgs/Logo_VBAKC_48.png",
                imageUrl: "../../assets/imgs/Logo_VBAKC_48.png",
                title: "Notification Image",
                message: "TEST",
            };
            await common.createNotification(notiConfig_2)
            break;
        case ACTION.CLEAR_NOTIFICATIONS:
            await common.clearNotifications();
            break;
        default:
            break;
    }
});

// Context menu
const contextConfig = {
    title: "Selected: %s",
    contexts: ["page", "selection"],
    id: "context-menu-id",
};

common.createContextMenu(contextConfig);
