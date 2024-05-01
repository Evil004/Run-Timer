let browserAction = new ScriptsComunicator();


window.onload = async () => {
    browserAction.sendOpenedExtensionMessage()
}

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