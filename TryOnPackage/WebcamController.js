import { loadMeasurementPanel } from './dp.js';
import { setupFaceDetection } from './AngleDistance.js';


var targetElement;
var windowWebcamContainer;
var closeButton;



function InitWebcamView(targetElementID, onGotFaceMeasure){
    const video = document.getElementById('webcam');
    closeButton = document.getElementById("closeButton");
    windowWebcamContainer = document.getElementById("faceMeasureContainer");
    closeButton.addEventListener("click", closeWindow);
   
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
        setupFaceDetection(video); 
        video.srcObject = stream;
    })
    .catch(err => {
        console.error('Erro ao acessar a webcam: ', err);
    });
    
    const captureButton = document.getElementById("take-picture")
    const capturedPhoto = document.getElementById("foto")
    captureButton.addEventListener('click', () => {
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/png');
        capturedPhoto.src = dataURL;
        capturedPhoto.style.display = 'block';
        video.style.display = 'none';
        sessionStorage.setItem('imagemWebcam', dataURL);

        loadMeasurementPanel(targetElementID, onGotFaceMeasure);
        //window.location.href = 'foto.html';
    });
}

export default function loadWebcamPannel(targetElementID, onGotFaceMeasure){
    targetElement = document.getElementById(targetElementID);
    if (!document.getElementById("faceMeasureContainer")) {
        const moduleDir = new URL('.', import.meta.url).pathname;
        const htmlPath = moduleDir + 'WindowWebcam.html';
        fetch(htmlPath)
            .then(response => response.text())
            .then(html => {
                targetElement.innerHTML = "";
                targetElement.innerHTML = html;
                InitWebcamView(targetElementID ,onGotFaceMeasure);
            });
    }
}

function closeWindow(){
    windowWebcamContainer.style.display = "none";
    targetElement.innerHTML = "";
}