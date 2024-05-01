interface Browser {
    sendMessage(message: any): Promise<any>;

    getFromStorage(key: string): Promise<any>;

    setToStorage(key: string, value: any): void;

    removeFromStorage(key: string): void;
}

class ChromeBrowser implements Browser {
    private getActiveTab(): Promise<chrome.tabs.Tab> {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }

    sendMessage(message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getActiveTab().then((tab) => {
                let response = chrome.tabs.sendMessage(tab.id!, message);

                response
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error);
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
        chrome.storage.local.set({ [key]: value });
    }

    removeFromStorage(key: string): void {
        chrome.storage.local.remove(key).catch((error) => {
            console.log(error);
        });
    }
}

class FirefoxBrowser implements Browser {
    private getActiveTab(): Promise<browser.tabs.Tab> {
        return new Promise((resolve) => {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then((tabs) => {
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
        browser.storage.local.set({ [key]: value });
    }

    removeFromStorage(key: string): void {
        browser.storage.local.remove(key);
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
            this.messageSender
                .sendMessage({ action: "getExactTime" })
                .then((response) => {
                    resolve(Number(response));
                });
        });
    }

    sendOpenedExtensionMessage() {
        this.messageSender.sendMessage({ action: "openedExtension" });
    }

    changeSelectedInput(): Promise<void> {
        return this.messageSender.sendMessage({
            action: "changeSelectedInput",
        });
    }

    setTimeToSRC(time: Time): Promise<void> {
        console.log(time);
        return this.messageSender.sendMessage({
            action: "setTime",
            time: time,
        });
    }
}
