function randint(min, max){ return Math.round(Math.random()*(max-min)+min); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas, ob, ai, rate, hp){
		this.canvas = canvas;
		this.alive = 0;
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
		this.isEnd = false;
		this.isWin = false;
		this.rate = rate;
		// the logical width and height of the stage
		this.width=canvas.width;
		this.height=canvas.height;
		
		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var radius = 6;
		var colour= 'rgba(124,252,0,1)';
		var position = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		this.addPlayer(new Player(this, position, velocity, colour, radius, false, false, false, hp));
		var total=ob;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-40))); 
			var y=Math.floor((Math.random()*(this.width-40))); 
			if(this.getActor(x,y,this.player)===null){
				var red=randint(0, 255), green=randint(0, 255), blue=randint(0, 255);
				var alpha = Math.random()*0.8 + 0.2;
				var radius = randint(30,40);
				var colour= 'rgba('+red+','+green+','+blue+','+alpha+')';
				var position = new Pair(x,y);
				var b;
			
				b = new Obstacles(this, position, colour, radius, true, false, false);
				this.addActor(b);

				
				total--;
			}
		}
		var total = 10;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-40))); 
			var y=Math.floor((Math.random()*(this.width-40))); 
			if(this.getActor(x,y,this.player)===null){
				b = new Ammo(this, new Pair(x,y), "#008e00", 5, false, false, true);
				this.addActor(b);
			}
			x=Math.floor((Math.random()*(this.width-40))); 
			y=Math.floor((Math.random()*(this.width-40))); 
			if(this.getActor(x,y,this.player)===null){
				b = new Medkit(this, new Pair(x,y), "#ff8080", 5, false, false, true);
				this.addActor(b);
			}	
			total--;
		}
		var total = 5;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-40))); 
			var y=Math.floor((Math.random()*(this.width-40))); 
			if(this.getActor(x,y,this.player)===null){
				b = new Rifle(this, new Pair(x,y), "#000000", 5, false, false, true);
				this.addActor(b);
			}			
			total--;
		}
		var total=ai;
		while(total>0){
			var x=Math.floor((Math.random()*this.width)); 
			var y=Math.floor((Math.random()*this.height)); 
			if(this.getActor(x,y,this.player)===null){
				var radius = 6;
				var velocity = new Pair(rand(20), rand(20));
				var alpha = Math.random();
				var colour= 'rgba(255,0,0,1)';
				var position = new Pair(x,y);
				var b = new Ball(this, position, velocity, colour, radius, false, false, false);
				this.addActor(b);
				total--;
			}
		}
		
		
	}

	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

	addActor(actor){
		this.actors.push(actor);
	}

	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){

		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
			if(!this.actors[i].isOb && !this.actors[i].isBullet && this.actors[i]!= this.player){
				if(this.actors[i].counter%this.rate == 0){
					var angle =  Math.atan2(this.actors[i].pointer.y , this.actors[i].pointer.x);
					var velocity = new Pair(this.actors[i].velocity.x/2 + Math.cos(angle)*20, this.actors[i].velocity.y/2 + Math.sin(angle)*20);
					var colour= 'rgba(0,0,0,1)';
					var position = new Pair(this.actors[i].x,this.actors[i].y);
					var b = new Bullet(this, position, velocity, colour, 2, false, true, false, this.actors[i]);
					this.addActor(b);
				}
			}
			if(this.actors[i].clean()){
				if(this.actors[i] == this.player){
					this.isEnd = true;
					return;
				}
				this.removeActor(this.actors[i]);
			}
			this.countAlive();
			if(this.alive == 1 && this.actors.includes(this.player)){
				this.isWin = true;
			}
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		context.save();
		context.transform(1.5,0,0,1.5,0,0);
		context.translate(this.width/3-this.player.x,this.height/3-this.player.y);
		
		context.lineWidth = 2;
		context.strokeStyle="#000000";
		context.strokeRect(0, 0, this.width, this.height);
		
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}

		context.restore();
		context.fillStyle="#000000";
		context.font = "30px Georgia";
		context.fillText("HP:" + this.player.health, 0, 25);
		context.fillText("Kills:" + this.player.kills, 0, 55);
		context.fillText(this.alive + " Players left", 0, 85);
		context.fillText("Ammo:" + this.player.ammo, 0, 115);
		
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y, cur){
		for(var i=0;i<this.actors.length;i++){
			var length;
			if (this.actors[i] === cur){
				continue;
			}
			if (this.actors[i].isOb||this.actors[i].isItem) {
				length = this.actors[i].length;
				if(x<=this.actors[i].x+length+2 && x>=this.actors[i].x-2 && y<=this.actors[i].y+length+2&& y>=this.actors[i].y-2){
					return this.actors[i];
				}
			} else {
				if(cur != null && (this.actors[i].isBullet||this.actors[i].isItem)){
					if(cur.isBullet) continue;
				}
				length = this.actors[i].radius;
				if(x<=this.actors[i].x+length+2 && x>=this.actors[i].x-length-2 && y<=this.actors[i].y+length+2&& y>=this.actors[i].y-length-2){
					
					return this.actors[i];
				}
								
			}
		}
		return null;
	}

	countAlive(){
		this.alive = 0;	
		for(var i=0;i<this.actors.length;i++){
			if(!this.actors[i].isOb && !this.actors[i].isBullet && !this.actors[i].isItem){
				this.alive +=1;
			}
		}
		
	}

	Lose(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		this.draw();
		context.globalAlpha = 0.5;
		context.fillStyle = "grey";
		context.fillRect(0, 0, this.width, this.height);
		context.globalAlpha = 1;
		
		context.font = "60px Georgia";
		context.fillStyle = "white";
		context.fillText("Lose", this.width/2 - 70, this.height/2);
		context.lineWidth = 2;
		context.strokeStyle="#000000";
		context.strokeText("Lose", this.width/2 - 70, this.height/2);
		context.font = "30px Georgia";
		context.fillText("You are Dead", this.width/2 - 100, this.height/2+60);
		context.fillText("Your rank is No. " + (this.alive) , this.width/2 - 125, this.height/2 + 90);
		context.strokeText("You are Dead", this.width/2 - 100, this.height/2+60);
		context.strokeText("Your rank is No. " + (this.alive) , this.width/2 - 125, this.height/2 + 90);
	}

	Win(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		this.draw();
		context.globalAlpha = 0.5;
		context.fillStyle = "grey";
		context.fillRect(0, 0, this.width, this.height);
		context.globalAlpha = 1;
		context.font = "60px Georgia";
		context.fillStyle = "white";
		context.fillText("WIN", this.width/2 - 65, this.height/2);
		context.lineWidth = 2;
		context.strokeStyle="#000000";
		context.strokeText("WIN", this.width/2 - 65, this.height/2);
		context.font = "30px Georgia";
		context.fillText("You are the f0rt9it32d Champoion!", this.width/2 - 220, this.height/2+60);
		context.strokeText("You are the f0rt9it32d Champoion!", this.width/2 - 220, this.height/2+60);

	}
} // End Class Stages


