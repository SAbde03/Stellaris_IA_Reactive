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
function preload() {
  // on charge une image de fusée pour le vaisseau
  imageFusee = loadImage('./assets/vehicule.png');
  explosionSound = loadSound('./assets/loud-explosion-425457.mp3');
  spaceSound = loadSound('./assets/sfx-deep-space-travel-ambience-01-background-sound-effect-358466.mp3');
  imageOvni[0] = loadImage('./assets/ufo-4995753_1280.png');
  explosionImage[0] = loadImage('./assets/explosion-effect-PNG-image-thumb26.png');
  explosionImage[1] = loadImage('./assets/explosion-png-hd-atomic-explosion-transparent-background-1600.png');
  //obstacleImages[0]= loadImage('./assets/3d-cartoon-planet-with-glowing-orange-rings-and-sparkling-stars-on-transparent-background-space-astronomy-icon-for-educational-design-or-science-illustration-free-png.png');
  //obstacleImages[1]= loadImage('./assets/pngtree-3d-earth-globe-render-highlighting-global-geography-on-transparent-png-image_16511386.png');
  //[2]= loadImage('./assets/pngtree-3d-jupiter-planet-illustration-png-image_9199325.png');
  obstacleImages[0]= loadImage('./assets/large-grey-rock-with-transparent-background-isolated-natural-stone-texture-for-3d-design-png.png');
}

function setup() {
  
  spaceSound.setVolume(0.3);
  spaceSound.loop();
  explosionSound.setVolume(0.2);
  createCanvas(windowWidth, windowHeight);
  for(let i=0; i<100;i++){
    stars.push(new Star());
  }

  for(let i=0; i<5;i++){
    obstacles.push(new Obstacle());
  }
  
  const nbVehicles = 10;
  // création du premier véhicule au centre de l'écran
  let vehicle = new Vehicle(width/2, height/2, imageFusee);
  vehicles.push(vehicle);
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
  //faire apparaître les véhicules dehors de l'écran (OVNI)
    let vehicle = new Vehicle(x, y, imageOvni[0]);
    vehicles.push(vehicle);
  }

  // On cree des sliders pour régler les paramètres
  //creerSlidersPourProprietesVehicules();

  //TODO : creerSliderPourNombreDeVehicules(nbVehicles);
  //creerSliderPourNombreDeVehicules(nbVehicles);

  //TODO : 
  //creerSliderPourLongueurCheminDerriereVehicules(20);
  
}
function creerSliderPourNombreDeVehicules(nbVehiclesInitial) {
  let nbVehiculesSlider = createSlider(1, 100, nbVehiclesInitial, 1);
  // ecouteur sur le slider pour recréer les véhicules
  nbVehiculesSlider.input(() => {
    // on vide le tableau
    vehicles = [];
    // on recrée les véhicules
    for(let i=0; i < nbVehiculesSlider.value(); i++) {
      let vehicle = new Vehicle(width/2, height/2, imageOvni[0]);
      vehicles.push(vehicle);
    }
  });
  nbVehiculesSlider.position(160, 230);
  
  // je crée un label juste devant en X
  let labelNbVehicules = createDiv('Nb véhicules:')
  labelNbVehicules.position(10, 230);
  labelNbVehicules.style('color', 'white');

  // affichage de la valeur du slider
  let valueSpan = createSpan(nbVehiculesSlider.value());
  valueSpan.position(310, 230);
  valueSpan.style('color', 'white');
  valueSpan.html(nbVehiculesSlider.value());
}

