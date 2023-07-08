const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimerBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");

obj = {
    startTime: 0,
    endTime: 0,
};

getExactTimeBtn.addEventListener("click", () => {
    saveDataToLocalStorage();
    injectScript();
});

startTimerBtn.addEventListener("click", () => {
    obj.startTime = timeText.value;

    timeText.value = 0;
});

endTimerBtn.addEventListener("click", () => {
    obj.endTime = timeText.value;

    timeText.value = 0;
});

function onLoad() {
    getDataFromLocalStorage();
}

window.onload = onLoad;
window.onbeforeunload = saveDataToLocalStorage;

function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: obj });
    chrome.storage.local.set({ actualTime: timeText.value });
}

function getDataFromLocalStorage() {
    chrome.storage.local.get("timeData", function (result) {
        obj = result.timeData;
    });

    chrome.storage.local.get("actualTime", function (result) {
        timeText.value = result.actualTime;
    });
}

function calculateTime() {
    let time = obj.endTime - obj.startTime;
    alert(time);
}

function injectScript() {
    chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(function (tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;

            return chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                // injectImmediately: true,  // uncomment this to make it execute straight away, other wise it will wait for document_idle
                func: GetExactSecond,
                // args: ['body']  // you can use this to target what element to get the html for
            });
        })
        .then(function (results) {
            timeText.value = results[0].result;
        })
        .catch(function (err) {
            alert("No se ha podido obtener el tiempo exacto");
        });
}

function GetExactSecond(selector) {
    return document.getElementsByClassName("video-stream html5-main-video")[0]
        .currentTime;
}
