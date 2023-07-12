const timeText = document.querySelector("#time-text");
const instancesContainer = document.querySelector("#instances-container");
const sendMessageBtn = document.querySelector("#send-msg-btn");
const videoSelect = document.querySelector("#video-select");
const calculatedTimeText = document.querySelector("#calculated-time");
const calculateBtn = document.querySelector("#calculate-btn");
const addBtn = document.querySelector("#add-btn");
const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimerBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");
const resetAllBtn = document.querySelector("#reset-all-btn");

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
        var segundos = this.getSeconds();
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

function resetBtnFunc() {
    resetBtn.parentNode.querySelector("#time-instance-text").value =
        "00h 00m 00s 000ms";
    resetBtn.parentNode.segment = undefined;
    saveDataToLocalStorage();
}

function getSelectedInstance() {
    var radioInputs = document.querySelectorAll('input[type="radio"]');

    for (var i = 0; i < radioInputs.length; i++) {
        var input = radioInputs[i];

        // Verificar si el radio input está seleccionado

        if (input.checked) {
            // Obtener el contenedor más cercano con la clase "contenedor"
            var contenedor = input.closest(".instance");

            return contenedor;
        }
    }
}

window.onload = getDataFromLocalStorage;

function saveDataToLocalStorage() {
    browser.storage.local.set({ timeData: createSaveJSON() });
}

function getDataFromLocalStorage() {
    browser.storage.local.get(["timeData"], function (result) {
        var obj = result.timeData;

        setData(obj);
    });

    setData(undefined);
}

function setData(timeData) {
    if (timeData == undefined) {
        return;
    }

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
        contenedor.querySelector("#time-instance-text").value =
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
            contenedor.querySelector("#time-instance-text").value =
                objSegment.toString();
        }

        contenedor.segment = objSegment;
    }
}

function onLoad() {
    getDataFromLocalStorage();
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
    var container = document.createElement("div");
    var selectButton = document.createElement("input");
    var timeInput = document.createElement("input");
    var removeButton = document.createElement("button");
    var resetButton = document.createElement("button");

    // Configurar los atributos y contenido de los elementos
    container.classList.add("instance");

    selectButton.type = "radio";
    selectButton.name = "select-instance";
    selectButton.checked = true;

    resetButton.textContent = "↻";
    removeButton.textContent = "–";

    timeInput.type = "text";
    timeInput.id = "time-instance-text";
    timeInput.placeholder = "00h 00m 00s 000ms";
    timeInput.disabled = true;

    removeButton.addEventListener("click", () => {
        container.remove();
        saveDataToLocalStorage();
    });

    resetButton.addEventListener("click", () => {
        timeInput.value = "00h 00m 00s 000ms";
        resetButton.parentNode.segment = undefined;
        saveDataToLocalStorage();
    });

    // Agregar los elementos al contenedor principal
    container.appendChild(selectButton);
    container.appendChild(timeInput);
    container.appendChild(resetButton);
    container.appendChild(removeButton);

    // Obtener el contenedor de instancias y agregar la nueva instancia
    var instancesContainer = document.getElementById("instances-container");
    instancesContainer.appendChild(container);
}

// ----------------- Event Listeners -----------------

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

    resetBtnFunc();

    saveDataToLocalStorage();
});

resetBtn.addEventListener("click", () => {
    resetBtnFunc();
});

getExactTimeBtn.addEventListener("click", () => {
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


startTimerBtn.addEventListener("click", () => {
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

    contenedor.querySelector("#time-instance-text").value = segment.toString();
    saveDataToLocalStorage();
});
