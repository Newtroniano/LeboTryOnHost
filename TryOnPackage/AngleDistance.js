const TARGET_DISTANCE = 30; 
const DISTANCE_MARGIN = 10; // Aumentada para cobrir até 40cm (30±10)
const ANGLE_MARGIN = 15; 
let hasAlerted = false; 

function showToast(message, soundUrl) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    toast.style.fontFamily = 'Arial, sans-serif';
    toast.style.fontSize = '16px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play().catch(e => console.log("Não foi possível tocar o som:", e));
    }
    
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
export function setupFaceDetection(videoElement) {
    const canvasElement = document.createElement('canvas');
    videoElement.parentNode.insertBefore(canvasElement, videoElement.nextSibling);
    const canvasCtx = canvasElement.getContext('2d');

    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        if (results.multiFaceLandmarks) {
            for (const landmarks of results.multiFaceLandmarks) {
                drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
                
                const { pitch, yaw, roll, distance } = estimateHeadPose(landmarks, canvasElement.width, canvasElement.height);
                
                console.log(`Distância: ${distance.toFixed(1)}cm | Pitch: ${pitch.toFixed(1)}° | Yaw: ${yaw.toFixed(1)}° | Roll: ${roll.toFixed(1)}°`);
                
                const isDistanceValid = Math.abs(distance - TARGET_DISTANCE) <= DISTANCE_MARGIN;
                const isAngleValid = (
                    Math.abs(pitch) <= ANGLE_MARGIN &&
                    Math.abs(yaw) <= ANGLE_MARGIN &&
                    Math.abs(roll) <= ANGLE_MARGIN
                );
                
                if (isDistanceValid && isAngleValid) {
                    canvasCtx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
                    canvasCtx.font = 'bold 24px Arial';
                    canvasCtx.fillStyle = 'white';
                    canvasCtx.textAlign = 'center';
                    canvasCtx.fillText('✓ Posição Ideal', canvasElement.width / 2, canvasElement.height / 2);
                    
                    if (!hasAlerted) {
                        showToast('Posição perfeita! (30-40cm e ângulos corretos)', 'TryOnPackage/tindeck_1.mp3');
                        hasAlerted = true;
                        
                        setTimeout(() => {
                            hasAlerted = false;
                        }, 5000);
                    }
                } else {
                    hasAlerted = false;
                    
                    // Mostra feedback sobre o que precisa ajustar
                    let feedback = [];
                    if (!isDistanceValid) {
                        feedback.push(`Distância: ${distance.toFixed(1)}cm (ideal 30-40cm)`);
                    }
                    if (Math.abs(pitch) > ANGLE_MARGIN) feedback.push(`Inclinação: ${pitch.toFixed(1)}°`);
                    if (Math.abs(yaw) > ANGLE_MARGIN) feedback.push(`Rotaçao: ${yaw.toFixed(1)}°`);
                    if (Math.abs(roll) > ANGLE_MARGIN) feedback.push(`Inclinaçao lateral: ${roll.toFixed(1)}°`);
                    
                    canvasCtx.font = '16px Arial';
                    canvasCtx.fillStyle = 'white';
                    canvasCtx.textAlign = 'left';
                    feedback.forEach((text, i) => {
                        canvasCtx.fillText(text, 20, 30 + (i * 20));
                    });
                    
                    canvasCtx.font = 'bold 20px Arial';
                    canvasCtx.textAlign = 'center';
                    canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    canvasCtx.fillText('Ajuste sua posição', canvasElement.width / 2, 40);
                }
            }
        }
        canvasCtx.restore();
    });

    new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480,
    }).start();
}

function estimateHeadPose(landmarks, imageWidth, imageHeight) {
    const imagePoints = [
        [landmarks[4].x * imageWidth, landmarks[4].y * imageHeight],  // Ponta do nariz
        [landmarks[152].x * imageWidth, landmarks[152].y * imageHeight],  // Queixo
        [landmarks[33].x * imageWidth, landmarks[33].y * imageHeight],  // Olho esquerdo
        [landmarks[263].x * imageWidth, landmarks[263].y * imageHeight],  // Olho direito
    ];

    const focalLength = imageWidth;
    const center = [imageWidth / 2, imageHeight / 2];
    
    const pitch = (imagePoints[0][1] - center[1]) / focalLength * 90;
    const yaw = (imagePoints[0][0] - center[0]) / focalLength * 90;
    const roll = Math.atan2(
        imagePoints[3][1] - imagePoints[2][1],
        imagePoints[3][0] - imagePoints[2][0]
    ) * (180 / Math.PI);

    const eyeDistPixels = Math.sqrt(
        Math.pow(imagePoints[3][0] - imagePoints[2][0], 2) +
        Math.pow(imagePoints[3][1] - imagePoints[2][1], 2)
    );
    
    const realEyeDist = 6.5;  // Distância média entre olhos em cm
    
    const distance = (realEyeDist * focalLength) / eyeDistPixels;

    return {
        pitch: pitch,
        yaw: yaw,
        roll: roll,
        distance: distance
    };
}