class Time {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;

    constructor(
        hours: number = 0,
        minutes: number = 0,
        seconds: number = 0,
        milliseconds: number = 0,
    ) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }

    static fromSeconds(secondsTimestamp: number, framerate: number) {

        secondsTimestamp = Math.abs(secondsTimestamp);

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


    toString() {
        return `${this.hours.toString().padStart(2, '0')}h ${this.minutes.toString().padStart(2, '0')}m ${this.seconds.toString().padStart(2, '0')}s ${this.milliseconds.toString().padStart(3, '0')}ms`;
    }
}


interface Segment {
    startTime: number | null;
    endTime: number | null;
    time: Time;

    getCalculatedTime(): Time;
    getCalculatedSeconds(): number;
    toString(): string;
}

class AdditiveSegment implements Segment {
    startTime: number | null;
    endTime: number | null;
    time: Time;

    constructor(startTime: number | null = null, endTime: number | null = null) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = Time.fromSeconds(this.getCalculatedSeconds(), getFramerate());
    }

    getCalculatedTime() {
        return Time.fromSeconds(this.getCalculatedSeconds(), getFramerate());
    }

    getCalculatedSeconds() {
        return Math.abs(
            (this.endTime != null ? this.endTime : 0) - this.startTime!
        );
    }

    toString() {
        return this.getCalculatedTime().toString();
    }

}

class SubtractiveSegment implements Segment {
    startTime: number | null;
    endTime: number | null;
    time: Time;

    constructor(startTime: number | null = null, endTime: number | null = null) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = Time.fromSeconds(this.getCalculatedSeconds(), getFramerate());
    }

    getCalculatedTime() {
        return Time.fromSeconds(this.getCalculatedSeconds(), getFramerate());
    }

    getCalculatedSeconds() {
        return Math.abs(this.startTime! - this.endTime!) * -1;
    }

    toString() {
        return this.getCalculatedTime().toString();
    }
}

const segmentTypeMap: { [key: string]: any } = {
    'AdditiveSegment': AdditiveSegment,
    'SubtractiveSegment': SubtractiveSegment
};

function getSegmentInstancce(name: string, startTime: number = 0, endTime: number | null = null) {
    const SegmentClass = segmentTypeMap[name];
    if (typeof SegmentClass !== 'function') {
        throw new Error(`Segment type ${name} is not a valid constructor`);
    }
    return new SegmentClass(startTime, endTime);
}

class HTMLSegmentFactory {
    static createSegmentElement(segment: Segment): HTMLSegment {
        let segmentElement = document.createElement("div");
        segmentElement.classList.add("segment");

        let segmentText = this.createTimeSegmentElement(segment);
        let resetButton = this.createResetSegmentButton();
        let removeButton = this.createRemoveButton();
        let checkButton = this.createCheckButton();
        let tooltip = this.createTooltip();
        segmentElement.appendChild(segmentText);
        segmentElement.appendChild(resetButton);
        segmentElement.appendChild(removeButton);
        segmentElement.appendChild(checkButton);
        segmentElement.appendChild(tooltip);

        segmentElement.addEventListener("mouseover", () => {
            tooltip.querySelector(".startValue")!.textContent = segment.startTime || segment.startTime == 0 ? Time.fromSeconds(segment.startTime, getFramerate()).toString() : "Start Not Set";
            tooltip.querySelector(".endValue")!.textContent = segment.endTime || segment.endTime == 0 ? Time.fromSeconds(segment.endTime, getFramerate()).toString() : "End Not Set";

            let segmentRect = segmentElement.getBoundingClientRect();
            let tooltipRect = tooltip.getBoundingClientRect();
            
            tooltip.style.top = - tooltipRect.height + 'px';
        });

        tooltip.querySelector(".tooltipStart")!.addEventListener("click", (e) => {
            e.preventDefault();

            browserAction.setVideoTime(segment.startTime!).then(() => {
                NotificationManager.setSuccessNotification("Time set!")
            }).catch(() => {
                NotificationManager.setErrorNotification("Error when comunicating with video player!")
            });
        })

        tooltip.querySelector(".tooltipEnd")!.addEventListener("click", (e) => {
            e.preventDefault();
            browserAction.setVideoTime(segment.endTime!).then(() => {
                NotificationManager.setSuccessNotification("Time set!")
            }).catch(() => {
                NotificationManager.setErrorNotification("Error when comunicating with video player!")
            });
        })
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

        try {
            if (segment.endTime && segment.startTime) {
                valueSpan.innerText = segment.toString();
            } else {
                valueSpan.innerText = DEFAULT_TIME;
            }
        } catch (e: any) {
            valueSpan.innerText = DEFAULT_TIME;
        }

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

        let icon = this.createIcon("icon-spinner11");
        resetButton.appendChild(icon);

        return resetButton;
    }

