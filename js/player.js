function Player() {
    this.pos = new V3d(0, 0, 0);
    this.vel = new V3d(0, 0, 0);
    this.facing = new V3d(0, 1, 0);
    this.roll = 0;  // Add roll angle tracking
}

Player.prototype.render = function(scene) {
};

Player.prototype.step = function(dt, input) {
    // Update facing direction based on mouse
    if (input.mouse.movementX || input.mouse.movementY) {
        console.log(input.mouse.movementX, input.mouse.movementY);
        let sensitivity = 0.003;
        
        // Get the current right vector and up vector (taking roll into account)
        let right = this.getRightVector();
        let up = right.cross(this.facing).normalize();
        
        // Yaw (rotate around local up vector instead of global Y)
        this.facing = this.facing.rotateAround(up, -input.mouse.movementX * sensitivity);
        
        // Pitch (rotate around right vector)
        this.facing = this.facing.rotateAround(right, input.mouse.movementY * sensitivity);
        this.facing = this.facing.normalize();
    }

    // Movement relative to facing direction
    let moveDir = new V3d(0, 0, 0);
    let right = this.getRightVector();
    
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
    if (input.keys['q']) {
        this.roll += dt * 0.5;
    }
    if (input.keys['e']) {
        this.roll -= dt * 0.5;
    }

    // Apply thrust in movement direction
    if (moveDir.length() > 0) {
        moveDir = moveDir.normalize();
        this.vel = this.vel.add(moveDir.mul(dt * 10));
    }

    this.pos = this.pos.add(this.vel.mul(dt));
    this.vel = this.vel.mul(0.999);

    if (this.pos.length() > WORLD_RADIUS) {
        // TODO: sparks, we've hit the celestial sphere
        this.vel = this.vel.mul(-1);
    }

    // Handle mouse input
    if (input.mouse.clicked) {
        console.log('Shooting!');
    }

};

Player.prototype.getRightVector = function() {
    // Get right vector by crossing facing direction with world forward
    let worldForward = new V3d(0, 0, 1);
    let right = this.facing.cross(worldForward).normalize().mul(-1);
    
    // Apply roll rotation around the facing vector
    return right.rotateAround(this.facing, this.roll);
};
