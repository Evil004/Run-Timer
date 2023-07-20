/*const timeText = document.querySelector("#time-text");
const segmentsContainer = document.querySelector("#segments-container");
const sendMessageBtn = document.querySelector("#send-msg-btn");
const videoSelect = document.querySelector("#video-select");
const calculatedTimeText = document.querySelector("#calculated-time");
const calculateBtn = document.querySelector("#calculate-btn");
const addBtn = document.querySelector("#add-btn");
const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimeBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");
const resetAllBtn = document.querySelector("#reset-all-btn");
const copyBtn = document.querySelector("#copy-btn");
const timeInput = document.querySelector("#time-segment-btn");
const framerateInput = document.querySelector("#framerate");
const sendBtn = document.querySelector("#send-btn");
const changeInput = document.querySelector("#change-input-btn");
const setFramerateTo60 = document.querySelector("#sixty-framerate-btn");
const setFramerateTo30 = document.querySelector("#thirty-framerate-btn");
const modNoteBtn = document.querySelector("#copy-mod-note-btn");
const lock = document.querySelector("#lock");

// ----------------- Basic Funcionality -----------------
/*
function generateModNote() {
    var modNote = 'Mod Message: The sections, "';

    for (let i = 0; i < segmentsContainer.childNodes.length; i++) {
        let segment = segmentsContainer.childNodes[i].segment;

        if (segment == undefined) {
            continue;
        }

        modNote += segment.toString();

        if (i != segmentsContainer.childNodes.length - 1) {
            modNote += " + ";
        }
    }

    let framerate = framerateInput.value;

    if (framerate == 0) {
        document.querySelector("#error-message").innerHTML =
            "Framerate cannot be 0 or empty";
        return;
    }

    if (framerate == "" || framerate == undefined || framerate == null) {
        framerate = 60;
    }

    modNote += " at " + framerate + ' fps"';
    modNote += ' add up to a final time of "' + calculatedTimeText.value + '"';
    modNote +=
        "\nRetimed using the Retimer Chrome Extension (https://github.com/Evil004/FrameTimerExtension)";

    return modNote;
}

function Time(hours, minutes, seconds, milliseconds) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.milliseconds = milliseconds;
}

function Segment(startTime) {
    this.startTime = startTime;
    this.endTime = null;
    this.time = new Time(0, 0, 0, 0);
    this.getSeconds = function () {
        return Math.abs(this.endTime - this.startTime);
    };
    this.toString = function () {
        let time = this.calculateTime();

        if (time == undefined) {
            return "00h 00m 00s 000ms";
        }

        return time;
    };
    this.calculateTime = function () {
        var framerate = framerateInput.value;

        if (framerate == 0) {
            document.querySelector("#error-message").innerHTML =
                "Framerate can't be 0";
            return;
        }

        if (framerate == "" || framerate == undefined || framerate == null) {
            framerate = 60;
        }

        var frames = Math.abs(this.getSeconds()) * framerate;
        var horas = Math.floor(frames / (3600 * framerate));
        var minutos = Math.floor(
            (frames % (3600 * framerate)) / (60 * framerate)
        );
        var segundosRestantes = Math.floor(
            (frames % (60 * framerate)) / framerate
        );
        var milisegundos = Math.floor(
            (frames % framerate) * (1000 / framerate)
        );

        var tiempoFormateado = "";

        tiempoFormateado += horas.toString().padStart(2, "0") + "h ";
        tiempoFormateado += minutos.toString().padStart(2, "0") + "m ";
        tiempoFormateado +=
            segundosRestantes.toString().padStart(2, "0") + "s ";
        tiempoFormateado += milisegundos.toString().padStart(3, "0") + "ms";

        this.time = new Time(horas, minutos, segundosRestantes, milisegundos);

        return tiempoFormateado;
    };
}
function resetAll() {
    document.querySelector("#framerate").value = "";
    var contenedores = document.querySelectorAll(".segment");

    timeText.value = "0.0";

    for (let i = 1; i < contenedores.length; i++) {
        const contenedor = contenedores[i];

        contenedor.remove();
    }

    contenedores[0].segment = undefined;

    contenedores[0].querySelector("#segment-value").innerHTML =
        "00h 00m 00s 000ms";

    changeSelectedInstance(document.querySelector("#time-segment-btn"));

    calculatedTimeText.value = "00h 00m 00s 000ms";
    calculatedTimeText.segment = new Segment(0);

    saveDataToLocalStorage();
}

function resetBtnFunc(resetBtn) {
    resetBtn.parentNode.querySelector("#segment-value").innerHTML =
        "00h 00m 00s 000ms";
    resetBtn.parentNode.segment = undefined;
    saveDataToLocalStorage();
}

function getSelectedInstance() {
    var segments = segmentsContainer.querySelectorAll("#time-segment-btn");

    for (var i = 0; i < segments.length; i++) {
        var input = segments[i];

        // Verificar si el radio input está seleccionado

        if (input.getAttribute("checked") == "true") {
            // Obtener el contenedor más cercano con la clase "contenedor"
            var contenedor = input.closest(".segment");

            return contenedor;
        }
    }
}

function getSelectedInstanceIndex() {
    var segments = segmentsContainer.querySelectorAll("#time-segment-btn");

    for (var i = 0; i < segments.length; i++) {
        var input = segments[i];

        // Verificar si el radio input está seleccionado

        if (input.getAttribute("checked") == "true") {
            // Obtener el contenedor más cercano con la clase "contenedor"

            return i;
        }
    }
}

window.onload = onLoad;

function onLoad() {
    calculatedTimeText.segment = new Segment(0);

    getDataFromLocalStorage();
    unselectAll();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        chrome.tabs.sendMessage(
            activeTabId,
            { message: "openedExtension" },
            async function (response) {}
        );
    });
}
function unselectAll() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        chrome.tabs.sendMessage(
            activeTabId,
            { message: "unselect" },
            async function (response) {}
        );
    });
}


function removeError() {
    document.querySelector("#error-message").innerHTML = "";
    document.querySelector("#error-message").style.color = "red";
}

function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: createSaveJSON() });
}

function getDataFromLocalStorage() {
    chrome.storage.local.get(["timeData"], function (result) {
        var obj = result.timeData;

        setData(obj);

        var selected = result.timeData.selected;

        changeSelectedInstance(
            segmentsContainer.childNodes[selected].querySelector(
                "#time-segment-btn"
            )
        );
    });

    setData(undefined);
}

function setData(timeData) {
    if (timeData == undefined) {
        return;
    }

    var segments = timeData.segments;
    var framerate = timeData.framerate;
    var textTime = timeData.textTime;

    if (framerate == undefined) {
        framerate = "";
    }

    document.querySelector("#framerate").value = framerate;

    timeText.value = textTime;

    if (segments.length == 0) {
        return;
    }

    for (let i = 0; i < segments.length; i++) {
        var segment = segments[i];
        var childNode = segmentsContainer.childNodes[i];

        if (childNode == undefined) {
            addInstance();

            childNode = segmentsContainer.childNodes[i];
        }

        childNode.segment = new Segment(segment.startTime);

        if (segment.endTime == null) {
            continue;
        }

        childNode.segment.endTime = segment.endTime;

        childNode.querySelector("#segment-value").innerHTML =
            childNode.segment.toString();
    }

    calculatedTimeText.segment = new Segment(timeData.calculatedTime.startTime);
    calculatedTimeText.segment.endTime = timeData.calculatedTime.endTime;
    if (calculatedTimeText.segment.endTime != null) {
        calculatedTimeText.value = calculatedTimeText.segment.toString();
    }
}*/

