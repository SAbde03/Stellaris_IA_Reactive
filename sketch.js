let vehicles = [];
let bullets = [];
let stars =[];
let obstacles = [];

let followMouse = true;

// --- Demo "wow" : Follow Leader non-naïf (toggle with L) --------------------
let followLeaderMode = false;
const FOLLOW_BEHIND_DIST = 95;
const FOLLOW_AHEAD_DIST = 135;
const FOLLOW_AHEAD_RADIUS = 95;

let imageFusee;
let imageOvni=[];
let explosionImage=[];
let obstacleImages = [];

let debugCheckbox;
let originalSpeed =2.5;

let score = 0;

let startMillis = 0;

// ✅ spawn control (fix "9 enemies then stop")
const ENEMY_TARGET_COUNT = 10;
let respawnQueue = 0;
let respawnTimer = 0;
const RESPAWN_DELAY_MS = 250;

let missionTime = 0;
let spaceSound;
let explosionSound;


function preload() {
  imageFusee = loadImage('./assets/vehicule.png');
  imageOvni[0] = loadImage('./assets/ufo-4995753_1280.png');
  explosionImage[0] = loadImage('./assets/explosion-effect-PNG-image-thumb26.png');
  explosionImage[1] = loadImage('./assets/explosion-png-hd-atomic-explosion-transparent-background-1600.png');

  obstacleImages[0]= loadImage('./assets/large-grey-rock-with-transparent-background-isolated-natural-stone-texture-for-3d-design-png.png');

  explosionSound = loadSound('./assets/loud-explosion-425457.mp3');
  spaceSound = loadSound('./assets/sfx-deep-space-travel-ambience-01-background-sound-effect-358466.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  spaceSound.setVolume(0.3);
  spaceSound.loop();

  explosionSound.setVolume(0.2);

  for(let i=0; i<100;i++){
    stars.push(new Star());
  }

  for(let i=0; i<4;i++){
    obstacles.push(new Obstacle());
  }

  const nbVehicles = 10;

  const player = new Vehicle(width / 2, height / 2, imageFusee);
  player.maxSpeed = 2.8;
  player.maxForce = 0.18;
  player.r = 42;
  vehicles.push(player);
  originalSpeed = player.maxSpeed;

  // ✅ enemies (exact count)
  for (let i = 0; i < ENEMY_TARGET_COUNT; i++) {
    vehicles.push(spawnEnemy());
  }

  // UI
  debugCheckbox = createCheckbox("Debug (D)", false);
  debugCheckbox.position(12, 12);
  debugCheckbox.style("color", "white");
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  startMillis = millis();
}

function draw() {
  background(0);

  // stars
  for (const s of stars) {
    s.update();
    s.show();
  }

  // obstacles
  for (const o of obstacles) {
    o.update();
    o.show();
  }

  // ✅ Respawn manager (garde ENEMY_TARGET_COUNT en permanence)
  handleRespawn();

  // bullets (iterate backwards because we may splice)
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    const target = getClosestEnemy(b);
    if (target) b.applyForce(b.pursue(target).mult(2.2));

    b.applyForce(b.separate(bullets, 22).mult(1.6));
    b.applyForce(b.avoid(obstacles).mult(3.0));

    b.update();
    b.show();

    // collisions bullet vs enemies
    if (handleBulletHits(b)) {
      bullets.splice(i, 1);
      continue;
    }

    if (!b.isAlive()) bullets.splice(i, 1);
  }

  // vehicles
  for (let i = vehicles.length - 1; i >= 0; i--) {
    const v = vehicles[i];

    // player control
    if (i === 0 && followMouse) {
      const target = createVector(mouseX, mouseY);
      v.applyForce(v.seek(target, true).mult(1.2));

      // boost while holding mouse
      if (mouseIsPressed) {
        v.maxSpeed = originalSpeed * 5;
        v.maxForce = 0.25;
      } else {
        v.maxSpeed = originalSpeed;
        v.maxForce = 0.18;
      }

      v.show(true, true);
    } else {
      // NPCs
      if (followLeaderMode && vehicles[0]) {
        // Follow Leader non-naïf : arrive derrière le leader + évite de le dépasser
        v.applyForce(
            v.followLeaderNonNaive(
                vehicles[0],
                FOLLOW_BEHIND_DIST,
                FOLLOW_AHEAD_DIST,
                FOLLOW_AHEAD_RADIUS
            ).mult(1.35)
        );
      } else {
        // Default behavior: wander
        v.wander();
      }
      v.show(false, true);
    }

    // common forces
    if (followLeaderMode && i !== 0) {
      // separation only among followers (keeps the formation readable)
      v.applyForce(v.separate(vehicles.slice(1), 70).mult(2.2));
    } else {
      v.applyForce(v.separate(vehicles, 60).mult(2.0));
    }
    v.applyForce(v.avoid(obstacles).mult(1.6));

    v.update();
    v.edges();
  }

  cleanupDeadEnemies(); // ✅ retire les ennemis explosés + enqueue respawn
  drawHUD();
}

