var selectedInput = {
    input: null,
    index: 0
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {


    if (request.message === "unselect"){


        try {
            selectedInput.input.style.border = "none";
        }catch(error){
        }

        selectedInput.input = null;
        selectedInput.index = 0;

        sendResponse();

    }

    if (request.message === "openedExtension") {
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
            let hourInput = selectedInput.input.querySelector('[name$=hour]');
            let minuteInput = selectedInput.input.querySelector('[name$=minute]');
            let secondInput = selectedInput.input.querySelector('[name$=second]');
            let millisecondInput = selectedInput.input.querySelector('[name$=millisecond]');

            let hours = request.time.hours;
            let minutes = request.time.minutes;
            let seconds = request.time.seconds;
            let milliseconds = request.time.milliseconds;

            hourInput.value = hours;
            minuteInput.value = minutes;
            secondInput.value = seconds;
            millisecondInput.value = milliseconds;

            sendResponse({ message: "success" });
        } catch (error) {
            console.log(error);
            sendResponse({ message: "error" });
        }
    }
});
