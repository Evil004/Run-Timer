class Time {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;

    constructor(
        hours: number = 0,
        minutes: number = 0,
        seconds: number = 0,
        milliseconds: number = 0
    ) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }

    static fromSeconds(secondsTimestamp: number, framerate: number) {
        let hours = Math.floor(secondsTimestamp / 3600);
        let minutes = Math.floor((secondsTimestamp % 3600) / 60);
        let seconds = Math.floor(secondsTimestamp % 60);
        let milliseconds = Math.floor(
            ((secondsTimestamp % framerate) -
                Math.floor(secondsTimestamp % framerate)) *
            1000
        );

        return new Time(hours, minutes, seconds, milliseconds);
    }
}

class Segment {
    private _startTime: number;
    private _endTime: number | null;
    private _time: Time;

    constructor(startTime: number, endTime: number | null = null) {
        this._startTime = startTime;
        this._endTime = endTime;
        this._time = new Time();
    }

    getCalculatedSeconds() {
        return Math.abs(
            (this._endTime != null ? this._endTime : 0) - this._startTime
        );
    }

    calculateTime() {
        let framerate = getFramerate();
        let seconds = this.getCalculatedSeconds();
        this._time = Time.fromSeconds(seconds, framerate);
    }

    getCalculatedTime() {
        this.calculateTime();

        return this._time;
    }

    toString() {
        debugger
        let time = this.getCalculatedTime();
        let hours = time.hours.toString().padStart(2, "0");
        let minutes = time.minutes.toString().padStart(2, "0");
        let seconds = time.seconds.toString().padStart(2, "0");
        let milliseconds = time.milliseconds.toString().padStart(3, "0");

        return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
    }

    setStartTime(value: number) {
        this._startTime = value;
    }

    get startTime(): number {
        return this._startTime;
    }

    set startTime(value: number) {
        this._startTime = value;
    }

    get endTime(): number | null {
        return this._endTime;
    }

    set endTime(value: number | null) {
        this._endTime = value;
    }

    get time(): Time {
        return this._time;
    }

    set time(value: Time) {
        this._time = value;
    }
}

class HTMLSegmentFactory {
    static createSegmentElement(segment: Segment): HTMLSegment {
        let segmentElement = document.createElement("div");
        segmentElement.classList.add("segment");

        let segmentText = this.createTimeSegmentElement(segment);
        let resetButton = this.createResetSegmentButton();
        let removeButton = this.createRemoveButton();

        segmentElement.appendChild(segmentText);
        segmentElement.appendChild(resetButton);
        segmentElement.appendChild(removeButton);

        return new HTMLSegment(segment, segmentElement);
    }

    static createTimeSegmentElement(segment: Segment): HTMLButtonElement {
        let timeElement = document.createElement("button");
        timeElement.classList.add("time-segment");

        timeElement.addEventListener("click", () => {

            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === timeElement.parentElement;
            });

            segmentList.setSegmentAsSelected(index);
        });

        let valueSpan = document.createElement("span");
        valueSpan.classList.add("segment-value");
        valueSpan.innerText = segment.toString();

        timeElement.appendChild(valueSpan);

        return timeElement;
    }

    static createResetSegmentButton(): HTMLButtonElement {
        let resetButton = document.createElement("button");
        resetButton.classList.add("reset-segment");
        resetButton.classList.add("icon");

        resetButton.addEventListener("click", () => {

            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === resetButton.parentElement;
            });

            segmentList.resetSegment(index);

        });

        let icon = this.createIcon("icons/reset.png");
        resetButton.appendChild(icon);

        return resetButton;
    }

    static createIcon(imgPath: string): HTMLImageElement {
        let icon = document.createElement("img");
        icon.src = imgPath;

        return icon;
    }

    static createRemoveButton(): HTMLButtonElement {
        let removeButton = document.createElement("button");
        removeButton.classList.add("remove-segment");
        removeButton.classList.add("icon");

        removeButton.addEventListener("click", () => {
            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === removeButton.parentElement;
            });

            segmentList.removeSegment(index);

        });

        let icon = this.createIcon("icons/remove.png");
        removeButton.appendChild(icon);

        return removeButton;
    }
}

class HTMLSegment {
    element: HTMLDivElement;
    segment: Segment;
    private _selected: boolean = false;

    constructor(segment: Segment, element: HTMLDivElement) {
        this.segment = segment;
        this.element = element
        document.querySelector("#segments-container")!.appendChild(element);
    }

    setStartTime(value: number) {
        this.segment.startTime = value;
        (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.toString();
    }

    setEndTime(value: number) {
        this.segment.endTime = value;
        (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.toString();
    }

    get selected() {
        return this._selected;
    }
    set selected(value: boolean) {
        this._selected = value;

        if (value) {
            this.element.classList.add("selected");
        } else {
            this.element.classList.remove("selected");
        }

    }

}

class SegmentList {
    segments: HTMLSegment[];

    constructor() {
        this.segments = [];
    }

    addSegment(segment: HTMLSegment) {
        this.segments.push(segment);
    }

    clearSegments() {
        this.segments.forEach((segment) => {
            segment.element.remove();
        });
        this.segments = [];
    }

    setSelectedSegmentStartTime(value: number) {
        let selectedSegment = this.getSelectedSegment();
        selectedSegment.setStartTime(value);
    }

    setSelectedSegmentEndTime(value: number) {
        let selectedSegment = this.getSelectedSegment();
        selectedSegment.setEndTime(value);
    }

    getSelectedSegment() {
        return this.segments.find((segment) => {
            return segment.selected
        })!;
    }

    setSegmentAsSelected(index: number) {
        this.segments.forEach((segment) => {
            segment.element.classList.remove("selected");
            segment.selected = false;
        });

        this.segments[index].element.classList.add("selected");
        this.segments[index].selected = true;
    }

    resetSegment(index: number) {
        this.segments[index].setStartTime(0);
        this.segments[index].setEndTime(0);
    }

    removeSegment(index: number) {
        let segment = this.segments[index];
        if (segment.selected) {

            if (this.segments[index + 1]) {
                this.setSegmentAsSelected(index + 1);
            } else if (this.segments[index - 1]) {
                this.setSegmentAsSelected(index - 1);
            }
        }

        segment.element.remove();
        this.segments.splice(index, 1);

        if (this.segments.length === 0) {
            this.addSegment(HTMLSegmentFactory.createSegmentElement(new Segment(0)));
            this.setSegmentAsSelected(0);
        }

    }

    generateDefaultSegment() {
        let segmentElement = HTMLSegmentFactory.createSegmentElement(new Segment(0));

        segmentList.addSegment(segmentElement);

        segmentList.setSegmentAsSelected(0);
    }
}

const segmentList = new SegmentList();

if (segmentList.segments.length === 0) {
    segmentList.generateDefaultSegment();
}