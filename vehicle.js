// vehicle.js
// Base Vehicle class implementing steering behaviors (seek/arrive, flee, pursue/evade,
// wander, separation, obstacle avoidance) + optional debug drawing.

class Vehicle {
  static debug = false;

  constructor(x, y, image = null) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().setMag(2);
    // remember last non-zero heading (useful when speed ~ 0)
    this.lastHeading = this.vel.heading();
    this.acc = createVector(0, 0);

    // tuning
    this.maxSpeed = 2.5;
    this.maxForce = 0.15;

    // rendering / collision radius
    this.r = 36;
    this.image = image;

    // trail
    this.path = [];
    this.pathLength = 45;

    // wander params
    this.wanderTheta = 0;
    this.wanderRadius = 40;
    this.wanderDistance = 70;
    this.wanderDisplace = 0.35; // radians
  }

  applyForce(f) {
    if (!f) return;
    this.acc.add(f);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // keep lastHeading stable when nearly stopped
    if (this.vel.magSq() > 0.0001) this.lastHeading = this.vel.heading();

    // trail
    this.path.push(this.pos.copy());
    if (this.path.length > this.pathLength) this.path.shift();
  }

  edges() {
    if (this.pos.x > width + this.r) this.pos.x = -this.r;
    else if (this.pos.x < -this.r) this.pos.x = width + this.r;

    if (this.pos.y > height + this.r) this.pos.y = -this.r;
    else if (this.pos.y < -this.r) this.pos.y = height + this.r;
  }

  show(drawTrail = false, rotateToVelocity = true) {
    // trail smoke (only when requested)
    if (drawTrail) {
      noFill();
      strokeWeight(2);
      for (let i = 0; i < this.path.length; i++) {
        const p = this.path[i];
        const a = map(i, 0, this.path.length - 1, 0, 180);
        stroke(255, 165, 0, a);
        circle(p.x, p.y, map(i, 0, this.path.length - 1, 2, 16));
      }
    }

    // body
    push();
    translate(this.pos.x, this.pos.y);
    if (rotateToVelocity) rotate(this.vel.heading() + PI / 2);

    if (this.image && !this.image._failed) {
      imageMode(CENTER);
      image(this.image, 0, 0, this.r * 2, this.r * 2);
    } else {
      // fallback triangle
      noStroke();
      fill(200);
      triangle(0, -this.r, -this.r * 0.6, this.r, this.r * 0.6, this.r);
    }
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel.copy().setMag(40), "cyan");
      // collision radius
      noFill();
      stroke(0, 255, 0, 120);
      circle(this.pos.x, this.pos.y, this.r * 2);
    }
  }

  // --- Steering behaviors ----------------------------------------------------

  seek(target, arrive = false, slowRadius = 120) {
    if (!target) return createVector(0, 0);

    const desired = p5.Vector.sub(target, this.pos);
    const d = desired.mag();

    let speed = this.maxSpeed;
    if (arrive && d < slowRadius) {
      speed = map(d, 0, slowRadius, 0, this.maxSpeed);
    }
    desired.setMag(speed);

    const steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  flee(target) {
    // flee is seek in the opposite direction
    const steer = this.seek(target, false);
    steer.mult(-1);
    return steer;
  }

  pursue(vehicle) {
    if (!vehicle) return createVector(0, 0);
    const prediction = vehicle.vel.copy().mult(12);
    const target = vehicle.pos.copy().add(prediction);

    if (Vehicle.debug) {
      noFill();
      stroke(0, 255, 0, 180);
      circle(target.x, target.y, 14);
    }
    return this.seek(target, false);
  }

  evade(vehicle) {
    const steer = this.pursue(vehicle);
    steer.mult(-1);
    return steer;
  }

  wander() {
    const circleCenter = this.vel.copy().setMag(this.wanderDistance).add(this.pos);
    this.wanderTheta += random(-this.wanderDisplace, this.wanderDisplace);

    const offset = createVector(
        this.wanderRadius * cos(this.wanderTheta),
        this.wanderRadius * sin(this.wanderTheta)
    );

    const target = circleCenter.copy().add(offset);

    if (Vehicle.debug) {
      noFill();
      stroke(255, 255, 0, 80);
      circle(circleCenter.x, circleCenter.y, this.wanderRadius * 2);
      fill(0, 255, 0);
      noStroke();
      circle(target.x, target.y, 8);
      this.drawVector(this.pos, circleCenter.copy().sub(this.pos), "yellow");
    }

    this.applyForce(this.seek(target));
  }

  separate(others, desiredSeparation = 50) {
    let sum = createVector(0, 0);
    let count = 0;

    for (const other of others) {
      if (!other || other === this) continue;
      const d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < desiredSeparation) {
        const diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count++;
      }
    }

    if (count === 0) return createVector(0, 0);

    sum.div(count);
    sum.setMag(this.maxSpeed);
    const steer = p5.Vector.sub(sum, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // Improved obstacle avoidance with two look-ahead points
  avoid(obstacles, distanceAhead = 70) {
    if (!obstacles || obstacles.length === 0) return createVector(0, 0);

    const ahead = this.vel.copy().setMag(distanceAhead);
    const ahead2 = this.vel.copy().setMag(distanceAhead * 0.5);

    const p1 = this.pos.copy().add(ahead);
    const p2 = this.pos.copy().add(ahead2);

    let mostThreatening = null;
    let minDist = Infinity;

    for (const o of obstacles) {
      if (!o || !o.pos || typeof o.r !== "number") continue;

      const d1 = p5.Vector.dist(o.pos, p1);
      const d2 = p5.Vector.dist(o.pos, p2);
      const d = min(d1, d2);

      if (d < o.r + this.r && d < minDist) {
        minDist = d;
        mostThreatening = o;
      }
    }

    if (!mostThreatening) return createVector(0, 0);

    const avoidance = p5.Vector.sub(p1, mostThreatening.pos);
    avoidance.setMag(this.maxForce * 6);

    if (Vehicle.debug) {
      this.drawVector(this.pos, ahead, "orange");
      noFill();
      stroke(255, 0, 0, 120);
      circle(
          mostThreatening.pos.x,
          mostThreatening.pos.y,
          (mostThreatening.r + this.r) * 2
      );
    }

    return avoidance;
  }

  /**
   * Follow leader (non-naïf):
   * - "arrive" to a point behind the leader
   * - if you enter a circle in front of the leader, you flee that circle (prevents overtaking)
   *
   * Params are distances in pixels.
   */
  followLeaderNonNaive(
      leader,
      behindDist = 90,
      aheadDist = 120,
      aheadRadius = 90,
      arriveSlowRadius = 160
  ) {
    if (!leader) return createVector(0, 0);

    // direction of leader (fallback to lastHeading if leader is (almost) stopped)
    let leaderDir = leader.vel.copy();
    if (leaderDir.magSq() < 0.0001) {
      leaderDir = p5.Vector.fromAngle(leader.lastHeading ?? 0);
    }
    leaderDir.normalize();

    const behindTarget = leader.pos.copy().sub(leaderDir.copy().mult(behindDist));
    const aheadPoint = leader.pos.copy().add(leaderDir.copy().mult(aheadDist));

    if (Vehicle.debug) {
      // behind target
      noStroke();
      fill(0, 200, 255);
      circle(behindTarget.x, behindTarget.y, 8);

      // circle in front of leader (no-overtake zone)
      noFill();
      stroke(255, 60, 60, 180);
      circle(aheadPoint.x, aheadPoint.y, aheadRadius * 2);
    }

    // If I'm in front zone, flee it (looks smart + avoids "passing through" the leader)
    if (p5.Vector.dist(this.pos, aheadPoint) < aheadRadius) {
      return this.flee(aheadPoint).mult(1.6);
    }

    // Otherwise, arrive behind leader
    return this.seek(behindTarget, true, arriveSlowRadius);
  }

  fire() {
    if (typeof Bullet === "undefined") return;
    if (typeof bullets === "undefined") return;

    const dir = this.vel.copy();
    // if nearly stopped, shoot in the last moving direction
    if (dir.magSq() < 0.0001) {
      dir.set(cos(this.lastHeading), sin(this.lastHeading));
    }
    dir.normalize();

    bullets.push(new Bullet(this.pos.x, this.pos.y, dir));

    if (typeof dispatchPlaySoundEvent === "function") {
      dispatchPlaySoundEvent("shoot");
    }
  }

  drawVector(origin, vec, color = "white") {
    push();
    stroke(color);
    strokeWeight(2);
    line(origin.x, origin.y, origin.x + vec.x, origin.y + vec.y);
    pop();
  }
}
