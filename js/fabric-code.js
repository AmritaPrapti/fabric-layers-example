import { fabric } from 'fabric';

const canvas = new fabric.Canvas('c');
let clipRect;
let designImage = null; // Store reference to the design image globally
const layerImages = {}; 
let currentSelectedImage;
let selectedLayer = 0;
const blendModes = {
    'normal': 'source-over',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    // Add more blend modes as needed
};

// Function to update design image based on clipRect changes
function updateImageForClipRect() {
    if (!designImage || !clipRect) {
        return; // Exit if there's no image or clipRect
    }

    const clipRectWidth = clipRect.width * clipRect.scaleX;
    const clipRectHeight = clipRect.height * clipRect.scaleY;
    const imageRatio = designImage.width / designImage.height;
    const clipRectRatio = clipRectWidth / clipRectHeight;
    let scale;

    if (imageRatio > clipRectRatio) {
        scale = clipRectWidth / designImage.width;  // Fit to width
    } else {
        scale = clipRectHeight / designImage.height; // Fit to height
    }

    designImage.set({
        left: clipRect.left,
        top: clipRect.top,
        scaleX: scale,
        scaleY: scale,
        clipPath: new fabric.Rect({
            originX: 'left',
            originY: 'top',
            left: 0, // Position relative to the image
            top: 0, // Position relative to the image
            width: clipRectWidth / scale, // Match clipRect dimensions
            height: clipRectHeight / scale, // Match clipRect dimensions
            fill: 'transparent', // No fill for clipping path
            absolutePositioned: true
        })
    });
    clipRect.set({ fill: 'transparent' });
    canvas.renderAll();
}

// Load and handle the image upload
function handleImageUpload(e, layerIndex) {
    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, function (img) {
            // Set the image to be selectable only if it's uploaded to the design layer
            img.selectable = (layerIndex === 3);
            layerImages[layerIndex] = img;
            currentSelectedImage = layerImages[selectedLayer] || null;

            if (layerIndex === 3) { // If it's the design layer
                designImage = img; // Set the global reference to the uploaded image
                updateImageForClipRect(); // Initial update to fit clipRect
            } else {
                // Scale other images to fit the canvas size
                const imgScaleX = canvas.width / img.width;
                const imgScaleY = canvas.height / img.height;
                img.set({
                    scaleX: imgScaleX,
                    scaleY: imgScaleY,
                    left: 0,
                    top: 0
                });
            }

            canvas.add(img);
            canvas.moveTo(img, layerIndex);
            canvas.renderAll();

             // Attach filters to the current image
            const brightnessFilter = new fabric.Image.filters.Brightness({
                brightness: 0
            });
            const contrastFilter = new fabric.Image.filters.Contrast({
                contrast: 0
            });
            const saturationFilter = new fabric.Image.filters.Saturation({
                saturation: 0
            });
            const hueFilter = new fabric.Image.filters.HueRotation({
                rotation: 0
            });

            img.filters.push(brightnessFilter, contrastFilter, saturationFilter, hueFilter);
        });
    };
    reader.readAsDataURL(e.target.files[0]);
}

document.getElementById('bg-upload').addEventListener('change', (e) => handleImageUpload(e, 0));
document.getElementById('main-upload').addEventListener('change', (e) => handleImageUpload(e, 1));
document.getElementById('color-upload').addEventListener('change', (e) => handleImageUpload(e, 2));
document.getElementById('design-upload').addEventListener('change', (e) => handleImageUpload(e, 3));


// Function to render layers with blend mode applied to currentSelectedImage and its below layer
function renderLayersWithBlendMode() {
    canvas.clear(); // Clear canvas before rendering

    // Check if the current layer and the layer below it exist
    let currentLayer = layerImages[selectedLayer];
    let belowLayer = null;

    // Find the closest available layer below the current layer
    for (let i = selectedLayer - 1; i >= 0; i--) {
        if (layerImages[i]) {
            belowLayer = layerImages[i];
            break;
        }
    }

    // Set blend mode to 'normal' if either layer is missing
    const blendMode = document.getElementById('blend-mode-select').value;
    console.log('blendModes[blendMode] :>> ', blendModes[blendMode]);

    // Set the blend mode for the current layer and the layer below it
    if (currentLayer && belowLayer) {
        currentLayer.globalCompositeOperation = blendModes[blendMode];
        belowLayer.globalCompositeOperation = blendModes[blendMode];
    }

    // Add all layers to the canvas
    for (let i = 0; i < 4; i++) {
        if (layerImages[i]) {
            canvas.add(layerImages[i]);
        }
    }

    canvas.renderAll();
}




document.getElementById('add-clip-area').addEventListener('click', function () {
    if (!clipRect) {
        clipRect = new fabric.Rect({
            left: 150,
            top: 150,
            width: 200,
            height: 150,
            fill: 'rgba(0,0,0,0.1)',
            cornerColor: 'red',
            cornerSize: 8,
            transparentCorners: false,
            hasRotatingPoint: true,
            perPixelTargetFind: true,
            selectable: true,
            evented: true, // Make sure it's evented (interactable)
            absolutePositioned: true
        });
        canvas.add(clipRect);
        canvas.setActiveObject(clipRect);
        canvas.renderAll(); // Force the canvas to re-render with the new object
        clipRect.on('modified', updateImageForClipRect); // Attach event listener to update image on clipRect changes
    } else {
        // If the clipRect already exists, ensure it's selectable and draggable
        clipRect.set({
            selectable: true,
            evented: true
        });
        canvas.setActiveObject(clipRect);
        canvas.renderAll();
    }
});


document.getElementById('layer-select').addEventListener('change', function() {
    console.log('this :>> ', this.value);
     selectedLayer = this.value;
    console.log('layerImages :>> ', layerImages);
    currentSelectedImage = layerImages[selectedLayer] || null;
    if (currentSelectedImage) {
        // canvas.setActiveObject(currentSelectedImage);
        canvas.renderAll();
    }
});


document.getElementById('brightness-slider').addEventListener('input', function() {
    if (currentSelectedImage) {
        const brightnessFilter = new fabric.Image.filters.Brightness({
            brightness: parseFloat(this.value)
        });
        currentSelectedImage.filters[0] = brightnessFilter; // Assuming brightness is the first filter
        currentSelectedImage.applyFilters();
        canvas.renderAll();
    }
});


document.getElementById('contrast-slider').addEventListener('input', function() {
    if (currentSelectedImage) {
        const contrastFilter = new fabric.Image.filters.Contrast({
            contrast: parseFloat(this.value)
        });
        currentSelectedImage.filters[1] = contrastFilter; // Assuming contrast is the second filter
        currentSelectedImage.applyFilters();
        canvas.renderAll();
    }
});

document.getElementById('saturation-slider').addEventListener('input', function() {
    if (currentSelectedImage) {
        const saturationFilter = new fabric.Image.filters.Saturation({
            saturation: parseFloat(this.value)
        });
        currentSelectedImage.filters[2] = saturationFilter; // Assuming saturation is the third filter
        currentSelectedImage.applyFilters();
        canvas.renderAll();
    }
});

document.getElementById('hue-slider').addEventListener('input', function() {
    if (currentSelectedImage) {
        const hueFilter = new fabric.Image.filters.HueRotation({
            rotation: parseFloat(this.value)
        });
        currentSelectedImage.filters[3] = hueFilter; // Assuming hue is the fourth filter
        currentSelectedImage.applyFilters();
        canvas.renderAll();
    }
});



// Event listener for blend mode selection
document.getElementById('blend-mode-select').addEventListener('change', renderLayersWithBlendMode);





