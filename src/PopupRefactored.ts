// @ts-ignore
function getFramerate() {
    let framerate = DEFAULT_FRAMERATE;

    if (ELEMENTS.framerateInput.value != "") {
        framerate = parseFloat(ELEMENTS.framerateInput.value);
    }

    if (framerate <= 0) {
        throw new Error(NOTIFICATION_MESSAGES.framerateUnderOrEqual0);
    }
    if (isNaN(framerate)) {
        throw new Error(NOTIFICATION_MESSAGES.framerateIsNaN);
    }

    return framerate;
}

// @ts-ignore
function getVideoTime() {
    let time = parseFloat(ELEMENTS.videoTimeInput.value);
    return isNaN(time) ? 0 : time;
}

function collectDataToSave() {
    let data = {
        segmentList: segmentList.segments.map((segmentElement) => {
            let segment = segmentElement.segment
            return {
                startTime: segment.startTime,
                endTime: segment.endTime,
            }
        }),
        selectedIndex: segmentList.getSelectedSegmentIndex(),
        framerate: parseFloat(ELEMENTS.framerateInput.value),
        videoTime: getVideoTime(),
        calculatedTime: ELEMENTS.calculatedTimeText.value
    }
    return data
}

function saveOnChange(e: Event) {
    let data = collectDataToSave();

    browserController.setToStorage("data", data);
}

function restoreData(data: any) {
    if (data) {
        if (data.segmentList.length == 0) {
            segmentList.generateDefaultSegment();
        } else {
            segmentList.clearSegments();
        }

        data.segmentList.forEach((segment: any) => {
            let segmentElement = HTMLSegmentFactory.createSegmentElement(new Segment(segment.startTime, segment.endTime));
            segmentList.addSegment(segmentElement);

        });

        segmentList.setSegmentAsSelected(data.selectedIndex);

        ELEMENTS.framerateInput.value = isNaN(data.framerate) ? "" : data.framerate;
        ELEMENTS.videoTimeInput.value = data.videoTime == 0 ? "0.0" : data.videoTime;
        ELEMENTS.calculatedTimeText.value = data.calculatedTime?.toString() ?? DEFAULT_TIME;
    }
}

function generateModNote() {
        let totalTime = Time.fromSeconds(segmentList.getTotalTime(),getFramerate());
        let segmentsNote = segmentList.segments.map((segment) => {
            return `${segment.segment.getCalculatedTime().toString()}`
        }).join(" + ");


    return `Mod Message: The sections ${segmentsNote}, at fps ${getFramerate()} add up to a final time of ${totalTime.toString()}`;
}