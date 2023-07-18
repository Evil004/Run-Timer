const timeText = document.querySelector("#time-text");
const instancesContainer = document.querySelector("#instances-container");
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
const timeInput = document.querySelector("#time-instance-btn");
const framerateInput = document.querySelector("#framerate");
const sendBtn = document.querySelector("#send-btn");
const changeInput = document.querySelector("#change-input-btn");
const setFramerateTo60 = document.querySelector("#sixty-framerate-btn");
const setFramerateTo30 = document.querySelector("#thirty-framerate-btn");
const modNoteBtn = document.querySelector("#copy-mod-note-btn");

// ----------------- Basic Funcionality -----------------

function generateModNote() {
    var modNote = 'Mod Message: The sections, "';

    for (let i = 0; i < instancesContainer.childNodes.length; i++) {
        let segment = instancesContainer.childNodes[i].segment;

        if (segment == undefined) {
            continue;
        }

        modNote += segment.toString();

        if (i != instancesContainer.childNodes.length - 1) {
            modNote += " + ";
        }
    }

    modNote += " at " + framerateInput.value + ' fps"';
    modNote += ' add up to a final time of "' + calculatedTimeText.value + '"';
    modNote +=
        "\nRetimed using the Retimer Firefox Addon (https://github.com/Evil004/FrameTimerExtension)";

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
        return this.endTime - this.startTime;
    };
    this.toString = function () {
        return this.calculateTime();
    };
    this.calculateTime = function () {
        var framerate = framerateInput.value;

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

function resetBtnFunc(resetBtn) {
    resetBtn.parentNode.querySelector("#instance-value").innerHTML =
        "00h 00m 00s 000ms";
    resetBtn.parentNode.segment = undefined;
    saveDataToLocalStorage();
}

function getSelectedInstance() {
    var instances = instancesContainer.querySelectorAll("#time-instance-btn");

    for (var i = 0; i < instances.length; i++) {
        var input = instances[i];

        // Verificar si el radio input está seleccionado

        if (input.getAttribute("checked") == "true") {
            // Obtener el contenedor más cercano con la clase "contenedor"
            var contenedor = input.closest(".instance");

            return contenedor;
        }
    }
}

function getSelectedInstanceIndex() {
    var instances = instancesContainer.querySelectorAll("#time-instance-btn");

    for (var i = 0; i < instances.length; i++) {
        var input = instances[i];

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
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        browser.tabs.sendMessage(
            activeTabId,
            { message: "openedExtension" },
            async function (response) {}
        );
    });
}

function unselectAll() {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        browser.tabs.sendMessage(
            activeTabId,
            { message: "unselect" },
            async function (response) {}
        );
    });
}

function removeError() {
    document.querySelector("#setTimeError").innerHTML = "";
    document.querySelector("#setTimeError").style.color = "red";
}

function saveDataToLocalStorage() {
    browser.storage.local.set({ timeData: createSaveJSON() });
}

