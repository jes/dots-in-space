let laststep = null;

let lastwidth;
let lastheight;

let player;

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
    player = new Player();

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
    input.mouse.x = e.clientX;
    input.mouse.y = e.clientY;
    input.mouse.movementX = e.movementX;
    input.mouse.movementY = e.movementY;
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

init();