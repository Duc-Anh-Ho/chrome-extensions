console.log("Background script loaded!");

// NOTE: Don't remove this because it will occur below:
// BUG: Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
// REASON: chrome.runtime.sendMessage has to have at lease one listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script loaded!"); 
});
