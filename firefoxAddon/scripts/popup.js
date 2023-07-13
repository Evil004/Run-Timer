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

// ----------------- Funcionalidad básica -----------------

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
        var seconds = this.getSeconds();
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var remainingSeconds = Math.floor(seconds % 60);
        var milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);

        var formattedTime = "";

        formattedTime += hours.toString().padStart(2, "0") + "h ";
        formattedTime += minutes.toString().padStart(2, "0") + "m ";
        formattedTime +=
            remainingSeconds.toString().padStart(2, "0") + "s ";
        formattedTime += milliseconds.toString().padStart(3, "0") + "ms";

        return formattedTime;
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
            var container = input.closest(".instance");

            return container;
        }
    }
}

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

    var container = instancesContainer.children[0];

    if (objSegment.startTime != null && objSegment.endTime != null) {
        container.querySelector("#time-instance-text").value =
            objSegment.toString();
    }

    container.segment = objSegment;

    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];

        var objSegment = new Segment(segment.startTime);
        objSegment.endTime = segment.endTime;

        addInstance();

        var container = instancesContainer.children[i];

        if (objSegment.startTime != null && objSegment.endTime != null) {
            container.querySelector("#time-instance-text").value =
                objSegment.toString();
        }

        container.segment = objSegment;
    }
}

function onLoad() {
    getDataFromLocalStorage();
}

// ------------- Crear JSON ----------------

function getAllSegments() {
    var containers = document.querySelectorAll(".instance");

    var obj = [];

    for (let i = 0; i < containers.length; i++) {
        const container = containers[i];

        var segment = container.segment;

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

//----------------- Calcular tiempo -----------------

function calculateTotalTime() {
    var totalSeconds = 0;

    var segments = document.querySelectorAll(".instance");

    var totalSegment = new Segment(0);

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].segment;
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

// ----------------- Agregar instancia -----------------

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
    var containers = document.querySelectorAll(".instance");

    timeText.value = "";

    for (let i = 1; i < containers.length; i++) {
        const container = containers[i];

        container.remove();
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
            function (response) {
                timeText.value = response.time;
            }
        );
    });
});

startTimerBtn.addEventListener("click", () => {
    if (timeText.value.trim() == "") {
        alert("No has seleccionado un segundo, primero haz clic en 'Obtener tiempo exacto'.");
        return;
    }
    var segment = new Segment(timeText.value);

    var container = getSelectedInstance();

    if (container == null) {
        alert("No se ha seleccionado ninguna instancia.");
        return;
    }

    container.segment = segment;

    saveDataToLocalStorage();
});

endTimerBtn.addEventListener("click", () => {
    var container = getSelectedInstance();

    if (container == null) {
        alert("No se ha seleccionado ninguna instancia.");
        return;
    }

    var segment = container.segment;

    if (segment == null) {
        alert("La instancia seleccionada no tiene un tiempo de inicio.");
        return;
    }

    segment.endTime = timeText.value;

    container.querySelector("#time-instance-text").value = segment.toString();
    saveDataToLocalStorage();
});
