const DEFAULT_FRAMERATE = 60;
const MANIFEST = chrome.runtime.getManifest();
const DEFAULT_TIME = "00h 00m 00s 000ms";

const NOTIFICATION_MESSAGES = {
    framerateIsNaN: "Framerate must be a number",
    framerateIsEmpty: "Framerate cannot be empty",
    framerateUnderOrEqual0: "Framerate cannot be under 0",
    copied: "Copied to ClipBoard!",
};

const SEND_MESSAGES = {
    openedExtension: "openedExtension",
    changeSelectedInput: "changeSelectedInput",
    setTime: "setTime",
    getExactTime: "getExactTime",
};

const NOTIFICATION_COLORS = {
    error: "#ff3e30",
    success: "#00ae52",
    visualOutput: "#0067dd",
};

const WARNING_MESSAGES = {
    overwritingStartTime: "Are you sure you want to overwrite the start time?",
    overwritingEndTime: "Are you sure you want to overwrite the end time?",
    resetAll: "Are you sure you want to reset all?",
};

const ELEMENTS = {
    framerateInput: document.querySelector("#framerate"),
    timeText: document.querySelector("#time-text"),
    errorMessage: document.querySelector("#notification-message"),
    segmentsContainer: document.querySelector("#segments-container"),
    calculatedTimeText: document.querySelector("#calculated-time"),
    warningModal: document.querySelector("#warning"),
    lock: document.querySelector("#lock"),
};

const BUTTONS = {
    calculateBtn: document.querySelector("#calculate-btn"),
    copyBtn: document.querySelector("#copy-btn"),
    addSegmentBtn: document.querySelector("#add-segment-btn"),
    resetAllBtn: document.querySelector("#reset-all-btn"),
    resetFirstSegmentBtn: document.querySelector("#reset-btn"),
    getExactTimeBtn: document.querySelector("#exact-time-btn"),
    sendToSRCBtn: document.querySelector("#send-btn"),
};

// Classes

class Time {
    constructor(hours, minutes, seconds, milliseconds) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }
}

class Segment {
    constructor(startTime, endTime = null) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = new Time();
    }

    getFrames() {
        return Math.abs(this.endTime - this.startTime);
    }

    calculateTime() {
        let framerate = getFramerate();

        checkFramerate(framerate);

        let frames = this.getFrames() * framerate;
        let hours = Math.floor(frames / (3600 * framerate));
        let minutes = Math.floor(
            (frames % (3600 * framerate)) / (60 * framerate)
        );
        let seconds = Math.floor((frames % (60 * framerate)) / framerate);
        let milliseconds = Math.floor(
            (frames % framerate) * (1000 / framerate)
        );

        this.time = new Time(hours, minutes, seconds, milliseconds);
    }

    getTime() {
        this.calculateTime();

        return this.time;
    }

    toString() {
        let time = this.getTime();
        let hours = time.hours.toString().padStart(2, "0");
        let minutes = time.minutes.toString().padStart(2, "0");
        let seconds = time.seconds.toString().padStart(2, "0");
        let milliseconds = time.milliseconds.toString().padStart(3, "0");

        return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
    }
}

// General Functions

function getFramerate() {
    let framerate = framerateInput.value;

    framerate = checkFramerate(framerate);

    return framerate;
}

function checkFramerate(framerate) {
    if (framerate == "" || framerate == undefined || framerate == null) {
        framerate = DEFAULT_FRAMERATE;
    }

    if (isNaN(framerate)) {
        setNotificationMessage(ERROR_MESSAGES.framerateIsNaN);
    }

    if (framerate <= 0) {
        setNotificationMessage(ERROR_MESSAGES.framerateUnderOrEqual0);
    }

    return framerate;
}

function setNotificationMessage(
    message,
    color = NOTIFICATION_COLORS.error,
    throwException = false
) {
    ELEMENTS.errorMessage.textContent = message;
    ELEMENTS.errorMessage.style.color = color;
    if (throwException) {
        throw new Error(ERROR_MESSAGES.framerateIsNaN);
    }
}

function removeWarning() {
    ELEMENTS.errorMessage.textContent = "";
}

function getCalculatedTime() {
    return ELEMENTS.calculatedTimeText.value;
}

function getCalculatedTimeObject() {
    return ELEMENTS.calculatedTimeText.segment.time;
}

function setCalculatedTime(time) {
    ELEMENTS.calculatedTimeText.value = time;
}

function changeSelectedInstance(segmentNode) {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segmentNode) => {
        segmentNode.unselectSegment();
    });

    console.log(segmentNode.selectSegment);

    segmentNode.selectSegment();
    saveDataToLocalStorage();
}

function isSelected(segmentNode) {
    return (
        segmentNode
            .querySelector("#time-segment-btn")
            .getAttribute("checked") == "true"
    );
}

function getAllSegmentsNodes() {
    let segmentsNodes = segmentsContainer.querySelectorAll(".segment");

    return segmentsNodes;
}

function getTime() {
    return ELEMENTS.timeText.textContent;
}

