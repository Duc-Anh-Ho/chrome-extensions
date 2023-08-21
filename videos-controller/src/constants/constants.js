"use strict";
const speed = 100;
const MIN_SPEED = 0;
const MAX_SPEED = 1000;
const VIDEOS_CONFIG = {
    speed
    , MAX_SPEED
    , MIN_SPEED
}

const NUM = /^\d+(\.\d{0,2})?$/; // 0.00
const CHR = /[^\d.]/g;
const REGEX = {
    NUM
    , CHR
}

const GREEN = "#00ff00";
const RED = "#dc3545";
const COLOR = {
    GREEN
    , RED
}

const CREATE_NOTIFICATION = "create-notification";
const CLEAR_NOTIFICATIONS = "clear-notifications";
const ACTION = {
    CREATE_NOTIFICATION
    , CLEAR_NOTIFICATIONS
}

export {
    VIDEOS_CONFIG
    , REGEX
    , COLOR
    , ACTION
}
export default {
    VIDEOS_CONFIG
    , REGEX
    , COLOR
    , ACTION
}