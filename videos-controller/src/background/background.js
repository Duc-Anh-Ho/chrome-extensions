import common from "../scripts/common.js";
import { VIDEOS_CONFIG, COLOR } from "../constants/constants.js";
console.log("Background script loaded!");

chrome.storage.sync.get(["videosConfig"], (result) => {
    let videosConfig = result.videosConfig || { ...VIDEOS_CONFIG };
    let speedTxt = (videosConfig.speed / 100).toFixed(2).toString()
    common.setBadgeText(speedTxt, COLOR.GREEN);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.videosConfig) {
        const speedTxt = (changes.videosConfig.newValue.speed / 100).toFixed(2).toString()
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

chrome.contextMenus.create(contextConfig);
chrome.contextMenus.onClicked.addListener(contextClick);

