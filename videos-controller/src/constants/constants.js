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

export {
    VIDEOS_CONFIG
    , REGEX
}

export default {
    VIDEOS_CONFIG
    , REGEX
}