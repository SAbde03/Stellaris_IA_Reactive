let vehicles = [];
let bullets = []; // global bullets array managed by sketch
let followMouse = true; // when true the first vehicle will seek the mouse
let imageFusee;
let debugCheckbox;
let missionTime = 0;
let stars =[];
let obstacles = [];
let obstacleImages = [];
let originalSpeed;
let imageOvni=[];
let explosionImage=[];
let spaceSound;
let explosionSound;
let terre;
function preload() {
  // on charge une image de fusée pour le vaisseau
  imageFusee = loadImage('./assets/vehicule.png');
  explosionSound = loadSound('./assets/loud-explosion-425457.mp3');
  spaceSound = loadSound('./assets/sfx-deep-space-travel-ambience-01-background-sound-effect-358466.mp3');
  imageOvni[0] = loadImage('./assets/ufo-4995753_1280.png');
  explosionImage[0] = loadImage('./assets/explosion-effect-PNG-image-thumb26.png');
  explosionImage[1] = loadImage('./assets/explosion-png-hd-atomic-explosion-transparent-background-1600.png');
  terre = loadImage('./assets/earth-seen-from-space.jpg');
  //obstacleImages[0]= loadImage('./assets/3d-cartoon-planet-with-glowing-orange-rings-and-sparkling-stars-on-transparent-background-space-astronomy-icon-for-educational-design-or-science-illustration-free-png.png');
  //obstacleImages[1]= loadImage('./assets/pngtree-3d-earth-globe-render-highlighting-global-geography-on-transparent-png-image_16511386.png');
  //[2]= loadImage('./assets/pngtree-3d-jupiter-planet-illustration-png-image_9199325.png');
  obstacleImages[0]= loadImage('./assets/large-grey-rock-with-transparent-background-isolated-natural-stone-texture-for-3d-design-png.png');
}

function setup() {
  
  // régler le volume de la musique
  spaceSound.setVolume(0.3);
  // faire boucler la musique de fond
  spaceSound.loop();
  // régler le volume des effets sonores
  explosionSound.setVolume(0.2);
  createCanvas(windowWidth, windowHeight);


  // création des étoiles
  for(let i=0; i<100;i++){
    stars.push(new Star()); 
  }
  


  // création des obstacles
  for(let i=0; i<10;i++){
    obstacles.push(new Obstacle()); 
  }
  
  const nbVehicles = 10;
  // création du premier véhicule au centre de l'écran
  let vehicle = new Vehicle(width/2, height/2, imageFusee);
  vehicles.push(vehicle);

  //faire apparaître les véhicules dehors de l'écran (OVNI)
  for(let i=1; i < nbVehicles; i++) {
    const side = floor(random(4));
  let x, y;

  switch (side) {
    case 0: // gauche
      x = -50;                 // juste en dehors de l'écran
      y = random(height);
      break;
    case 1: // droite
      x = width + 50;          // juste en dehors de l'écran
      y = random(height);
      break;
    case 2: // haut
      x = random(width);
      y = -50;
      break;
    case 3: // bas
      x = random(width);
      y = height + 50;
      break;
  }

    let vehicle = new Vehicle(x, y, imageOvni[0]);
    vehicles.push(vehicle);
  }
  
}



