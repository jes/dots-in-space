function Player() {
    this.pos = new V3d(0, 0, 0);
    this.vel = new V3d(0, 0, 0);
    // Start with default orientation
    this.facing = new V3d(0, 1, 0);
    this.up = new V3d(0, 0, 1);

    this.lastshot = 0;
}

Player.prototype.render = function(scene) {
};

Player.prototype.step = function(dt, input) {
    // Update orientation based on mouse
    if (input.mouse.movementX || input.mouse.movementY) {
        let sensitivity = 0.003;
        
        // For any mouse movement, rotate both vectors together as a rigid frame
        let right = this.facing.cross(this.up).normalize();
        
        // Combined rotation axis based on mouse movement (flipped signs)
        let rotationAxis = right.mul(-input.mouse.movementY).add(this.up.mul(-input.mouse.movementX));
        let rotationAmount = Math.sqrt(
            input.mouse.movementX * input.mouse.movementX + 
            input.mouse.movementY * input.mouse.movementY
        ) * sensitivity;
        
        // Rotate both vectors around the combined axis
        if (rotationAmount > 0) {
            this.facing = this.facing.rotateAround(rotationAxis.normalize(), rotationAmount);
            this.up = this.up.rotateAround(rotationAxis.normalize(), rotationAmount);
        }
        
        // Ensure orthonormal basis
        this.facing = this.facing.normalize();
        right = this.facing.cross(this.up).normalize();
        this.up = right.cross(this.facing).normalize();
    }

    // Handle roll separately
    if (input.keys['q']) {
        this.facing = this.facing.rotateAround(this.facing, dt * 0.5);
        this.up = this.up.rotateAround(this.facing, dt * 0.5);
    }
    if (input.keys['e']) {
        this.facing = this.facing.rotateAround(this.facing, -dt * 0.5);
        this.up = this.up.rotateAround(this.facing, -dt * 0.5);
    }

    // Movement relative to facing direction
    let moveDir = new V3d(0, 0, 0);
    let right = this.facing.cross(this.up).normalize();
    
    if (input.keys['w'] || input.keys['arrowup']) {
        moveDir = moveDir.add(this.facing);
    }
    if (input.keys['s'] || input.keys['arrowdown']) {
        moveDir = moveDir.sub(this.facing);
    }
    if (input.keys['a'] || input.keys['arrowleft']) {
        moveDir = moveDir.sub(right);
    }
    if (input.keys['d'] || input.keys['arrowright']) {
        moveDir = moveDir.add(right);
    }

    // Apply thrust in movement direction
    if (moveDir.length() > 0) {
        moveDir = moveDir.normalize();
        this.vel = this.vel.add(moveDir.mul(dt * 10));
    }

    // TODO: gravity?
    /*if (this.pos.length() > 0.1) {
        this.vel = this.vel.add(this.pos.mul(-1).normalize().mul(dt * 0.1));
    }*/

    this.pos = this.pos.add(this.vel.mul(dt));
    this.vel = this.vel.mul(0.999);

    if (this.pos.length() > WORLD_RADIUS) {
        // TODO: sparks, we've hit the celestial sphere
        this.vel = this.vel.mul(-1);
    }

    // Handle mouse input
    if (input.mouse.clicked || input.keys[' ']) {
        this.shoot();
    }
};

Player.prototype.shoot = function() {
    if (Date.now() - this.lastshot < 100) return;
    this.lastshot = Date.now();
    
    // Offset bullet spawn position by 1 unit down in player's coordinate system
    let spawnPos = this.pos.sub(this.up.normalize());
    
    // Bullet inherits player velocity and adds speed in facing direction
    const BULLET_SPEED = 200;
    let bulletVelocity = this.facing.mul(BULLET_SPEED).add(this.vel);
    
    addBullet(spawnPos, bulletVelocity);
};

Player.prototype.getRightVector = function() {
    // Simply get right vector from facing and up, then apply roll
    let right = this.facing.cross(this.up).normalize();
    return right.rotateAround(this.facing, this.roll);
};
