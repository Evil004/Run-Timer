const getExactTimeBtn = document.querySelector("#exact-time-btn");
const startTimerBtn = document.querySelector("#start-time-btn");
const endTimerBtn = document.querySelector("#end-time-btn");
const resetBtn = document.querySelector("#reset-btn");
const resetAllBtn = document.querySelector("#reset-all-btn");
var player;

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
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        console.log(tabs);

        chrome.tabs.sendMessage(
            activeTabId,
            { message: "getExactTime", videoId: 0 },
            function (response) {
                timeText.value = response.response;
            }
        );
    });

});



var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player("ytplayer", {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });
}

function onPlayerReady(event) {
    // El reproductor de video está listo
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        events: {
            onReady: onPlayerReady,
        },
    });
}

function onPlayerReady(event) {
    // El reproductor de video está listo
}

startTimerBtn.addEventListener("click", () => {
    if (timeText.value.trim() == "") {
        alert("You have not selected a second, hit 'Get exact time' first.");
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
