const DEFAULT_FRAMERATE = 60;
const MANIFEST = browser.runtime.getManifest();
const DEFAULT_TIME = "00h 00m 00s 000ms";

const NOTIFICATION_MESSAGES = {
    framerateIsNaN: "Framerate must be a number",
    framerateIsEmpty: "Framerate cannot be empty",
    framerateUnderOrEqual0: "Framerate cannot be under 0",
    copied: "Copied to ClipBoard!",
    timeIsEmpty: "Time cannot be empty",
    noSegmentSelected: "No segment selected",
    timeIsNaN: "Time must be a number",
    timeUnder0: "Time cannot be under 0",
    startTimeSaved: "Start time saved!",
    endTimeSaved: "End time saved!",
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
    deleteSegment: "Are you sure you want to delete this segment?",
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
    firstTimeInput: document.querySelector("#time-segment-btn"),
    getExactTimeBtn: document.querySelector("#exact-time-btn"),
    sendToSRCBtn: document.querySelector("#send-btn"),
    setStartTimeBtn: document.querySelector("#start-time-btn"),
    setEndTimeBtn: document.querySelector("#end-time-btn"),
    changeSRCTimeInputBtn: document.querySelector("#change-input-btn"),
    setFramerateTo60Btn: document.querySelector("#sixty-framerate-btn"),
    setFramerateTo30Btn: document.querySelector("#thirty-framerate-btn"),
    copyModNoteBtn: document.querySelector("#copy-mod-note-btn"),
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

        let frames = this.getFrames();
        let hours = Math.floor(frames / 3600);
        let minutes = Math.floor((frames % 3600) / 60);
        let seconds = Math.floor(frames % 60);
        let milliseconds = Math.floor(
            ((frames % framerate) - Math.floor(frames % framerate)) * 1000
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
    let framerate = ELEMENTS.framerateInput.value;

    try {
        framerate = checkFramerate(framerate);
    } catch (error) {
        ELEMENTS.framerateInput.value = "";
        return;
    }

    return framerate;
}

function checkFramerate(framerate) {
    if (framerate == "" || framerate == undefined || framerate == null) {
        framerate = DEFAULT_FRAMERATE;
    }

    if (isNaN(framerate)) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateIsNaN);
    }

    if (framerate <= 0) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateUnderOrEqual0);
    }

    return framerate;
}

function checkTime(time) {
    if (time == "" || time == undefined || time == null) {
        setNotificationMessage(NOTIFICATION_MESSAGES.timeIsEmpty);
    }

    if (isNaN(time)) {
        setNotificationMessage(NOTIFICATION_MESSAGES.timeIsNaN);
    }

    if (time < 0) {
        setNotificationMessage(NOTIFICATION_MESSAGES.timeUnder0);
    }
}

function setNotificationMessage(
    message,
    color = NOTIFICATION_COLORS.error,
    throwException = true
) {
    ELEMENTS.errorMessage.textContent = message;
    ELEMENTS.errorMessage.style.color = color;
    if (throwException) {
        throw new Error(NOTIFICATION_MESSAGES.framerateIsNaN);
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

function changeSelectedSection(segmentNode) {
    let segmentsNodes = getAllSegmentsNodes();

    segmentsNodes.forEach((segmentNode) => {
        unselectSegment(segmentNode);
    });

    selectSegment(segmentNode);
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
    let segmentsNodes = ELEMENTS.segmentsContainer.querySelectorAll(".segment");

    return segmentsNodes;
}

function getTime() {
    return ELEMENTS.timeText.value;
}

function setTime(time) {
    ELEMENTS.timeText.value = time;
}

function setFramerate(framerate) {
    ELEMENTS.framerateInput.value = framerate;
}

function sendMessage(messageToSend, extraData = undefined) {
    return new Promise((resolve, reject) => {
        browser.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                var activeTab = tabs[0];
                var activeTabId = activeTab.id;

                try {
                    browser.tabs.sendMessage(
                        activeTabId,
                        { message: messageToSend, extraData: extraData },
                        function (response) {
                            resolve(response); // Resolve the promise with the response
                        }
                    );
                } catch (error) {
                    reject(error); // Reject the promise in case of an error
                }
            }
        );
    });
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

    let framerate = ELEMENTS.framerateInput.value;
    try {
        framerate = checkFramerate(framerate);
    } catch (error) {
        framerate = 60;
    }

    let totalTime = calculateTotalSumOfSegments().toString();
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

    setFramerate("");
    setTime("0.0");

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

    resetSegment(firstSegmentNode);

    changeSelectedSection(firstSegmentNode);
}

