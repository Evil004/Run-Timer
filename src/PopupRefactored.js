var Time = /** @class */ (function () {
    function Time(hours, minutes, seconds, milliseconds) {
        if (hours === void 0) { hours = 0; }
        if (minutes === void 0) { minutes = 0; }
        if (seconds === void 0) { seconds = 0; }
        if (milliseconds === void 0) { milliseconds = 0; }
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
        this.milliseconds = milliseconds;
    }
    Time.fromSeconds = function (secondsTimestamp, framerate) {
        var hours = Math.floor(secondsTimestamp / 3600);
        var minutes = Math.floor((secondsTimestamp % 3600) / 60);
        var seconds = Math.floor(secondsTimestamp % 60);
        var milliseconds = Math.floor(((secondsTimestamp % framerate) -
            Math.floor(secondsTimestamp % framerate)) *
            1000);
        return new Time(hours, minutes, seconds, milliseconds);
    };
    return Time;
}());
var Segment = /** @class */ (function () {
    function Segment(startTime, endTime) {
        if (endTime === void 0) { endTime = null; }
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = new Time();
    }
    Segment.prototype.getCalculatedSeconds = function () {
        return Math.abs((this.endTime != null ? this.endTime : 0) - this.startTime);
    };
    Segment.prototype.calculateTime = function () {
        var framerate = getFramerate();
        var seconds = this.getCalculatedSeconds();
        this.time = Time.fromSeconds(seconds, framerate);
    };
    Segment.prototype.getCalculatedTime = function () {
        this.calculateTime();
        return this.time;
    };
    Segment.prototype.toString = function () {
        var time = this.getCalculatedTime();
        var hours = time.hours.toString().padStart(2, "0");
        var minutes = time.minutes.toString().padStart(2, "0");
        var seconds = time.seconds.toString().padStart(2, "0");
        var milliseconds = time.milliseconds.toString().padStart(3, "0");
        return "".concat(hours, "h ").concat(minutes, "m ").concat(seconds, "s ").concat(milliseconds, "ms");
    };
    return Segment;
}());
var VideoPlayerController = /** @class */ (function () {
    function VideoPlayerController() {
    }
    VideoPlayerController.prototype.getActualSeconds = function () {
    };
    return VideoPlayerController;
}());
var ChromeMessageSender = /** @class */ (function () {
    function ChromeMessageSender() {
    }
    ChromeMessageSender.prototype.getActiveTab = function () {
        return new Promise(function (resolve) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                resolve(tabs[0]);
            });
        });
    };
    ChromeMessageSender.prototype.sendMessage = function (message) {
        var tab = this.getActiveTab().await();
        chrome.runtime.sendMessage(message);
    };
    return ChromeMessageSender;
}());
