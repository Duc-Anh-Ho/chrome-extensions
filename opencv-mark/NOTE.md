DOC
[D:\repos\chrome-extensions\opencv-mark](https://docs.opencv.org/4.x/opencv.js)
https://docs.opencv.org/master/opencv.js
https://opencv.org/releases/
https://docs.opencv.org/4.x/d0/d84/tutorial_js_usage.html

DOWNLOAD
option-1: LINUX (Should not use with company PC)
git clone https://github.com/opencv/opencv.git
cd opencv
emcmake python platforms/js/build_js.py build_js --build_wasm
option-2:

npm install opencv-wasm
Find and copy out:  .\node_modules\opencv-wasm
opencv.js
opencv.wasm
(2 files need for chorme extension without npm)


