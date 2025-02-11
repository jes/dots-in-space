const fullcircle = 180*Math.PI;

function Scene(ctx) {
    this.ctx = ctx;
    this.viewpoint = new V2d(0,0);
    this.viewz = 1.0;
    this.viewscale = 1200;
    this.distscale = 2;
    this.circles = [];
}

Scene.prototype.drawCircle = function(pos, z, r, col, opts) {
    let circle = this.project(pos, z, r);
    if (!circle) return;
    circle.col = col;
    circle.roady = pos.y;

    let ground = this.project(pos, 0, 0);
    circle.yground = ground.y;

    if (opts && opts.no_occlude) circle.no_occlude = true;

    this.circles.push(circle);
};

Scene.prototype.render = function() {
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.globalAlpha = 0.2;
    // get the nearest circles first
    this.circles.sort((a,b) => {
        return a.roady - b.roady;
    });

    // work out which circles are occluded by the road
    let highestroad = this.ctx.canvas.height;
    for (circle of this.circles) {
        if (circle.yground < highestroad) highestroad = circle.yground;
        if (circle.y > highestroad && !circle.no_occlude) circle.occluded = true;
    }

    for (circle of this.circles) {
        if (circle.occluded) continue;

        this.ctx.fillStyle = circle.col;

        for (let k = 1.0; k > 0; k -= 0.15) {
            this.ctx.beginPath();
            this.ctx.arc(circle.x, circle.y, circle.r*1.5*k*k, 0, fullcircle);
            this.ctx.fill();
        }
    }
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1.0;
};

Scene.prototype.project = function(pos, z, r) {
    const dy = 0.1;
    const dx = 0;
    const theta = Math.atan2(dx,dy);
    const posrel1 = pos.sub(this.viewpoint);
    const posrel = posrel1.rotate(theta);

    const zrel = z - this.viewz;

    // things behind the viewer are not visible
    if (posrel.y <= 0) return null;

    const dist = this.distscale * Math.sqrt(posrel.y*posrel.y + zrel*zrel);

    // things too close are not visible
    if (dist < 0.5) return null;

    const scaleratio = this.viewscale * this.ctx.canvas.width / 640;

    const screenx = (this.ctx.canvas.width/2) + scaleratio * (posrel.x / dist);
    const screeny = (this.ctx.canvas.height/2) - scaleratio * (zrel / dist);
    const screenr = scaleratio * (r / dist); // px

    return {
        x: screenx,
        y: screeny,
        r: screenr,
    };
};