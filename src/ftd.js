var port = 8000; 

var express = require('express');
var app = express();

const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});


const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

app.use(bodyParser.json());

// Handle rest uri for registering account and store it in the database
app.use('/api/register', function (req, res,next) {
	var emailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	// Check if all the required inputs are in the request body
	if (!"username" in req.body || !"password" in req.body || !"repassword" in req.body || !"gender" in req.body || !"country" in req.body || !"email" in req.body) {
		return res.status(400).json({"error":'Missing required input'});
	}

	// Check if the password and confirm password are identical
	if(req.body.password!=req.body.repassword){
		return res.status(400).json({"error":'Password and confirm password are not identical'});
	}
	
	// Check if the email address is valid
	if (!req.body.email.match(emailformat)){
		return res.status(400).json({"error":'Invalid email format'});
	}
	
	let sql = 'INSERT INTO ftduser(username, password, gender, country, email) VALUES ($1,sha512($2),$3,$4,$5);';
	// Insert the account information to the database
	pool.query(sql, [req.body.username, req.body.password, req.body.gender, req.body.country, req.body.email], (err, pgRes) => {
		if(err && err.code==23505){ // pg duplicate key error
			res.status(409);
			res.json({"error":`Username ${req.body.username} is already in database`});
			return;
		}
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		}
		// Check if the register success
		if(pgRes.rowCount == 1){
			next();
		} else {
			res.status(500);
			res.json({"error":`couldn't add ${req.body.username}`});
		}
	});
});

// Handle rest uri for initialize the stats of the newly registered account to the databse
app.post('/api/register/init', function (req, res) {
	let sql = 'INSERT INTO stats(username, easyHighest, interHighest, hardHighest) VALUES ($1, 0, 0, 0);';
	// Insert new account stats to the database
	pool.query(sql, [req.body.username], (err, pgRes) => {
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		}
		// Check if the initialization success
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"message":"success"}); 
		} else {
			res.status(500);
			res.json({"error":`couldn't initialize ${req.body.username}`});
		}
	});
});

// Handle rest uri for get the leaderBoard data from the database
app.get('/api/leaderBoard/:leaderBoardType', function (req, res) {
	var type = req.params.leaderBoardType;
	let sql;
	// Select the needed leaderBoard type
	if (type=="leaderBoardEasy") {
		sql = 'SELECT username, easyhighest AS score FROM stats ORDER BY easyhighest DESC LIMIT 10;';
	} else if (type=="leaderBoardInter") {
		sql = 'SELECT username, interhighest AS score FROM stats ORDER BY interhighest DESC LIMIT 10;';
	} else {
		sql = 'SELECT username, hardhighest AS score FROM stats ORDER BY hardhighest DESC LIMIT 10;';
	}

	// Get the leaderBoard
	pool.query(sql, [], (err, pgRes) => {
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		var response=[];
		res.status(200);
		for(let i=0; i<pgRes.rowCount; i++) {
			response.push([pgRes.rows[i].username, pgRes.rows[i].score]);
		}
		res.json({"array": response}); 
	});
});

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth', function (req, res,next) {
	// Check if credential exists in header
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString();
		m = /^(.*):(.*)$/.exec(user_pass);

		var username = m[1];
		var password = m[2];

		// Check if username or password are empty
		if (username==""){
			return res.status(400).json({ error: 'Username cannot be empty'});
		} else if (password==""){
			return res.status(400).json({ error: 'Password cannot be empty'});
		}

		// Authorize the account
		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        pool.query(sql, [username, password], (err, pgRes) => {
			// Check error
  			if (err){
                res.status(500).json({ error: err.message});
			}
			if(pgRes.rowCount == 1){
				next(); 
			} else {
                res.status(401).json({ error: 'Not authorized'});
        	}
		});
	} catch(err) {
    	res.status(401).json({ error: 'Not authorized'});
	}
});

// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.get('/api/auth/play', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.get('/api/auth/instruction', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

// Handle rest uri for getting the stats of a user from the database
app.get('/api/auth/stats/:username', function (req, res) {
	var userName = req.params.username;

	// Get the stats
	let sql = 'SELECT * FROM stats WHERE username=$1;';
	pool.query(sql, [userName], (err, pgRes) => {
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		// Check if the user exists in the databse
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"easy":pgRes.rows[0].easyhighest, "intermediate":pgRes.rows[0].interhighest, "hard":pgRes.rows[0].hardhighest}); 
		} else {
			res.status(404);
			res.json({"error":`couldn't find user ${userName}`});
		}
	});
});

// Handle rest uri for getting the information of a user from the database
app.get('/api/auth/profile/:username', function (req, res) {
	var userName = req.params.username;

	// Get the information
	let sql = 'SELECT * FROM ftduser WHERE username=$1;';
	pool.query(sql, [userName], (err, pgRes) => {
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		// Check if the user exists in database
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"gender":pgRes.rows[0].gender, "country":pgRes.rows[0].country, "email":pgRes.rows[0].email}); 
		} else {
			res.status(404);
			res.json({"error":`couldn't find user ${userName}`});
		}
	});
});

