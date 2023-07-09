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
    }

    return jsonObj;
}


