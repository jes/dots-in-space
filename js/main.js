let laststep = null;

let WORLD_RADIUS = 50;

let lastwidth;
let lastheight;

let player;
let canvas;

let stars = [];

// Input state
const input = {
    keys: {},
    mouse: {
        x: 0,
        y: 0,
        clicked: false,
        movementX: 0,
        movementY: 0
    }
};

function init() {
    canvas = document.getElementById('canvas');
    player = new Player();
    
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    for (let i = 0; i < 1000; i++) {
        // Generate random spherical coordinates
        const theta = Math.random() * 2 * Math.PI;  // Azimuthal angle (0 to 2π)
        const phi = Math.acos(2 * Math.random() - 1);  // Polar angle (0 to π)
        
        // Convert spherical to Cartesian coordinates
        const x = WORLD_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = WORLD_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = WORLD_RADIUS * Math.cos(phi);
        
        stars.push(new V3d(x, y, z));
    }

    render();
}

function render() {
    step();

    const canvas = document.getElementById('canvas');
    if (canvas.clientWidth != lastwidth || canvas.clientHeight != lastheight) {
        resize(canvas);
    }
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(1,1,1,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scene = new Scene(ctx);
    scene.setCamera(player.pos, player.facing, player.roll);

    scene.drawCircle(new V3d(0, 10, 0), 1, 'red');
    scene.drawCircle(new V3d(1, 5, 0), 0.5, 'blue');

    player.render(scene);
    
    for (let i = 0; i < stars.length; i++) {
        scene.drawCircle(stars[i], 0.1, 'white');
    }

    scene.render();

    window.requestAnimationFrame(render);
}

function step() {
    const now = Date.now();
    if (!laststep) {
        laststep = now;
        return;
    }

    const dt = (now - laststep) / 1000;
    laststep = now;

    player.step(dt, input);

    // Reset mouse movement after each frame
    input.mouse.movementX = 0;
    input.mouse.movementY = 0;
}

function resize(canvas) {
    lastwidth = canvas.width = canvas.clientWidth;
    lastheight = canvas.height = canvas.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

// Keyboard events
document.addEventListener('keydown', (e) => {
    input.keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    input.keys[e.key.toLowerCase()] = false;
});

// Mouse events
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        input.mouse.movementX = e.movementX || 0;
        input.mouse.movementY = e.movementY || 0;
        console.log(input.mouse.movementX, input.mouse.movementY);
    } else {
        input.mouse.movementX = 0;
        input.mouse.movementY = 0;
    }
    input.mouse.x = e.clientX;
    input.mouse.y = e.clientY;
});

document.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        input.mouse.clicked = true;
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 0) { // Left click
        input.mouse.clicked = false;
    }
});

// Add pointer lock change handler
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        canvas.style.cursor = 'none';
    } else {
        canvas.style.cursor = 'pointer';
    }
});

init();