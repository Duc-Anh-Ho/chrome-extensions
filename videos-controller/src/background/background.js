"use strict";
import common from "../scripts/common.js";
import { VIDEOS_CONFIG, COLOR, ACTION } from "../constants/constants.js";

console.log("Background script loaded!");

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

const contextClick = (info, tab) => {
    if (info.menuItemId === "context-menu-id") {
        console.log("info.selectionText:", typeof info.selectionText);
        console.log("Context menu clicked!");
    }
};

const contextConfig = {
    id: "context-menu-id",
    title: "Context Menu",
    contexts: ["page", "selection"],
};

// const clearNotifications = () => {
//     chrome.notifications.getAll((notifications) => {
//         for (const notificationId in notifications) {
//             chrome.notifications.clear(notificationId, (isCleared) => {
//                 if (isCleared) {
//                     console.log(`Notification ${notificationId} cleared.`);
//                 } else {
//                     console.error(`Notification ${notificationId} could not be cleared.`);
//                 }
//             });
//         }
//     });
// };

chrome.contextMenus.create(contextConfig);
chrome.contextMenus.onClicked.addListener(contextClick);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message"); // TODO: <-- DELETE 
    if (message.action === ACTION.CREATE_NOTIFICATION) {
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
        console.log("here"); // TODO: <-- DELETE 
        // chrome.notifications.create(notiId, notiConfig, (id) => {
        //     console.log("Created Notification ID:", id);
        // });

        chrome.notifications.create(notiId, notiConfig_2, (id) => {
            console.log("Created Notification:", id);
        });
        chrome.notifications.onClicked.addListener(notiClick);
    }
})
