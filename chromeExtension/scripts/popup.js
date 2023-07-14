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

// ----------------- Basic Funcionality -----------------

function Segment(startTime) {
    this.startTime = startTime;
    this.endTime = null;
    this.getSeconds = function () {
        return this.endTime - this.startTime;
    };
    this.toString = function () {
        return this.calculateTime();
    };
    this.calculateTime = function () {
        var segundos = Math.abs(this.getSeconds());
        var horas = Math.floor(segundos / 3600);
        var minutos = Math.floor((segundos % 3600) / 60);
        var segundosRestantes = Math.floor(segundos % 60);
        var milisegundos = Math.floor((segundos - Math.floor(segundos)) * 1000);

        var tiempoFormateado = "";

        tiempoFormateado += horas.toString().padStart(2, "0") + "h ";
        tiempoFormateado += minutos.toString().padStart(2, "0") + "m ";
        tiempoFormateado +=
        segundosRestantes.toString().padStart(2, "0") + "s ";
        tiempoFormateado += milisegundos.toString().padStart(3, "0") + "ms";

        return tiempoFormateado;
    };
}

function resetBtnFunc(resetBtn) {
    console.log(resetBtn);
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

window.onload = getDataFromLocalStorage;

function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: createSaveJSON() });
}

function getDataFromLocalStorage() {
    chrome.storage.local.get(["timeData"], function (result) {
        var obj = result.timeData;

        setData(obj);
    });

    setData(undefined);
}

function setData(timeData) {
    if (timeData == undefined) {
        return;
    }

    console.log("Setting data...");

    var segments = timeData.segments;
    var textTime = timeData.textTime;

    timeText.value = textTime;

    if (segments.length == 0) {
        return;
    }

    segment = segments[0];

    var objSegment = new Segment(segment.startTime);
    objSegment.endTime = segment.endTime;

    var contenedor = instancesContainer.children[0];

    if (objSegment.startTime != null && objSegment.endTime != null) {
        contenedor.querySelector("#instance-value").innerHTML =
            objSegment.toString();
    }

    contenedor.segment = objSegment;

    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];

        var objSegment = new Segment(segment.startTime);
        objSegment.endTime = segment.endTime;

        addInstance();

        var contenedor = instancesContainer.children[i];

        if (objSegment.startTime != null && objSegment.endTime != null) {
            contenedor.querySelector("#instance-value").innerHTML =
                objSegment.toString();
        }

        contenedor.segment = objSegment;
    }
}

function onLoad() {
    getDataFromLocalStorage();
}

function changeSelectedInstance(timeInput) {
    instancesContainer
        .querySelectorAll("#time-instance-btn")
        .forEach((button) => {
            button.setAttribute("checked", false);
        });

    timeInput.setAttribute("checked", true);
}

// ------------- Create JSON ----------------

function getAllSegments() {
    var contenedores = document.querySelectorAll(".instance");

    var obj = [];

    for (let i = 0; i < contenedores.length; i++) {
        const contenedor = contenedores[i];

        var segment = contenedor.segment;

        if (segment == null) {
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

    var jsonObj = {
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
    return totalSegment;
}

calculateBtn.addEventListener("click", () => {
    calculatedTimeText.value = calculateTotalTime().toString();
});

// ----------------- Add Instance -----------------

function addInstance() {
    // Crear los elementos para la nueva instancia
    var removeButton = document.createElement("button");



    // Configurar los atributos y contenido de los elementos
    var newChild = instancesContainer.childNodes[1].cloneNode(true);

    var resetBtn = newChild.querySelector("#reset-btn");

    resetBtn.addEventListener("click", () => {
        resetBtnFunc(resetBtn)
        });

    removeButton.textContent = "-";

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
        //saveDataToLocalStorage();
    });

    // Agregar los elementos al contenedor principal
    instancesContainer.appendChild(newChild);

    newChild.appendChild(removeButton);

    // Obtener el contenedor de instancias y agregar la nueva instancia
}

// ----------------- Event Listeners -----------------

copyBtn.addEventListener("click", () => {
    var text = calculatedTimeText.value;
    navigator.clipboard.writeText(text).then(function () {
        alert("Copied to clipboard");
    });
});

addBtn.addEventListener("click", () => {
    addInstance();
});

resetAllBtn.addEventListener("click", () => {
    var contenedores = document.querySelectorAll(".instance");

    timeText.value = "";

    for (let i = 1; i < contenedores.length; i++) {
        const contenedor = contenedores[i];

        contenedor.remove();
    }

    //resetBtnFunc();

    saveDataToLocalStorage();
});

resetBtn.addEventListener("click", () => {
    resetBtnFunc(resetBtn);
});

getExactTimeBtn.addEventListener("click", () => {
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
});

startTimeBtn.addEventListener("click", () => {
    if (timeText.value.trim() == "") {
        alert("You have not selected a second, hit 'Get exact time' first.");
        return;
    }
    var segment = new Segment(timeText.value);

    var contenedor = getSelectedInstance();

    if (contenedor == null) {
        alert("No se ha seleccionado ninguna instancia seleccionada");
        return;
    }

    contenedor.segment = segment;

    saveDataToLocalStorage();
});

endTimerBtn.addEventListener("click", () => {
    var contenedor = getSelectedInstance();

    if (contenedor == null) {
        alert("No se ha seleccionado ninguna instancia seleccionada");
        return;
    }

    var segment = contenedor.segment;

    if (segment == null) {
        alert("La instancia seleccionada no tiene un tiempo de inicio");
        return;
    }

    segment.endTime = timeText.value;

    contenedor.querySelector("#instance-value").innerHTML =
        contenedor.segment.toString();
    console.log(contenedor);
    saveDataToLocalStorage();
});

timeInput.addEventListener("click", () => {
    changeSelectedInstance(timeInput);
});

// ----------------- Execute -----------------

timeInput.setAttribute("checked", true);
