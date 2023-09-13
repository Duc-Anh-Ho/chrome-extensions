"use strict";
// REGULAR
const regexInput = (regex) => {
    return (event) => {
        event.target.value = event.target.value.replace(regex, "");
    };
};
const debounce = (callback, delay) => {
    delay = delay || 10; // Default
    let timer = null;
    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};
const throttle = (callback, delay) => {
    delay = delay || 10; // Default
    let lastCall = 0;
    return (...args) => {
        const now = new Date().getTime();
        if (now - lastCall < delay) return;
        lastCall = now;
        callback(...args);
    };
};
const throttleDebounced = (callback, throttleDelay, debounceDelay) => {
    throttleDelay = throttleDelay || 10; // Default
    debounceDelay = debounceDelay || 10; // Default
    return throttle( debounce( async (...args) => {
        await callback(...args);
    }, debounceDelay), throttleDelay);
};
const debounceThottled = (callback, debounceDelay, throttleDelay) => {
    debounceDelay = debounceDelay || 10; // Default
    throttleDelay = throttleDelay || 10; // Default
    return debounce( throttle( async (...args) => {
        await callback(...args);
    }, throttleDelay), debounceDelay);
}
// https://javascript.info/mouse-drag-and-drop
const createDragAndDrop = (parentElement, ...childElements) => {
    // let shadowElement = targetElement.cloneNode(true);
    // targetElement.style.display = "none";
    // parentElement.appendChild(shadowElement);
    const parent = {};
    const child = {};
    const shadow = {};
    const offset = {};
    const position = {};
    let opacity;

    parentElement.style.position = "absolute";
    parentElement.style.zIndex = "9999";
    parentElement.addEventListener("dragover", (event) => {
        event.preventDefault(); // Can enable drag icon.
        if (!child.element) return false;
        parent.element = event.target;
        parent.rect = parent.element.getBoundingClientRect();
        shadow.rect = shadow.element.getBoundingClientRect();
        position.top = Math.round(event.clientY - offset.top - parent.rect.top);
        position.left = Math.round(event.clientX - offset.left - parent.rect.left);
        shadow.element.style.opacity = 0.6;
        shadow.element.style.top = `${position.top}px`;
        shadow.element.style.left = `${position.left}px`;
        console.log("position.top:", position.top);
        console.log("position.top:", position.top);
    });
    parentElement.addEventListener("dragleave", (event) => {});
    parentElement.addEventListener("dragenter", (event) => {});
    // TODO: Optional drop inside only.
    parentElement.addEventListener("drop", (event) => {
        return false;
        const parentElement = event.target;
        const parentRect = parentElement.getBoundingClientRect();
        const dropDataId = event.dataTransfer.getData("text/plain");
        const dropElement = document.getElementById(dropDataId);
        const dropRect = dropElement.getBoundingClientRect();
        const position = {
            top: Math.round(event.clientY - offset.top - parentRect.top),
            left: Math.round(event.clientX - offset.left - parentRect.left)
        };
        dropElement.style.opacity = opacity;
        dropElement.style.top = `${position.top}px`;
        dropElement.style.left = `${position.left}px`;
    });
    for (const childElement of childElements) {
        opacity = childElement.style.opacity;
        childElement.draggable = true;
        childElement.style.position = "absolute";
        childElement.style.userSelect = "none";
        childElement.style.cursor = "move";
        childElement.addEventListener("selectstart", (event) => {
            event.preventDefault(); // Prevent text selection
        });
        childElement.addEventListener("dragstart", (event) => {
            // return false;
            child.element = event.target;
            child.rect = child.element.getBoundingClientRect();
            child.element.style.opacity = "0.3";
            offset.left = event.clientY - child.rect.y;
            offset.top = event.clientX - child.rect.x;
            event.dataTransfer.clearData();
            event.dataTransfer.setData("text/plain", event.target.id);
            shadow.element = child.element.cloneNode(true);
            parent.element.appendChild(shadow.element);
        });
        childElement.addEventListener("drag", (event) => {});
        // TODO: Optional drop outside also.
        childElement.addEventListener("dragend", (event) => {
            return false;
            const parentRect = parentElement.getBoundingClientRect();
            const dropElement = event.target;
            const position = {
                top: Math.round(event.clientY - offset.top - parentRect.top),
                left: Math.round(event.clientX - offset.left - parentRect.left)
            };
            dropElement.style.opacity = opacity;
            dropElement.style.top = `${position.top}px`;
            dropElement.style.left = `${position.left}px`;
        });
        childElement.addEventListener("mousedown", (event) => {
            return false
            const dragElement = event.target;
            const dragRect = dragElement.getBoundingClientRect();
            dragElement.style.opacity = "0.3";
            offset.top = event.clientX - dragRect.x;
            offset.left = event.clientY - dragRect.y;
        });
        parentElement.appendChild(childElement);
    }
};
// VIDEOS CONTROLLER
const isFullScreen = (doc) => !!(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
);
const isPlaying = (video) => !!(
    !video.paused 
    && !video.ended 
    && video.currentTime > 0 
    && video.readyState > 2
);
const enableFullScreen = async (doc, elem) => {
    // Chrome, Safari, and Opera
    if (elem.webkitEnterFullscreen && doc.webkitFullscreenEnabled) {
        await elem.webkitEnterFullscreen(Element.ALLOW_KEYBOARD_INPUT); 
    } else if(elem.webkitRequestFullscreen && doc.webkitFullscreenEnabled) {
        await elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    // Firefox
    } else if (elem.mozRequestFullScreen && doc.mozFullScreenEnabled) {
        await elem.mozRequestFullScreen();
    // IE/Edge
    } else if (elem.msRequestFullscreen && doc.msFullscreenEnabled) {
        await elem.msRequestFullscreen();
    } else if (elem.requestFullscreen && doc.fullscreenEnabled) {
        await elem.requestFullscreen();
    }
};
const disableFullscreen = async (doc, elem) => {
    if (doc.exitFullscreen) {
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
        return false;
    } else {
        await enableFullScreen(doc, elem);
        return true;
    }
};
const getVideos = (doc) => {
    return doc.querySelectorAll("video"); // $$("video")
};
const isInputting = (event) => {
    const tagName = event.target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || event.target.isContentEditable;
};
const setLastPlayedVideo = (doc) => {
    const videos = getVideos(doc);
    for (const video of videos) {
        video.addEventListener("play", () => {
            video.setAttribute("last-video-played", "true");
            for (const otherVideo of getVideos(doc)) {
                if (otherVideo !== video) {
                    otherVideo.removeAttribute("last-video-played");
                }
            }
        });
    }
};
const getLastPlayedVideo = (doc) => {
    return (
        doc.querySelector("video[last-video-played]") 
        || doc.querySelector("video")
        || ((doc.activeElement instanceof HTMLVideoElement) ? doc.activeElement : null)
    )
};
// CHROME API
const getCurrentTabs = async () => {
    const queryOptions = { active: true, currentWindow: true };
    return await chrome.tabs.query(queryOptions);
};
const getLastTab = async () => {
    const queryOptions = { active: true, lastFocusedWindow: true };
    return await chrome.tabs.query(queryOptions);
};
const enableAction = async (tabId) => {
    await chrome.action.enable(tabId);
};
const dissableAction = async (tabId) => {
    await chrome.action.disable(tabId);
};
const requestAction = async (action) => {
    try {
        await chrome.runtime.sendMessage({ action });
    } catch (err) {
        // Upgrade extension will lost message, so reload required.
        window.location.reload();
    }
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
    await chrome.runtime.onInstalled.addListener(async () => {
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
    try {
        await chrome.storage.sync.set(object);
    } catch (err) {
        // Upgrade extension will lost storage, so reload required.
        window.location.reload();
    }
};
const getStorage = async (keys) => {
    try {
        return await chrome.storage.sync.get(keys)
    } catch (err) {
        // console.error('Error:', err);
        // Upgrade extension will lost storage, so reload required.
        window.location.reload();
    }
};
const syncStorage = (namespace, key, callback) => {
    chrome.storage.onChanged.addListener((changes, storageNamespace) => {
        if (storageNamespace === namespace && changes[key]) {
            // callback(changes[key].newValue);
            callback();
        }
    });
};

export {
    regexInput
    , debounce
    , throttle
    , debounceThottled
    , throttleDebounced
    , createDragAndDrop

    , isFullScreen
    , enableFullScreen
    , disableFullscreen
    , toggleFullscreen

    , isPlaying
    , getVideos
    , setLastPlayedVideo
    , getLastPlayedVideo

    , requestAction
    , setStorage
    , setBadgeText
    , setIcon
    , removeBangeText
    , getStorage
    , getCurrentTabs // Background Only
    , getLastTab // Background Only
    , syncStorage
    , createContextMenu
    , createNotification
    , clearNotifications
    , enableAction
    , dissableAction
    , isInputting
};

export default {
    regexInput
    , debounce
    , throttle
    , debounceThottled
    , throttleDebounced
    , createDragAndDrop

    , isFullScreen
    , enableFullScreen
    , disableFullscreen
    , toggleFullscreen

    , isPlaying
    , getVideos
    , setLastPlayedVideo
    , getLastPlayedVideo

    , requestAction
    , setStorage
    , setBadgeText
    , setIcon
    , removeBangeText
    , getStorage
    , getCurrentTabs // Background Only 
    , getLastTab // Background Only  
    , syncStorage
    , createContextMenu
    , createNotification
    , clearNotifications
    , enableAction
    , dissableAction
    , isInputting 
};
