let browserAction = new ScriptsComunicator();
let browserController = BrowserFactory.getBrowser();

window.onload = async () => {
    let response = await browserController.getFromStorage("data")

    restoreData(response.data)

    browserAction.sendOpenedExtensionMessage()
}


document.addEventListener("change", saveOnChange);
document.addEventListener("click", (e)=>{
    saveOnChange(e);

    NotificationManager.removeNotification();
});
document.addEventListener("input", saveOnChange);


BUTTONS.copyModNoteBtn.addEventListener('click', async (e) => {
    let text = generateModNote();
    navigator.clipboard.writeText(text).then(() => {
        NotificationManager.setSuccessNotification("Copied to clipboard!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error copying to clipboard!")
    });
});

BUTTONS.copyBtn.addEventListener('click', async (e) => {
    let text = ELEMENTS.calculatedTimeText.value;
    navigator.clipboard.writeText(text).then(() => {
        NotificationManager.setSuccessNotification("Copied to clipboard!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error copying to clipboard!")
    });

})

BUTTONS.calculateBtn.addEventListener('click', async (e) => {
    let totalTime = segmentList.getTotalTime();

    let time = Time.fromSeconds(totalTime, getFramerate());

    ELEMENTS.calculatedTimeText.value = time.toString();
});

BUTTONS.sendToSRCBtn.addEventListener('click', async (e) => {
    let time = Time.fromSeconds(parseFloat(ELEMENTS.videoTimeInput.value), getFramerate());
    browserAction.setTimeToSRC(time).then(() => {
        NotificationManager.setSuccessNotification("Time set!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error when comunicating with SRC!")
    });
})

BUTTONS.resetAllBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (await NotificationManager.showWarningModal("Are you sure you want to reset all data?")) {
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
    NotificationManager.setInfoNotification("Start time set!");
})

BUTTONS.setEndTimeBtn.addEventListener('click', async (e) => {
    segmentList.setSelectedSegmentEndTime(parseFloat(ELEMENTS.videoTimeInput.value));
    NotificationManager.setInfoNotification("End time set!");
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
        NotificationManager.setSuccessNotification("Got time from video player!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error communicating with the video player!")
    });
});

BUTTONS.changeSRCTimeInputBtn.addEventListener('click', async (e) => {
    browserAction.changeSelectedInput().then(() => {
        NotificationManager.setSuccessNotification("Changed input!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error when comunicating with SRC!")
    });
});