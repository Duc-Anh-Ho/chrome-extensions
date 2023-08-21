"use strict";
const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};

const requestAction = async (action, extensionId = null) => {
    console.log("action:", action);
    await chrome.runtime.sendMessage(extensionId ,{ action });
};

const setBadgeText = async (text, color) => {
    await chrome.action.setBadgeBackgroundColor({ color })
    await chrome.action.setBadgeText({ text });
};

const getCurrentTab = async () => {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
};

export {
    regexInput
    , requestAction
    , setBadgeText
    , getCurrentTab
};

export default {
    regexInput
    , requestAction
    , setBadgeText
    , getCurrentTab
};
