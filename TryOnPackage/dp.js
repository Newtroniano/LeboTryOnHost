export { loadMeasurementPanel }

let dragging = null;
let currentHandle = null;
let offsetX, offsetY;

let rect = { x: 0.25, y: 0.35, width: 0.5, height: 0.3, angle: 0 };
let leftEye = { x: 0.4, y: 0.5 };  
let rightEye = { x: 0.6, y: 0.5 };

var targetElement;
var closeButton;

function InitMeasureScene(){
    const canvasBg = document.getElementById('canvasBg');
    const canvasFg = document.getElementById('canvasFg');
    const resultado = document.getElementById('resultado');
    const closeButton = document.getElementById("closeButton");

    closeButton.addEventListener("click", closeWindow);

    const bgCtx = canvasBg.getContext('2d');
    const fgCtx = canvasFg.getContext('2d');
    const imagemBase64= sessionStorage.getItem("imagemWebcam");
    window.addEventListener('resize', draw);

    function draw() {
        if(!canvasBg) return;
        canvasFg.width = canvasFg.offsetWidth;
        canvasFg.height = canvasFg.offsetHeight;
        const cw = canvasFg.width;
        const ch = canvasFg.height;
        const rx = rect.x * cw;
        const ry = rect.y * ch;
        const rw = rect.width * cw;
        const rh = rect.height * ch;
        const eyeR = Math.max(10, Math.min(cw, ch) * 0.03);
        const hsz = Math.max(8, cw * 0.03);

        fgCtx.clearRect(0, 0, cw, ch);

        // Desenhar o retângulo (cartão)
        fgCtx.save();
        fgCtx.translate(rx + rw / 2, ry + rh / 2);
        fgCtx.rotate(rect.angle);

        fgCtx.fillStyle = 'rgba(255, 0, 0, 0.12)';
        fgCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        fgCtx.lineWidth = Math.max(2, cw * 0.005);
        fgCtx.fillRect(-rw / 2, -rh / 2, rw, rh);
        fgCtx.strokeRect(-rw / 2, -rh / 2, rw, rh);

        fgCtx.restore();

        // Desenhar handle de rotação
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        const handleDist = 40;

        const topCenterX = cx + (rh / 2 + handleDist) * Math.sin(rect.angle);
        const topCenterY = cy - (rh / 2 + handleDist) * Math.cos(rect.angle);

        fgCtx.beginPath();
        fgCtx.arc(topCenterX, topCenterY, 10, 0, 2 * Math.PI);
        fgCtx.fillStyle = 'orange';
        fgCtx.fill();

        // Desenhar olhos
        [ ['leftEye', leftEye], ['rightEye', rightEye] ].forEach(([name, eye]) => {
        fgCtx.strokeStyle = 'rgba(255, 0, 0, 0.98)';
        const ex = eye.x * cw;
        const ey = eye.y * ch;

        // Círculo externo do olho
        fgCtx.beginPath();
        fgCtx.arc(ex, ey, eyeR, 0, 2 * Math.PI);
        fgCtx.stroke();

        // Cruz no centro
        fgCtx.strokeStyle = 'rgb(255, 0, 0)';
        const cr = eyeR * 0.6;
        fgCtx.beginPath();
        fgCtx.moveTo(ex - cr, ey);
        fgCtx.lineTo(ex + cr, ey);
        fgCtx.moveTo(ex, ey - cr);
        fgCtx.lineTo(ex, ey + cr);
        fgCtx.stroke();

        // Ponto no centro
        fgCtx.fillStyle = 'red';
        fgCtx.beginPath();
        fgCtx.arc(ex, ey, 4, 0, 2 * Math.PI);
        fgCtx.fill();
        });
        }

        function getRotationHandle(x, y) {
        const cw = canvasFg.width, ch = canvasFg.height;
        const rx = rect.x * cw, ry = rect.y * ch;
        const rw = rect.width * cw, rh = rect.height * ch;

        const cx = rx + rw / 2;
        const cy = ry + rh / 2;

        const handleDist = 40;
        const topCenterX = cx + (rh / 2 + handleDist) * Math.sin(rect.angle);
        const topCenterY = cy - (rh / 2 + handleDist) * Math.cos(rect.angle);

        const dist = Math.hypot(x - topCenterX, y - topCenterY);
        return dist < 10;
        }

        function getHandleUnderMouse(x, y) {
        const cw = canvasFg.width;
        const ch = canvasFg.height;
        const rx = rect.x * cw;
        const ry = rect.y * ch;
        const rw = rect.width * cw;
        const rh = rect.height * ch;
        const hsz = Math.max(8, cw * 0.03);

        const handles = {
        tl: { x: rx, y: ry },
        tr: { x: rx + rw, y: ry },
        bl: { x: rx, y: ry + rh },
        br: { x: rx + rw, y: ry + rh },
        };

        for (let k in handles) {
        const h = handles[k];
        if (
        x >= h.x - hsz && x <= h.x + hsz &&
        y >= h.y - hsz && y <= h.y + hsz
        ) return k;
        }
        return null;
        }

        function isInside(x, y, obj, radius = 0) {
        const cw = canvasFg.width, ch = canvasFg.height;

        if (obj.width !== undefined) {
        const rx = obj.x * cw;
        const ry = obj.y * ch;
        const rw = obj.width * cw;
        const rh = obj.height * ch;

        const cx = rx + rw / 2;
        const cy = ry + rh / 2;

        const dx = x - cx;
        const dy = y - cy;

        const cos = Math.cos(-rect.angle);
        const sin = Math.sin(-rect.angle);

        const xRot = dx * cos - dy * sin;
        const yRot = dx * sin + dy * cos;

        return Math.abs(xRot) < rw / 2 && Math.abs(yRot) < rh / 2;
        } else {
        const cx = obj.x * cw;
        const cy = obj.y * ch;
        return Math.hypot(x - cx, y - cy) <= radius;
        }
        }

        canvasFg.addEventListener('mousedown', e => {
        const r = canvasFg.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        if (getRotationHandle(x, y)) {
        dragging = 'rotate';
        } else {
        currentHandle = getHandleUnderMouse(x, y);
        if (currentHandle) {
        dragging = 'resize';
        } else if (isInside(x, y, leftEye, Math.min(canvasFg.width, canvasFg.height) * 0.03)) {
        dragging = 'leftEye';
        } else if (isInside(x, y, rightEye, Math.min(canvasFg.width, canvasFg.height) * 0.03)) {
        dragging = 'rightEye';
        } else if (isInside(x, y, rect)) {
        dragging = 'rect';
        } else {
        dragging = null;
        }
        }
        offsetX = x;
        offsetY = y;
        });

        canvasFg.addEventListener('mousemove', e => {
        if (!dragging) return;

        const r = canvasFg.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const dx = x - offsetX;
        const dy = y - offsetY;
        const cw = canvasFg.width;
        const ch = canvasFg.height;
        const pdx = dx / cw;
        const pdy = dy / ch;

        if (dragging === 'rect') {
        rect.x += pdx;
        rect.y += pdy;
        } else if (dragging === 'leftEye') {
        leftEye.x += pdx;
        leftEye.y += pdy;
        } else if (dragging === 'rightEye') {
        rightEye.x += pdx;
        rightEye.y += pdy;
        } else if (dragging === 'resize') {
        if (currentHandle === 'tl') {
        rect.x += pdx;
        rect.y += pdy;
        rect.width -= pdx;
        rect.height -= pdy;
        } else if (currentHandle === 'tr') {
        rect.y += pdy;
        rect.width += pdx;
        rect.height -= pdy;
        } else if (currentHandle === 'bl') {
        rect.x += pdx;
        rect.width -= pdx;
        rect.height += pdy;
        } else if (currentHandle === 'br') {
        rect.width += pdx;
        rect.height += pdy;
        }
        } else if (dragging === 'rotate') {
        const rx = rect.x * cw + rect.width * cw / 2;
        const ry = rect.y * ch + rect.height * ch / 2;
        rect.angle = Math.atan2(y - ry, x - rx) + Math.PI / 2;
        }

        offsetX = x;
        offsetY = y;
        draw();
        });

        canvasFg.addEventListener('mouseup', () => {
        dragging = null;
        currentHandle = null;
        });

        // Upload da imagem
        if (imagemBase64) {
            const img = new Image();
            img.onload = () => {
            [canvasBg, canvasFg].forEach(c => {
                c.width = img.width;
                c.height = img.height;
            });
                bgCtx.clearRect(0, 0, canvasBg.width, canvasBg.height);
                bgCtx.drawImage(img, 0, 0);
                fgCtx.clearRect(0, 0, canvasFg.width, canvasFg.height);
            draw();
            };
            img.src = imagemBase64;
            } 
        else {
            console.log('Nenhuma imagem encontrada no sessionStorage.');
        }
}

        // Cálculo da distância pupilar
