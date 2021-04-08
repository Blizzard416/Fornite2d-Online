function randint(min, max){ return Math.round(Math.random()*(max-min)+min); }
function rand(n){ return Math.random()*n; }

class Stage {
	constructor(ob, ai, rate, hp){
		this.hp = hp;
		this.alive = 0; // num of players alive
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player={}; // a special actor, the player
		this.isEnd = false; //check if the game ended
		this.isWin = false; //check if the user wins
		this.rate = rate; // firerate of the AIs
		this.kills = {};
		// the logical width and height of the stage
		this.width=800;
		this.height=800;
		
		//Obstacles generating...
		var total=ob;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-40))); 
			var y=Math.floor((Math.random()*(this.height-40))); 
			if (x>this.width/2-40 && x<this.width/2+40 && y<this.height/2+40 && y<this.height/2+40) continue; 

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

		//Medkits&Ammunation Box generating...
		total = 10;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-5))); 
			var y=Math.floor((Math.random()*(this.height-5))); 
			if(this.getActor(x, y, null) == null){
				b = new Ammo(this, new Pair(x,y), "#3Cb043", 5, false, false, true);
				this.addActor(b);
			}
			total--;
		}

		total = 10;
		while(total>0){
			x=Math.floor((Math.random()*(this.width-5))); 
			y=Math.floor((Math.random()*(this.height-5))); 
			if(this.getActor(x, y, null) == null){
				b = new Medkit(this, new Pair(x,y), "#ff8080", 5, false, false, true);
				this.addActor(b);
			}
			total--;
		}

		//Rifle generating...
		total = 3;
		while(total>0){
			var x=Math.floor((Math.random()*(this.width-5))); 
			var y=Math.floor((Math.random()*(this.height-5))); 
			if(this.getActor(x, y, null) == null){
				b = new Rifle(this, new Pair(x,y), "#000000", 5, false, false, true);
				this.addActor(b);			
				total--;
			}
		}
		//AIs generating...
		total=ai;
		while(total>0){
			
			var x=Math.floor((Math.random()*this.width-5)); 
			var y=Math.floor((Math.random()*this.height-5)); 
			if(this.getActor(x, y, null) == null){
				var radius = 5;
				var velocity = new Pair(0, 0);
				var alpha = Math.random();
				var colour= 'rgba(255,0,0,1)';
				var position = new Pair(x,y);
				var b = new Ball(this, position, velocity, colour, radius, false, false, false);
				this.addActor(b);
				total--;
			}
		}
	}

	//Add the user to the actors list
	addPlayer(id){
		var x,y;
		var player;
		while(1){
			x=Math.floor((Math.random()*(this.width-40))); 
			y=Math.floor((Math.random()*(this.height-40))); 
			if(this.getActor(x, y, null) == null){
				var velocity = new Pair(0,0);
				var radius = 5;
				var colour= 'rgba(124,252,0,1)';
				var position = new Pair(x,y);
				var player = new Player(this, position, velocity, colour, radius, false, false, false, this.hp);
				this.addActor(player);
				this.player[id] = player;
				this.kills[id] = player.kills;
				break;
			}
		}
		return new Pair(x,y);
	}

	//Remove the user from the actors list
	removePlayer(id){
		this.removeActor(this.player[id]);
		delete this.player[id];
	}

	//Add an actor to the actors list
	addActor(actor){
		this.actors.push(actor);
	}

	//Remove an specific actor from the actors list
	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
	}

	//Update the alive number
	countAlive(){
		this.alive = 0;	
		for(var i=0;i<this.actors.length;i++){
			if(!this.actors[i].isOb && !this.actors[i].isBullet && !this.actors[i].isItem){
				this.alive +=1;
			}
		}
		
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		for(var i=0;i<this.actors.length;i++){
			this.actors[i].step();
			//if this actor is an AI
			if(!this.actors[i].isOb && !this.actors[i].isBullet && !Object.values(this.player).includes(this.actors[i])){
				//check is it the right time to fire a shoot
				if(this.actors[i].counter%this.rate == 0){
					var angle =  Math.atan2(this.actors[i].pointer.y , this.actors[i].pointer.x);
					var velocity = new Pair(this.actors[i].velocity.x/2 + Math.cos(angle)*20, this.actors[i].velocity.y/2 + Math.sin(angle)*20);
					var colour= 'rgba(0,0,0,1)';
					var position = new Pair(this.actors[i].x,this.actors[i].y);
					var b = new Bullet(this, position, velocity, colour, 2.5, false, true, false, this.actors[i]);
					this.addActor(b);
				}
			}
			//Clean up expired actors
			if(this.actors[i].clean()){
				if(Object.values(this.player).includes(this.actors[i])){
					for(var key in this.player){
						if(this.player[key] == this.actors[i]){
							this.stop(key);
							this.kills[key] = this.player[key].kills;
							delete this.player[key];
						}
					}
				}
				this.removeActor(this.actors[i]);
			}
		}
		//Update the alive number
		this.countAlive();
		//win the game if only the user is alive
		for(var key in this.player) {
			this.kills[key] = this.player[key].kills;
			if(this.alive == 1 && this.actors.includes(this.player[key])) this.isWin = true;
		}

		if(Object.keys(this.player).length == 0){
			this.isEnd = true;
			return;
		}
	}

	stop(id){
		if(this.player[id]){
			clearInterval(this.player[id].timeout);
			this.player[id].timeout = null;
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y, cur){
		for(var i=0;i<this.actors.length;i++){
			var length;
			//Skip itself
			if (this.actors[i] === cur){
				continue;
			}
			//check if the actor is a colliding obstacle or item to the object on current x, y
			if (this.actors[i].isOb||this.actors[i].isItem) {
				length = this.actors[i].length;
				if(x<=this.actors[i].x+length+2 && x>=this.actors[i].x-2 && y<=this.actors[i].y+length+2&& y>=this.actors[i].y-2){
					return this.actors[i];
				}
			} else {
				//ignore the case when a bullet is colliding with another bullet
				if(cur != null && (this.actors[i].isBullet||this.actors[i].isItem)){
					if(cur.isBullet) continue;
				}
				//check if the actor is a colliding player to the object on current x, y
				length = this.actors[i].radius;
				if(x<=this.actors[i].x+length+2 && x>=this.actors[i].x-length-2 && y<=this.actors[i].y+length+2&& y>=this.actors[i].y-length-2){
					return this.actors[i];
				}
								
			}
		}
		return null;
	}

} // End Class Stages

