browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "getExactTime") {
        var time = document.querySelector("video").currentTime;

        sendResponse({ time: time });
    }
});