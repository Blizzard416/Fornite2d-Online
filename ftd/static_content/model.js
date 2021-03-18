function randint(min, max){ return Math.round(Math.random()*(max-min)+min); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(canvas){
		this.canvas = canvas;
		//this.camera = Pair(0,0);
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
	
		// the logical width and height of the stage
		this.width=canvas.width;
		this.height=canvas.height;

		// Add the player to the center of the stage
		var velocity = new Pair(0,0);
		var radius = 10;
		var colour= 'rgba(124,252,0,1)';
		var position = new Pair(Math.floor(this.width/2), Math.floor(this.height/2));
		this.addPlayer(new Player(this, position, velocity, colour, radius, false));
		
		var total=40;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-20))); 
			var y=Math.floor((Math.random()*(this.width-20))); 
			if(this.getActor(x,y,this.player)===null){
				var red=randint(0, 255), green=randint(0, 255), blue=randint(0, 255);
				var alpha = Math.random();
				var radius = randint(30,40);
				var colour= 'rgba('+red+','+green+','+blue+','+alpha+')';
				var position = new Pair(x,y);
				var b = new Obstacles(this, position, colour, radius, true);
				this.addActor(b);
				total--;
			}
		}
		
		var total=20;
		while(total>0){
			var x=Math.floor((Math.random()*this.width)); 
			var y=Math.floor((Math.random()*this.height)); 
			if(this.getActor(x,y,this.player)===null){
				var radius = 10;
				var velocity = new Pair(rand(20), rand(20));
				var alpha = Math.random();
				var colour= 'rgba(255,0,0,1)';
				var position = new Pair(x,y);
				var b = new Ball(this, position, velocity, colour, radius, false);
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
		}
	}

	draw(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		context.save();
		context.transform(1.5,0,0,1.5,0,0);
		context.translate(this.width/3-this.player.x,this.height/3-this.player.y);
		
		context.lineWidth = 2;
		context.strokeStyle="#FF0000";
		context.strokeRect(0, 0, this.width, this.height);
		
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].draw(context);
		}
		context.restore();
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y, cur){
		for(var i=0;i<this.actors.length;i++){
			var length;
			if (this.actors[i] === cur)
				continue;
			if (this.actors[i].isOb) {
				length = this.actors[i].length;
				if(x<this.actors[i].x+length && x>this.actors[i].x && y<this.actors[i].y+length&& y>this.actors[i].y){
					return this.actors[i];
				}
			} else {
				length = this.actors[i].radius;
				if(x<this.actors[i].x+length && x>this.actors[i].x-length && y<this.actors[i].y+length&& y>this.actors[i].y-length){
					return this.actors[i];
				}
			}
		}
		return null;
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
	constructor(stage, position, colour, length, isOb){
		this.stage = stage;
		this.position=position;
		this.intPosition();
		this.colour = colour;
		this.length = length;
		this.isOb = isOb;
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	step() {
		this.intPosition();
	}

	draw(context){
		context.fillStyle = this.colour;
   		context.fillRect(this.x, this.y, this.length,this.length);  
	}
}

class Ball {
	constructor(stage, position, velocity, colour, radius, isOb){
		this.stage = stage;
		this.position=position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity=velocity;
		this.colour = colour;
		this.radius = radius;
		this.isOb = isOb;
		this.pointer = new Pair(0,0);
	}
	
	headTo(position){
		
		this.velocity.x=(position.x-this.position.x);
		this.velocity.y=(position.y-this.position.y);
		this.pointer = new Pair(this.velocity.x,this.velocity.y);
		this.velocity.normalize();
		this.velocity.x*=3;
		this.velocity.y*=3;
		
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}

	step(){
		this.headTo(this.stage.player.position);
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;

		if(this.stage.getActor(this.position.x, this.position.y, this)!==null){
			this.position.x-=this.velocity.x;
			this.position.y-=this.velocity.y;
		}
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
    	context.moveTo(0,  this.radius*3/2);
    	context.lineTo(this.radius/2, this.radius);
    	context.lineTo(-this.radius/2, this.radius);
		context.fill();
		context.restore();
	}
}

class Player extends Ball {
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
		if(this.stage.getActor(this.position.x, this.position.y, this)!==null){
			this.position.x-=this.velocity.x;
			this.position.y-=this.velocity.y;
		}

		this.intPosition();
	}

	draw(context){
		context.fillStyle = this.colour;
   		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();
		context.fillRect(this.x, this.y, 5,5)
		context.save();
		console.log(this.pointer.y, this.pointer.x);
		context.translate(this.x, this.y);
		
		context.rotate((3 * Math.PI/2) + Math.atan2(this.pointer.y, this.pointer.x));
		
		context.beginPath();
    	context.moveTo(0,  this.radius*2);
    	context.lineTo(this.radius/2, this.radius);
    	context.lineTo(-this.radius/2, this.radius);
		context.fill();
		context.restore();
	}
}
