const fullcircle = 180*Math.PI;

function Scene(ctx) {
    this.ctx = ctx;
    this.viewpoint = new V3d(0,0,0);
    this.viewdir = new V3d(0,1,0);  // Looking along +Y by default
    this.viewscale = 1200;
    this.distscale = 2;
    this.circles = [];
    
    // Initialize view basis vectors
    this._right = new V3d(1,0,0);
    this._up = new V3d(0,0,1);
    this._forward = this.viewdir.normalize();
}

Scene.prototype.setCamera = function(position, direction, roll = 0) {
    this.viewpoint = position;
    this.viewdir = direction.normalize();
    
    // Precompute the orthonormal basis
    this._forward = this.viewdir;
    this._right = new V3d(0, 0, 1).cross(this._forward).normalize();
    // Handle the case where forward is parallel to up
    if (this._right.length() < 0.001) {
        this._right.x = 1;  // Choose arbitrary right vector
    }
    this._up = this._forward.cross(this._right).normalize();

    // Apply roll rotation around forward axis if specified
    if (roll !== 0) {
        const cos = Math.cos(roll);
        const sin = Math.sin(roll);
        
        // Rotate right and up vectors around forward axis
        const newRight = this._right.scale(cos).add(this._up.scale(sin));
        const newUp = this._up.scale(cos).sub(this._right.scale(sin));
        
        this._right = newRight.normalize();
        this._up = newUp.normalize();
    }
};

Scene.prototype.drawCircle = function(pos, r, col) {
    let circle = this.project(pos, r);
    if (!circle) return;
    circle.col = col;
    circle.roady = pos.y;

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
    const posrel = pos.sub(this.viewpoint);
    
    // Use precomputed basis vectors
    const viewX = posrel.dot(this._right);
    const viewY = posrel.dot(this._forward);
    const viewZ = posrel.dot(this._up);
    
    // things behind the viewer are not visible
    if (viewY <= 0) return null;

    const dist = this.distscale * Math.sqrt(viewX*viewX + viewY*viewY + viewZ*viewZ);

    // things too close are not visible
    if (dist < 0.5) return null;

    const scaleratio = this.viewscale * this.ctx.canvas.width / 640;

    const screenx = (this.ctx.canvas.width/2) + scaleratio * (viewX / viewY);
    const screeny = (this.ctx.canvas.height/2) - scaleratio * (viewZ / viewY);
    const screenr = scaleratio * (r / viewY); // px

    return {
        x: screenx,
        y: screeny,
        dist: dist,
        r: screenr,
    };
};