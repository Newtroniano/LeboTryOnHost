import { InsertNewTextures, InsertNewModels, switchMaterialWithID, getSelectedTexturesArray } from './ModelManager.js';

var glassesTitle;


var targetElement;
var windowtryOnContainer;
var closeButton;
var glassesTitle;
var price;

var addToCartButton;

var currentSelectedGlasses;

function init(glassesData, onAddToCart){

    currentSelectedGlasses = {
        name: glassesData.name
    }

    windowtryOnContainer = document.getElementById("tryOnContainer");
    glassesTitle = document.getElementById("glassesTitle");
    price = document.getElementById("price");
    closeButton = document.getElementById("closeButton");
    addToCartButton = document.getElementById("addToCartButton");

    addToCartButton.addEventListener("click", function() {
        onAddToCartClicked(onAddToCart);
    });


    windowtryOnContainer.style.display = "flex";
    glassesTitle.innerHTML = glassesData.name;
    price.innerHTML = glassesData.price;

    closeButton.addEventListener("click", closeWindow);
    

    const controllersDiv = document.getElementById("partsDiv");
    controllersDiv.querySelectorAll(".partDescriptor").forEach(el => el.remove());

    for(let u = 0; u < glassesData.parts.length; u++){
        const currentPartDiv = document.createElement("div");
        currentPartDiv.className = "partDescriptor";
        const part = glassesData.parts[u];

        if(part.textures && Array.isArray(part.textures)){
            const partName = document.createElement("p");
            partName.textContent = part.title;
            currentPartDiv.appendChild(partName);
            const colorsCompartiment = document.createElement("div");
            colorsCompartiment.className = "colorsCompartiment";

            for(let i = 0; i < part.textures.length; i++){
                const texture = part.textures[i];
                const btn = document.createElement("button");
                btn.className = "colorButton";
                btn.title = texture.name;
                // Optionally set background image or color
                btn.style.backgroundColor = texture.previewColor;
                //btn.style.backgroundImage = `url(${texture.url})`;
                btn.style.backgroundSize = "cover";
                // Add event listener if needed
                // btn.addEventListener("click", () => { ... });
                btn.addEventListener("click", ()=>{
                    switchMaterialWithID(part.title + "_" + texture.name, part.title, u, i);
                });
                colorsCompartiment.appendChild(btn);
            }
            currentPartDiv.appendChild(colorsCompartiment);
            controllersDiv.appendChild(currentPartDiv);
        }
    }

    // glassesData.parts.forEach(part => {
    //     const currentPartDiv = document.createElement("div");
    //     currentPartDiv.className = "partDescriptor";
    //     // If textures exist, create color buttons
        
    //     if (part.textures && Array.isArray(part.textures)) {
    //         const partName = document.createElement("p");
    //         partName.textContent = part.title;
            
    //         currentPartDiv.appendChild(partName);
    //         const colorsCompartiment = document.createElement("div");
    //         colorsCompartiment.className = "colorsCompartiment";

    //         for (let i = 0; i < part.textures.length; i++) {
    //             const texture = part.textures[i];
    //             const btn = document.createElement("button");
    //             btn.className = "colorButton";
    //             btn.title = texture.name;
    //             // Optionally set background image or color
    //             btn.style.backgroundColor = texture.previewColor;
    //             //btn.style.backgroundImage = `url(${texture.url})`;
    //             btn.style.backgroundSize = "cover";
    //             // Add event listener if needed
    //             // btn.addEventListener("click", () => { ... });
    //             btn.addEventListener("click", ()=>{
    //                 switchMaterialWithID(part.title + "_" + texture.name, part.title, i);
    //             });
    //             colorsCompartiment.appendChild(btn);
    //         }
    //         currentPartDiv.appendChild(colorsCompartiment);
    //         controllersDiv.appendChild(currentPartDiv);
    //     }


    // });
    InsertNewTextures(glassesData.parts);
    InsertNewModels(glassesData.parts);
    
    setTimeout(() => {
        const occluder = document.querySelector('[mindar-face-default-face-occluder]');
        if (occluder) {
        occluder.parentNode.removeChild(occluder);
        }
  }, 1000);
}


function onAddToCartClicked(onAddToCartCallback){
    const currentSelectedTextures = getSelectedTexturesArray();
    const result = {
        selectedGlasses: true,
        result: {
            name: currentSelectedGlasses.name,
        }
    };

    let hasTextures = false;
    for(let i = 0; i < currentSelectedTextures.length; i++){
        if(currentSelectedTextures[i].texture){
            hasTextures = true;
            break;
        }
    }

    if(hasTextures){
        result.result.textures = currentSelectedTextures;
    }
    onAddToCartCallback(result);
    closeWindow();
}


export default function loadTryOnPanel(glassesData, targetElementID, onAddToCart) {
    targetElement = document.getElementById(targetElementID);
    if (!document.getElementById("tryOnContainer")) {
        const moduleDir = new URL('.', import.meta.url).pathname;
        const htmlPath = moduleDir + 'WindowTryOn.html';
        fetch(htmlPath)
            .then(response => response.text())
            .then(html => {
                targetElement.innerHTML = "";
                targetElement.innerHTML = html;

                const circleOccluder = document.getElementById("circleOccluder");
                const src = circleOccluder.getAttribute('src');
                if (circleOccluder) {
                     circleOccluder.setAttribute('src', moduleDir + src.replace('./', ''));
                     console.log("switched src");
                }
                console.log("circleOccluder src: ", circleOccluder.getAttribute('src'));
                init(glassesData, onAddToCart);
            });
    }
    else{
        init(glassesData, onAddToCart);
    }
}

function closeWindow(){
    windowtryOnContainer.style.display = "none";
    targetElement.innerHTML = "";
}