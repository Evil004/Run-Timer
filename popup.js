const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimerBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");
const timeText = document.querySelector("#time-text");

let obj = {
    startTime: null,
    endTime: null,
};

getExactTimeBtn.addEventListener("click", () => {
    injectScript();
});

startTimerBtn.addEventListener("click", () => {
    obj.startTime = timeText.value.trim();
    timeText.value = '00h 00m 00s 000ms';
    saveDataToLocalStorage();
});

endTimerBtn.addEventListener("click", () => {
    obj.endTime = timeText.value.trim();
    timeText.value = '00h 00m 00s 000ms';
    saveDataToLocalStorage();
    calculateTime();
});

function onLoad() {
    getDataFromLocalStorage();
}

window.onload = onLoad;
window.onbeforeunload = saveDataToLocalStorage;

function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: obj });
}

function getDataFromLocalStorage() {
    chrome.storage.local.get("timeData", function (result) {
        if (result.timeData) {
            obj = result.timeData;
        }
    });
}

function calculateTime() {
    if (obj.startTime && obj.endTime) {
        const startTime = parseTime(obj.startTime);
        const endTime = parseTime(obj.endTime);

        if (startTime !== null && endTime !== null) {
            const timeDifference = endTime - startTime;

            const hours = Math.floor(timeDifference / 3600000);
            const minutes = Math.floor((timeDifference % 3600000) / 60000);
            const seconds = Math.floor((timeDifference % 60000) / 1000);
            const milliseconds = timeDifference % 1000;

            const calculatedTime = `${padZero(hours)}h ${padZero(minutes)}m ${padZero(seconds)}s ${padZero(milliseconds)}ms`;
            document.getElementById("calculated-time").value = calculatedTime;
        } else {
            alert("Invalid time format. Please set the time in the format '00h 00m 00s 000ms'.");
        }
    } else {
        alert("Please set both start time and end time.");
    }
}

function parseTime(timeString) {
    const regex = /(\d+)h\s+(\d+)m\s+(\d+)s\s+(\d+)ms/;
    const match = timeString.match(regex);

    if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        const milliseconds = parseInt(match[4], 10);

        return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
    }

    return null;
}

function padZero(number) {
    return number.toString().padStart(2, "0");
}

function injectScript() {
    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: GetExactSecond,
        });
    }).then(function (results) {
        timeText.value = results[0].result;
    }).catch(function (err) {
        alert("No se ha podido obtener el tiempo exacto");
    });
}

function GetExactSecond(selector) {
    return document.getElementsByClassName("video-stream html5-main-video")[0].currentTime;
}
