"use strict";

console.info("Content loaded!");

// Script Injection Technique:
/* 
const scriptURL = chrome.runtime.getURL("./src/content/content-script.js");
const script = document.createElement("script");
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

script.setAttribute("type", "module");
script.setAttribute("src", scriptURL);
head.insertBefore(script, head.lastChild); 
*/

// Dynamic Import Function Technique:
(async () => {
    const src = chrome.runtime.getURL("./src/content/content-script.js");
    const contentMain = await import(src);
    await contentMain.main();
})();
