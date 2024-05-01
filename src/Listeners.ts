let browserAction = new ScriptsComunicator();
let browserController = BrowserFactory.getBrowser();

window.onload = async () => {
    let response = await browserController.getFromStorage("data")

    restoreData(response.data)

    browserAction.sendOpenedExtensionMessage()
}

document.addEventListener("change", saveOnChange);
document.addEventListener("click", saveOnChange);
document.addEventListener("input", saveOnChange);


BUTTONS.copyModNoteBtn.addEventListener('click', async (e) => {
    let text = generateModNote();
    navigator.clipboard.writeText(text);
});

BUTTONS.copyBtn.addEventListener('click', async (e) => {
    let text = ELEMENTS.calculatedTimeText.value;
    navigator.clipboard.writeText(text);

})

BUTTONS.calculateBtn.addEventListener('click', async (e) => {
    let totalTime = segmentList.getTotalTime();

    let time = Time.fromSeconds(totalTime, getFramerate());

    ELEMENTS.calculatedTimeText.value = time.toString();
});

BUTTONS.sendToSRCBtn.addEventListener('click', async (e) => {
let time = Time.fromSeconds(parseFloat(ELEMENTS.videoTimeInput.value), getFramerate());
    browserAction.setTimeToSRC(time);
})

BUTTONS.resetAllBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to reset all?")) {
        ELEMENTS.framerateInput.value = "";
        ELEMENTS.videoTimeInput.value = "0.0";
        segmentList.clearSegments();
        segmentList.generateDefaultSegment();
        ELEMENTS.calculatedTimeText.value = DEFAULT_TIME;

        browserController.removeFromStorage("data");
    }
});

BUTTONS.addSegmentBtn.addEventListener('click', async (e) => {
    segmentList.addSegment(HTMLSegmentFactory.createSegmentElement(new Segment(0)));
});

BUTTONS.setStartTimeBtn.addEventListener('click', async (e) => {
    segmentList.setSelectedSegmentStartTime(parseFloat(ELEMENTS.videoTimeInput.value));
})

BUTTONS.setEndTimeBtn.addEventListener('click', async (e) => {
    segmentList.setSelectedSegmentEndTime(parseFloat(ELEMENTS.videoTimeInput.value));
})

BUTTONS.setFramerateTo30Btn.addEventListener('click', async (e) => {
    ELEMENTS.framerateInput.value = "30";
});

BUTTONS.setFramerateTo60Btn.addEventListener('click', async (e) => {
    ELEMENTS.framerateInput.value = "60";
});

BUTTONS.getExactTimeBtn.addEventListener('click', async (e) => {
    browserAction.getVideoSeconds().then((time) => {
        ELEMENTS.videoTimeInput.value = time.toString();
    });
});

BUTTONS.changeSRCTimeInputBtn.addEventListener('click', async (e) => {
    browserAction.changeSelectedInput();
});