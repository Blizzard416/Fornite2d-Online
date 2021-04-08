import View from './View';

var stage=null;
var view = null;
var socket;
var keys = {'w': false,'a':false,'s':false,'d':false};
var sid = 1;

export const connectSocket = (canvas, user)=>{
        stage = canvas;
        sid = user;
        socket = new WebSocket(`ws://${window.location.hostname}:8001`);
        view = new View(stage);
	socket.onopen = function (event) {
		document.addEventListener('keydown', moveByKey);
                document.addEventListener('keyup', moveByKey);
                document.addEventListener('mousemove', mouseFollow);
                document.addEventListener('mousedown', Fire);
                document.addEventListener('mouseup', mouseup);
	};
	socket.onmessage = function (event) {
		view.updateView(event.data);
	}
}

export const closeSocket = () => {
        if (socket != null) {
                document.removeEventListener('keydown', moveByKey);
                document.removeEventListener('keyup', moveByKey);
                document.removeEventListener('mousemove', mouseFollow);
                document.removeEventListener('mousedown', Fire);
                document.removeEventListener('mouseup', mouseup);
                socket.close();
        }
}

//eventhandler for keys
function moveByKey(event){
	var x = 0;
        var y = 0;
	var e = event.key;
        keys[e] = true;
        if(event.type === 'keyup') keys[e] = false;
	if(keys['w']) y -= 10;
        if(keys['a']) x -= 10;
        if(keys['s']) y += 10;
        if(keys['d']) x += 10;
	
        socket.send(JSON.stringify({"player":sid, "move":[x,y]}));
}

//eventhandler for mousemove
function mouseFollow(event){
        //get the x,y offset of the canvas and calculate the mouse position reletaed to the (o,o) on canvas
        //because the event.x,y coordinates are based on the windows not the canvas
        var offsetx = stage.offsetLeft + stage.width/2;
        var offsety = stage.offsetTop + stage.height/2;
        socket.send(JSON.stringify({"player":sid, "offset":[event.x - offsetx, event.y - offsety]}));
}

//eventhandler for mousedown, start shooting
function Fire(event){
        socket.send(JSON.stringify({"player":sid, "fire":true}));       
}

//eventhandler for mousedown, stop shooting
function mouseup(event){
        socket.send(JSON.stringify({"player":sid, "fire":false})); 
}