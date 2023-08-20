const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};

const requestAction = (action) => {
    chrome.runtime.sendMessage({ action });
};

const setBadgeText = (text, color) => {
    chrome.action.setBadgeBackgroundColor({ color })
    chrome.action.setBadgeText({ text });
};

export {
    regexInput
    , requestAction
    , setBadgeText
};

export default {
    regexInput
    , requestAction
    , setBadgeText
};
