let browserAction = new ScriptsComunicator();
let browserController = BrowserFactory.getBrowser();

window.onload = async () => {
    let response = await browserController.getFromStorage("data")

    restoreData(response.data)

    browserAction.sendOpenedExtensionMessage()
}


document.addEventListener("change", saveOnChange);
document.addEventListener("click", (e) => {
    saveOnChange(e);

    NotificationManager.removeNotification();
});
document.addEventListener("input", saveOnChange);


BUTTONS.copyModNoteBtn.addEventListener('click', async (e) => {
    try {
        let text = generateModNote();
        navigator.clipboard.writeText(text).then(() => {
            NotificationManager.setSuccessNotification("Copied to clipboard!")
        }).catch(() => {
            NotificationManager.setErrorNotification("Error copying to clipboard!")
        });
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }

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

    try {
        let time = Time.fromSeconds(totalTime, getFramerate());

        ELEMENTS.calculatedTimeText.value = time.toString();
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }
});

BUTTONS.sendToSRCBtn.addEventListener('click', async (e) => {
    try {
        let time = Time.fromSeconds(segmentList.getTotalTime(), getFramerate());
        debugger
        browserAction.setTimeToSRC(time).then(() => {
            NotificationManager.setSuccessNotification("Time set!")
        }).catch(() => {
            NotificationManager.setErrorNotification("Error when comunicating with SRC!")
        });
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }
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



    try {
        let time = parseFloat(ELEMENTS.videoTimeInput.value);
        if (segmentList.getSelectedSegment().segment.startTime  && segmentList.getSelectedSegment().segment.startTime != time) {
            if (!await NotificationManager.showWarningModal("Are you sure you want to overwrite the start time?")) {
                return;
            }
        }
        segmentList.setSelectedSegmentStartTime(time);
        NotificationManager.setInfoNotification("Start time set!");
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }
})

BUTTONS.setEndTimeBtn.addEventListener('click', async (e) => {

    try {
        let time = parseFloat(ELEMENTS.videoTimeInput.value);

        if (segmentList.getSelectedSegment().segment.endTime && segmentList.getSelectedSegment().segment.endTime != time) {
            if (!await NotificationManager.showWarningModal("Are you sure you want to overwrite the end time?")) {
                return;
            }
        }
        segmentList.setSelectedSegmentEndTime(time);

        NotificationManager.setInfoNotification("End time set!");
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);
    }
})

BUTTONS.setFramerateTo30Btn.addEventListener('click', async (e) => {
    ELEMENTS.framerateInput.value = "30";
});

BUTTONS.setFramerateTo60Btn.addEventListener('click', async (e) => {
    ELEMENTS.framerateInput.value = "60";
});

BUTTONS.getExactTimeBtn.addEventListener('click', async (e) => {
    try {
        debugger
        let fps = getFramerate();
        browserAction.getVideoSeconds().then((response) => {

            let time = Math.floor(response * fps) / fps;

            ELEMENTS.videoTimeInput.value = time.toString();
            NotificationManager.setSuccessNotification("Got time from video player!")

        }).catch((e) => {
            NotificationManager.setErrorNotification("Error communicating with the video player!")
        });
    } catch (e: any) {
        NotificationManager.setErrorNotification(e.message);

    }
});

BUTTONS.changeSRCTimeInputBtn.addEventListener('click', async (e) => {
    browserAction.changeSelectedInput().then(() => {
        NotificationManager.setSuccessNotification("Changed input!")
    }).catch(() => {
        NotificationManager.setErrorNotification("Error when comunicating with SRC!")
    });
});