// Handle rest uri for updating the information of a user to the database
app.put('/api/auth/profile/:username', function (req, res) {
	var userName = req.params.username;
	var emailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	// Check if all the required inputs are in the request body
	if (!"password" in req.body || !"repassword" in req.body || !"gender" in req.body || !"country" in req.body || !"email" in req.body) {
		return res.status(400).json({"error":'Missing required input'});
	}

	// Check if the password and confirm password are identical
	if(req.body.password!=req.body.repassword){
		return res.status(400).json({"error":'Password and confirm password are not identical'});
	}

	// Check if the email address is valid
	if (!req.body.email.match(emailformat)){
		return res.status(400).json({"error":'Invalid email format'});
	}
	
	// Update the user information
	let sql = 'UPDATE ftduser SET password=sha512($2), gender=$3, country=$4, email=$5 WHERE username=$1;';
	pool.query(sql, [userName, req.body.password, req.body.gender, req.body.country, req.body.email], (err, pgRes) => {
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		// Check if update success
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"password":req.body.password}); 
		} else {
			res.status(500);
			res.json({"error":`couldn't update ${userName}`});
		}
	});
});

// Handle rest uri for deleting a user from the database
app.delete('/api/auth/profile/:username', function (req, res) {
	var userName = req.params.username;

	// Delete the user
	let sql = 'DELETE FROM ftduser WHERE username=$1;';
	pool.query(sql, [userName], (err, pgRes) => {
		// Check error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		// Check if the delete was succeed
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"message":"success"}); 
		} else {
			res.status(404);
			res.json({"error":`couldn't find user ${userName}`});
		}
	});
});

// Handle rest uri for updating the user score to the database
app.use('/api/auth/updateScore/:username', function (req, res, next) {
	var userName = req.params.username;
	let sql;

	// Check if the required inputs are in the request body
	if (!"difficulty" in req.body || !"score" in req.body) {
		return res.status(400).json({"error":'Missing required data'});
	}

	// Check the difficulty to update the score for
	if (req.body.difficulty=="easy") {
		sql = 'SELECT easyHighest AS old FROM stats WHERE username=$1;';
	} else if (req.body.difficulty=="intermediate") {
		sql = 'SELECT interHighest AS old FROM stats WHERE username=$1;';
	} else if (req.body.difficulty=="hard") {
		sql = 'SELECT hardHighest AS old FROM stats WHERE username=$1;';
	} else {
		return res.status(400).json({"error":'Invalid difficulty'});
	}

	// Retrieve the old score and compare it to the new one
	pool.query(sql, [userName], (err, pgRes) => {
		// Check the error
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		// Check if the score was retrieved
		if(pgRes.rowCount == 1){
			// Compare the two scores
			if (pgRes.rows[0].old<req.body.score) {
				next();
			} else {
				res.status(200);
				res.json({"message":"Not a new highest score"});
			}
		} else {
			res.status(404);
			res.json({"error":`couldn't find user ${userName}`});
		}
	});
});

// Handle rest uri for updating the user score to the database
app.put('/api/auth/updateScore/:username', function (req, res) {
	var userName = req.params.username;
	let sql;

	// Check the difficulty to update the score for
	if (req.body.difficulty=="easy") {
		sql = 'UPDATE stats SET easyHighest=$2 WHERE username=$1;';
	} else if (req.body.difficulty=="intermediate") {
		sql = 'UPDATE stats SET interHighest=$2 WHERE username=$1;';
	} else if (req.body.difficulty=="hard") {
		sql = 'UPDATE stats SET hardHighest=$2 WHERE username=$1;';
	} else {
		return res.status(400).json({"error":'Invalid difficulty'});
	}

	// Update the new score
	pool.query(sql, [userName, req.body.score], (err, pgRes) => {
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		// Check if update sccuess
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"message":"score updated"});
		} else {
			res.status(500);
			res.json({"error":`couldn't update ${userName}`});
		}
	});
});

app.use('/',express.static('static_content')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

//==================================
var webSocketPort = port+1;
var model = require('./model');
var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: webSocketPort});
var stage=null;
var connection = 0;
var client_id = 0;
var state = false;
var interval=null;
var record = {};
var dict = {};

wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
	for(let ws of this.clients){ 
		ws.send(message); 
	}
}

