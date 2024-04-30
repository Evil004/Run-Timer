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
    startTime: number;
    endTime: number | null;
    time: Time;

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
}

interface Browser {
    sendMessage(message: any): Promise<any>;

    getFromStorage(key: string): Promise<any>;

    setToStorage(key: string, value: any): void
}

class ChromeBrowser implements Browser {

    private getActiveTab(): Promise<chrome.tabs.Tab> {
        return new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }

    sendMessage(message: any): Promise<any> {
        return new Promise((resolve) => {
            this.getActiveTab().then((tab) => {
                let response = chrome.tabs.sendMessage(tab.id!, message);

                response.then((response) => {
                    resolve(response);
                });
            });


        });
    }

    getFromStorage(key: string): Promise<any> {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (value) => {
                resolve(value);
            });
        });
    }

    setToStorage(key: string, value: any): void {
        chrome.storage.local.set({[key]: value});
    }
}

class FirefoxBrowser implements Browser {

    private getActiveTab(): Promise<browser.tabs.Tab> {
        return new Promise((resolve) => {
            browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
                return resolve(tabs[0]);
            });
        });
    }

    sendMessage(message: any): Promise<any> {
        return new Promise((resolve) => {
            this.getActiveTab().then((tab) => {
                let response = browser.tabs.sendMessage(tab.id!, message);

                response.then((response) => {
                    resolve(response);
                });
            });


        });
    }

    getFromStorage(key: string): Promise<any> {
        return new Promise((resolve) => {
            browser.storage.local.get(key).then((value) => {
                resolve(value);
            });
        });
    }

    setToStorage(key: string, value: any): void {
        browser.storage.local.set({[key]: value});
    }
}

class BrowserFactory {
    static getBrowser(): Browser {
        if (navigator.userAgent.indexOf("Chrome") != -1) {
            return new ChromeBrowser();
        } else if (navigator.userAgent.indexOf("Firefox") != -1) {
            return new FirefoxBrowser();
        } else {
            throw new Error("Unsupported browser");
        }
    }
}

class ScriptsComunicator {
    private messageSender: Browser;

    constructor(messageSender: Browser = BrowserFactory.getBrowser()) {
        this.messageSender = messageSender;
    }

    getVideoSeconds(): Promise<number> {
        return new Promise<number>((resolve) => {
            this.messageSender.sendMessage({action: "getExactTime"}).then((response) => {
                console.log(response);
                resolve(Number(response));
            });
        });
    }

    sendOpenedExtensionMessage() {
        this.messageSender.sendMessage({action: "openedExtension"});
    }

    changeSelectedInput() {
        this.messageSender.sendMessage({action: "changeSelectedInput"});
    }

    setTimeToTheSelectedInput(time: Time) {
        this.messageSender.sendMessage({action: "setTimeToTheSelectedInput", time: time});
    }
}

