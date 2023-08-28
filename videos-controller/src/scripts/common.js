"use strict";
// REGULAR
const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};
const isFullScreen = (doc) => !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
);
const isPlaying = (video) => !!(
    video.currentTime > 0 
    && !video.paused 
    && !video.ended 
    && video.readyState > 2
);
const enableFullScreen = async (doc, elem) => {
    if (elem.webkitRequestFullScreen || doc.webkitFullscreenEnabled) {
        await elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen || doc.mozFullScreenEnabled) {
        await elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen || doc.msFullscreenEnabled) {
        await elem.msRequestFullscreen();
    } else if (elem.requestFullscree || doc.fullscreenEnabled) {
        await elem.requestFullscreen();
    }
};
const disableFullscreen = async (doc) => {
    if (doc.exitFullscreen ) {
        await doc.exitFullscreen();
    } else if (doc.webkitFullscreenElement) {
        await doc.webkitExitFullscreen();
    } else if (doc.mozFullScreenElement) {
        await doc.mozCancelFullScreen();
    } else if (doc.msFullscreenElement) {
        await doc.msExitFullscreen();
    }
};
const toggleFullscreen = async (doc, elem) => {
    if (isFullScreen(doc)) {
        await disableFullscreen(doc);
    } else {
        await enableFullScreen(doc, elem);
    }
};
const getVideos = (doc) => {
    // return [ ...doc.querySelectorAll("video")]; // $$("video")
    return doc.querySelectorAll("video"); // $$("video")
};
const setLastPlayedVideo = (doc) => {
    const videos = getVideos(doc);
    for (const video of videos) {
        video.addEventListener("play", () => {
            video.setAttribute("data-last-played", "true");
            for (const otherVideo of getVideos(doc)) {
                if (otherVideo !== video) {
                    otherVideo.removeAttribute("data-last-played");
                }
            }
        });
    }
};
const getLastPlayedVideo = (doc) => {
    return (
        doc.querySelector("video[data-last-played]") 
        || doc.querySelector("video")
        || ((doc.activeElement instanceof HTMLVideoElement) ? doc.activeElement : null)
    )
};

// CHROME API
const getCurrentTab = async () => {
    const queryOptions = { 
        active: true,
        currentWindow: true 
    };
    return await chrome.tabs.query(queryOptions);
};
const getLastTab = async () => {
    const queryOptions = { 
        active: true
        , lastFocusedWindow: true 
    };
    return await chrome.tabs.query(queryOptions);
};
const enableAction = async (tabId) => {
    await chrome.action.enable(tabId);
};
const dissableAction = async (tabId) => {
    await chrome.action.disable(tabId);
    await chrome.action.setBadgeText({ text: "" });
};
const requestAction = async (action) => {
    await chrome.runtime.sendMessage({ action });
};
const setBadgeText = async (text, color) => {
    await chrome.action.setBadgeBackgroundColor({ color })
    await chrome.action.setBadgeText({ text });
};
const removeBangeText = async () => {
    await chrome.action.setBadgeText({ text: "" });
};
const setIcon = async (iconPaths, tabId) => {
    await chrome.action.setIcon({
        path: iconPaths,
        tabId: tabId
    });
}
const createContextMenu = async (config, clickEvent) => {
    if (!clickEvent) {
        clickEvent = (info, tab) => {
            console.info("Context menu clicked:", info.menuItemId);
            console.info("info.selectionText:", info.selectionText);
        }
    }
    // Create only on installed
    await chrome.runtime.onInstalled.addListener( async () => {
        await chrome.contextMenus.create(config);
        console.info(`Created context menu:`, config.id);
        await chrome.contextMenus.onClicked.addListener(clickEvent);
    });
}
const createNotification = async (config, clickEvent) => {
    const id = `notification-id-${Date.now()}`;
    if (!clickEvent) {
        clickEvent = () => {
            clickEvent = (id) => {
                console.info("Notification clicked:", id);
            };
        }
    }
    await chrome.notifications.create(id, config)
    console.info(`Created ${config.type} notification:`, id);
    await chrome.notifications.onClicked.addListener(clickEvent);
}
const clearNotifications = async () => {
    await chrome.notifications.getAll(async (notifications) => {
        for (const notificationId in notifications) {
            await chrome.notifications.clear(notificationId, (isCleared) => {
                if (isCleared) {
                    console.info(`Notification ${notificationId} cleared.`);
                } else {
                    console.error(`Notification ${notificationId} could not be cleared.`);
                }
            });
        }
    });
};
const setStorage = async (object) => {
    await chrome.storage.sync.set(object);
};
const getStorage = async (keys) => {
    return await chrome.storage.sync.get(keys);
};

export {
    regexInput
    , isFullScreen
    , enableFullScreen
    , disableFullscreen
    , toggleFullscreen
    , isPlaying
    , requestAction
    , setLastPlayedVideo
    , getVideos
    , getLastPlayedVideo

    , setStorage
    , setBadgeText
    , setIcon
    , removeBangeText
    , getStorage
    , getCurrentTab
    , getLastTab
    , createContextMenu
    , createNotification
    , clearNotifications
    , enableAction
    , dissableAction
};

export default {
    regexInput
    , isFullScreen
    , enableFullScreen
    , disableFullscreen
    , toggleFullscreen
    , isPlaying
    , requestAction
    , getVideos
    , getLastPlayedVideo
    , setLastPlayedVideo

    , setStorage
    , setBadgeText
    , setIcon
    , removeBangeText
    , getStorage
    , getCurrentTab
    , getLastTab
    , createContextMenu
    , createNotification
    , clearNotifications
    , enableAction
    , dissableAction
};
