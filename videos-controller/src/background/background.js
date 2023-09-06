"use strict";
import common from "../scripts/common.js";
import { VIDEOS_CONFIG, COLOR, ACTION } from "../constants/constants.js";

console.info("Background script loaded!");

// Video Controller

const setSpeedBage = async (color) => {
    const storage = await common.getStorage(["videosConfig"]);
    const videosConfig = storage?.videosConfig || { ...VIDEOS_CONFIG };
    const speedTxt = (videosConfig.speed / 100).toFixed(2).toString();
    await common.setBadgeText(speedTxt, color);
};

setSpeedBage(COLOR.GRAY); // Init
common.syncStorage("sync", "videosConfig", setSpeedBage.bind(null, COLOR.RED)); // Sync

// Events (message listener)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    let currentTabs = await common.getCurrentTabs();
    switch (message.action) {
        case ACTION.HIDE_PAGE_ACTION:
            if (currentTabs.some((tab) => tab.id !== sender.tab.id)) return;
            const disableIcons = { 
                "16" : "../../assets/imgs/Logo_VBAKC_18_grey.png",
                "48" : "../../assets/imgs/Logo_VBAKC_48_grey.png",
                "128" : "../../assets/imgs/Logo_VBAKC_128_grey.png"
            }
            // await common.dissableAction(sender.tab.id);
            setSpeedBage (COLOR.GRAY);
            await common.setIcon(disableIcons, sender.tab.id);
            break;
        case ACTION.SHOW_PAGE_ACTION:
            if (currentTabs.some((tab) => tab.id !== sender.tab.id)) return;
            const enableIcons = { 
                "16" : "../../assets/imgs/Logo_VBAKC_18.png",
                "48" : "../../assets/imgs/Logo_VBAKC_48.png",
                "128" : "../../assets/imgs/Logo_VBAKC_128.png"
            }
            // await common.enableAction(sender.tab.id);
            setSpeedBage (COLOR.GREEN);
            await common.setIcon(enableIcons, sender.tab.id);
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
            await common.createNotification(notiConfig_2);
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
