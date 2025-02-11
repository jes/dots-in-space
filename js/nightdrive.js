let laststep = null;
let observer;

let lastwidth;
let lastheight;

const started = Date.now();
const musiclabeltime = 5000; // ms

function init() {
    const canvas = document.getElementById('canvas');
    resize(canvas);

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
    scene.viewpoint = new V3d(0, 0, 0);

    const label = document.getElementById('clickformusic');
    label.style.top = `${canvas.height/2 - 100}px`;
    label.style.left = `${canvas.width/2 - label.clientWidth/2}px`;

    const time = Date.now() - started;
    if (time < musiclabeltime) {
        const col = (musiclabeltime-time) * (200/musiclabeltime);
        label.style.color = `rgb(${col}, ${col}, ${col})`;
    } else {
        label.style.display = 'none';
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

init();

let playing = false;
document.getElementById('canvas').onclick = function() {
    if (playing) document.getElementById('audio').pause();
    else document.getElementById('audio').play();
    playing = !playing;
}
