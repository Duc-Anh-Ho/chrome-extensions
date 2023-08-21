"use strict";

console.log("Content loaded!");

const scriptURL = chrome.runtime.getURL("./src/content/content-script.js");
const script = document.createElement("script");
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

script.setAttribute("type", "module");
script.setAttribute("src", scriptURL);
head.insertBefore(script, head.lastChild);
