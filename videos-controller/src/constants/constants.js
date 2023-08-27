"use strict";
const speed = 100;
const step = 0.25;
const seek = 10;
const MIN_SPEED = 0;
const MAX_SPEED = 1000;
const VIDEOS_CONFIG = {
    speed
    , step
    , seek
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
const SHOW_PAGE_ACTION = "show-page-action";
const HIDE_PAGE_ACTION = "hide-page-action";
const ACTION = {
    CREATE_NOTIFICATION
    , CLEAR_NOTIFICATIONS
    , SHOW_PAGE_ACTION
    , HIDE_PAGE_ACTION
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