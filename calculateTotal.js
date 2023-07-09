const calculatedTimeText = document.querySelector("#calculated-time");
const calculateBtn = document.querySelector("#calculate-btn");

function calculateTotalTime() {
    var totalSeconds = 0;

    var segmets = document.querySelectorAll(".instance");

    var totalSegment = new Segment(0);

    debugger;

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