/*
function changeSelectedInstance(timeInput) {
    segmentsContainer
        .querySelectorAll("#time-segment-btn")
        .forEach((button) => {
            button.setAttribute("checked", false);
        });

    timeInput.setAttribute("checked", true);
    saveDataToLocalStorage();
}

function openWarning(isStart, newTime, contenedor) {
    document.querySelector("#warning").style.visibility = "visible";
    document.querySelector("#lock").style.visibility = "visible";

    document.querySelector("#warning-text").innerHTML =
        "Are you sure you want to overwrite the time?";

    let warningYes = document.querySelector("#warning-yes-btn");
    let warningNo = document.querySelector("#warning-no-btn");

    warningYes.addEventListener("click", () => {
        if (isStart) {
            contenedor.segment.startTime = newTime;
        } else {
            contenedor.segment.endTime = newTime;
        }

        if (contenedor.segment.endTime != null) {
            contenedor.querySelector("#segment-value").innerHTML =
                contenedor.segment.toString();
        }

        document.querySelector("#warning").style.visibility = "hidden";
        document.querySelector("#lock").style.visibility = "hidden";

        warningYes.removeEventListener("click", () => {});
        saveDataToLocalStorage();
    });

    warningNo.addEventListener("click", () => {
        document.querySelector("#warning").style.visibility = "hidden";
        document.querySelector("#lock").style.visibility = "hidden";

        warningNo.removeEventListener("click", () => {});
    });
}

function openWarningResetAll() {
    document.querySelector("#warning").style.visibility = "visible";
    document.querySelector("#lock").style.visibility = "visible";

    document.querySelector("#warning-text").innerHTML =
        "Are you sure you want to reset all the data?";

    let warningYes = document.querySelector("#warning-yes-btn");
    let warningNo = document.querySelector("#warning-no-btn");

    warningYes.addEventListener("click", () => {
        resetAll();

        document.querySelector("#warning").style.visibility = "hidden";
        document.querySelector("#lock").style.visibility = "hidden";

        warningYes.removeEventListener("click", () => {});
        saveDataToLocalStorage();
    });

    warningNo.addEventListener("click", () => {
        document.querySelector("#warning").style.visibility = "hidden";
        document.querySelector("#lock").style.visibility = "hidden";

        warningNo.removeEventListener("click", () => {});
    });
}*/

