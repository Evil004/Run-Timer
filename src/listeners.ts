let browserAction = new ScriptsComunicator();

window.onload = async () => {
    browserAction.sendOpenedExtensionMessage()
}

BUTTONS.setFramerateTo30Btn.addEventListener('click', async (e) => {
    e.preventDefault();
    ELEMENTS.framerateInput.value = "30";
});

BUTTONS.setFramerateTo60Btn.addEventListener('click', async (e) => {
    e.preventDefault();
    ELEMENTS.framerateInput.value = "60";
});

BUTTONS.getExactTimeBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const time = browserAction.getVideoSeconds().then((time) => {
        ELEMENTS.videoTimeInput.value = time.toString();
    });
});

BUTTONS.changeSRCTimeInputBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    browserAction.changeSelectedInput();
});