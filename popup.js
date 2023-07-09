const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimerBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");
const timeText = document.querySelector("#time-text");
const instancesContainer = document.querySelector("#instances-container");
const resetAllBtn = document.querySelector("#reset-all-btn");

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

function resetBtnFunc() {
    resetBtn.parentNode.querySelector("#time-instance-text").value =
        "00h 00m 00s 000ms";
    resetBtn.parentNode.segment = undefined;
    saveDataToLocalStorage();
}

resetBtn.addEventListener("click", () => {
    resetBtnFunc();
});

getExactTimeBtn.addEventListener("click", () => {
    injectScript();

    saveDataToLocalStorage();
});

startTimerBtn.addEventListener("click", () => {
    if (timeText.value.trim() == "") {
        alert(
            "No se ha podido el tiempo, usa primero el botón de obtener tiempo"
        );
        return;
    }
    var segment = new Segment(timeText.value);

    var contenedor = getSelectedInstance();

    console.log(contenedor);

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
    chrome.storage.local.set({ timeData: createSaveJSON() });
}

function getDataFromLocalStorage() {
    debugger;
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
        contenedor.querySelector("#time-instance-text").value = objSegment.toString();
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

function injectScript() {
    chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(function (tabs) {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;

            return chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                func: GetExactSecond,
            });
        })
        .then(function (results) {
            timeText.value = results[0].result;
        })
        .catch(function (err) {
            alert("No se ha podido obtener el tiempo exacto");
        });
}

function GetExactSecond(selector) {
    return document.getElementsByClassName("video-stream html5-main-video")[0]
        .currentTime;
}
