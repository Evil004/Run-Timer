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
    private startTime: number;
    private endTime: number | null;
    private time: Time;

    constructor(startTime: number, endTime: number | null = null) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = new Time();
    }

    getCalculatedSeconds() {
        return Math.abs(
            (this.endTime != null ? this.endTime : 0) - this.startTime
        );
    }

    calculateTime() {
        let framerate = getFramerate();
        let seconds = this.getCalculatedSeconds();
        this.time = Time.fromSeconds(seconds, framerate);
    }

    getCalculatedTime() {
        this.calculateTime();

        return this.time;
    }

    toString() {
        let time = this.getCalculatedTime();
        let hours = time.hours.toString().padStart(2, "0");
        let minutes = time.minutes.toString().padStart(2, "0");
        let seconds = time.seconds.toString().padStart(2, "0");
        let milliseconds = time.milliseconds.toString().padStart(3, "0");

        return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
    }

    setStartTime(value: number) {
        this.startTime = value;
    }

    setEndTime(value: number) {
        this.endTime = value;
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

        timeElement.addEventListener("click", (e) => {

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

        resetButton.addEventListener("click", (e) => {

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

        removeButton.addEventListener("click", (e) => {
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

    constructor(segment: Segment, element: HTMLDivElement) {
        this.segment = segment;
        this.element = element
        document.querySelector("#segments-container")!.appendChild(element);
    }

    getSegment() {
        return this.segment;
    }

    getElement() {
        return this.element;
    }

    setStartTime(value: number) {
        this.segment.setStartTime(value);
        (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.toString();
    }

    setEndTime(value: number) {
        this.segment.setEndTime(value);
        (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.toString();
    }

    isSegmentSelected() {
        return this.element.classList.contains("selected");
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
            return segment.element.classList.contains("selected");
        })!;
    }

    setSegmentAsSelected(index: number) {
        this.segments.forEach((segment) => {
            segment.element.classList.remove("selected");
        });

        this.segments[index].element.classList.add("selected");
    }

    resetSegment(index: number) {
        this.segments[index].setStartTime(0);
        this.segments[index].setEndTime(0);
    }

    removeSegment(index: number) {
        let segment = this.segments[index];
        if (segment.isSegmentSelected()) {

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
}

const segmentList = new SegmentList();

let segmentElement = HTMLSegmentFactory.createSegmentElement(new Segment(0));

segmentList.addSegment(segmentElement);

segmentList.setSegmentAsSelected(0);