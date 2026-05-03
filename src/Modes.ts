

abstract class Mode {
    constructor(public name: string) { }

    async setStartTime() {
        try {
            let time = parseFloat(ELEMENTS.videoTimeInput.value);
            if (segmentList.getSelectedSegment().segment.startTime && segmentList.getSelectedSegment().segment.startTime != time) {
                if (!await NotificationManager.showWarningModal("Are you sure you want to overwrite the start time?")) {
                    return;
                }
            }
            segmentList.setSelectedSegmentStartTime(time);
            NotificationManager.setInfoNotification("Start time set!");
        } catch (e: any) {
            NotificationManager.setErrorNotification(e.message);
        }
    }

    async setEndTime() {
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
    }

    abstract getSegment(): Segment;
    abstract getStartingSegment(): Segment;

    abstract setStyle(): void;
    abstract removeStyle(): void;
}

class SubstractMode extends Mode {

    constructor() {
        super("Substract");
    }

    getSegment(): Segment {
        return new SubtractiveSegment();
    }
    getStartingSegment(): Segment {
        return new AdditiveSegment();
    }

    async setEndTime(): Promise<void> {
        let time = parseFloat(ELEMENTS.videoTimeInput.value);
        const initialSegment = segmentList.getInitialSegment();

        let selectedSegmentIndex = segmentList.getSelectedSegmentIndex();

        if (selectedSegmentIndex == 0) {
            if (initialSegment && initialSegment.startTime && initialSegment.startTime > time) {
                NotificationManager.setErrorNotification("Time can't be lower than the start of the run!");
                return;
            }

            const minStartTime = segmentList.segments.slice(1).filter(s => s.segment.startTime).reduce((min, segment) =>
                Math.min(min, segment.segment.startTime!), Infinity);
            const maxEndTime = segmentList.segments.slice(1).filter(s => s.segment.endTime).reduce((min, segment) =>
                Math.min(min, segment.segment.endTime!), Infinity);

            if (time > maxEndTime) {
                NotificationManager.setErrorNotification("Time can't be greater than the maximum end time!");
                return;
            }

        } else {
            if (initialSegment && initialSegment.startTime && initialSegment.startTime > time) {
                NotificationManager.setErrorNotification("Time can't be lower than the start of the run!");
                return;
            } else if (initialSegment && initialSegment.endTime && initialSegment.endTime < time) {
                NotificationManager.setErrorNotification("Time can't be greater than the end of the run!");
                return;
            }
        }


        super.setEndTime();
    }

    async setStartTime(): Promise<void> {
        let time = parseFloat(ELEMENTS.videoTimeInput.value);
        const initialSegment = segmentList.getInitialSegment();

        let selectedSegmentIndex = segmentList.getSelectedSegmentIndex();

        if (selectedSegmentIndex == 0) {
            if (initialSegment && initialSegment.endTime && initialSegment.endTime < time) {
                NotificationManager.setErrorNotification("Time can't be greater than the end of the run!");
                return;
            }

            const minStartTime = segmentList.segments.slice(1).filter(s => s.segment.startTime).reduce((min, segment) =>
                Math.min(min, segment.segment.startTime!), Infinity);
            const maxEndTime = segmentList.segments.slice(1).filter(s => s.segment.endTime).reduce((min, segment) =>
                Math.min(min, segment.segment.endTime!), Infinity);

            if (time > minStartTime) {
                NotificationManager.setErrorNotification("Time can't be lower than the minimum start time!");
                return;
            }


        } else {
            if (initialSegment && initialSegment.startTime && initialSegment.startTime > time) {
                NotificationManager.setErrorNotification("Time can't be lower than the start of the run!");
                return;
            } else if (initialSegment && initialSegment.endTime && initialSegment.endTime < time) {
                NotificationManager.setErrorNotification("Time can't be greater than the end of the run!");
                return;
            }
        }


        super.setStartTime();
    }

    setStyle(): void {
        let firstSegment = document.querySelector("#segments-container > *:first-child");
        if (firstSegment) {
            firstSegment.classList.add("divided-segment");
        }
    }

    removeStyle(): void {
        let firstSegment = document.querySelector("#segments-container > *:first-child");
        if (firstSegment) {
            firstSegment.classList.remove("divided-segment");
        }
    }
}

class AdditiveMode extends Mode {

    constructor() {
        super("Additive");
    }

    getSegment(): Segment {
        return new AdditiveSegment();
    }
    getStartingSegment(): Segment {
        return new AdditiveSegment();
    }

    setStyle(): void {

    }

    removeStyle(): void {

    }
}

class ModeManager {
    private static currentMode: Mode;

    static setCurrentMode(modeName: String) {
        if (this.currentMode) {
            this.currentMode.removeStyle();
        }

        for (let modeButton of Array.from(document.querySelectorAll("#mode-container > button"))) {
            modeButton.classList.remove("mode-active");
        }

        switch (modeName) {
            case new AdditiveMode().name:
                this.currentMode = new AdditiveMode();
                BUTTONS.additiveModeBtn.classList.add("mode-active");
                break;
            case new SubstractMode().name:
                this.currentMode = new SubstractMode();
                BUTTONS.subtractiveModeBtn.classList.add("mode-active");
                break;
            default:
                this.currentMode = new AdditiveMode();
        }
        this.currentMode.setStyle();
    }

    static getCurrentMode(): Mode {
        if (this.currentMode == null) {
            this.currentMode = new AdditiveMode();
            this.currentMode.setStyle();
        }
        return this.currentMode;
    }

}