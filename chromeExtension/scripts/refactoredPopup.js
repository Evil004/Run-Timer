const DEFAULT_FRAMERATE = 60;
const MANIFEST = chrome.runtime.getManifest();
const DEFAULT_TIME = "00h 00m 00s 000ms";
const NOTIFICATION_MESSAGES = {
    framerateIsNaN: "Framerate must be a number",
    framerateIsEmpty: "Framerate cannot be empty",
    framerateUnderOrEqual0: "Framerate cannot be under 0",
};

const NOTIFICATION_COLORS = {
    error: "#ff0000",
    success: "#00ff00",
    visualOutput: "#0000ff",
};

const elements = {
    framerateInput: document.querySelector("#framerate"),
    timeText: document.querySelector("#time-text"),
    errorMessage: document.querySelector("#notification-message"),
    segmentsContainer: document.querySelector("#segments-container"),
    calculatedTimeText: document.querySelector("#calculated-time"),
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

    calculateTime(framerate) {
        checkFramerate(framerate);

        let frames = this.getFrames();
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
        setErrorMessag(ERROR_MESSAGES.framerateIsNaN);
    }

    if (framerate <= 0) {
        setErrorMessag(ERROR_MESSAGES.framerateUnderOrEqual0);
    }

    return framerate;
}

function setErrorMessag(message, color = NOTIFICATION_COLORS.error) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.color = color;
    throw new Error(ERROR_MESSAGES.framerateIsNaN);
}

function removeError() {
    elements.errorMessage.textContent = "";
}

function getCalculatedTime() {
    return elements.calculatedTimeText.value;
}

function setCalculatedTime(time) {
    elements.calculatedTimeText.textContent = time;
}

function changeSelectedInstance(segmentNode) {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segmentNode) => {
        segmentNode.unselectSegment();
    });

    segmentNode.selectSegment();
    saveDataToLocalStorage();
}

function getAllSegmentsNodes() {
    let segmentsNodes = segmentsContainer.querySelectorAll(".segment");

    return segmentsNodes;
}

function getTime(){
    return elements.timeText.textContent;
}

function setTime(time) {
    elements.timeText.textContent = time;
}

function setFramerate(framerate) {
    elements.framerateInput.value = framerate;
}

// Functions

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
    let segmentsNodes = elements.segmentsContainer.childNodes;

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

function resetAll() {
    framerateInput.value = "";

    resetNodes();

    elements.calculatedTimeText.textContent = DEFAULT_TIME;
    elements.calculatedTimeText.segment = new Segment(0);

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
        let segmentNode = elements.segmentsContainer.childNodes[index];
        let segmentNodeValue =
            segmentNode.querySelector(".segment-value").value;

        segmentNode.segment = new Segment(
            segmentLoaded.startTime,
            segmentLoaded.endTime
        );

        segmentNodeValue = segmentLoaded.toString();
    });

    elements.calculatedTimeText.segment = new Segment(
        calculatedSegmentLoaded.startTime,
        calculatedSegmentLoaded.endTime
    );
    if (elements.calculatedTimeText.segment.endTime != null) {
        setCalculatedTime(elements.calculatedTimeText.segment.toString());
    }
}

function sendOpenedMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        try {
            chrome.tabs.sendMessage(
                activeTabId,
                { message: "openedExtension" },
                async function (response) {}
            );
        } catch (error) {
        }
    });
}


// Segment Node Functions

function resetSegment(segmentNode) {
    segmentNode.segment = undefined;
    segmentNode.querySelector(".segment-value").value = DEFAULT_TIME;
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

function sesetSegmentBtnFunc(resetBtn) {
    resetBtn.parentNode.resetSegment();
    saveDataToLocalStorage();
}

function addResetSegmentFunctionalityToAllSegments() {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segmentNode) => {
        segmentNode.resetSegment = () => resetSegment(segmentNode);
    });
}

function addSelectSegmentFunctionalityToAllSegments() {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segmentNode) => {
        segmentNode.selectSegment = () => selectSegment(segmentNode);
    });
}

function addUnselectSegmentFunctionalityToAllSegments() {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segmentNode) => {
        segmentNode.unselectSegment = () => unselectSegment(segmentNode);
    });
}

addResetSegmentFunctionalityToAllSegments();
addSelectSegmentFunctionalityToAllSegments();
addUnselectSegmentFunctionalityToAllSegments();

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
    elements.calculatedTimeText.segment = new Segment(0);

    loadSavedDataFromLocalStorage();

    sendOpenedMessage();
}