// ------------- Create JSON ----------------
/*
function getAllSegments() {
    var contenedores = document.querySelectorAll(".segment");

    var obj = [];

    for (let i = 0; i < contenedores.length; i++) {
        const contenedor = contenedores[i];

        var segment = contenedor.segment;

        if (segment == null) {
            var objSegment = {
                startTime: null,
                endTime: null,
            };

            obj.push(objSegment);
            continue;
        }

        var objSegment = {
            startTime: segment.startTime,
            endTime: segment.endTime,
        };

        obj.push(objSegment);
    }

    return obj;
}

function createSaveJSON() {
    var obj = getAllSegments();
    var framerate = document.querySelector("#framerate").value;

    if (isNaN(framerate)) {
        framerate = "";
    }

    var jsonObj = {
        selected: getSelectedInstanceIndex(),
        framerate: framerate,
        segments: obj,
        textTime: timeText.value,
        calculatedTime: calculatedTimeText.segment,
    };

    return jsonObj;
}

//----------------- Calculate Time -----------------

function calculateTotalTime() {
    var totalSeconds = 0;

    var segments = document.querySelectorAll(".segment");

    var totalSegment = new Segment(0);

    for (let i = 0; i < segments.length; i++) {
        let segment = segments[i].segment;

        if (segment == undefined) {
            continue;
        }

        var seconds = segment.getSeconds();

        if (seconds == null || seconds == undefined || seconds < 0) {
            continue;
        }

        totalSeconds += segment.getSeconds();
    }

    totalSegment.endTime = totalSeconds;

    calculatedTimeText.segment = totalSegment;

    return totalSegment;
}

calculateBtn.addEventListener("click", () => {
    if (isNaN(framerateInput.value)) {
        document.querySelector("#error-message").innerHTML =
            "The framerate must be a number.";
        framerateInput.value = "";
        return;
    }
    calculatedTimeText.value = calculateTotalTime().toString();
    saveDataToLocalStorage();
});

// ----------------- Add Instance -----------------

function addInstance() {
    // Crear los elementos para la nueva instancia
    var removeButton = document.createElement("button");

    var removeImg = document.createElement("img");

    removeImg.src = "icons/remove.png";

    removeButton.appendChild(removeImg);

    removeButton.classList.add("icon");

    // Configurar los atributos y contenido de los elementos
    var newChild = segmentsContainer.childNodes[0].cloneNode(true);

    var resetBtn = newChild.querySelector("#reset-btn");

    resetBtn.addEventListener("click", () => {
        resetSegmentBtnFunc(resetBtn);
    });

    newChild.segment = undefined;
    newChild.querySelector("#segment-value").innerHTML = "00h 00m 00s 000ms";

    //timeInput.type = "text";

    newChild
        .querySelector("#time-segment-btn")
        .addEventListener("click", () => {
            changeSelectedInstance(newChild.querySelector("#time-segment-btn"));
        });

    changeSelectedInstance(newChild.querySelector("#time-segment-btn"));

    //timeInput.disabled = true;

    removeButton.addEventListener("click", () => {
        if (
            newChild
                .querySelector("#time-segment-btn")
                .getAttribute("checked") == "true"
        ) {
            changeSelectedInstance(
                newChild.previousElementSibling.querySelector(
                    "#time-segment-btn"
                )
            );
        }

        newChild.remove();
        saveDataToLocalStorage();
    });

    // Agregar los elementos al contenedor principal
    segmentsContainer.appendChild(newChild);

    newChild.appendChild(removeButton);

    // Obtener el contenedor de instancias y agregar la nueva instancia
}

// ----------------- Event Listeners -----------------

copyBtn.addEventListener("click", () => {
    removeError();
    var text = calculatedTimeText.value;
    navigator.clipboard.writeText(text).then(function () {
        document.querySelector("#error-message").innerHTML =
            "Copied to clipboard";
        document.querySelector("#error-message").style.color = "green";
    });
});

addBtn.addEventListener("click", () => {
    removeWarning();
    addSegmentNode();
    saveDataToLocalStorage();
});

resetAllBtn.addEventListener("click", () => {
    removeWarning();

    resetAll();
});

resetBtn.addEventListener("click", () => {
    removeWarning();
    resetSegmentBtnFunc(resetBtn);
});

getExactTimeBtn.addEventListener("click", () => {
    removeWarning();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        chrome.tabs.sendMessage(
            activeTabId,
            { message: "getExactTime", videoId: 0 },
            async function (response) {
                timeText.value = response.time;
            }
        );
    });
    saveDataToLocalStorage();
});

sendBtn.addEventListener("click", () => {
    removeWarning();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        var calculatedTime = calculatedTimeText.segment;

        var time = calculatedTime.time;

        chrome.tabs.sendMessage(
            activeTabId,
            { message: "setTime", time: time },
            async function (response) {
                console.log(response.message);
            }
        );
    });
});

startTimeBtn.addEventListener("click", () => {
    removeWarning();

    if (timeText.value.trim() == "" || timeText.value == "0.0") {
        document.querySelector("#error-message").innerHTML =
            "You have not selected a second.";

        return;
    }

    var contenedor = getSelectedSegmentNodeAndIndex().segmentNode;

    if (contenedor == null) {
        document.querySelector("#error-message").innerHTML =
            "No segment selected.";
        return;
    }

    if (isNaN(framerateInput.value)) {
        document.querySelector("#error-message").innerHTML =
            "The framerate must be a number.";
        framerateInput.value = "";
        return;
    }

    if (framerateInput.value <= 0 || framerateInput.value == "") {
        document.querySelector("#error-message").innerHTML =
            "The framerate cannot be 0 or lower.";
        framerateInput.value = "";
        return;
    }

    if (isNaN(timeText.value)) {
        document.querySelector("#error-message").innerHTML =
            "The time must be a number.";
        timeText.value = "0.0";
        return;
    }

    if (contenedor.segment != undefined) {
        if (contenedor.segment.startTime == timeText.value) {
            return;
        }
        openWarning(true, timeText.value, contenedor);
    } else {
        var segment = new Segment(timeText.value);

        contenedor.segment = segment;
    }

    if (contenedor.segment.endTime != null) {
        contenedor.querySelector("#segment-value").innerHTML =
            contenedor.segment.toString();
    }

    saveDataToLocalStorage();
});

endTimerBtn.addEventListener("click", () => {
    removeWarning();
    debugger;
    var contenedor = getSelectedSegmentNodeAndIndex().segmentNode;

    if (contenedor == null) {
        document.querySelector("#error-message").innerHTML =
            "No segment selected";
        return;
    }

    var segment = contenedor.segment;
    if (isNaN(framerateInput.value)) {
        document.querySelector("#error-message").innerHTML =
            "The framerate must be a number.";
        framerateInput.value = "";
        return;
    }

    if (framerateInput.value <= 0 || framerateInput.value == "") {
        document.querySelector("#error-message").innerHTML =
            "The framerate cannot be 0 or lower.";
        framerateInput.value = "";
        return;
    }

    if (segment == null || segment.startTime == null) {
        document.querySelector("#error-message").innerHTML =
            "The selected segment does not have a start time";
        return;
    }

    if (isNaN(timeText.value)) {
        document.querySelector("#error-message").innerHTML =
            "The time must be a number.";
        timeText.value = "0.0";
        return;
    }

    if (segment.endTime != null) {
        if (segment.endTime == timeText.value) {
            return;
        }
        openWarning(false, timeText.value, contenedor);
    } else {
        segment.endTime = timeText.value;
    }

    contenedor.querySelector("#segment-value").innerHTML =
        contenedor.segment.toString();

    saveDataToLocalStorage();
});

changeInput.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        chrome.tabs.sendMessage(
            activeTabId,
            { message: "changeSelectedInput" },
            async function (response) {}
        );
    });
});

timeInput.addEventListener("click", () => {
    changeSelectedInstance(timeInput);
});

framerateInput.addEventListener("change", () => {
    if (framerateInput.value <= 0) {
        document.querySelector("#error-message").innerHTML =
            "The framerate cannot be 0 or lower.";
        framerateInput.value = "";
    }
    saveDataToLocalStorage();
});

setFramerateTo30.addEventListener("click", () => {
    removeWarning();
    framerateInput.value = 30;
    saveDataToLocalStorage();
});

setFramerateTo60.addEventListener("click", () => {
    removeWarning();

    framerateInput.value = 60;
    saveDataToLocalStorage();
});

modNoteBtn.addEventListener("click", () => {
    removeWarning();

    if (isNaN(framerateInput.value)) {
        document.querySelector("#error-message").innerHTML =
            "The framerate must be a number.";
        framerateInput.value = "";
        return;
    }

    var modNote = generateModNote();

    if (modNote == undefined) {
        return;
    }

    navigator.clipboard.writeText(modNote).then(function () {
        document.querySelector("#error-message").innerHTML =
            "Copied to clipboard";
        document.querySelector("#error-message").style.color = "green";
    });
});

lock.addEventListener("click", () => {
    removeWarning();

    document.querySelector("#warning").style.visibility = "hidden";
    document.querySelector("#lock").style.visibility = "hidden";

    warningYes.removeEventListener("click", () => {});
});
// ----------------- Execute -----------------

timeInput.setAttribute("checked", true);
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}*/
