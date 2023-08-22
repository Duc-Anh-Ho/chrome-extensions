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
    return await chrome.tabs.query(queryOptions)
};
const getLastTab = async () => {
    const queryOptions = { 
        active: true
        , lastFocusedWindow: true 
    };
    return await chrome.tabs.query(queryOptions)
};
const showPageAction = async () => {
    const tab = await getCurrentTab();
    console.log("tab :", tab );
    const tab2 = await getLastTab();
    console.log("tab2 :", tab );
};
const requestAction = async (action) => {
    await chrome.runtime.sendMessage({ action });
};
const setBadgeText = async (text, color) => {
    await chrome.action.setBadgeBackgroundColor({ color })
    await chrome.action.setBadgeText({ text });
};
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
    , getCurrentTab
    , getLastTab
    , createContextMenu
    , showPageAction
};

export default {
    regexInput
    , requestAction
    , setBadgeText
    , getCurrentTab
    , getLastTab
    , createContextMenu
    , showPageAction
};