//pair used to storge x,y coordinates
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

//Obstacles
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

	//round the position
	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	//return if the object will be cleaned
	clean(){
		return (this.health <= 0);
	}

	//perform the next step
	step() {
		this.intPosition();
	}
}

//Item includes ammunation boxes, weapon boxes or medkits
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

	//return if the object will be cleaned
	clean(){
		return (this.health <= 0);
	}

	step() {
		this.intPosition();
	}
}

//Give players 30 more ammo
class Ammo extends Item {
	step() {
		//check collision
		var collide = this.stage.getActor(this.x, this.y, this);
		if(collide!==null){
			if(Object.values(this.stage.player).includes(collide)){
				collide.ammo += 30;
				this.health = -1;
			}
		}
	}

	//return if the object will be cleaned
	//the bullet will be cleaned if it is away from the player of 3/4 size of the map to save the memory.
	clean(){
		return (this.health <= 0 ||(Math.abs(this.x-this.stage.player.x) >= 3*this.stage.width/4 && Math.abs(this.y-this.stage.player.y) >= 3*this.stage.width/4));
	}
}

//Restore the player's health
class Medkit extends Item {
	step() {
		var collide = this.stage.getActor(this.x, this.y, this);
		//check collision
		if(collide!==null){
			if(Object.values(this.stage.player).includes(collide)){
				collide.health = collide.full;
				this.health = -1;
			}
		}
	}

}

//a high fire-rate weapon
class Rifle extends Item {
	step() {
		var collide = this.stage.getActor(this.x, this.y, this);
		//check collision
		if(collide!==null){
			if(Object.values(this.stage.player).includes(collide)){
				collide.firerate = 100;
				this.health = -1;
			}
		}
	}
}

//Parent class for player and bullets
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
		this.pointer = new Pair(0,0); // the location where the pointer points at
		this.counter = Math.round(Math.random()*100);
		this.ammo = 60;
		this.target = null;
	}
	
	//heads to the users's location
	headTo(){
		if(this.counter%(this.stage.rate/2) == 0){
			this.target = this.stage.player[Object.keys(this.stage.player)[Math.floor(Math.random()*Object.keys(this.stage.player).length)]];
		}
		if(this.target != null){
			var position = this.target.position;
			this.velocity.x=(position.x-this.position.x);
			this.velocity.y=(position.y-this.position.y);
			this.pointer = new Pair(this.velocity.x,this.velocity.y);
			this.velocity.normalize();
			this.velocity.x*=3;
			this.velocity.y*=3;
		}
	}

	//return if the object will be cleaned
	clean(){
		return (this.health <= 0);
	}

	toString(){
		return this.position.toString() + " " + this.velocity.toString();
	}

	step(){
		this.counter ++;
		this.headTo();
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;
		//check if the player is out of the map
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
		//check collision
		var collide = this.stage.getActor(this.position.x, this.position.y, this);
		if(collide!==null){
			if(!collide.isBullet&&!collide.isItem){
				this.position.x-=this.velocity.x;
				this.position.y-=this.velocity.y;
			}
		}
		if(this.counter == 100)this.counter = 0;
		this.intPosition();
	}

	intPosition(){
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

}

//the user class
class Player extends Ball {
	constructor(stage, position, velocity, colour, radius, isOb, isBullet, isItem, hp){
		super(stage, position, velocity, colour, radius, isOb, isBullet, isItem);
		this.health = hp;
		this.full = this.health;
		this.firerate = 300;
		this.timeout = null;
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
				this.position.x-=this.velocity.x;
				this.position.y-=this.velocity.y;
			}
		}

		this.intPosition();
	}
}

//bullet class
class Bullet extends Ball {
	constructor(stage, position, velocity, colour, radius, isOb, isBullet, isItem, owner){
		super(stage, position, velocity, colour, radius, isOb, isBullet, isItem);
		this.owner = owner;
	}

	step(){
		this.position.x=this.position.x+this.velocity.x;
		this.position.y=this.position.y+this.velocity.y;

		//boader test
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
		//collision test
		var collide = this.stage.getActor(this.position.x, this.position.y, this);
		if(collide!==null){
			//if the bullet hit someone that isn't the owner(the one who shoot this bullet)
			if(this.owner!=collide){
				collide.health -= 1;
				//if he is dead, add 1 to the owner's kills record
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
		// if the velocity is 0, need to clean
		return (this.velocity.x == 0 && this.velocity.y == 0);
	}
}

module.exports = {Stage, Pair, Bullet}