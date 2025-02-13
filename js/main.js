let laststep = null;

let WORLD_RADIUS = 50;

let lastwidth;
let lastheight;

let player;
let canvas;

let stars = [];
let worldLights = [];
let bullets = [];

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

    // Generate world lights just above the surface
    const LIGHT_RADIUS = 10.1; // Slightly larger than occlusion sphere radius (10)
    for (let i = 0; i < 300; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = LIGHT_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = LIGHT_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = LIGHT_RADIUS * Math.cos(phi);
        
        worldLights.push(new V3d(x, y, z));
    }

    render();
}

function addBullet(pos, vel) {
    bullets.push(new Bullet(pos, vel));
}

function render() {
    step();

    const canvas = document.getElementById('canvas');
    if (canvas.clientWidth != lastwidth || canvas.clientHeight != lastheight) {
        resize(canvas);
    }
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scene = new Scene(ctx);
    scene.setCamera(player.pos, player.facing, player.up);

    scene.drawCircle(new V3d(0, 10, 0), 1, 'red');
    scene.drawCircle(new V3d(1, 5, 0), 0.5, 'blue');

    player.render(scene);
    
    for (let i = 0; i < stars.length; i++) {
        scene.drawCircle(stars[i], 0.08, 'white');
    }

    // Render world lights
    for (let i = 0; i < worldLights.length; i++) {
        scene.drawCircle(worldLights[i], 0.15, 'yellow');
    }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].render(scene);
    }

    scene.addOcclusionSphere(new V3d(0, 0, 0), 10);

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
    
    // Update and filter bullets
    bullets = bullets.filter(bullet => {
        bullet.step(dt);
        // Remove bullets that go beyond WORLD_RADIUS
        return bullet.pos.length() <= WORLD_RADIUS;
    });

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