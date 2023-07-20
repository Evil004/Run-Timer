browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
    if (request.message === "getExactTime") {
        console.log("getExactTime message received");
        var time = document.getElementsByClassName(
            "video-stream html5-main-video"
        )[0].currentTime;

        sendResponse({ time: time });
    }
});

console.log("injectYT.js loaded");