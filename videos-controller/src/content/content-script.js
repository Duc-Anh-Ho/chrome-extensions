"use strict";
import common from "../scripts/common.js";
import { ACTION } from "../constants/constants.js";

console.log("Content script loaded!");


document.addEventListener("keydown", (e) => {
    if (e.shiftKey && e.code === "Slash") {
        common.requestAction(ACTION.CREATE_NOTIFICATION);
    }
    if (e.code === "Numpad0") {
        common.requestAction(ACTION.CLEAR_NOTIFICATIONS);
    }
});