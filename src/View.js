class View{
	constructor(canvas){
		this.record = {};
		this.canvas = canvas;
	}

	updateView(msg){
		var message = JSON.parse(msg);
		if(message[0] == "win"){
			this.drawWin();
			return;
		}else if(message[0] == "wait"){
			this.drawWait();
			return;
		}
		
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, 800, 800);
			//camera view
		context.save();
		context.transform(1.5,0,0,1.5,0,0);
	
		context.translate(800/3-message[0].main.x,800/3-message[0].main.y);
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
		context.fillText("HP:" + message[0].main.health, 0, 25);
		context.fillText("Kills:" + message[0].main.kills, 0, 55);
		context.fillText(message[5].alive + " Players left", 0, 85);
		context.fillText("Ammo:" + message[0].main.ammo, 0, 115);
		context.restore();
	}
	
	drawOb(message){
		var context = this.canvas.getContext('2d');
		for(var i=0;i<message[1].length;i++){
			var temp = message[1][i];
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
		for(var i=0;i<message[2].length;i++){
			var temp = message[2][i];
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
		for(var i=0;i<message[3].length;i++){
			var temp = message[3][i];
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
		for(var i=0;i<message[4].length;i++){
			var temp = message[4][i];
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
		for(var key in message[0]){
			var temp = message[0][key];
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
	}
}

export default View;