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
    const [tab] = await chrome.tabs.query(queryOptions, (tabs) => {
        console.log("Current tab:", tabs);
    });
    return tab;
};
const getLastTab = async () => {
    const queryOptions = { 
        active: true
        , lastFocusedWindow: true 
    };
    const [tab] = await chrome.tabs.query(queryOptions, (tabs) => {
        console.log("Last focused tab:", tabs);
    });
    return tab;
};
const requestAction = async (action) => {
    await chrome.runtime.sendMessage({ action });
};
const setBadgeText = async (text, color) => {
    await chrome.action.setBadgeBackgroundColor({ color })
    await chrome.action.setBadgeText({ text });
};

export {
    regexInput
    , requestAction
    , setBadgeText
    , getCurrentTab
    , getLastTab
};

export default {
    regexInput
    , requestAction
    , setBadgeText
    , getCurrentTab
    , getLastTab
};
