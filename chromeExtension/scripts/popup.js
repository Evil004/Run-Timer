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

window.onload = getDataFromLocalStorage;

function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: createSaveJSON() });
}

function getDataFromLocalStorage() {
    chrome.storage.local.get(["timeData"], function (result) {
        var obj = result.timeData;

        setData(obj);

        var selected = result.timeData.selected;

        console.log(instancesContainer.childNodes[selected].querySelector("#time-instance-btn"));

        changeSelectedInstance( instancesContainer.childNodes[selected].querySelector("#time-instance-btn"));
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
    var text = calculatedTimeText.value;
    navigator.clipboard.writeText(text).then(function () {
        alert("Copied to clipboard");
    });
});

addBtn.addEventListener("click", () => {
    addInstance();
    saveDataToLocalStorage();
});

resetAllBtn.addEventListener("click", () => {
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
    if (timeText.value.trim() == "" || timeText.value == "0.0") {
        alert("You have not selected a second, hit 'Get exact time' first.");
        return;
    }
    var segment = new Segment(timeText.value);

    var contenedor = getSelectedInstance();

    if (contenedor == null) {
        alert("No instance selected.");
        return;
    }

    contenedor.segment = segment;

    saveDataToLocalStorage();
});

endTimerBtn.addEventListener("click", () => {
    var contenedor = getSelectedInstance();

    if (contenedor == null) {
        alert("No instance selected");
        return;
    }

    var segment = contenedor.segment;

    if (segment == null || segment.startTime == null) {
        alert("The selected instance does not have a start time");
        return;
    }

    segment.endTime = timeText.value;

    contenedor.querySelector("#instance-value").innerHTML =
        contenedor.segment.toString();
    saveDataToLocalStorage();
});

timeInput.addEventListener("click", () => {
    changeSelectedInstance(timeInput);
});

framerateInput.addEventListener("change", () => {
    saveDataToLocalStorage();
});

// ----------------- Execute -----------------

timeInput.setAttribute("checked", true);