function creerSliderPourLongueurCheminDerriereVehicules(longueurInitiale) {
  let longueurCheminSlider = createSlider(10, 120, longueurInitiale, 1);
  
  // ecouteur sur le slider pour modifier la propriété pathLength de chaque véhicule
  longueurCheminSlider.input(() => {
    vehicles.forEach(vehicle => {
      vehicle.pathLength = longueurCheminSlider.value();
    });
  });
  longueurCheminSlider.position(160, 270);
  
  // je crée un label juste devant en X
  let labelLongueurChemin = createDiv('Longueur chemin:')
  labelLongueurChemin.position(10, 270);
  labelLongueurChemin.style('color', 'white');

  // affichage de la valeur du slider
  let valueSpan = createSpan(longueurCheminSlider.value());
  valueSpan.position(310, 270);
  valueSpan.style('color', 'white');
  valueSpan.html(longueurCheminSlider.value());
}

function creerSlidersPourProprietesVehicules() {
  // paramètres de la fonction custom de création de sliders :
  // label, min, max, val, step, posX, posY, propriete des véhicules
  creerUnSlider("Rayon du cercle", 10, 200, 50, 1, 10, 20, "wanderRadius");
  // TODO : ajouter des sliders pour les autres propriétés
  // distanceCercle, displaceRange, maxSpeed, maxForce

  creerUnSlider("Distance au cercle", 50, 300, 150, 1, 10, 60, "distanceCercle");
  creerUnSlider("Plage de déplacement", 0.01, 1, 0.3, 0.01, 10, 100, "displaceRange");
  creerUnSlider("Vitesse Max", 1, 10, 4, 0.1, 10, 140, "maxSpeed");
  creerUnSlider("Force Max", 0.01, 1, 0.2, 0.01, 10, 180, "maxForce");

  // checkbox pour debug on / off
  debugCheckbox = createCheckbox('Debug ', false);
  debugCheckbox.position(10, 300);
  debugCheckbox.style('color', 'white');

  debugCheckbox.changed(() => {
    Vehicle.debug = !Vehicle.debug;
  });
}

function creerUnSlider(label, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY+17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    vehicles.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });
}
// appelée 60 fois par seconde
function draw() {
  background(0);
  fill(255);
  color(255);
  //background(0, 0, 0, 20);
  for(let i=0;i<stars.length;i++){
    stars[i].show();
    stars[i].update();
  }
  
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

    if (closestVehicle) {
      let seekForce = b.pursue(closestVehicle);
      b.applyForce(seekForce);
    }
    b.applyForce(b.separate(bullets, 300).mult(2));
    const avoidForce = b.avoid(obstacles);
    avoidForce.mult(3);
    b.applyForce(avoidForce);
    b.update();
    b.show();
    if (!b.isAlive()) {
      bullets.splice(i, 1); // supprimer le missile s'il n'est plus vivant
    } 

    
  }

  vehicles.forEach(vehicle => {
    if (followMouse && vehicle === vehicles[0]) {
      const target = createVector(mouseX, mouseY);
      vehicle.applyForce(vehicle.seek(target, true));
      //double la vitesse quand on suit la souris
      vehicle.show(true);
      // si le vehicule est proche des bords, on le fait boundaries
      
    } else {
      vehicle.wander();
      vehicle.show();
    }

    
    
    vehicle.applyForce(vehicle.separate(vehicles, 60).mult(5));
    // Application de l'évitement des obstacles
    const avoidForce = vehicle.avoid(obstacles);
    // renforcer la force d'évitement
    avoidForce.mult(1.5);
    vehicle.applyForce(avoidForce);
    
    vehicle.update();
    
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
  text("TOGGLE FOLLOW MOUSE: F", x, y);
  y -= interligne;

  //top left corner
  text(`score: ${vehicles.length -1}`, x, -height+40);
  y -= interligne;
  //vert
  fill(0, 255, 0);
  // millis() donne le temps en millisecondes depuis le début
  
  if(vehicles.length >1){
    missionTime= floor(millis() / 1000);
  }
  text("MISSION TIME: " + missionTime + "s", x, 40);

 
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

if (mouseIsPressed) {
    vehicle.maxSpeed *= 5;
    vehicle.maxForce = 0.2;
  } else {
    vehicles[0].maxSpeed = originalSpeed;
  }
