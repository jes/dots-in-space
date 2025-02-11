function V3d(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

V3d.prototype.add = function(v) {
    return new V3d(this.x + v.x, this.y + v.y, this.z + v.z);
};

V3d.prototype.sub = function(v) {
    return new V3d(this.x - v.x, this.y - v.y, this.z - v.z);
};

V3d.prototype.mul = function(k) {
    return new V3d(this.x * k, this.y * k, this.z * k);
};

V3d.prototype.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};

V3d.prototype.angle = function() {
    // Returns azimuthal angle in the x-y plane from x-axis (in radians)
    return Math.atan2(this.y, this.x);
};

V3d.prototype.elevation = function() {
    // Returns elevation angle from x-y plane (in radians)
    return Math.atan2(this.z, Math.sqrt(this.x*this.x + this.y*this.y));
};

V3d.prototype.rotate = function(theta, axis) {
    // Rotate around specified axis by theta radians
    // axis should be 'x', 'y', or 'z'
    let x = this.x, y = this.y, z = this.z;
    switch(axis.toLowerCase()) {
        case 'x':
            return new V3d(
                x,
                y * Math.cos(theta) - z * Math.sin(theta),
                y * Math.sin(theta) + z * Math.cos(theta)
            );
        case 'y':
            return new V3d(
                x * Math.cos(theta) + z * Math.sin(theta),
                y,
                -x * Math.sin(theta) + z * Math.cos(theta)
            );
        case 'z':
            return new V3d(
                x * Math.cos(theta) - y * Math.sin(theta),
                x * Math.sin(theta) + y * Math.cos(theta),
                z
            );
        default:
            throw new Error('Invalid rotation axis. Use "x", "y", or "z"');
    }
};

V3d.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
};

V3d.prototype.cross = function(v) {
    return new V3d(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
    );
};

V3d.prototype.normalize = function() {
    const len = this.length();
    return len > 0 ? this.mul(1/len) : new V3d(0, 0, 0);
};

V3d.prototype.distanceTo = function(v) {
    return this.sub(v).length();
};

V3d.prototype.angleBetween = function(v) {
    // Returns angle between two vectors in radians
    const dot = this.dot(v);
    const mags = this.length() * v.length();
    return Math.acos(Math.max(-1, Math.min(1, dot / mags)));
};

V3d.prototype.rotateAround = function(axis, theta) {
    // Rodrigues rotation formula implementation
    // Rotates this vector around arbitrary axis by theta radians
    const k = axis.normalize();
    const cos_theta = Math.cos(theta);
    const sin_theta = Math.sin(theta);
    
    // v * cos(θ) + (k × v) * sin(θ) + k * (k · v) * (1 - cos(θ))
    return this.mul(cos_theta)
        .add(k.cross(this).mul(sin_theta))
        .add(k.mul(k.dot(this) * (1 - cos_theta)));
};
