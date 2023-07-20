chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("Message received!");

    if (request.message === "getExactTime") {
        console.log("Message received!");
        var time = document.getElementsByClassName(
            "video-stream html5-main-video"
        )[0].currentTime;

        sendResponse({ time: time });
    }
});
