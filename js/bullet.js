function Bullet(pos, vel) {
    this.pos = pos;
    this.vel = vel;
}

Bullet.prototype.step = function(dt) {
    this.pos = this.pos.add(this.vel.mul(dt));
};

Bullet.prototype.render = function(scene) {
    scene.drawCircle(this.pos, 0.1, 'white');
};
