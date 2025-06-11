import * as TryOnModule from "./TryOnPackage/TryOnModule.js";

document.addEventListener("DOMContentLoaded", () => {
  initPage();
});

function initPage() {
    console.log("Initializing page...");
    const button1 = document.getElementById("glasses1Button");
    const button2 = document.getElementById("glasses2Button");
    const button3 = document.getElementById("measureFaceButton");
    
    initGlassesButton(button1, "glassesStats/glasses1.json", "bodyID");
    initGlassesButton(button2, "glassesStats/glasses2.json", "bodyID");

    button3.addEventListener("click", function() {
        TryOnModule.WebcamPannel("bodyID", (result) => {
            const resultElement = document.getElementById("resultText");
            resultElement.innerHTML = result;
        });
    });
}


function initGlassesButton(buttonElement, modelStatsURL, parentTargetID) {
    fetch(modelStatsURL)
    .then(response => response.json())
    .then(newData => {
        buttonElement.addEventListener("click", function(){
            TryOnModule.TryOnPanel(newData, parentTargetID, (result) => {onTryOnComplete(result);});
        });
    });
}

function onTryOnComplete(callback){
    if(callback.selectedGlasses == true){
        const resultElement = document.getElementById("resultText");
        resultElement.innerHTML = JSON.stringify(callback.result);
    }
}
