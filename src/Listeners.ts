let browserAction = new ScriptsComunicator();
let browsera = BrowserFactory.getBrowser();

window.onload = async () => {
    let response = await browsera.getFromStorage("data")

    restoreData(response.data)

    browserAction.sendOpenedExtensionMessage()
}

document.addEventListener("change", saveOnChange);
document.addEventListener("click", saveOnChange);
document.addEventListener("input", saveOnChange);


BUTTONS.resetAllBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to reset all?")) {
        ELEMENTS.framerateInput.value = "";
        ELEMENTS.videoTimeInput.value = "0.0";
        segmentList.clearSegments();
        segmentList.generateDefaultSegment();


        browsera.removeFromStorage("data");
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