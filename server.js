const express = require('express');
const bodyParser = require('body-parser');
const Validator = require("validator");
const bcrypt = require("bcryptjs");

const {mongoose} = require("./database/mongodb");
const User = require("./models/user");
const Stats = require("./models/stats");

const app = express();

var webSocketPort = 8001;
var model = require('./src/model');
var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: webSocketPort});
var stage=null;
var connection = 0;
var client_id = 0;
var state = false;
var interval=null;
var record = {};
var dict = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle rest uri for registering account and store it in the database
app.post('/api/register', (req, res) => {
    console.log(req.body);
	// Check if all the required inputs are in the request body
    if (Validator.isEmpty(req.body.username)) return res.status(400).json({"error":'Missing username'});
    if (Validator.isEmpty(req.body.password)) return res.status(400).json({"error":'Missing password'});
    if (Validator.isEmpty(req.body.repassword)) return res.status(400).json({"error":'Missing re-enter password'});
    if (Validator.isEmpty(req.body.gender)) return res.status(400).json({"error":'Missing gender'});
    if (Validator.isEmpty(req.body.country)) return res.status(400).json({"error":'Missing contry'});
    if (Validator.isEmpty(req.body.email)) return res.status(400).json({"error":'Missing email'});

	// Check if the password and confirm password are identical
    if (!Validator.equals(req.body.password, req.body.repassword)) return res.status(400).json({"error":'Passwords are not identical'});
	// Check if the email address is valid
    if (!Validator.isEmail(req.body.email)) return res.status(400).json({"error":'Invalid email format'});

	// Check if the user already exists
    User.findOne({username: req.body.username}).then(user => {
		// Return error if user exists
        if (user) {
            return res.status(400).json({ "error": "Username already exists" });
        } else {
			// Create new user
            const newUser = new User({
                username: req.body.username,
                password: req.body.password,
                gender: req.body.gender,
                country: req.body.country,
                email: req.body.email
            });
			// Hash password
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(newUser.password, salt, (error, hash) => {
                    newUser.password = hash;
					// Save the new user to database
                    newUser
                        .save()
						// Create new stats for user
                        .then(() => {
                            const initStats = new Stats({
                                username: req.body.username,
                                mostKills: 0
                            })
							// Save new stats to database
                            initStats
                                .save()
								// Return success message
                                .then(() => {
                                    return res.status(200).json({"message":"success"});
                                })
								// Return error message
                                .catch(error => {
                                    return res.status(400).json({"error": "Stats not created"});
                                });
                        })
						// Return error message
                        .catch(error => {
                            return res.status(400).json({"error": "User not created"});
                        });
                });
            });
        }
    });
});

// Handle rest uri for getting the leaderBoard data from the database
app.get('/api/leaderBoard', (req, res) => {
	// Retrieve all user stats, sort it and return the leaderboard
    Stats.find({}).sort({mostKills: -1}).limit(10).exec(function(err, leader) {
        if (err) return res.status(404).json({"error":"LeaderBoard not found"});
        return res.status(200).json({"res": leader});
    });
});

// Authorization before accessing the game page
app.use('/api/auth', (req, res, next) => {
	// Check if credential exists in header
	if (!req.headers.authorization) {
		return res.status(400).json({ error: 'No credentials sent!' });
  	}
	try {
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString();
		m = /^(.*):(.*)$/.exec(user_pass);

		var userName = m[1];
		var password = m[2];

		// Check if username or password are empty
		if (userName=="") return res.status(400).json({"error":'Missing username'});
        if (password=="") return res.status(400).json({"error":'Missing password'});

		// Authorize the account
		User.findOne({username: userName}).then(user => {
            if (!user) {
                return res.status(404).json({ "error": "Username not found" });
            } else {
                bcrypt.compare(password, user.password).then(match => {
                    if (match) {
                        next();
                    } else {
                        return res.status(401).json({ "error": "Not authorized" });
                    }
                })
            }
        });
	} catch(err) {
    	return res.status(401).json({ error: 'Not authorized'});
	}
});

// Login after authentication
app.post('/api/auth/login', (req, res) => {
    return res.status(200).json({"message":"authentication success"})
});

