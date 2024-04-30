var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// General Functions
function getFramerate() {
    var framerate = Number(ELEMENTS.framerateInput.value);
    try {
        framerate = isFramerateValid(framerate) ? framerate : DEFAULT_FRAMERATE;
    }
    catch (error) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateIsNaN);
        framerate = DEFAULT_FRAMERATE;
    }
    return framerate;
}
function isFramerateValid(framerate) {
    if (isNaN(framerate)) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateIsNaN);
    }
    if (framerate <= 0) {
        setNotificationMessage(NOTIFICATION_MESSAGES.framerateUnderOrEqual0);
    }
    return true;
}
function isTimeValid(time) {
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
function setNotificationMessage(message, color, throwException) {
    if (color === void 0) { color = NOTIFICATION_COLORS.error; }
    if (throwException === void 0) { throwException = true; }
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
    var segmentsNodes = getAllSegmentsNodes();
    segmentsNodes.forEach(function (segmentNode) {
        unselectSegment(segmentNode);
    });
    selectSegment(segmentNode);
    saveDataToLocalStorage();
}
function isSelected(segmentNode) {
    return (segmentNode
        .querySelector("#time-segment-btn")
        .getAttribute("checked") == "true");
}
function getAllSegmentsNodes() {
    var segmentsNodes = ELEMENTS.segmentsContainer.querySelectorAll(".segment");
    return segmentsNodes;
}
function getVideoTime() {
    return parseFloat(ELEMENTS.videoTimeInput.value);
}
function setTime(time) {
    ELEMENTS.videoTimeInput.value = time;
}
function setFramerate(framerate) {
    ELEMENTS.framerateInput.value = framerate;
}
function sendMessage(messageToSend, extraData) {
    if (extraData === void 0) { extraData = undefined; }
    return new Promise(function (resolve, reject) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;
            try {
                chrome.tabs.sendMessage(activeTabId, { message: messageToSend, extraData: extraData }, function (response) {
                    resolve(response); // Resolve the promise with the response
                });
            }
            catch (error) {
                reject(error); // Reject the promise in case of an error
            }
        });
    });
}
// Functions
function calculateTotalSumOfSegments() {
    var segmentsNodes = getAllSegmentsNodes();
    var totalSum = 0;
    segmentsNodes.forEach(function (segmentNode) {
        var segment = segmentNode.segment;
        if (segment != undefined) {
            totalSum += segment.getFrames();
        }
    });
    return new Segment(0, totalSum);
}
function generateModNote() {
    var segmentsTimes = getSegmentsTimeSeparatedBy("+");
    var framerate = ELEMENTS.framerateInput.value;
    try {
        framerate = isFramerateValid(framerate);
    }
    catch (error) {
        framerate = 60;
    }
    var totalTime = calculateTotalSumOfSegments().toString();
    var extensionName = MANIFEST.name;
    var repoLink = MANIFEST.homepage_url;
    var modNote = "Mod Message: The sections, \"".concat(segmentsTimes, " at ").concat(framerate, " fps\" add up") +
        "to a final time of \"".concat(totalTime, "\" Retimed using the ").concat(extensionName, " (").concat(repoLink, ")");
    return modNote;
}
function getSegmentsTimeSeparatedBy(separator) {
    var segmentsTimeString = "";
    var segmentsNodes = ELEMENTS.segmentsContainer.childNodes;
    segmentsNodes.forEach(function (segmentNode, index) {
        var segment = segmentNode.segment;
        var isLastSegment = index == segmentsNodes.length - 1;
        segmentsTimeString +=
            segment == undefined ? DEFAULT_TIME : segment.toString();
        if (!isLastSegment) {
            segmentsTimeString += " ".concat(separator, " ");
        }
    });
    return segmentsTimeString;
}
function resetAll() {
    return __awaiter(this, void 0, void 0, function () {
        var accepted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, openWarningModal((message = WARNING_MESSAGES.resetAll))];
                case 1:
                    accepted = _a.sent();
                    if (!accepted)
                        return [2 /*return*/];
                    setFramerate("");
                    setTime("0.0");
                    resetNodes();
                    ELEMENTS.calculatedTimeText.textContent = DEFAULT_TIME;
                    ELEMENTS.calculatedTimeText.segment = new Segment(0);
                    saveDataToLocalStorage();
                    return [2 /*return*/];
            }
        });
    });
}
function resetNodes() {
    var segmentsNodes = getAllSegmentsNodes();
    segmentsNodes.forEach(function (segment, index) {
        if (index != 0) {
            segment.remove();
        }
    });
    var firstSegmentNode = segmentsNodes[0];
    resetSegment(firstSegmentNode);
    changeSelectedSection(firstSegmentNode);
}
function getSelectedSegmentNodeAndIndex() {
    var segmentsNodes = getAllSegmentsNodes();
    var selectedSegment = {
        segmentNode: undefined,
        index: undefined,
    };
    for (var i = 0; i < segmentsNodes.length; i++) {
        var segmentNode = segmentsNodes[i];
        var isSelected_1 = segmentNode
            .querySelector("#time-segment-btn")
            .getAttribute("checked") == "true";
        if (isSelected_1) {
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
        var timeData = result.timeData;
        if (timeData == undefined) {
            return;
        }
        setData(timeData);
    });
}
function setData(timeData) {
    var segmentsLoaded = timeData.segments;
    var framerateLoaded = timeData.framerate;
    var actualTimeLoaded = timeData.textTime;
    var calculatedSegmentLoaded = timeData.calculatedTime;
    var selectedIndex = timeData.selectedIndex;
    setTime(actualTimeLoaded);
    setFramerate(framerateLoaded == undefined || framerateLoaded == null
        ? ""
        : framerateLoaded);
    segmentsLoaded.forEach(function (segmentLoaded, index) {
        var segmentNode = ELEMENTS.segmentsContainer.childNodes[index];
        if (segmentNode == undefined) {
            addSegmentNode();
            segmentNode = ELEMENTS.segmentsContainer.childNodes[index];
        }
        segmentNode.segment = new Segment(segmentLoaded.startTime, segmentLoaded.endTime);
        if (segmentNode.segment.endTime != null &&
            segmentNode.segment.startTime != null) {
            setValue(segmentNode, segmentNode.segment.toString());
        }
    });
    changeSelectedSection(ELEMENTS.segmentsContainer.childNodes[selectedIndex]);
    ELEMENTS.calculatedTimeText.segment = new Segment(calculatedSegmentLoaded.startTime, calculatedSegmentLoaded.endTime);
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
    return new Promise(function (resolve, reject) {
        ELEMENTS.warningModal.querySelector("#warning-yes-btn").onclick =
            function () {
                resolve(true);
                ELEMENTS.warningModal.style.visibility = "hidden";
                ELEMENTS.lock.style.visibility = "hidden";
            };
        ELEMENTS.warningModal.querySelector("#warning-no-btn").onclick = function () {
            resolve(false);
            ELEMENTS.warningModal.style.visibility = "hidden";
            ELEMENTS.lock.style.visibility = "hidden";
        };
    });
}
function addSegmentNode() {
    var newSegmentNode = createSegmentNode();
    ELEMENTS.segmentsContainer.appendChild(newSegmentNode);
    changeSelectedSection(newSegmentNode);
}
function createSegmentNode() {
    var segmentNode = ELEMENTS.segmentsContainer.childNodes[0].cloneNode(true);
    segmentNode.querySelector("#remove-segment-btn").onclick = function () {
        removeSegmentNode(segmentNode);
    };
    segmentNode.querySelector("#reset-btn").onclick = function () {
        resetSegmentBtnFunc(segmentNode.querySelector("#reset-btn"));
    };
    segmentNode.querySelector("#remove-segment-btn").style.visibility =
        "visible";
    segmentNode.querySelector("#time-segment-btn").onclick = function () {
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
function removeSegmentNode(segmentNode) {
    return __awaiter(this, void 0, void 0, function () {
        var accepted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (segmentNode.segment == undefined) {
                        if (isSelected(segmentNode)) {
                            changeSelectedSection(segmentNode.previousSibling);
                        }
                        segmentNode.remove();
                        return [2 /*return*/];
                    }
                    if (!(segmentNode.segment.startTime != null ||
                        segmentNode.segment.endTime != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, openWarningModal(WARNING_MESSAGES.deleteSegment)];
                case 1:
                    accepted = _a.sent();
                    if (!accepted)
                        return [2 /*return*/];
                    _a.label = 2;
                case 2:
                    if (isSelected(segmentNode)) {
                        changeSelectedSection(segmentNode.previousSibling);
                    }
                    segmentNode.remove();
                    saveDataToLocalStorage();
                    return [2 /*return*/];
            }
        });
    });
}
function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: createSaveJSON() });
}
// JSON Functions
function getSegmentsJSON() {
    var segmentsNodes = getAllSegmentsNodes();
    var segments = [];
    segmentsNodes.forEach(function (segmentNode) {
        var segment = segmentNode.segment;
        if (segment == undefined) {
            segment = new Segment(null);
        }
        segments.push(segment);
    });
    return segments;
}
function createSaveJSON() {
    var segments = getSegmentsJSON();
    var framerate = ELEMENTS.framerateInput.value;
    try {
        isFramerateValid(framerate);
    }
    catch (error) {
        framerate = "";
    }
    var textTime = getVideoTime();
    var calculatedTime = getCalculatedTime();
    var selectedIndex = getSelectedSegmentNodeAndIndex().index;
    var timeData = {
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
BUTTONS.calculateBtn.addEventListener("click", function () {
    var totalSum = calculateTotalSumOfSegments();
    var stringTime = totalSum.toString();
    setCalculatedTime(stringTime);
    saveDataToLocalStorage();
});
BUTTONS.copyBtn.addEventListener("click", function () {
    removeWarning();
    var calculatedTime = calculateTotalSumOfSegments().toString();
    navigator.clipboard.writeText(calculatedTime).then(function () {
        setNotificationMessage(NOTIFICATION_MESSAGES.copied, NOTIFICATION_COLORS.success, false);
    });
    saveDataToLocalStorage();
});
BUTTONS.addSegmentBtn.addEventListener("click", function () {
    removeWarning();
    addSegmentNode();
    saveDataToLocalStorage();
});
BUTTONS.resetAllBtn.addEventListener("click", function () {
    removeWarning();
    resetAll();
    saveDataToLocalStorage();
});
BUTTONS.resetFirstSegmentBtn.addEventListener("click", function () {
    removeWarning();
    var firstSegmentNode = ELEMENTS.segmentsContainer.childNodes[0];
    resetSegmentBtnFunc(firstSegmentNode.querySelector("#reset-btn"));
    saveDataToLocalStorage();
});
BUTTONS.getExactTimeBtn.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var response, fps, time;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                removeWarning();
                return [4 /*yield*/, sendMessage(SEND_MESSAGES.getExactTime)];
            case 1:
                response = _a.sent();
                fps = getFramerate();
                fps = isFramerateValid(fps);
                time = Math.floor(response.time * fps) / fps;
                setTime(time);
                saveDataToLocalStorage();
                return [2 /*return*/];
        }
    });
}); });
BUTTONS.sendToSRCBtn.addEventListener("click", function () {
    removeWarning();
    var time = calculateTotalSumOfSegments().toString();
    var timeObject = calculateTotalSumOfSegments().getCalculatedTime();
    sendMessage(SEND_MESSAGES.setTime, timeObject);
    saveDataToLocalStorage();
});
BUTTONS.setStartTimeBtn.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var time, framerate, selectedSegmentNode, segment, isSameTime, accepted, hasEndTime;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                removeWarning();
                time = getVideoTime();
                framerate = getFramerate();
                isTimeValid(time);
                isFramerateValid(framerate);
                selectedSegmentNode = getSelectedSegmentNodeAndIndex().segmentNode;
                segment = selectedSegmentNode.segment;
                isSameTime = segment != undefined && segment.startTime == time;
                if (!(segment == undefined || segment.startTime == null)) return [3 /*break*/, 1];
                segment = new Segment(0);
                return [3 /*break*/, 3];
            case 1:
                if (isSameTime)
                    return [2 /*return*/];
                return [4 /*yield*/, openWarningModal(WARNING_MESSAGES.overwritingStartTime)];
            case 2:
                accepted = _a.sent();
                if (!accepted)
                    return [2 /*return*/];
                _a.label = 3;
            case 3:
                hasEndTime = segment.endTime != null;
                segment.startTime = time;
                selectedSegmentNode.segment = segment;
                setNotificationMessage(NOTIFICATION_MESSAGES.startTimeSaved, NOTIFICATION_COLORS.visualOutput, false);
                if (hasEndTime) {
                    setValue(selectedSegmentNode, segment.toString());
                }
                saveDataToLocalStorage();
                return [2 /*return*/];
        }
    });
}); });
BUTTONS.setEndTimeBtn.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var time, framerate, selectedSegmentNode, segment, isSameTime, isSameTimeAsStartTime, accepted, hasStartTime;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                time = getVideoTime();
                framerate = getFramerate();
                isTimeValid(time);
                isFramerateValid(framerate);
                debugger;
                selectedSegmentNode = getSelectedSegmentNodeAndIndex().segmentNode;
                segment = selectedSegmentNode.segment;
                isSameTime = segment != undefined && segment.endTime == time;
                isSameTimeAsStartTime = parseFloat(segment.startTime) == parseFloat(segment.endTime);
                if (!(segment == undefined ||
                    segment.endTime == null ||
                    isSameTimeAsStartTime)) return [3 /*break*/, 1];
                segment.endTime = time;
                return [3 /*break*/, 3];
            case 1:
                if (isSameTime)
                    return [2 /*return*/];
                return [4 /*yield*/, openWarningModal(WARNING_MESSAGES.overwritingEndTime)];
            case 2:
                accepted = _a.sent();
                if (!accepted)
                    return [2 /*return*/];
                _a.label = 3;
            case 3:
                hasStartTime = segment.startTime != null;
                segment.endTime = time;
                selectedSegmentNode.segment = segment;
                setNotificationMessage(NOTIFICATION_MESSAGES.endTimeSaved, NOTIFICATION_COLORS.visualOutput, false);
                if (hasStartTime) {
                    setValue(selectedSegmentNode, segment.toString());
                }
                saveDataToLocalStorage();
                return [2 /*return*/];
        }
    });
}); });
BUTTONS.changeSRCTimeInputBtn.addEventListener("click", function () {
    removeWarning();
    sendMessage(SEND_MESSAGES.changeSelectedInput);
    saveDataToLocalStorage();
});
BUTTONS.firstTimeInput.addEventListener("click", function () {
    changeSelectedSectionEvent(ELEMENTS.segmentsContainer.childNodes[0]);
});
function changeSelectedSectionEvent(segmentNode) {
    removeWarning();
    changeSelectedSection(segmentNode);
    saveDataToLocalStorage();
}
BUTTONS.setFramerateTo60Btn.addEventListener("click", function () {
    removeWarning();
    setFramerate(60);
    saveDataToLocalStorage();
});
BUTTONS.setFramerateTo30Btn.addEventListener("click", function () {
    removeWarning();
    setFramerate(30);
    saveDataToLocalStorage();
});
BUTTONS.copyModNoteBtn.addEventListener("click", function () {
    removeWarning();
    var modNote = generateModNote();
    navigator.clipboard.writeText(modNote).then(function () {
        setNotificationMessage(NOTIFICATION_MESSAGES.copied, NOTIFICATION_COLORS.success, false);
    });
    saveDataToLocalStorage();
});
ELEMENTS.lock.addEventListener("click", function () {
    ELEMENTS.warningModal.querySelector("#warning-no-btn").click();
});
ELEMENTS.segmentsContainer.childNodes[0].setAttribute("checked", true);
