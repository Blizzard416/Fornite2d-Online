import View from './View';

var stage=null;
var view = null;
var socket;
var keys = {'w': false,'a':false,'s':false,'d':false};
//user id
var uid = "";

//helper to connect to the socket and setup the eventhandler
export const connectSocket = (canvas, user)=>{
        stage = canvas;
        uid = user;
        setTimeout(function () {
		socket = new WebSocket(`ws://${window.location.hostname}:8001`);
                socket.onopen = function (event) {
                        document.addEventListener('keydown', moveByKey);
                        document.addEventListener('keyup', moveByKey);
                        document.addEventListener('mousemove', mouseFollow);
                        document.addEventListener('mousedown', Fire);
                        document.addEventListener('mouseup', mouseup);
                };
                view = new View(stage);
                socket.onmessage = function (event) {
                        var msg = JSON.parse(event.data); 
                        view.updateView(msg);
                }
	}, 800);   
}

//helper to disconnect from the socket
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


//eventhandler for keys, send speific movement requests to the server
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
	
        socket.send(JSON.stringify({"player":uid, "move":[x,y]}));
}

//eventhandler for mousemove
function mouseFollow(event){
        //get the x,y offset of the canvas and calculate the mouse position reletaed to the (o,o) on canvas
        //because the event.x,y coordinates are based on the windows not the canvas
        var offsetx = stage.offsetLeft + stage.width/2;
        var offsety = stage.offsetTop + stage.height/2;
        socket.send(JSON.stringify({"player":uid, "offset":[event.x - offsetx, event.y - offsety]}));
}

//eventhandler for mousedown, start shooting
function Fire(event){
        socket.send(JSON.stringify({"player":uid, "fire":true}));       
}

//eventhandler for mousedown, stop shooting
function mouseup(event){
        socket.send(JSON.stringify({"player":uid, "fire":false})); 
}