    static createIcon(iconName: string): HTMLParagraphElement {
        let icon = document.createElement("p");
        icon.classList.add(iconName,"font-icon");
    
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

        let icon = this.createIcon("icon-minus");
        removeButton.appendChild(icon);

        return removeButton;
    }

    static createCheckButton(): HTMLButtonElement {
        let checkButton = document.createElement("button");
        checkButton.classList.add("check-segment");
        checkButton.classList.add("icon");

        checkButton.addEventListener("click", () => {
            let index = segmentList.segments.findIndex((segment) => {
                return segment.element === checkButton.parentElement;
            });

            segmentList.checkSegment(index);

        });

        let icon = this.createIcon("icon-checkmark");
        checkButton.appendChild(icon);

        return checkButton;
    }

    static createTooltip(): HTMLSpanElement {
        let tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");

        let start = document.createElement("p")
        start.classList.add("tooltipStart");

        let startValue = document.createElement("span");
        startValue.classList.add("startValue");
        start.appendChild(startValue);

        tooltip.appendChild(start);

        let end = document.createElement("p")
        end.classList.add("tooltipEnd");

        let endValue = document.createElement("span");
        endValue.classList.add("endValue");
        end.appendChild(endValue);

        tooltip.appendChild(end);
        return tooltip;
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

    setStartTime(value: number | null) {
        this.segment.startTime = value;
        if (this.segment.endTime || this.segment.endTime == 0) {
            (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.toString();
        }
    }

    setEndTime(value: number | null) {
        this.segment.endTime = value;
        if (this.segment.startTime || this.segment.startTime == 0) {
            (this.element.querySelector(".segment-value")! as HTMLButtonElement).innerText = this.segment.toString();
        }
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
        this.setSegmentAsSelected(this.segments.length - 1)
        if (this.segments.length == 1) {
            this.segments[0].element.querySelector(".remove-segment")!.classList.add("hidden");
        }
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

    getSelectedSegmentIndex() {
        return this.segments.findIndex((segment) => {
            return segment.selected
        });
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
        debugger
        this.segments[index].setStartTime(null);
        this.segments[index].setEndTime(null);
        this.segments[index].element.querySelector(".segment-value")!.textContent = DEFAULT_TIME;
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


    }

    checkSegment(index: number) {
        let segment = this.segments[index];
        if (segment.selected) {

            if (this.segments[index + 1]) {
                this.setSegmentAsSelected(index + 1);
            } else if (this.segments[index - 1]) {
                this.setSegmentAsSelected(index - 1);
            }
        }
    };

    generateDefaultSegment() {
        let segmentElement = HTMLSegmentFactory.createSegmentElement(ModeManager.getCurrentMode().getStartingSegment());

        segmentList.addSegment(segmentElement);

        segmentList.setSegmentAsSelected(0);
    }

    getTotalTime() {
        let totalTime = 0;
        this.segments.forEach((segment) => {
            totalTime += segment.segment.getCalculatedSeconds();
        });

        return totalTime;
    }

    getInitialSegment() {
        return this.segments[0].segment;
    }
}

const segmentList = new SegmentList();

if (segmentList.segments.length === 0) {
    segmentList.generateDefaultSegment();
}