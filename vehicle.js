class Vehicle {
  static debug = false;
  
  constructor(x, y, image, pathColor = "white") {
    this.pos = createVector(x, y); // position initiale
    this.vel = createVector(1, 0); // vitesse initiale
    this.acc = createVector(0, 0); // acceleration initiale
    this.maxSpeed = 2; // vitesse maximale
    this.maxForce = 0.1; // force maximale appliquée
    this.r = 46; // rayon du véhicule

    
    // sprite image du véhicule
    this.image = image;


    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = PI / 2;
    this.displaceRange = 0.3;

    // trainée derrière les véhicules
    this.path = [];
    this.pathLength = 40;
    this.pathColor = pathColor;
    // largeur de la zone d'évitement devant le vaisseau (px)
    this.largeurZoneEvitementDevantVaisseau = 30;
  }

    wander() {
    // point devant le véhicule, centre du cercle
    let pointDevant = this.vel.copy();
    pointDevant.setMag(this.distanceCercle);
    pointDevant.add(this.pos);

    push();
    if (Vehicle.debug) {
      // on dessine le cercle en rouge
      // on le dessine sous la forme d'une petit cercle rouge
      fill("red");
      noStroke();
      circle(pointDevant.x, pointDevant.y, 8);

      // on dessine le cercle autour
      // Cercle autour du point
      noFill();
      strokeWeight(2);
      stroke(255);
      circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);
      

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      strokeWeight(1);
      // ligne en pointillés
      stroke(255, 255, 255, 80);
      drawingContext.setLineDash([5, 15]);
      stroke(255, 255, 255, 80);
      line(this.pos.x, this.pos.y, pointDevant.x, pointDevant.y);

    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();
    let pointSurLeCercle = createVector(0, 0);
    pointSurLeCercle.x = this.wanderRadius * cos(theta);
    pointSurLeCercle.y = this.wanderRadius * sin(theta);

    // on rajoute ces distances au point rouge au centre du cercle
    pointSurLeCercle.add(pointDevant);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill("green");
      noStroke();
      circle(pointSurLeCercle.x, pointSurLeCercle.y, 16);

      // on dessine le vecteur qui va du centre du vaisseau
      // à ce point vert sur le cercle
      stroke("yellow");
      strokeWeight(1);
      // pas en pointillés mais une ligne pleine
      drawingContext.setLineDash([]);
      line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);
    }

    // entre chaque image on va déplacer aléatoirement
    // le point vert en changeant un peu son angle...
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    // D'après l'article, la force est égale au vecteur qui va du
    // centre du vaisseau, à ce point vert. On va aussi la limiter
    // à this.maxForce
    // REMPLACER LA LIGNE SUIVANTE !
    let force = p5.Vector.sub(pointSurLeCercle, this.pos);
    // On met la force à maxForce
    force.setMag(this.maxForce);
    // on applique la force
    this.applyForce(force);

    pop();

    // et on la renvoie au cas où....
    return force;
  }

  //separate
  separate(vehicles, desiredSeparation) {
    let steer = createVector(0, 0);
    let count = 0;
    // pour chaque véhicule
    for (let other of vehicles) {
      let d = p5.Vector.dist(this.pos, other.pos);
      // si la distance est inférieure à la distance désirée
      if (d > 0 && d < desiredSeparation) {
        // calculer la direction d'éloignement
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }
    // si on a trouvé des véhicules à éviter
    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  wander1() {
    // point devant le véhicule, centre du cercle
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(this.distanceCercle);
    wanderPoint.add(this.pos);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'une petit cercle rouge
      fill(255, 0, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 8);

      // Cercle autour du point
      noFill();
      stroke(255);
      circle(wanderPoint.x, wanderPoint.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();

    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill(0, 255, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 16);
    }

    // maintenant wanderPoint c'est un point sur le cercle
    wanderPoint.add(x, y);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill(0, 255, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 16);

      // on dessine le vecteur desiredSpeed qui va du vaisseau au point vert
      stroke(255);
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }
    // On a donc la vitesse désirée que l'on cherche qui est le vecteur
    // allant du vaisseau au cercle vert. On le calcule :
    // ci-dessous, steer c'est la desiredSpeed directement !
    // Voir l'article de Craig Reynolds, Daniel Shiffman s'est trompé
    // dans sa vidéo, on ne calcule pas la formule classique
    // force = desiredSpeed - vitesseCourante, mais ici on a directement
    // force = desiredSpeed
    let steer = wanderPoint.sub(this.pos);

    steer.setMag(this.maxForce);
    this.applyForce(steer);

    // On déplace le point vert sur le cerlcle (en radians)
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    noFill();
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target) {
    return this.seek(target, true);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      let slowRadius = 100;
      let distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // on rajoute la position courante dans le tableau du chemin
    this.path.push(this.pos.copy());

    // si le tableau a plus de this.pathLength éléments, on vire le plus ancien
    // TODO
    if (this.path.length > this.pathLength) {
      this.path.shift();
    }
  }

  show(doitTourner) {

    if (doitTourner === true) {
    // dessin du chemin comme de la fumée
    this.path.forEach((p, index) => {
      let alpha = map(index, 0, this.path.length, 0, 255);
      //si vehicle est le premier du tableau (le vaisseau), on dessine en orange
      stroke('rgba(255, 165, 0, 0.5)');
      //si pas, on dessine en bleu clair
      //stroke('rgba(173, 216, 230, 0.5)');
    
      strokeWeight(2);
      noFill();
      circle(p.x, p.y, map(index, 0, this.path.length, 2, 15));
    });
  }
    // dessin du vaisseau
    /*
    //console.log("show")
    stroke(255);
    strokeWeight(2);
    fill(255);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
    */

    // dessin du vaisseau avec image
    push();
    translate(this.pos.x, this.pos.y);
    if (doitTourner === true) {
        rotate(this.vel.heading() + PI/2);
    }
    imageMode(CENTER);
    image(this.image, 0, 0, this.r * 2, this.r * 2);
    pop();


  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  // pour le debug : dessiner un vecteur à partir d'une origine
  drawVector(origin, vec, color = "white") {
    push();
    stroke(color);
    strokeWeight(2);
    line(origin.x, origin.y, origin.x + vec.x, origin.y + vec.y);
    pop();
  }

  // retourner l'obstacle le plus proche d'un point donné
  getClosestObstacle(point, obstacles) {
    if (!obstacles || obstacles.length === 0) {
      return { pos: createVector(width * 10, height * 10), r: 0 };
    }
    let closest = obstacles[0];
    let closestPos = closest.pos ? closest.pos : createVector(closest.x + closest.w / 2, closest.y + closest.h / 2);
    let minD = p5.Vector.dist(point, closestPos);
    for (let i = 1; i < obstacles.length; i++) {
      const o = obstacles[i];
      const oPos = o.pos ? o.pos : createVector(o.x + o.w / 2, o.y + o.h / 2);
      const d = p5.Vector.dist(point, oPos);
      if (d < minD) {
        minD = d;
        closest = o;
        closestPos = oPos;
      }
    }
    // ensure returned object has .pos and .r
    if (!closest.pos) closest.pos = closestPos;
    if (!closest.r) closest.r = Math.max(closest.w || 0, closest.h || 0) / 2;
    return closest;
  }

  // tirrer une balle dans la direction du véhicule
  fire() {
  const dir = this.vel.copy().normalize();
    // passe la direction (p5.Vector) pour que Bullet hérite du comportement
    // et fixe sa vitesse initiale dans son propre constructeur
    if (typeof bullets !== 'undefined') {
      bullets.push(new Bullet(this.pos.x, this.pos.y, dir.copy()));
      dispatchPlaySoundEvent('shoot');
      // permet de suivre le plus proche obstacle après le tir
      
      

    }
}

    
  

  avoid(obstacles) {
    // TODO
    let distanceAhead = 50;
    // il regarde par exemple 20 frames devant lui (le point "ahead)
    let ahead = this.vel.copy();
    ahead.mult(distanceAhead);

    // second point ahead2 à mi-distance
    let ahead2 = this.vel.copy();
    ahead2.mult(distanceAhead * 0.5);

    if (Vehicle.debug) {
      // on le dessine avec ma méthode this.drawVector(pos vecteur, color)
      this.drawVector(this.pos, ahead, "yellow");
      this.drawVector(this.pos, ahead2, "orange");
    }
    // on calcule la distance entre le point au bout du vecteur ahead
    // et le centre de l'obstacle le plus proche
    //let pointAuBoutDeAhead = this.pos.copy().add(ahead);

    // on dessine le point pour vérifier
    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
    let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);

    // on calcule la distance entre le point au bout du vecteur ahead
    // et le centre de l'obstacle le plus proche
    let obstacleLePlusProche = this.getClosestObstacle(pointAuBoutDeAhead, obstacles);
    let obstacleLePlusProche2 = this.getClosestObstacle(pointAuBoutDeAhead2, obstacles);
    // on prend aussi le vaisseau
    let obstaceLePlusProche3 = this.getClosestObstacle(this.pos, obstacles);

    let distance = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
    let distance2 = pointAuBoutDeAhead2.dist(obstacleLePlusProche2.pos);
    let distance3 = this.pos.dist(obstaceLePlusProche3.pos);


    let pointUtilise;
    if (distance < distance2 && distance < distance3) {
      // on utilise ahead
      pointUtilise = pointAuBoutDeAhead;
    } else if (distance2 < distance && distance2 < distance3) {
      // on utilise ahead2
      pointUtilise = pointAuBoutDeAhead2;
      obstacleLePlusProche = obstacleLePlusProche2;
      distance = distance2;
    } else {
      // on utilise la position du vaisseau
      pointUtilise = this.pos;
      obstacleLePlusProche = obstaceLePlusProche3;
      distance = distance3;
    }

    if (Vehicle.debug) {
      // on dessine le point pour vérifier
      fill("red");
      circle(pointUtilise.x, pointUtilise.y, 10);

      // on dessine la zone d'évitement
      stroke(100, 100);
      strokeWeight(this.largeurZoneEvitementDevantVaisseau);
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
    }

    let force;

    if (distance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
      // il y a collision possible
      // on calcule la force d'évitement
      // c'est le vecteur qui part du centre de l'obstacle et qui va vers
      // le point au bout du vecteur ahead (cercle rouge)
      force = p5.Vector.sub(pointUtilise, obstacleLePlusProche.pos);

      if (Vehicle.debug) {
        // on le dessine en jaune pour vérifier qu'il est ok (dans le bon sens etc)
        this.drawVector(obstacleLePlusProche.pos, force, "yellow");
      }

      // on limite cette force
      force.setMag(this.maxForce);
    } else {
      // pas de collision possible
      force = createVector(0, 0);
    }

    return force;
  }
}