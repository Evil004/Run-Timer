chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.message === "getExactTime") {

        var time = document.getElementsByClassName(
            "video-stream html5-main-video"
        )[0].currentTime;

        console.log(time);

        sendResponse({ response: time });
    }
});
