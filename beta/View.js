class View{
	constructor(canvas){
		this.canvas = canvas;
		this.record = {};
	}

	updateView(msg){
		if(Object.keys(msg).includes("change")){
			this.getUpdate(msg);
		}else{
			this.record = msg;
		}
		var message = this.record;
	
		if(message["game"]["status"] == "win"){
			this.drawWin();
			return;
		}else if(message["game"]["status"] == "wait"){
			this.drawWait();
			return;
		}
		if(!message.hasOwnProperty("players") || !message["players"].hasOwnProperty("main")){
			return;
		}
		
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, 800, 800);
			//camera view
		context.save();
		context.transform(1.5,0,0,1.5,0,0);
	
		context.translate(800/3-message["players"]["main"].x,800/3-message["players"]["main"].y);
		context.lineWidth = 2;
		context.strokeStyle="#000000";
		context.strokeRect(0,0,800,800);
	
		this.drawOb(message);
		this.drawItem(message);
		this.drawAi(message);
		this.drawBullet(message);
		this.drawPlayer(message);
		context.restore();
	
		//Display useful information
		context.save();
		context.fillStyle="#000000";
		context.font = "30px Georgia";
		context.fillText("HP:" + message["players"]["main"].health, 0, 25);
		context.fillText("Kills:" + message["players"]["main"].kills, 0, 55);
		context.fillText(message["game"]["status"] + " Players left", 0, 85);
		context.fillText("Ammo:" + message["players"]["main"].ammo, 0, 115);
		context.restore();
	}
	
	drawOb(message){
		var context = this.canvas.getContext('2d');
		for(var i=0;i<message["obstacles"].length;i++){
			var temp = message["obstacles"][i];
			context.fillStyle = temp.colour;
			   context.fillRect(temp.x, temp.y, temp.length, temp.length);  
			if(temp.health != temp.full){
				context.save();
				context.fillStyle="#964B00";
				context.fillRect(temp.x, temp.y+temp.length/2, temp.length/temp.full * temp.health , 5);  
				context.lineWidth = 1;
				context.strokeStyle="#000000";
				context.strokeRect(temp.x, temp.y+temp.length/2, temp.length , 5); 
				context.restore();
			}
		}
	}
	
	drawItem(message){
		var context = this.canvas.getContext('2d');
		for(var i=0;i<message["items"].length;i++){
			var temp = message["items"][i];
			context.save();
			context.fillStyle = temp.colour;
			   context.fillRect(temp.x, temp.y, temp.length, temp.length);
			context.lineWidth = 1;
			context.strokeStyle="#000000";
			context.strokeRect(temp.x, temp.y, temp.length, temp.length);  
			context.restore();
		}
	}
	
	drawBullet(message){
		var context = this.canvas.getContext('2d');
		for(var i=0;i<message["bullets"].length;i++){
			var temp = message["bullets"][i];
			context.save();
			context.fillStyle = temp.colour;
			context.beginPath(); 
			context.arc(temp.x, temp.y, temp.radius, 0, 2 * Math.PI, false); 
			context.fill();
			context.restore();
		}
	}
	
	drawAi(message){
		var context = this.canvas.getContext('2d');
		for(var i=0;i<message["ai"].length;i++){
			var temp = message["ai"][i];
			context.fillStyle = temp.colour;
			context.beginPath(); 
			context.arc(temp.x, temp.y, temp.radius, 0, 2 * Math.PI, false); 
			context.fill();  
			context.save();
			context.translate(temp.x, temp.y);
			context.rotate((3 * Math.PI/2) + Math.atan2(temp.py, temp.px));
			context.beginPath();
			context.moveTo(0,  temp.radius*2);
			context.lineTo(temp.radius/2, temp.radius+1);
			context.lineTo(-temp.radius/2, temp.radius+1);
			context.fill();
			context.restore();
			context.save();
			if(temp.health>=0){
				context.fillStyle="#FF0000";
				context.fillRect(temp.x - temp.radius -10, temp.y - temp.radius -10, 30/temp.full * temp.health , 5);  
			}
			context.lineWidth = 1;
			context.strokeStyle="#000000";
			context.strokeRect(temp.x - temp.radius -10, temp.y - temp.radius -10, 30 , 5); 
			context.restore();
		}
	}
	
	drawPlayer(message){
		var context = this.canvas.getContext('2d');
		for(var key in message["players"]){
			var temp = message["players"][key];
			context.fillStyle = temp.colour;
			context.beginPath(); 
			context.arc(temp.x, temp.y, temp.radius, 0, 2 * Math.PI, false); 
			context.fill();
			context.save();
			context.translate(temp.x, temp.y);
			context.rotate((3 * Math.PI/2) + Math.atan2(temp.py, temp.px));
			context.beginPath();
			context.moveTo(0,  temp.radius*2);
			context.lineTo(temp.radius/2, temp.radius+1);
			context.lineTo(-temp.radius/2, temp.radius+1);
			context.fill();
			context.restore();
			context.save();
			if(temp.health>=0){
				context.fillStyle="#FF0000";
				context.fillRect(temp.x - temp.radius -10, temp.y - temp.radius -10, 30/temp.full * temp.health , 5);  
			}
			context.lineWidth = 1;
			context.strokeStyle="#000000";
			context.strokeRect(temp.x - temp.radius -10, temp.y - temp.radius -10, 30 , 5); 
			context.restore();
		}
	}
	
	//Draw game win screen
	drawWin(){
		var context = this.canvas.getContext('2d');
		context.save();
		context.globalAlpha = 0.5;
		context.fillStyle = "grey";
		context.fillRect(0, 0, 800, 800);
		context.globalAlpha = 1;
		context.font = "60px Georgia";
		context.fillStyle = "white";
		context.fillText("WIN", 800/2 - 65, 800/2);
		context.lineWidth = 2;
		context.strokeStyle="#000000";
		context.strokeText("WIN", 800/2 - 65, 800/2);
		context.font = "30px Georgia";
		context.fillText("You are the f0rt9it32d Champoion!", 800/2 - 220, 800/2+60);
		context.strokeText("You are the f0rt9it32d Champoion!", 800/2 - 220, 800/2+60);
		context.restore();
		this.record = {};
	}
	
	//Draw game pause screen
	drawWait(){
		var context = this.canvas.getContext('2d');
		context.save();
		context.globalAlpha = 0.5;
		context.fillStyle = "grey";
		context.fillRect(0, 0, 800, 800);
		context.globalAlpha = 1;
		context.font = "60px Georgia";
		context.fillStyle = "white";
		context.fillText("Waiting", 800/2 - 110, 800/2);
		context.lineWidth = 2;
		context.strokeStyle="#000000";
		context.strokeText("Waiting", 800/2 - 110, 800/2);
		context.font = "30px Georgia";
		context.fillText("Please wait for the next game", 800/2 - 200, 800/2+60);
		context.strokeText("Please wait for the next game", 800/2 - 200, 800/2+60);
		context.restore();
		this.record = {};
	}

	getUpdate(msg){
		for(var key in msg["change"]){
				if(key == "players"){
						for(var key2 in msg["change"]["players"]){
								this.record["players"][key2] = msg["change"]["players"][key2];
						}
				}else{
						this.record["game"] = msg["change"]["game"];
				} 
		}
		for(var key in msg["add"]){
				if(key == "players"){
						for(var key2 in msg["add"]["players"]){
								this.record["players"][key2] = msg["add"]["players"][key2];
						}
				}else{
						for(var i in msg["add"][key]){
								this.record[key].push(msg["add"][key][i]);
						}
				} 
		}
		for(var key in msg["remove"]){
				if(key == "players"){
						for(var key2 in msg["remove"]["players"]){
								delete this.record["players"][key2];
						}
				}else{
						for(var i in msg["remove"][key]){
								this.record[key] = this.record[key].filter(elem => !this.compareDict(elem, msg["remove"][key][i]));
						}
				} 
		}
	
	}

	compareDict(dict1,dict2){
		return JSON.stringify(dict1) == JSON.stringify(dict2)
	}
}


export default View;