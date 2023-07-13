browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "getExactTime") {
        var video = document.querySelector(".video-stream.html5-main-video");
        var time = video.currentTime;

        sendResponse({ time: time });
    }
});
