var selectedInput = {
    input: null,
    index: 0,
};

function triggerChangeEvent(element) {
    var event = new Event("change", { bubbles: true });
    element.dispatchEvent(event);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "openedExtension") {
        unselectAllTimeInputs();

        let timeInputs = document.querySelectorAll(
            ".x-input-runtime-container"
        );

        if (timeInputs[0] != null || timeInputs[0] != undefined) {
            selectedInput.input = timeInputs[0];
            selectedInput.input.style.border = "1px solid red";
        }

        sendResponse();
    }

    if (request.message === "changeSelectedInput") {
        let timeInputs = document.querySelectorAll(
            ".x-input-runtime-container"
        );

        if (timeInputs.length > 0) {
            selectedInput.input.style.border = "none";

            if (selectedInput.index < timeInputs.length - 1) {
                selectedInput.index++;
            } else {
                selectedInput.index = 0;
            }

            selectedInput.input = timeInputs[selectedInput.index];

            selectedInput.input.style.border = "1px solid red";
        }

        sendResponse();
    }

    if (request.message === "setTime") {
        try {
            let hourInput = selectedInput.input.querySelector("[name$=hour]");
            let minuteInput =
                selectedInput.input.querySelector("[name$=minute]");
            let secondInput =
                selectedInput.input.querySelector("[name$=second]");
            let millisecondInput = selectedInput.input.querySelector(
                "[name$=millisecond]"
            );

            let hours = request.extraData.hours;
            let minutes = request.extraData.minutes;
            let seconds = request.extraData.seconds;
            let milliseconds = request.extraData.milliseconds;

            hourInput.value = hours;
            triggerChangeEvent(hourInput);
            minuteInput.value = minutes;
            triggerChangeEvent(minuteInput);
            secondInput.value = seconds;
            triggerChangeEvent(secondInput);
            millisecondInput.value = milliseconds;
            triggerChangeEvent(millisecondInput);

            sendResponse({ message: "success" });
        } catch (error) {
            console.log(error);
            sendResponse({ message: "error" });
        }
    }
});

function unselectAllTimeInputs() {
    try {
        selectedInput.input.style.border = "none";
    } catch (error) {}

    selectedInput.input = null;
    selectedInput.index = 0;
}