function calcularDistancia() {
        const pontos = [
        { x: rect.x, y: rect.y + rect.height },                         
        { x: rect.x + rect.width, y: rect.y + rect.height },            
        { x: leftEye.x, y: leftEye.y },                               
        { x: rightEye.x, y: rightEye.y }                               
        ];

        const dCartao = Math.hypot(pontos[1].x - pontos[0].x, pontos[1].y - pontos[0].y);
        const larguraCartaoCm = 8.56;
        const pxPorCm = dCartao / larguraCartaoCm;

        const dOlhos = Math.hypot(pontos[3].x - pontos[2].x, pontos[3].y - pontos[2].y);
        const dOlhosCm = dOlhos / pxPorCm;


        console.log(`Distância entre os olhos: ${dOlhosCm.toFixed(2)} cm`)
        return `Distância entre os olhos: ${dOlhosCm.toFixed(2)} cm`;
}

function loadMeasurementPanel(targetElementID, onGotFaceMeasure) {
    targetElement = document.getElementById(targetElementID);
    if (!document.getElementById("drawFaceContainer")) {
        const moduleDir = new URL('.', import.meta.url).pathname;
        const htmlPath = moduleDir + 'WindowDraw.html';
        fetch(htmlPath)
            .then(response => response.text())
            .then(html => {
                targetElement.innerHTML = "";
                targetElement.innerHTML = html;

                InitMeasureScene();
                const calcularBtn = document.getElementById('calculateDistanceButton');
                calcularBtn.addEventListener('click', () => {
                    const distancia = calcularDistancia();
                    onGotFaceMeasure(distancia);
                });
            });
    }
}

function closeWindow(){
        targetElement.innerHTML = "";
}
