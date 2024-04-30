
// General Functions
function getFramerate(): number {
    let framerate = Number(ELEMENTS.framerateInput.value);
    try {
        framerate = isFramerateValid(framerate) ? framerate : DEFAULT_FRAMERATE;
    } catch (error) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateIsNaN);
        framerate = DEFAULT_FRAMERATE;
    }

    return framerate;
}

function isFramerateValid(framerate: number): boolean {
    if (isNaN(framerate)) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateIsNaN);
    }

    if (framerate <= 0) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateUnderOrEqual0);
    }

    return true;
}

function isTimeValid(time: number): boolean {
    if (isNaN(time)) {
        setNotificationMessage(NOTIFICATION_MESSAGES.timeIsNaN);
        return false;
    }

    if (time < 0) {
        setNotificationMessage(NOTIFICATION_MESSAGES.timeUnder0);
        return false;
    }

    return true;
}

function setNotificationMessage(
    message: string,
    color = NOTIFICATION_COLORS.error,
    throwException = true
) {
    ELEMENTS.errorMessage.textContent = message;
    ELEMENTS.errorMessage.style.color = color;
    if (throwException) {
        throw new Error(message);
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

function getVideoTime(): number {
    return parseFloat(ELEMENTS.videoTimeInput.value);
}

function setTime(time) {
    ELEMENTS.videoTimeInput.value = time;
}

function setFramerate(framerate) {
    ELEMENTS.framerateInput.value = framerate;
}

function sendMessage(messageToSend, extraData = undefined) {
    return new Promise((resolve, reject) => {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                var activeTab = tabs[0];
                var activeTabId = activeTab.id;

                try {
                    chrome.tabs.sendMessage(
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
        framerate = isFramerateValid(framerate);
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
    chrome.storage.local.set({ timeData: createSaveJSON() });
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
        isFramerateValid(framerate);
    } catch (error) {
        framerate = "";
    }

    let textTime = getVideoTime();
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
    fps = isFramerateValid(fps);
    let time = Math.floor(response.time * fps) / fps;
    setTime(time);
    saveDataToLocalStorage();
});

BUTTONS.sendToSRCBtn.addEventListener("click", () => {
    removeWarning();

    let time = calculateTotalSumOfSegments().toString();
    let timeObject = calculateTotalSumOfSegments().getCalculatedTime();

    sendMessage(SEND_MESSAGES.setTime, timeObject);
    saveDataToLocalStorage();
});

BUTTONS.setStartTimeBtn.addEventListener("click", async () => {
    removeWarning();

    let time = getVideoTime();
    let framerate = getFramerate();

    isTimeValid(time);
    isFramerateValid(framerate);

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
    let time = getVideoTime();
    let framerate = getFramerate();

    isTimeValid(time);
    isFramerateValid(framerate);
    debugger;

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
