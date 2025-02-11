const fullcircle = 180*Math.PI;

function Scene(ctx) {
    this.ctx = ctx;
    this.viewpoint = new V3d(0,0,0);
    this.viewscale = 1200;
    this.distscale = 2;
    this.circles = [];
}

Scene.prototype.drawCircle = function(pos, r, col, opts) {
    let circle = this.project(pos, r);
    if (!circle) return;
    circle.col = col;
    circle.roady = pos.y;

    if (opts && opts.no_occlude) circle.no_occlude = true;

    this.circles.push(circle);
};

Scene.prototype.render = function() {
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.globalAlpha = 0.2;
    // get the nearest circles first
    this.circles.sort((a,b) => {
        return a.dist - b.dist;
    });

    // TODO: circle occlusion; set circle.occluded = true if it is occluded by a dark sphere

    for (let circle of this.circles) {
        if (circle.occluded) continue;

        this.ctx.fillStyle = circle.col;

        this.ctx.beginPath();
        this.ctx.arc(circle.x, circle.y, circle.r, 0, fullcircle);
        this.ctx.fill();
    }
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1.0;
};

Scene.prototype.project = function(pos, r) {
    const dy = 0.1;
    const dx = 0;
    const theta = Math.atan2(dx,dy);
    const posrel1 = pos.sub(this.viewpoint);
    const posrel = posrel1.rotate(theta, 'z');

    // things behind the viewer are not visible
    if (posrel.y <= 0) return null;

    const dist = this.distscale * posrel.length();

    // things too close are not visible
    if (dist < 0.5) return null;

    const scaleratio = this.viewscale * this.ctx.canvas.width / 640;

    const screenx = (this.ctx.canvas.width/2) + scaleratio * (posrel.x / dist);
    const screeny = (this.ctx.canvas.height/2) - scaleratio * (posrel.z / dist);
    const screenr = scaleratio * (r / dist); // px

    return {
        x: screenx,
        y: screeny,
        dist: dist,
        r: screenr,
    };
};