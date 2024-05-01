const DEFAULT_FRAMERATE = 60;
const MANIFEST = chrome.runtime.getManifest();
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

const ELEMENTS: {
    framerateInput: HTMLInputElement;
    videoTimeInput: HTMLInputElement;
    errorMessage: HTMLSpanElement;
    segmentsContainer: HTMLDivElement;
    calculatedTimeText: HTMLInputElement;
    warningModal: HTMLDivElement;
    lock: HTMLDivElement;
} = {
    framerateInput: document.querySelector("#framerate")!,
    videoTimeInput: document.querySelector("#time-text")!,
    errorMessage: document.querySelector("#notification-message")!,
    segmentsContainer: document.querySelector("#segments-container")!,
    calculatedTimeText: document.querySelector("#calculated-time")!,
    warningModal: document.querySelector("#warning")!,
    lock: document.querySelector("#lock")!,
};

const BUTTONS:{
    calculateBtn: HTMLButtonElement;
    copyBtn: HTMLButtonElement;
    addSegmentBtn: HTMLButtonElement;
    resetAllBtn: HTMLButtonElement;
    resetFirstSegmentBtn: HTMLButtonElement;
    firstTimeInput: HTMLInputElement;
    getExactTimeBtn: HTMLButtonElement;
    sendToSRCBtn: HTMLButtonElement;
    setStartTimeBtn: HTMLButtonElement;
    setEndTimeBtn: HTMLButtonElement;
    changeSRCTimeInputBtn: HTMLButtonElement;
    setFramerateTo60Btn: HTMLButtonElement;
    setFramerateTo30Btn: HTMLButtonElement;
    copyModNoteBtn: HTMLButtonElement;

} = {
    calculateBtn: document.querySelector("#calculate-btn")!,
    copyBtn: document.querySelector("#copy-btn")!,
    addSegmentBtn: document.querySelector("#add-segment-btn")!,
    resetAllBtn: document.querySelector("#reset-all-btn")!,
    resetFirstSegmentBtn: document.querySelector("#reset-btn")!,
    firstTimeInput: document.querySelector("#time-segment-btn")!,
    getExactTimeBtn: document.querySelector("#exact-time-btn")!,
    sendToSRCBtn: document.querySelector("#send-btn")!,
    setStartTimeBtn: document.querySelector("#start-time-btn")!,
    setEndTimeBtn: document.querySelector("#end-time-btn")!,
    changeSRCTimeInputBtn: document.querySelector("#change-input-btn")!,
    setFramerateTo60Btn: document.querySelector("#sixty-framerate-btn")!,
    setFramerateTo30Btn: document.querySelector("#thirty-framerate-btn")!,
    copyModNoteBtn: document.querySelector("#copy-mod-note-btn")!,
};



