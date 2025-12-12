class Star{
  constructor(){
    this.x=random(width);
    this.y=random(height);
    this.size=random(1,5);
    this.speed=random(1,1);
  }
  
  show(){
    noStroke();
    fill;
    ellipse(this.x,this.y,this.size);
  }
  update(){
    this.x -= this.speed;
    
    if(this.x < -this.size){
      this.x=width - this.size;
      this.y=random(height);
    }
  }
}