// Go to play page after authentication
app.get('/api/auth/play', (req, res) => {
    return res.status(200).json({"message":"authentication success"})
});

// Go to instruction page after authentication
app.get('/api/auth/instruction', (req, res) => {
    return res.status(200).json({"message":"authentication success"})
});

// Handle rest uri for getting the stats of a user from the database
app.get('/api/auth/stats/:username', (req, res) => {
    var userName = req.params.username;

	// Get the stats
    Stats.findOne({username: userName}, (err, stats) => {
		// Return error
        if (err) return res.status(400).json({"error": "Stats retrieving failed"})
		// Return stats not found error
        if (!stats) return res.status(404).json({"error": "Stats not found"})

		// Return stats
        return res.status(200).json({"stats": stats.mostKills});
    })
});

// Handle rest uri for getting the information of a user from the database
app.get('/api/auth/profile/:username', (req, res) => {
    var userName = req.params.username;

	// Get the user information
    User.findOne({username: userName}, (err, user) => {
		// Return error
        if (err) return res.status(400).json({"error": "Profile retrieving failed"})
		// Return stats not found error
		if (!user) return res.status(404).json({"error": "User profile not found"})

		// Return stats
        return res.status(200).json({"gender": user.gender, "country": user.country, "email": user.email});
    })
});

// Handle rest uri for updating the information of a user to the database
app.put('/api/auth/profile/:username', (req, res) => {
    var userName = req.params.username;

	// Check if all the required inputs are in the request body
    if (Validator.isEmpty(req.body.password)) return res.status(400).json({"error":'Missing password'});
    if (Validator.isEmpty(req.body.repassword)) return res.status(400).json({"error":'Missing re-enter password'});
    if (Validator.isEmpty(req.body.gender)) return res.status(400).json({"error":'Missing gender'});
    if (Validator.isEmpty(req.body.country)) return res.status(400).json({"error":'Missing contry'});
    if (Validator.isEmpty(req.body.email)) return res.status(400).json({"error":'Missing email'});

	// Check if the password and confirm password are identical
    if (!Validator.equals(req.body.password, req.body.repassword)) return res.status(400).json({"error":'Passwords are not identical'});
	// Check if the email address is valid
    if (!Validator.isEmail(req.body.email)) return res.status(400).json({"error":'Invalid email format'});
    
	// Create new update
    const update = {
        password: req.body.password,
        gender: req.body.gender,
        country: req.body.country,
        email: req.body.email
    };
    
	// Hash the password
    bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(update.password, salt, (error, hash) => {
            update.password = hash;
            console.log(update);
			// Find the user if exists and update
            User.findOneAndUpdate({username: userName}, update, {new: true}, (err, check) => {
				// Return error
                if (err) return res.status(400).json({"error": "Update profile failed"});

				// Check if update success
                if (check.password != update.password || check.gender != update.gender ||
                    check.country != update.country || check.email != update.email)
                    return res.status(400).json({"error":'Update failed'});
				
				// Return success
                return res.status(200).json({"message":"Update success"});
            });
        })
    });
});

// Handle rest uri for deleting a user from the database
app.delete('/api/auth/profile/:username', (req, res) => {
    var userName = req.params.username;

	// Find the user if exists and delete it
    User.findOneAndDelete({username: userName}, (err, check) => {
		// Return error
        if (err) return res.status(400).json({"error": "Delete user failed"});
		// Find the user stats if exists and delete it
        Stats.findOneAndDelete({username: userName}, (err, check) => {
			// Return error
            if (err) return res.status(400).json({"error": "Delete user stats failed"});

			// Return success
            return res.status(200).json({"message":"Delete success"});
        });
    });
});

function updateScore(userName, kills){
    Stats.findOne({username: userName}, (err, user) => {
        if (err) alert(err);
        if (!user) alert("User not found");
        if (user.mostKills < kills) {
			Stats.updateOne({username: userName}, {mostKills: kills});
		}
	})
}

// Setup a port
const port = process.env.PORT || 8080;
app.listen(port, ()=>console.log(`Server running on port ${port}`));


//==================================
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