class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	toString(){
		return "("+this.x+","+this.y+")";
	}

	normalize(){
		var magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}
}

class Obstacles {
	constructor(stage, position, colour, length, isOb, isBullet, isItem){
		this.stage = stage;
		this.position=position;
		this.intPosition();
		this.colour = colour;
		this.length = length;
		this.isOb = isOb;
		this.isBullet = isBullet;
		this.isItem = isItem;
		this.health = Math.round(Math.random()*10);
		this.full = this.health;
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	clean(){
		return (this.health <= 0);
	}

	step() {
		this.intPosition();
	}

	draw(context){
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.length, this.length);  
		if(this.health != this.full){
			context.fillStyle="#964B00";
			context.fillRect(this.x, this.y+this.length/2, this.length/this.full * this.health , 5);  
			context.lineWidth = 1;
			context.strokeStyle="#000000";
			context.strokeRect(this.x, this.y+this.length/2, this.length , 5); 
		}
		
	}
}

class Item {
	constructor(stage, position, colour, length, isOb, isBullet, isItem){
		this.stage = stage;
		this.position=position;
		this.intPosition();
		this.colour = colour;
		this.length = length;
		this.isOb = isOb;
		this.isBullet = isBullet;
		this.isItem = isItem;
		this.health = 1;
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	clean(){
		return (this.health <= 0);
	}

	step() {
		this.intPosition();
	}

	draw(context){
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.length, this.length);
		context.lineWidth = 1;
		context.strokeStyle="#000000";
		context.strokeRect(this.x, this.y, this.length, this.length);  	
	}
}

class Ammo extends Item {
	step() {
		var collide = this.stage.getActor(this.x, this.y, this);
		if(collide == this.stage.player){
			collide.ammo += 30;
			this.health = -1;
		}
	}

	clean(){
		return (this.health <= 0 ||(Math.abs(this.x-this.stage.player.x) >= 3*this.stage.width/4 && Math.abs(this.y-this.stage.player.y) >= 3*this.stage.width/4));
	}
}

class Medkit extends Item {
	step() {
		var collide = this.stage.getActor(this.x, this.y, this);
		if(collide!==null){
			if(collide == this.stage.player){
				collide.health = collide.full;
				this.health = -1;
			}
		}
	}

}

class Rifle extends Item {
	step() {
		var collide = this.stage.getActor(this.x, this.y, this);
		if(collide!==null){
			if(collide == this.stage.player){
				this.stage.player.firerate = 100;
				this.health = -1;
			}
		}
	}

}

