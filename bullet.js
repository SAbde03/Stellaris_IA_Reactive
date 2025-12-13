

class Bullet extends Vehicle {
  constructor(x, y, direction) {
    super(x, y, null);

    this.vel = direction.copy().setMag(15);
    this.maxSpeed = 12;
    this.maxForce = 0.35;

    this.radius = 5;
    this.life = 6; // seconds
    this.pathLength = 20;
  }

  update() {
    super.update();
    this.life -= deltaTime / 1000;
  }

  show() {
    noStroke();
    fill(255, 200, 0);
    circle(this.pos.x, this.pos.y, this.radius * 2);

    noFill();
    stroke(255, 140, 0, 120);
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      circle(p.x, p.y, map(i, 0, this.path.length - 1, 0, 10));
    }
  }

  isAlive() {
    return (
        this.life > 0 &&
        this.pos.x > -20 && this.pos.x < width + 20 &&
        this.pos.y > -20 && this.pos.y < height + 20
    );
  }
}
