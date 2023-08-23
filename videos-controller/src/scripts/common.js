"use strict";
const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};

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
    // Create only on installed
    await chrome.runtime.onInstalled.addListener( async () => {
        await chrome.contextMenus.create(config);
        await chrome.contextMenus.onClicked.addListener(clickEvent);
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
    , enableAction
    , dissableAction
};