wss.on('connection', function(ws) {
	console.log("new connection");
	ws.id = "client" + client_id;
	client_id ++;
	connection+=1;
	if(connection == 1){
		stage = new model.Stage(20, 5, 70, 1);
		stage.addPlayer(ws.id);
		setupGame();
	}else{
		if(state){
			stage.addPlayer(ws.id);
		}else{
			ws.send(JSON.stringify(["wait"]));
		}
	}
	
	ws.on('message', function(msg) {
		if(state && stage.player[ws.id]){
			message = JSON.parse(msg);
			if(Object.keys(message).includes("move")){
				stage.player[ws.id].velocity = new model.Pair(message["move"][0],message["move"][1]);
			}
			if(Object.keys(message).includes("fire")){
				if(message["fire"]){
					stage.player[ws.id].timeout = setInterval(function () {
						if(stage.player[ws.id].ammo > 0){
								var angle = Math.atan2(stage.player[ws.id].pointer.y , stage.player[ws.id].pointer.x);
								var velocity = new model.Pair(stage.player[ws.id].velocity.x/2 + Math.cos(angle)*15, stage.player[ws.id].velocity.y/2 + Math.sin(angle)*15);
								var colour= 'rgba(0,0,0,1)';
								var position = new model.Pair(stage.player[ws.id].x, stage.player[ws.id].y);
								var b = new model.Bullet(stage, position, velocity, colour, 2.5, false, true, false, stage.player[ws.id]);
								stage.addActor(b);
								stage.player[ws.id].ammo -=1;
						};
					}, stage.player[ws.id].firerate);
				}else{
					stage.stop(ws.id);
				}
			}
			if(Object.keys(message).includes("offset")){
				stage.player[ws.id].pointer = new model.Pair(message["offset"][0] , message["offset"][1]);
			}
		}
	});

	ws.on('close', function() {
		console.log("disconnected");
		connection-=1;
		stage.removePlayer(ws.id);
		if(connection < 1){
			endGame();
		}
	});
});

//draw each frame repeatly
function setupGame(){
	state=true;
	interval=setInterval(function(){
        stage.step();
		sendUpdate();
		sendNew();
        if(stage.isEnd||stage.isWin){
            endGame();
            return;
        }
    },70);
}

//Game end function. If the game ended, display proper information
function endGame(){
	console.log("endGame");
	state = false;
    clearInterval(interval);
	interval=null;
    //updateScore(stage.player.kills);
	sendResult();
	for(var key in stage.player) {
		stage.stop(key);
	}
	setTimeout(function () {
		if(connection>=1){
			stage = new model.Stage(20, 1, 70, 1);
			for(let ws of wss.clients){ 
				stage.addPlayer(ws.id);
			}
			setupGame();
		}
	}, 1000);
}

function sendUpdate(){
	var msg = generateMsg();
	record = msg;
	for(let ws of wss.clients){ 
		if(Object.keys(stage.player).includes(ws.id)){
			var temp = {...msg[0]};
			if (temp.hasOwnProperty(ws.id)) {
				temp.main = temp[ws.id];
				delete temp[ws.id];
			}
			ws.send(JSON.stringify([temp,msg[1],msg[2],msg[3],msg[4],msg[5]])); 
		}else{
			ws.send(JSON.stringify(["wait"]));
		}
	}
}

function sendResult(){
	for(let ws of wss.clients){ 
		if(Object.keys(stage.player).includes(ws.id)){
			ws.send(JSON.stringify(["win"])); 
		}else{
			ws.send(JSON.stringify(["wait"])); 
		}
	}
}

function generateMsg(){
	var obstacles =[];
	var items = [];
	var bullets = [];
	var ai= [];
	var players = {};
	var info = {};
	info.alive = stage.alive;
	for(var i=0; i<stage.actors.length;i++){
		if(stage.actors[i].isOb){
			obstacles.push({colour: stage.actors[i].colour, 
				length: stage.actors[i].length,
				full: stage.actors[i].full,
				health: stage.actors[i].health,
				x: stage.actors[i].x,
				y: stage.actors[i].y});
		}else if(stage.actors[i].isItem){
			items.push({colour: stage.actors[i].colour, 
				length: stage.actors[i].length,
				x: stage.actors[i].x,
				y: stage.actors[i].y});
		}else if(stage.actors[i].isBullet){
			bullets.push({colour: stage.actors[i].colour, 
				radius: stage.actors[i].radius,
				x: stage.actors[i].x,
				y: stage.actors[i].y});
		}else if(!Object.values(stage.player).includes(stage.actors[i])){
			ai.push({colour: stage.actors[i].colour, 
				radius: stage.actors[i].radius,
				x: stage.actors[i].x,
				y: stage.actors[i].y,
				full: stage.actors[i].full,
				health: stage.actors[i].health,
				px: stage.actors[i].pointer.x,
				py: stage.actors[i].pointer.y});
		}
	}
	for(var key in stage.player) {
		players[key] = {x: stage.player[key].x, 
			y: stage.player[key].y,
			px: stage.player[key].pointer.x,
			py: stage.player[key].pointer.y,
			radius: stage.player[key].radius,
			full: stage.player[key].full,
			health: stage.player[key].health,
			colour: stage.player[key].colour,	
			kills: stage.player[key].kills,
			ammo: stage.player[key].ammo
		};
	}
	return [players,obstacles,items,bullets,ai,info];
}

function sendNew(){
	var latest = generateMsg();
	//console.log( Object.values(latest));
	var change = [];
	var obstacles =[];
	var items = [];
	var bullets = [];
	var ai= [];
	var players = {};
	var info = {};	
	//console.log(change);
}