function setTime(time) {
    ELEMENTS.timeText.textContent = time;
}

function setFramerate(framerate) {
    ELEMENTS.framerateInput.value = framerate;
}

function sendMessage(messageToSend, extraData = undefined) {
    let response = chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;

            try {
                chrome.tabs.sendMessage(
                    activeTabId,
                    { message: messageToSend, extraData: extraData },
                    async function (response) {
                        return response;
                    }
                );
            } catch (error) {}
        }
    );
    return response;
}

// Functions

function calculateTotalSumOfSegments() {
    let segmentsNodes = getAllSegmentsNodes();

    let totalSum = 0;

    segmentsNodes.forEach((segmentNode) => {
        let segment = segmentNode.segment;

        if (segment != undefined) {
            totalSum += segment.getFrames();
        }
    });

    return new Segment(0, totalSum);
}

function generateModNote() {
    let segmentsTimes = getSegmentsTimeSeparatedBy("+");
    let framerate = getFramerate();
    let totalTime = getCalculatedTime();
    let extensionName = MANIFEST.name;
    let repoLink = MANIFEST.homepage_url;

    var modNote =
        `Mod Message: The sections, "${segmentsTimes} at ${framerate} fps" add up` +
        `to a final time of "${totalTime}" Retimed using the ${extensionName} (${repoLink})`;

    return modNote;
}

function getSegmentsTimeSeparatedBy(separator) {
    let segmentsTimeString = "";
    let segmentsNodes = ELEMENTS.segmentsContainer.childNodes;

    segmentsNodes.forEach((segmentNode, index) => {
        let segment = segmentNode.segment;
        let isLastSegment = index == segmentsNodes.length - 1;

        segmentsTimeString +=
            segment == undefined ? DEFAULT_TIME : segment.toString();

        if (!isLastSegment) {
            segmentsTimeString += ` ${separator} `;
        }
    });

    return segmentsTimeString;
}

async function resetAll() {
    let accepted = await openWarningModal(
        (message = WARNING_MESSAGES.resetAll)
    );

    if (!accepted) return;

    framerateInput.value = "";

    resetNodes();

    ELEMENTS.calculatedTimeText.textContent = DEFAULT_TIME;
    ELEMENTS.calculatedTimeText.segment = new Segment(0);

    saveDataToLocalStorage();
}

function resetNodes() {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segment, index) => {
        if (index != 0) {
            segment.remove();
        }
    });

    let firstSegmentNode = segmentsNodes[0];

    firstSegmentNode.resetSegment();

    changeSelectedInstance(firstSegmentNode);
}

function getSelectedSegmentNodeAndIndex() {
    let segmentsNodes = getAllSegmentsNodes();

    let selectedSegment = {
        segment: undefined,
        index: undefined,
    };

    for (let i = 0; i < segmentsNodes.length; i++) {
        let segmentNode = segmentsNodes[i];

        let isSelected =
            segmentNode
                .querySelector("#time-segment-btn")
                .getAttribute("checked") == "true";

        if (isSelected) {
            selectedSegment = {
                segment: segmentNode,
                index: i,
            };
            break;
        }
    }

    return selectedSegment;
}

function loadSavedDataFromLocalStorage() {
    chrome.storage.local.get(["timeData"], function (result) {
        let timeData = result.timeData;

        if (timeData == undefined) {
            return;
        }

        setData(timeData);
    });
}

function setData(timeData) {
    let segmentsLoaded = timeData.segments;
    let framerateLoaded = timeData.framerate;
    let actualTimeLoaded = timeData.textTime;
    let calculatedSegmentLoaded = timeData.calculatedTime;

    setTime(actualTimeLoaded);

    setFramerate(framerateLoaded == undefined ? "" : framerateLoaded);

    segmentsLoaded.forEach((segmentLoaded, index) => {
        let segmentNode = ELEMENTS.segmentsContainer.childNodes[index];
        let segmentNodeValue =
            segmentNode.querySelector("#segment-value").value;

        segmentNode.segment = new Segment(
            segmentLoaded.startTime,
            segmentLoaded.endTime
        );

        segmentNodeValue = segmentLoaded.toString();
    });

    ELEMENTS.calculatedTimeText.segment = new Segment(
        calculatedSegmentLoaded.startTime,
        calculatedSegmentLoaded.endTime
    );
    if (ELEMENTS.calculatedTimeText.segment.endTime != null) {
        setCalculatedTime(ELEMENTS.calculatedTimeText.segment.toString());
    }
}

function sendOpenedMessage() {
    sendMessage(SEND_MESSAGES.openedExtension);
}

function openWarningModal(message) {
    ELEMENTS.warningModal.querySelector("#warning-message").textContent =
        message;

    ELEMENTS.warningModal.style.visibility = "visible";
    ELEMENTS.lock.style.visibility = "visible";

    return new Promise((resolve, reject) => {
        ELEMENTS.warningModal.querySelector("#warning-yes-btn").onclick =
            () => {
                resolve(true);
                ELEMENTS.warningModal.style.visibility = "hidden";
                ELEMENTS.lock.style.visibility = "hidden";
            };
        ELEMENTS.warningModal.querySelector("#warning-no-btn").onclick = () => {
            resolve(false);
            ELEMENTS.warningModal.style.visibility = "hidden";
            ELEMENTS.lock.style.visibility = "hidden";
        };
    });
}