class Ball {
	constructor(stage, position, velocity, colour, radius, isOb, isBullet, isItem){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position
		this.health = 5;
		this.full = this.health;
		this.kills = 0;
		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
		this.isOb = isOb;
		this.isBullet = isBullet;
		this.isItem = isItem;
		this.pointer = new Pair(0,0);
		this.counter = Math.round(Math.random()*100);
		this.ammo = 60;
		this.weapon = '';
	}
	
	headTo(position){
		
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.pointer = new Pair(this.velocity.x,this.velocity.y);
		this.velocity.normalize();
		this.velocity.x*=3;
		this.velocity.y*=3;
		
	}

	clean(){
		return (this.health <= 0);
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}

	step(){
		this.counter ++;
		this.headTo(this.stage.player.position);
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;
		var collide = this.stage.getActor(this.position.x, this.position.y, this);
		if(collide!==null){
			if(!collide.isBullet&&!collide.isItem){
				this.position.x-=5*this.velocity.x;
				this.position.y-=5*this.velocity.y;
			}
		}
		if(this.counter == 100)this.counter = 0;
		this.intPosition();
	}
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context){
		context.fillStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();  
		context.save();
		context.translate(this.x, this.y);
		context.rotate((3 * Math.PI/2) + Math.atan2(this.pointer.y, this.pointer.x));
		context.beginPath();
    	context.moveTo(0,  this.radius*2);
    	context.lineTo(this.radius/2, this.radius+1);
    	context.lineTo(-this.radius/2, this.radius+1);
		context.fill();
		context.restore();
		context.fillStyle="#FF0000";
		context.fillRect(this.x - this.full*7/2, this.y - this.radius -10, this.health*7 , 5);  
		context.lineWidth = 1;
		context.strokeStyle="#000000";
		context.strokeRect(this.x - this.full*7/2, this.y - this.radius -10, this.full*7 , 5); 
	}
}

class Player extends Ball {
	constructor(stage, position, velocity, colour, radius, isOb, isBullet, isItem, hp){
		super(stage, position, velocity, colour, radius, isOb, isBullet, isItem);
		this.health = hp;
		this.full = this.health;
		this.firerate = 300;
	}

	step(){
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;

		if(this.position.x-this.radius<0){
			this.position.x=this.radius;
		}
		if(this.position.x+this.radius>this.stage.width){
			this.position.x=this.stage.width-this.radius;
		}
		if(this.position.y-this.radius<0){
			this.position.y=this.radius;
		}
		if(this.position.y+this.radius>this.stage.height){
			this.position.y=this.stage.height-this.radius;
		}
		var collide = this.stage.getActor(this.position.x, this.position.y, this);
		if(collide!==null){
			if(!collide.isBullet&&!collide.isItem){
				this.position.x-=5*this.velocity.x;
				this.position.y-=5*this.velocity.y;
			}
		}

		this.intPosition();
	}

	draw(context){
		context.fillStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();
		context.save();
		context.translate(this.x, this.y);
		
		context.rotate((3 * Math.PI/2) + Math.atan2(this.pointer.y, this.pointer.x));
		
		context.beginPath();
    	context.moveTo(0,  this.radius*2);
    	context.lineTo(this.radius/2, this.radius+1);
    	context.lineTo(-this.radius/2, this.radius+1);
		context.fill();
		context.restore();
		
		context.fillStyle="#FF0000";
		context.fillRect(this.x - this.full*7/2 , this.y - this.radius -10, this.health*7 , 5);  
		context.lineWidth = 1;
		context.strokeStyle="#000000";
		context.strokeRect(this.x - this.full*7/2, this.y - this.radius -10, this.full*7 , 5); 
	}
}

class Bullet extends Ball {
	constructor(stage, position, velocity, colour, radius, isOb, isBullet, isItem, owner){
		super(stage, position, velocity, colour, radius, isOb, isBullet, isItem);
		this.owner = owner;
	}

	step(){
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;

		if(this.position.x-this.radius<0){
			this.position.x=this.radius;
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
		if(this.position.x+this.radius>this.stage.width){
			this.position.x=this.stage.width-this.radius;
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
		if(this.position.y-this.radius<0){
			this.position.y=this.radius;
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
		if(this.position.y+this.radius>this.stage.height){
			this.position.y=this.stage.height-this.radius;
			this.velocity.x = 0;
			this.velocity.y = 0;
		}
		var collide = this.stage.getActor(this.position.x, this.position.y, this);
		if(collide!==null){
			if(this.owner!=collide){
				collide.health -= 1;
				if(collide.health <= 0 && !collide.isOb && !collide.isItem)this.owner.kills += 1;
			}
			this.position.x-=this.velocity.x;
			this.position.y-=this.velocity.y;
			this.velocity.x = 0;
			this.velocity.y = 0;
		}

		this.intPosition();
	}

	clean(){
		return (this.velocity.x == 0 && this.velocity.y == 0);
	}


	draw(context){
		context.fillStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();
	}
}