function draw() {
  background(0);
  fill(255);
  color(255);
  //background(0, 0, 0, 20);
  for(let i=0;i<stars.length;i++){
    stars[i].show();
    stars[i].update();
  }
  
  // mise à jour et affichage des obstacles
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].show();
    obstacles[i].update();
  }

  // creation des vehicules qui utilisent le comportement wander et avoidance
  for (let i = 1; i < vehicles.length; i++) {
    vehicles[i].update();
    vehicles[i].show(); 
    vehicles[i].edges();
    vehicles[i].wander();
    const avoidForce = vehicles[i].avoid(obstacles);
    avoidForce.mult(1.5);
  
   
    vehicles[i].applyForce(avoidForce);
  }

  
  // Mettre à jour et afficher les missiles
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
   // seek le vehicule le plus proche
   let closestVehicle = null;
   let closestDistance = Infinity;
    vehicles.forEach(vehicle => {
      let d = p5.Vector.dist(b.pos, vehicle.pos);
      // ignorer le véhicule qui a tiré le missile (le premier du tableau)
      // et ignorer les autres missiles
      if (d < closestDistance && vehicle !== vehicles[0]) {
        closestDistance = d;
        closestVehicle = vehicle;
      }
      // si la distance est inférieure à un certain seuil, on peut considérer qu'il a touché la cible
      const vr = vehicle.r || 0;
      const br = b.radius || 5;
      if (vehicle !== vehicles[0] && d <= vr + br) {
        // retirer le véhicule touché
        let index = vehicles.indexOf(vehicle);
        if (index > -1) {
          vehicle.image= explosionImage[0];
          //stoper l'animation du véhicule
          vehicle.maxSpeed = 0;
          // jouer le son d'explosion après un court délai
          setTimeout(() => {
            vehicle.image= explosionImage[1];
            explosionSound.play();
          }, 50);
          setTimeout(() => {
            vehicles.splice(index, 1);
          }, 300);
        }
        // retirer le missile
        bullets.splice(i, 1);
        return; // sortir du forEach pour éviter d'autres traitements sur ce missile
      }
      
    });

    // poursuivre le véhicule le plus proche
    if (closestVehicle) {
      let seekForce = b.pursue(closestVehicle);
      b.applyForce(seekForce);
    }
    // séparation des autres missiles
    b.applyForce(b.separate(bullets, 300).mult(2));
    // Application de l'évitement des obstacles
    const avoidForce = b.avoid(obstacles);
    avoidForce.mult(3);
    b.applyForce(avoidForce);
    b.update();
    b.show();
    // supprimer le missile s'il n'est plus vivant
    if (!b.isAlive()) {
      bullets.splice(i, 1); 
    } 

    
  }

  // mise à jour et affichage des véhicules
  vehicles.forEach(vehicle => {
    if (followMouse && vehicle === vehicles[0]) {
      // le premier véhicule suit la souris
      const target = createVector(mouseX, mouseY);
      if(vehicles.length > 1){
      vehicle.applyForce(vehicle.seek(target, true));
      }
      else{
        vehicle.wander();
      }
      vehicle.show(true);      
    } else {
      // les autres véhicules errent
      vehicle.wander();
      vehicle.show();
    }

    
    
    vehicle.applyForce(vehicle.separate(vehicles, 60).mult(5));
    // Application de l'évitement des obstacles
    const avoidForce = vehicle.avoid(obstacles);
    // renforcer la force d'évitement
    avoidForce.mult(1.5);
    vehicle.applyForce(avoidForce);
    // mise à jour de la position
    vehicle.update();
    // gestion des bords de l'écran
    vehicle.edges();
  });

  drawHUD();
}


function drawHUD() {
  push(); // Isoler les styles pour ne pas affecter les vaisseaux
  
  // 1. Configuration du texte
  textFont('Courier New'); // Police style "Terminal" ou "Code"
  textStyle(BOLD);
  textAlign(LEFT, BOTTOM); // Le point d'ancrage est en bas à gauche
  textSize(16);
  
  
  
  // 3. Position de départ (marge de 20px du bord gauche et bas)
  let x = 20;
  let y = height - 20;
  let interligne = 25; // Espace entre les lignes

  noStroke();
  fill(255, 255, 255); // Cyan
  text("TIRRE: ESPACE", x, y);
  y -= interligne;
  text("TOGGLE DEBUG: D", x, y);
  y -= interligne;
  text("TOGGLE SUIVRE SOURIS: F", x, y);
  y -= interligne;
  //vert
  fill(0, 255, 0);
  // millis() donne le temps en millisecondes depuis le début
  
  if(vehicles.length >1){
    missionTime= floor(millis() / 1000);
  }
  text("TEMPS DE MISSION: " + missionTime + "s", x, 40);
  
  

  // quand il n'y a plus de véhicules ennemis
  // afficher un message de victoire
  if(vehicles.length <=1){
    textAlign(CENTER, CENTER);
    textSize(48);
    textFont('Arial Black');
    fill(255, 215, 0);
    text("MISSION ACCOMPLIE!", width / 2, height / 2);
    text(missionTime + " s", width / 2, height / 2 + 60);
  }
 
  pop(); // Rétablir les styles précédents

}


 


function keyPressed() {
  if (key === 'd') {
    Vehicle.debug = !Vehicle.debug;

    debugCheckbox.checked(Vehicle.debug);
  }
  // tirer un missile avec la barre espace
  if (key === ' ' || keyCode === 32) {
    if (vehicles.length > 0) {
      vehicles[0].fire();
    }
  }
  // un toggle de suivi de la souris avec la touche F
  if (key === 'f' || key === 'F') {
    followMouse = !followMouse;
  }
}


