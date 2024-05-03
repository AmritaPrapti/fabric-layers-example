const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
    throw 'Unable to initialize WebGL';
}

// Load, compile and link shaders
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    throw 'Unable to initialize the shader program';
}

gl.useProgram(shaderProgram);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Define an array of positions for the square
const positions = [
    1.0,  1.0,
   -1.0,  1.0,
    1.0, -1.0,
   -1.0, -1.0,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Collect all the info needed to use the shader program.
// Look up locations
const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
gl.enableVertexAttribArray(vertexPosition);
gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

// Texture coordinates buffer setup
const textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // X, Y
    1.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,
]), gl.STATIC_DRAW);

const textureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
gl.enableVertexAttribArray(textureCoord);
gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);

// Uniform locations
const uMousePosition = gl.getUniformLocation(shaderProgram, 'uMousePosition');
const uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');

// Load and bind texture
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
// Set up texture parameters and image source, assuming an image is available

let mouseDown = false;
const mousePosition = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (mouseDown) {
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;
    }
});

function render() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uMousePosition, mousePosition.x / canvas.width, 1 - mousePosition.y / canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}

render();
