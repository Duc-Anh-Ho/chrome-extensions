const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};

const requestAction = (action) => {
    chrome.runtime.sendMessage({ action });
}

export { 
    regexInput
    , requestAction
};

export default {
    regexInput 
    , requestAction
};