function getSelectedSegmentNodeAndIndex() {
    let segmentsNodes = getAllSegmentsNodes();

    let selectedSegment = {
        segmentNode: undefined,
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
                segmentNode: segmentNode,
                index: i,
            };
            break;
        }
    }

    return selectedSegment;
}

function loadSavedDataFromLocalStorage() {
    browser.storage.local.get(["timeData"], function (result) {
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
    let selectedIndex = timeData.selectedIndex;

    setTime(actualTimeLoaded);

    setFramerate(
        framerateLoaded == undefined || framerateLoaded == null
            ? ""
            : framerateLoaded
    );

    segmentsLoaded.forEach((segmentLoaded, index) => {
        let segmentNode = ELEMENTS.segmentsContainer.childNodes[index];

        if (segmentNode == undefined) {
            addSegmentNode();

            segmentNode = ELEMENTS.segmentsContainer.childNodes[index];
        }

        segmentNode.segment = new Segment(
            segmentLoaded.startTime,
            segmentLoaded.endTime
        );

        if (
            segmentNode.segment.endTime != null &&
            segmentNode.segment.startTime != null
        ) {
            setValue(segmentNode, segmentNode.segment.toString());
        }
    });

    changeSelectedSection(ELEMENTS.segmentsContainer.childNodes[selectedIndex]);

    ELEMENTS.calculatedTimeText.segment = new Segment(
        calculatedSegmentLoaded.startTime,
        calculatedSegmentLoaded.endTime
    );
    setCalculatedTime(timeData.calculatedTime);
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
    debugger    
    let newSegmentNode = createSegmentNode();

    ELEMENTS.segmentsContainer.appendChild(newSegmentNode);

    changeSelectedSection(newSegmentNode);
}

function createSegmentNode() {
    let segmentNode = ELEMENTS.segmentsContainer.childNodes[0].cloneNode(true);

    segmentNode.querySelector("#remove-segment-btn").onclick = () => {
        removeSegmentNode(segmentNode);
    };

    segmentNode.querySelector("#reset-btn").onclick = () => {
        resetSegmentBtnFunc(segmentNode.querySelector("#reset-btn"));
    };

    segmentNode.querySelector("#remove-segment-btn").style.visibility =
        "visible";

    segmentNode.querySelector("#time-segment-btn").onclick = () => {
        changeSelectedSectionEvent(segmentNode);
    };

    resetSegment(segmentNode);

    return segmentNode;
}

// Segment Node Functions

function resetSegment(segmentNode) {
    segmentNode.segment = undefined;
    segmentNode.querySelector("#segment-value").textContent = DEFAULT_TIME;
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

function setValue(segmentNode, value) {
    segmentNode.querySelector("#segment-value").textContent = value;
}

function resetSegmentBtnFunc(resetBtn) {
    resetSegment(resetBtn.parentNode);
    saveDataToLocalStorage();
}

async function removeSegmentNode(segmentNode) {
    console.log(segmentNode);
    if (segmentNode.segment == undefined) {
        if (isSelected(segmentNode)) {
            changeSelectedSection(segmentNode.previousSibling);
        }
        segmentNode.remove();
        
        return;
    }
    if (
        segmentNode.segment.startTime != null ||
        segmentNode.segment.endTime != null
    ) {
        let accepted = await openWarningModal(WARNING_MESSAGES.deleteSegment);

        if (!accepted) return;
    }
    if (isSelected(segmentNode)) {
        changeSelectedSection(segmentNode.previousSibling);
    }

    segmentNode.remove();

    saveDataToLocalStorage();
}

function saveDataToLocalStorage() {
    browser.storage.local.set({ timeData: createSaveJSON() });
}

// JSON Functions

function getSegmentsJSON() {
    let segmentsNodes = getAllSegmentsNodes();

    let segments = [];

    segmentsNodes.forEach((segmentNode) => {
        let segment = segmentNode.segment;

        if (segment == undefined) {
            segment = new Segment(null);
        }

        segments.push(segment);
    });

    return segments;
}

function createSaveJSON() {
    let segments = getSegmentsJSON();
    let framerate = ELEMENTS.framerateInput.value;

    try {
        checkFramerate(framerate);
    } catch (error) {
        framerate = "";
    }

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
    let calculatedTime = calculateTotalSumOfSegments().toString();

    navigator.clipboard.writeText(calculatedTime).then(() => {
        setNotificationMessage(
            NOTIFICATION_MESSAGES.copied,
            NOTIFICATION_COLORS.success,
            false
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

BUTTONS.getExactTimeBtn.addEventListener("click", async () => {
    removeWarning();
    let response = await sendMessage(SEND_MESSAGES.getExactTime);
    let fps = getFramerate();
    fps = checkFramerate(fps);
    let time = Math.floor(response.time * fps) / fps;
    setTime(time);
    saveDataToLocalStorage();
});

BUTTONS.sendToSRCBtn.addEventListener("click", () => {
    removeWarning();

    sendMessage(SEND_MESSAGES.sendToSRC, getCalculatedTimeObject());
    saveDataToLocalStorage();
});

BUTTONS.setStartTimeBtn.addEventListener("click", async () => {
    removeWarning();

    let time = getTime();
    let framerate = getFramerate();

    checkTime(time);
    checkFramerate(framerate);

    let selectedSegmentNode = getSelectedSegmentNodeAndIndex().segmentNode;

    let segment = selectedSegmentNode.segment;

    let isSameTime = segment != undefined && segment.startTime == time;

    if (segment == undefined || segment.startTime == null) {
        segment = new Segment(0);
    } else {
        if (isSameTime) return;

        let accepted = await openWarningModal(
            WARNING_MESSAGES.overwritingStartTime
        );

        if (!accepted) return;
    }

    let hasEndTime = segment.endTime != null;

    segment.startTime = time;
    selectedSegmentNode.segment = segment;

    setNotificationMessage(
        NOTIFICATION_MESSAGES.startTimeSaved,
        NOTIFICATION_COLORS.visualOutput,
        false
    );

    if (hasEndTime) {
        setValue(selectedSegmentNode, segment.toString());
    }

    saveDataToLocalStorage();
});

BUTTONS.setEndTimeBtn.addEventListener("click", async () => {
    let time = getTime();
    let framerate = getFramerate();

    checkTime(time);
    checkFramerate(framerate);


    let selectedSegmentNode = getSelectedSegmentNodeAndIndex().segmentNode;

    let segment = selectedSegmentNode.segment;

    let isSameTime = segment != undefined && segment.endTime == time;

    let isSameTimeAsStartTime =
        parseFloat(segment.startTime) == parseFloat(segment.endTime);

    if (
        segment == undefined ||
        segment.endTime == null ||
        isSameTimeAsStartTime
    ) {
        segment.endTime = time;
    } else {
        if (isSameTime) return;

        let accepted = await openWarningModal(
            WARNING_MESSAGES.overwritingEndTime
        );

        if (!accepted) return;
    }

    let hasStartTime = segment.startTime != null;

    segment.endTime = time;
    selectedSegmentNode.segment = segment;

    setNotificationMessage(
        NOTIFICATION_MESSAGES.endTimeSaved,
        NOTIFICATION_COLORS.visualOutput,
        false
    );

    if (hasStartTime) {
        setValue(selectedSegmentNode, segment.toString());
    }

    console.log(segment);

    saveDataToLocalStorage();
});

BUTTONS.changeSRCTimeInputBtn.addEventListener("click", () => {
    removeWarning();
    sendMessage(SEND_MESSAGES.changeSelectedInput);
    saveDataToLocalStorage();
});

BUTTONS.firstTimeInput.addEventListener("click", () => {
    changeSelectedSectionEvent(ELEMENTS.segmentsContainer.childNodes[0]);
});

function changeSelectedSectionEvent(segmentNode) {
    removeWarning();
    changeSelectedSection(segmentNode);
    saveDataToLocalStorage();
}

BUTTONS.setFramerateTo60Btn.addEventListener("click", () => {
    removeWarning();
    setFramerate(60);
    saveDataToLocalStorage();
});

BUTTONS.setFramerateTo30Btn.addEventListener("click", () => {
    removeWarning();
    setFramerate(30);
    saveDataToLocalStorage();
});

BUTTONS.copyModNoteBtn.addEventListener("click", () => {
    removeWarning();
    let modNote = generateModNote();

    navigator.clipboard.writeText(modNote).then(() => {
        setNotificationMessage(
            NOTIFICATION_MESSAGES.copied,
            NOTIFICATION_COLORS.success,
            false
        );
    });

    saveDataToLocalStorage();
});

ELEMENTS.lock.addEventListener("click", () => {
    ELEMENTS.warningModal.querySelector("#warning-no-btn").click();
});

ELEMENTS.segmentsContainer.childNodes[0].setAttribute("checked", true);
