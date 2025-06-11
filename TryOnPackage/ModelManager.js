export { InsertNewTextures, InsertNewModels, switchMaterialWithID, getSelectedTexturesArray };

var currentParts;
var selectedTexturesArray = [];

function getSelectedTexturesArray(){
  return selectedTexturesArray;
}

function InsertNewTextures(parts){
  selectedTexturesArray = [];
  const textureAssets = document.getElementById("textureAssets");
  textureAssets.querySelectorAll(".textureAsset").forEach(el =>{
    el.remove();
  });


  if(parts && Array.isArray(parts)){
    selectedTexturesArray = [parts.length];
    parts.forEach(part => {
      currentParts = parts;
      if(part.textures){
        part.textures.forEach(texture => {
          const newTexture = document.createElement('img');
          newTexture.setAttribute('id', part.title + "_" + texture.name);
          newTexture.setAttribute('class', 'textureAsset');
          newTexture.setAttribute('src', texture.url);
          textureAssets.appendChild(newTexture);
        });
      }
    });
  }
}

function InsertNewModels(parts){
  const modelEntityElement = document.getElementById("modelEntityID");
  const models = modelEntityElement.querySelectorAll(".model");
  for (let i = 0; i < models.length; i++) {
    console.log("Removing model: ", models[i].id);
    models[i].remove();
  }

  if(parts && Array.isArray(parts)){
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if(part.title && part.modelURL){

        if(part.textures || Array.isArray(part.textures)){        
          selectedTexturesArray[i] = {
            model : currentParts[i].title,
            texture : currentParts[i].textures[0]
          };
        }
        // else{
        //   selectedTexturesArray[i] = {
        //     model : currentParts[i].title
        //   };
        // }


        const newModel = document.createElement('a-gltf-model');
        newModel.setAttribute('id', part.title);
        newModel.setAttribute('class', 'model');
        newModel.setAttribute('src', part.modelURL);
        newModel.setAttribute('position', '0 0 0');
        newModel.setAttribute('scale', '7.75 7.75 7.75');
        newModel.setAttribute('rotation', '0 0 0');
        modelEntityElement.appendChild(newModel);

        newModel.addEventListener('model-loaded', () => {
          newModel.object3D.traverse((node) => {
            if (node.isMesh) {
              node.material.depthTest = true;
              node.material.depthWrite = true; // set to true if your model needs transparency
              node.renderOrder = 1; // ensure it's rendered after the occluder
            }
          });
        });
      }
    }
  }
}


function switchMaterialWithID(textureId, modelId, modelIndex, textureIndex) {
  const texture = document.getElementById(textureId).getAttribute('src');
  const textureLoader = new THREE.TextureLoader();
  const targetModel = document.getElementById(modelId);

  try{
    selectedTexturesArray[modelIndex] = {
      model : currentParts[modelIndex].title,
      texture : currentParts[modelIndex].textures[textureIndex]
    };
  }
  catch(e){
    console.error("Error setting index", e);
  }
  if (!targetModel) {
    console.error('Target model not found!');
    return;
  }

  textureLoader.load(texture, (newTexture) => {
    targetModel.object3D.traverse((node) => {
      if (node.isMesh) {
          const material = node.material;
          if (material.map) material.map.dispose();
          material.map = newTexture;
          material.needsUpdate = true;
      }
    });
  });

  console.log("Selected textures array: ", selectedTexturesArray);
}