function getDataFromLocalStorage() {
    browser.storage.local.get(["timeData"], function (result) {
        var obj = result.timeData;

        setData(obj);

        var selected = result.timeData.selected;

        changeSelectedInstance(
            instancesContainer.childNodes[selected].querySelector(
                "#time-instance-btn"
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
        var childNode = instancesContainer.childNodes[i];

        if (childNode == undefined) {
            addInstance();

            childNode = instancesContainer.childNodes[i];
        }

        childNode.segment = new Segment(segment.startTime);

        if (segment.endTime == null) {
            continue;
        }

        childNode.segment.endTime = segment.endTime;

        childNode.querySelector("#instance-value").innerHTML =
            childNode.segment.toString();
    }
}

function changeSelectedInstance(timeInput) {
    instancesContainer
        .querySelectorAll("#time-instance-btn")
        .forEach((button) => {
            button.setAttribute("checked", false);
        });

    timeInput.setAttribute("checked", true);
    saveDataToLocalStorage();
}

// ------------- Create JSON ----------------

function getAllSegments() {
    var contenedores = document.querySelectorAll(".instance");

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

    var jsonObj = {
        selected: getSelectedInstanceIndex(),
        framerate: framerate,
        segments: obj,
        textTime: timeText.value,
    };

    return jsonObj;
}

//----------------- Calculate Time -----------------

function calculateTotalTime() {
    var totalSeconds = 0;

    var segmets = document.querySelectorAll(".instance");

    var totalSegment = new Segment(0);

    for (let i = 0; i < segmets.length; i++) {
        const segment = segmets[i].segment;
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
    calculatedTimeText.value = calculateTotalTime().toString();
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
    var newChild = instancesContainer.childNodes[0].cloneNode(true);

    var resetBtn = newChild.querySelector("#reset-btn");

    resetBtn.addEventListener("click", () => {
        resetBtnFunc(resetBtn);
    });

    newChild.segment = undefined;
    newChild.querySelector("#instance-value").innerHTML = "00h 00m 00s 000ms";

    //timeInput.type = "text";

    newChild
        .querySelector("#time-instance-btn")
        .addEventListener("click", () => {
            changeSelectedInstance(
                newChild.querySelector("#time-instance-btn")
            );
        });

    changeSelectedInstance(newChild.querySelector("#time-instance-btn"));

    //timeInput.disabled = true;

    removeButton.addEventListener("click", () => {
        if (
            newChild
                .querySelector("#time-instance-btn")
                .getAttribute("checked") == "true"
        ) {
            changeSelectedInstance(
                newChild.previousElementSibling.querySelector(
                    "#time-instance-btn"
                )
            );
        }

        newChild.remove();
        saveDataToLocalStorage();
    });

    // Agregar los elementos al contenedor principal
    instancesContainer.appendChild(newChild);

    newChild.appendChild(removeButton);

    // Obtener el contenedor de instancias y agregar la nueva instancia
}

// ----------------- Event Listeners -----------------

copyBtn.addEventListener("click", () => {
    removeError();
    var text = calculatedTimeText.value;
    navigator.clipboard.writeText(text).then(function () {
        document.querySelector("#setTimeError").innerHTML =
            "Copied to clipboard";
        document.querySelector("#setTimeError").style.color = "green";
    });
});

addBtn.addEventListener("click", () => {
    removeError();
    addInstance();
    saveDataToLocalStorage();
});

resetAllBtn.addEventListener("click", () => {
    removeError();
    document.querySelector("#framerate").value = "";
    var contenedores = document.querySelectorAll(".instance");

    timeText.value = "0.0";

    for (let i = 1; i < contenedores.length; i++) {
        const contenedor = contenedores[i];

        contenedor.remove();
    }

    contenedores[0].segment = undefined;

    contenedores[0].querySelector("#instance-value").innerHTML =
        "00h 00m 00s 000ms";

    changeSelectedInstance(document.querySelector("#time-instance-btn"));

    saveDataToLocalStorage();
});

resetBtn.addEventListener("click", () => {
    removeError();
    resetBtnFunc(resetBtn);
});

getExactTimeBtn.addEventListener("click", () => {
    removeError();
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        browser.tabs.sendMessage(
            activeTabId,
            { message: "getExactTime", videoId: 0 },
            async function (response) {
                timeText.value = response.time;
            }
        );
    });
});

sendBtn.addEventListener("click", () => {
    removeError();
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        var calculatedTime = calculatedTimeText.segment;

        var time = calculatedTime.time;

        browser.tabs.sendMessage(
            activeTabId,
            { message: "setTime", time: time },
            async function (response) {
                console.log(response.message);
            }
        );
    });
});

startTimeBtn.addEventListener("click", () => {
    removeError();

    if (timeText.value.trim() == "" || timeText.value == "0.0") {
        document.querySelector("#setTimeError").innerHTML =
            "You have not selected a second.";

        return;
    }
    var segment = new Segment(timeText.value);

    var contenedor = getSelectedInstance();

    if (contenedor == null) {
        document.querySelector("#setTimeError").innerHTML =
            "No instance selected.";
        return;
    }

    contenedor.segment = segment;

    saveDataToLocalStorage();
});

endTimerBtn.addEventListener("click", () => {
    removeError();
    var contenedor = getSelectedInstance();

    if (contenedor == null) {
        document.querySelector("#setTimeError").innerHTML =
            "No instance selected";
        return;
    }

    var segment = contenedor.segment;

    if (segment == null || segment.startTime == null) {
        document.querySelector("#setTimeError").innerHTML =
            "The selected instance does not have a start time";
        return;
    }

    segment.endTime = timeText.value;

    contenedor.querySelector("#instance-value").innerHTML =
        contenedor.segment.toString();

    maxFrame = maxFrame < segment.endTime ? segment.endTime : maxFrame;

    minFrame = minFrame > segment.startTime ? segment.startTime : minFrame;

    saveDataToLocalStorage();
});

changeInput.addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        browser.tabs.sendMessage(
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
    saveDataToLocalStorage();
});

setFramerateTo30.addEventListener("click", () => {
    framerateInput.value = 30;
    saveDataToLocalStorage();
});

setFramerateTo60.addEventListener("click", () => {
    framerateInput.value = 60;
    saveDataToLocalStorage();
});

modNoteBtn.addEventListener("click", () => {
    removeError();
    var modNote = generateModNote();

    navigator.clipboard.writeText(modNote).then(function () {
        document.querySelector("#setTimeError").innerHTML =
            "Copied to clipboard";
        document.querySelector("#setTimeError").style.color = "green";
    }, function () {
        console.log("Error copying to clipboard");
    }   
    );
});

// ----------------- Execute -----------------

timeInput.setAttribute("checked", true);
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
