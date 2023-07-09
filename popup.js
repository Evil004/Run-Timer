const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimerBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");
const timeText = document.querySelector("#time-text");

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

getExactTimeBtn.addEventListener("click", () => {
    injectScript();
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

        
    contenedor.querySelector('#time-instance-text').value = segment.toString();
    

    

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
    };
}



window.onload = getDataFromLocalStorage;
window.onbeforeunload = saveDataToLocalStorage;

function saveDataToLocalStorage() {
    chrome.storage.local.set({ timeData: obj });
}

function getDataFromLocalStorage() {
    chrome.storage.local.get("timeData", function (result) {
        if (result.timeData) {
            obj = result.timeData;
        }
    });
}
function padZero(number) {
    return number.toString().padStart(2, "0");
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
