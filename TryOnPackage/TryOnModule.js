import loadTryOnPanel  from './TryOnController.js';
import loadWebcamPannel from './WebcamController.js';


function loadTryOnStyle() {
    if (!document.getElementById('tryon-style')) {
        const link = document.createElement('link');
        link.id = 'tryon-style';
        link.rel = 'stylesheet';
        // Build the path relative to this module
        link.href = new URL('./TryOnStyle.css', import.meta.url).pathname;
        document.head.appendChild(link);
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function loadDependencies() {
    await loadScript('TryOnPackage/aframe.min.js');
    await loadScript('TryOnPackage/mindar-face-aframe.prod.js');
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadDependencies();
    loadTryOnStyle();
});

export function TryOnPanel(modelStats, parentTargetID, callback) {
    loadTryOnPanel(modelStats, parentTargetID, callback);
}

export function WebcamPannel(parentTargetID, callback) {
    loadWebcamPannel(parentTargetID, callback);
}
