class Obstacle {
  constructor() {
    this.w = 100; // Largeur
    this.h = 100; // Hauteur
    this.x = random(width- this.w); // Commence à droite
    this.y = random(height - this.h); // Hauteur aléatoire
    this.speed = 1; // Vitesse de l'obstacle
    this.image = random(obstacleImages);
    // position vector (center) and approximate radius for avoidance
    this.pos = createVector(this.x + this.w / 2, this.y + this.h / 2);
    this.r = max(this.w, this.h) / 2;
  }

  show() {
    image(this.image, this.x, this.y, this.w, this.h);
  }

  update() {
    this.x -= this.speed; // Déplacement vers la gauche

    // Si l'obstacle sort de l'écran à gauche, on le remet à droite
    if (this.x < -this.w) {
      this.x = width;
      this.y = random(height - this.h);
    }
    
    this.pos.x = this.x + this.w / 2;
    this.pos.y = this.y + this.h / 2;
    this.r = max(this.w, this.h) / 2;
  }
}