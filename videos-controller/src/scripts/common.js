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
const requestFullScreen = (elem) => {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
};
const exitFullscreen = (doc) => {
    if (doc.exitFullscreen) {
        doc.exitFullscreen();
    } else if (doc.webkitFullscreenElement) {
        doc.webkitExitFullscreen();
    } else if (doc.mozFullScreenElement) {
        doc.mozCancelFullScreen();
    } else if (doc.msFullscreenElement) {
        doc.msExitFullscreen();
    }
};
const toggleFullscreen = (doc, elem) => {
    console.log("isFullScreen(doc):", isFullScreen(doc));
    if (isFullScreen(doc)) {
        exitFullscreen(doc);
    } else {
        requestFullScreen(elem);
    }
};
const isPlaying = (video) => !!(
    video.currentTime > 0 
    && !video.paused 
    && !video.ended 
    && video.readyState > 2
);
const getVideos = (doc) => {
    // return [ ...doc.querySelectorAll("video")]; // $$("video")
    return doc.querySelectorAll("video"); // $$("video")
};
const getActiveVideo = (doc) => {
    return doc.querySelector("video");
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
    return doc.querySelector("video[data-last-played]") || null;
}


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
}

export {
    regexInput
    , isFullScreen
    , requestFullScreen
    , exitFullscreen
    , toggleFullscreen
    , isPlaying
    , requestAction
    , getVideos
    , getActiveVideo
    , setLastPlayedVideo
    , getLastPlayedVideo

    , setBadgeText
    , setIcon
    , removeBangeText
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
    , requestFullScreen
    , exitFullscreen
    , toggleFullscreen
    , isPlaying
    , requestAction
    , getVideos
    , getActiveVideo
    , setLastPlayedVideo
    , getLastPlayedVideo

    , setBadgeText
    , setIcon
    , removeBangeText
    , getCurrentTab
    , getLastTab
    , createContextMenu
    , createNotification
    , clearNotifications
    , enableAction
    , dissableAction
};