function handleBulletHits(bullet) {
  // enemies start at index 1
  for (let i = 1; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v || v._pendingRemove) continue;

    const d = p5.Vector.dist(bullet.pos, v.pos);
    // v.r = "rayon collision" de l’ennemi
    if (d <= bullet.radius + v.r) {
      score += 1;

      if (explosionImage[0] && !explosionImage[0]._failed) v.image = explosionImage[0];
      v.maxSpeed = 0;
      v.vel.mult(0);

      v._deathFrames = 18;
      v._pendingRemove = true;
      return true;
    }
  }
  return false;
}

function getClosestEnemy(bullet) {
  if (vehicles.length <= 1) return null;
  let closest = null;
  let best = Infinity;

  for (let i = 1; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (!v || v._pendingRemove) continue;
    const d = p5.Vector.dist(bullet.pos, v.pos);
    if (d < best) {
      best = d;
      closest = v;
    }
  }
  return closest;
}

function cleanupDeadEnemies() {
  // remove enemies marked pending after small animation frames
  for (let i = vehicles.length - 1; i >= 1; i--) {
    const v = vehicles[i];
    if (!v || !v._pendingRemove) continue;

    v._deathFrames = (v._deathFrames ?? 0) - 1;

    if (v._deathFrames === 8) {
      if (explosionImage[1] && !explosionImage[1]._failed) v.image = explosionImage[1];
    }

    if (v._deathFrames <= 0) {
      vehicles.splice(i, 1);
      if (explosionSound) explosionSound.play();

      // ✅ enqueue respawn (pour garder le même nombre d’ennemis)
      respawnQueue += 1;
    }
  }
}

function handleRespawn() {
  // combien d'ennemis actuels ?
  const currentEnemies = max(0, vehicles.length - 1);
  const missing = ENEMY_TARGET_COUNT - currentEnemies;

  // si on a perdu des ennemis mais pas encore en queue (cas rare), on répare
  if (missing > respawnQueue) respawnQueue = missing;

  if (respawnQueue <= 0) return;

  // délai entre spawns
  if (respawnTimer > 0) {
    respawnTimer -= deltaTime;
    return;
  }

  vehicles.push(spawnEnemy());
  respawnQueue -= 1;
  respawnTimer = RESPAWN_DELAY_MS;
}

function spawnEnemy() {
  // spawn à droite (style "arrive du vide") + position y aléatoire
  let x = width + random(40, 200);
  let y = random(40, height - 40);

  // éviter de spawn trop proche du joueur
  const player = vehicles[0];
  if (player) {
    let tries = 0;
    while (tries < 20 && dist(x, y, player.pos.x, player.pos.y) < 180) {
      x = width + random(40, 200);
      y = random(40, height - 40);
      tries++;
    }
  }

  const v = new Vehicle(x, y, imageOvni[0]);
  v.maxSpeed = random(1.8, 2.6);
  v.maxForce = random(0.12, 0.18);
  v.r = 34;

  // donne une vitesse initiale vers la gauche pour que ça "entre" à l'écran
  v.vel = createVector(-random(1, 3), random(-1, 1)).limit(v.maxSpeed);
  return v;
}

function drawHUD() {
  push();
  textFont("Courier New");
  textStyle(BOLD);
  textSize(16);
  textAlign(LEFT, TOP);
  fill(255);

  const t = floor((millis() - startMillis) / 1000);

  text(`Enemies: ${max(0, vehicles.length - 1)} / ${ENEMY_TARGET_COUNT}`, 12, 48);
  text(`Score:   ${score}`, 12, 68);
  text(`Time:    ${t}s`, 12, 88);
  text(`Mode:    ${followLeaderMode ? "FOLLOW LEADER" : "WANDER"}`, 12, 108);

  fill(180);
  text("SPACE: shoot  |  F: follow mouse  |  L: follow leader  |  D: debug", 12, height - 24);
  pop();
}

function keyPressed() {
  if (key === "d" || key === "D") {
    Vehicle.debug = !Vehicle.debug;
    if (debugCheckbox) debugCheckbox.checked(Vehicle.debug);
  }
  if (key === "f" || key === "F") {
    followMouse = !followMouse;
  }
  if (key === "l" || key === "L") {
    followLeaderMode = !followLeaderMode;
  }
  if (key === " " || keyCode === 32) {
    if (vehicles[0]) vehicles[0].fire();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- image loader avec fallback ---------------------------------------------
function safeLoadImage(path) {
  let img = null;
  img = loadImage(path, () => {}, () => { if (img) img._failed = true; });
  return img;
}

// called by Vehicle.fire()
function dispatchPlaySoundEvent(name) {
  // Optionnel : ajoute un son de tir ici.
}
