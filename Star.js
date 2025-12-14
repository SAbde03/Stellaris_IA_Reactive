class Star{
  constructor(){
    this.reset(true);
  }

  reset(randomX = false){
    this.x = randomX? random(width) : width + random(0,50);
    this.y = random(height);
    this.size = random(1, 3.5);
    this.speed = random(0.5, 2.2);
  }

  update(){
    this.x -= this.speed;
    if (this.x < -this.size){
      this.reset(false);
    }
  }
  
  show(){
    noStroke();
    fill(255);
    circle(this.x,this.y,this.size);
  }

}