function addSegmentNode() {
    let newSegmentNode = createSegmentNode();

    ELEMENTS.segmentsContainer.appendChild(newSegmentNode);

    changeSelectedInstance(newSegmentNode);
}

function createSegmentNode() {
    let segmentNode = ELEMENTS.segmentsContainer.childNodes[0].cloneNode(true);

    segmentNode.resetSegment = () => resetSegment(segmentNode);
    segmentNode.unselectSegment = () => unselectSegment(segmentNode);
    segmentNode.selectSegment = () => selectSegment(segmentNode);

    segmentNode.querySelector("#remove-segment-btn").onclick = () => {
        removeSegmentNode(segmentNode);
    };

    segmentNode.querySelector("#remove-segment-btn").style.visibility =
        "visible";

    return segmentNode;
}

// Segment Node Functions

function resetSegment(segmentNode) {
    segmentNode.segment = undefined;
    segmentNode.querySelector("#segment-value").value = DEFAULT_TIME;
}

function unselectSegment(segmentNode) {
    segmentNode
        .querySelector("#time-segment-btn")
        .setAttribute("checked", false);
}

function selectSegment(segmentNode) {
    segmentNode
        .querySelector("#time-segment-btn")
        .setAttribute("checked", true);
}

function resetSegmentBtnFunc(resetBtn) {
    resetBtn.parentNode.resetSegment();
    saveDataToLocalStorage();
}

function removeSegmentNode(segmentNode) {
    if (isSelected(segmentNode)) {
        changeSelectedInstance(segmentNode.previousSibling);
    }

    segmentNode.remove();

    saveDataToLocalStorage();
}

// JSON Functions

function getSegmentsJSON() {
    let segmentsNodes = getAllSegmentsNodes();

    let segments = [];

    segmentsNodes.forEach((segmentNode) => {
        let segment = segmentNode.segment;

        if (segment == undefined) {
            segment = new Segment(0);
        }

        segments.push(segment);
    });

    return segments;
}

function createSaveJSON() {
    let segments = getSegmentsJSON();
    let framerate = getFramerate();
    let textTime = getTime();
    let calculatedTime = getCalculatedTime();
    let selectedIndex = getSelectedSegmentNodeAndIndex().index;

    let timeData = {
        selectedIndex: selectedIndex,
        segments: segments,
        framerate: framerate,
        textTime: textTime,
        calculatedTime: calculatedTime,
    };

    return timeData;
}

// Execution
window.onload = executeOnLoad();

function executeOnLoad() {
    ELEMENTS.calculatedTimeText.segment = new Segment(0);

    let firstSegmentNode = ELEMENTS.segmentsContainer.childNodes[0];

    firstSegmentNode.resetSegment = () => resetSegment(firstSegmentNode);
    firstSegmentNode.unselectSegment = () => unselectSegment(firstSegmentNode);
    firstSegmentNode.selectSegment = () => selectSegment(firstSegmentNode);

    loadSavedDataFromLocalStorage();

    sendOpenedMessage();
}

// Event Listeners

BUTTONS.calculateBtn.addEventListener("click", () => {
    let totalSum = calculateTotalSumOfSegments();

    let stringTime = totalSum.toString();

    setCalculatedTime(stringTime);

    saveDataToLocalStorage();
});

BUTTONS.copyBtn.addEventListener("click", () => {
    removeWarning();
    let calculatedTime = getCalculatedTime();

    navigator.clipboard.writeText(calculatedTime).then(() => {
        setNotificationMessage(
            NOTIFICATION_MESSAGES.copied,
            NOTIFICATION_COLORS.success
        );
    });

    saveDataToLocalStorage();
});

BUTTONS.addSegmentBtn.addEventListener("click", () => {
    removeWarning();
    addSegmentNode();
    saveDataToLocalStorage();
});

BUTTONS.resetAllBtn.addEventListener("click", () => {
    removeWarning();
    resetAll();
    saveDataToLocalStorage();
});

BUTTONS.resetFirstSegmentBtn.addEventListener("click", () => {
    removeWarning();
    let firstSegmentNode = ELEMENTS.segmentsContainer.childNodes[0];
    resetSegmentBtnFunc(firstSegmentNode.querySelector("#reset-btn"));
    saveDataToLocalStorage();
});

BUTTONS.getExactTimeBtn.addEventListener("click", () => {
    removeWarning();
    let response = sendMessage(SEND_MESSAGES.getExactTime);
    setTime(response.time);
    saveDataToLocalStorage();
});

BUTTONS.sendToSRCBtn.addEventListener("click", () => {
    removeWarning();
    
    sendMessage(SEND_MESSAGES.sendToSRC, getCalculatedTimeObject());
    saveDataToLocalStorage();
});