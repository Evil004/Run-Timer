let selectedInput: {
    input: Element | null,
    index: number

} = {input: null, index: 0};

function triggerChangeEvent(element: Element) {
    element.dispatchEvent(new Event("change", {bubbles: true}));
}

function selectInput(index: number) {
    let timeInputs = document.querySelectorAll(".x-input-runtime-container");
    if (timeInputs[index]) {

        if (selectedInput.input) {
            selectedInput.input.classList.remove("RTSelected");
        }

        selectedInput.input = timeInputs[index];
        selectedInput.input.classList.add("RTSelected");
    }
}

function unselectAllTimeInputs() {
    selectedInput.input?.classList.remove("RTSelected");
    selectedInput = {input: null, index: 0};
}

let respondToMessage = (request: any, _sender: any, sendResponse: (response?: any) => void) => {
    switch (request.action) {
        case "openedExtension":
            unselectAllTimeInputs();
            selectInput(0);
            sendResponse();
            break;
        case "changeSelectedInput":
            selectedInput.index = (selectedInput.index + 1) % document.querySelectorAll(".x-input-runtime-container").length;
            selectInput(selectedInput.index);
            sendResponse();
            break;
        case "setTime":
            console.log(request)
            try {
                let {hours, minutes, seconds, milliseconds} = request.time;

                let hourInput: HTMLInputElement = selectedInput.input!.querySelector("[name$=hour]")!
                hourInput.value = hours;
                triggerChangeEvent(hourInput);

                let minuteInput: HTMLInputElement = selectedInput.input!.querySelector("[name$=minute]")!
                minuteInput.value = minutes;
                triggerChangeEvent(minuteInput);

                let secondInput: HTMLInputElement = selectedInput.input!.querySelector("[name$=second]")!
                secondInput.value = seconds;
                triggerChangeEvent(secondInput);

                let millisecondInput: HTMLInputElement = selectedInput.input!.querySelector("[name$=millisecond]")!
                millisecondInput.value = milliseconds;
                triggerChangeEvent(millisecondInput);




                sendResponse({message: "success"});
            } catch (error) {
                console.log(error);
                sendResponse({message: "error"});
            }
            break;
    }
}

if (navigator.userAgent.indexOf("Chrome") != -1) {
    chrome.runtime.onMessage.addListener(respondToMessage);
} else if (navigator.userAgent.indexOf("Firefox") != -1) {
    browser.runtime.onMessage.addListener(respondToMessage);
}

