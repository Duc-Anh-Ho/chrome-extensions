"use strict";
// REGULAR
const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};
// CHROME
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
    , requestAction
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
    , requestAction
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
