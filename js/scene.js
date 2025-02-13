const fullcircle = 180*Math.PI;

function Scene(ctx) {
    this.ctx = ctx;
    this.viewpoint = new V3d(0,0,0);
    this.viewdir = new V3d(0,1,0);  // Looking along +Y by default
    this.fov = 90; // Field of view in degrees
    this.distscale = 2;
    this.circles = [];
    this.occlusionSpheres = [];

    // Initialize view basis vectors
    this._right = new V3d(1,0,0);
    this._up = new V3d(0,0,1);
    this._forward = this.viewdir.normalize();
}

Scene.prototype.setCamera = function(position, direction, up) {
    this.viewpoint = position;
    this._forward = direction.normalize();
    
    // Construct orthonormal basis from forward and up vectors
    this._right = this._forward.cross(up).normalize();
    this._up = this._right.cross(this._forward).normalize();
};

Scene.prototype.addOcclusionSphere = function(pos, r) {
    this.occlusionSpheres.push({pos, r});
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
    this.ctx.globalAlpha = 1;

    for (let circle of this.circles) {
        // Check for occlusion
        const pos = circle.pos;
        const dir = pos.sub(this.viewpoint).normalize();
        const dist = pos.sub(this.viewpoint).length();
        
        let isOccluded = false;
        for (let sphere of this.occlusionSpheres) {
            // Vector from sphere center to ray origin (camera)
            const sphereToCamera = this.viewpoint.sub(sphere.pos);
            
            // Calculate closest approach using quadratic equation
            const a = dir.dot(dir);  // Should be 1 since dir is normalized
            const b = 2 * sphereToCamera.dot(dir);
            const c = sphereToCamera.dot(sphereToCamera) - (sphere.r * sphere.r);
            
            const discriminant = b * b - 4 * a * c;
            
            // If discriminant >= 0, ray intersects sphere
            if (discriminant >= 0) {
                // Calculate intersection distance
                const t = (-b - Math.sqrt(discriminant)) / (2 * a);
                // Check if intersection is between camera and circle (with small epsilon)
                if (t > 0 && t < dist - 0.0001) {
                    isOccluded = true;
                    break;
                }
            }
        }
        
        if (isOccluded) continue;

        // Draw the circle if not occluded
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
    
    if (viewY <= 0) return null;

    const dist = this.distscale * Math.sqrt(viewX*viewX + viewY*viewY + viewZ*viewZ);
    if (dist < 0.5) return null;

    // Convert FOV to radians and calculate projection scale
    const fovRadians = (this.fov * Math.PI) / 180;
    const aspectRatio = this.ctx.canvas.width / this.ctx.canvas.height;
    
    // Calculate projection scale based on FOV
    // tan(fov/2) gives us the ratio of half-width to distance
    const projectionScale = 1.0 / Math.tan(fovRadians / 2);
    
    const screenx = (this.ctx.canvas.width/2) + (this.ctx.canvas.width/2) * (viewX / viewY) * projectionScale;
    const screeny = (this.ctx.canvas.height/2) - (this.ctx.canvas.width/2) * (viewZ / viewY) * projectionScale;
    const screenr = (this.ctx.canvas.width/2) * (r / viewY) * projectionScale;

    return {
        pos: pos,
        x: screenx,
        y: screeny,
        dist: dist,
        r: screenr,
    };
};