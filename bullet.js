class Bullet extends Vehicle {

  constructor(x, y, direction) {
  super(x, y, null);
  this.vel = direction.copy().setMag(15); // vitesse initiale de la balle
  this.maxSpeed = 8; // éviter que super.update() ne la ramène à 2
  this.maxForce = 0.3; // permet de seek un peu
  // durée de vie en secondes
  this.life = 6;
  this.radius = 5;
}

  

  show() {
  fill(255, 200, 0);
  circle(this.pos.x, this.pos.y, this.radius * 2);
  this.path.forEach((p, index) => {
      let alpha = map(index, 0, this.path.length-2, 0, 50);
      //si vehicle est le premier du tableau (le vaisseau), on dessine en orange
      stroke('rgb(255, 166, 0)');
      
      strokeWeight(2);
      fill('rgb(255, 123,0)');
      circle(p.x, p.y, map(index, 0, this.path.length-2, 0, 10));
  
    });
}

  // mise à jour spécifique au missile: mouvement + décrément de vie
  update() {
    // mouvement via la logique Vehicle
    super.update();
    // décrémenter la vie selon le temps écoulé (ms -> s)
    if (typeof deltaTime !== 'undefined') {
      this.life -= deltaTime / 1000;
    } else {
      // fallback si deltaTime n'est pas dispo
      this.life -= 1 / 60;
    }
    
  }
 

  isAlive() {
    return (
      this.life > 0 &&
      this.pos.x > 0 && this.pos.x < width &&
      this.pos.y > 0 && this.pos.y < height
    );
  }

}