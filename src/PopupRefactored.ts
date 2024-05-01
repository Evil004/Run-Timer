// @ts-ignore
function getFramerate() {
    let framerate = parseFloat(ELEMENTS.framerateInput.value);
    return isNaN(framerate) ? DEFAULT_FRAMERATE : framerate;
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
                selected: segmentElement.selected
            }
        }),
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
            segmentElement.selected = segment.selected;
            segmentList.addSegment(segmentElement);

        });

        ELEMENTS.framerateInput.value = isNaN(data.framerate) ? "" : data.framerate;
        ELEMENTS.videoTimeInput.value = data.videoTime == 0 ? "0.0" : data.videoTime;
        ELEMENTS.calculatedTimeText.value = data.calculatedTime?.toString() ?? DEFAULT_TIME;
    }
}

function generateModNote() {
    let totalTime = segmentList.getTotalTime();
    let segmentsNote = segmentList.segments.map((segment) => {
        return `${segment.segment.getCalculatedTime().toString()}`
    }).join(" + ");

    let modNote = `Mod Message: The sections ${segmentsNote}, at fps ${getFramerate()} add up to a final time of ${totalTime.toString()}`

    return modNote;
}
