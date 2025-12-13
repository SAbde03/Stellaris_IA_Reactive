class Obstacle {
  constructor() {
    this.w = 100;
    this.h = 100;
    this.x = random(width - this.w);
    this.y = random(height - this.h);
    this.speed = 1;

    this.image = random(obstacleImages);
    this.pos = createVector(this.x + this.w / 2, this.y + this.h / 2);
    this.r = max(this.w, this.h) / 2;
  }

  update() {
    this.x -= this.speed;

    if (this.x < -this.w) {
      this.x = width + random(0, 100);
      this.y = random(height - this.h);
    }

    this.pos.x = this.x + this.w / 2;
    this.pos.y = this.y + this.h / 2;
    this.r = max(this.w, this.h) / 2;
  }

  show() {
    image(this.image, this.x, this.y, this.w, this.h);
  }

}