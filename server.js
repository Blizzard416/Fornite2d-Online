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

app.post('/api/register', (req, res) => {
    console.log(req.body);
    if (Validator.isEmpty(req.body.username)) return res.status(400).json({"error":'Missing username'});
    if (Validator.isEmpty(req.body.password)) return res.status(400).json({"error":'Missing password'});
    if (Validator.isEmpty(req.body.repassword)) return res.status(400).json({"error":'Missing re-enter password'});
    if (Validator.isEmpty(req.body.gender)) return res.status(400).json({"error":'Missing gender'});
    if (Validator.isEmpty(req.body.country)) return res.status(400).json({"error":'Missing contry'});
    if (Validator.isEmpty(req.body.email)) return res.status(400).json({"error":'Missing email'});

    if (!Validator.equals(req.body.password, req.body.repassword)) return res.status(400).json({"error":'Passwords are not identical'});
    if (!Validator.isEmail(req.body.email)) return res.status(400).json({"error":'Invalid email format'});

    User.findOne({username: req.body.username}).then(user => {
        if (user) {
            return res.status(400).json({ "error": "Username already exists" });
        } else {
            const newUser = new User({
                username: req.body.username,
                password: req.body.password,
                gender: req.body.gender,
                country: req.body.country,
                email: req.body.email
            });
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(newUser.password, salt, (error, hash) => {
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(() => {
                            const initStats = new Stats({
                                username: req.body.username,
                                mostKills: 0
                            })
                            initStats
                                .save()
                                .then(() => {
                                    return res.status(200).json({"message":"success"});
                                })
                                .catch(error => {
                                    return res.status(400).json({"error": "Stats not created"});
                                });
                        })
                        .catch(error => {
                            return res.status(400).json({"error": "User not created"});
                        });
                });
            });
        }
    });
});

app.get('/api/leaderBoard', (req, res) => {
    Stats.find({}).sort({mostKills: -1}).limit(10).exec(function(err, leader) {
        if (err) return res.status(404).json({"error":"LeaderBoard not found"});
        return res.status(200).json({"res": leader});
    });
});

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

app.post('/api/auth/login', (req, res) => {
    return res.status(200).json({"message":"authentication success"})
});

app.get('/api/auth/play', (req, res) => {
    return res.status(200).json({"message":"authentication success"})
});

app.get('/api/auth/instruction', (req, res) => {
    return res.status(200).json({"message":"authentication success"})
});

app.get('/api/auth/stats/:username', (req, res) => {
    var userName = req.params.username;

    Stats.findOne({username: userName}, (err, stats) => {
        if (err) return res.status(400).json({"error": "Stats retrieving failed"})
        if (!stats) return res.status(404).json({"error": "Stats not found"})

        return res.status(200).json({"stats": stats.mostKills});
    })
});

app.get('/api/auth/profile/:username', (req, res) => {
    var userName = req.params.username;

    User.findOne({username: userName}, (err, user) => {
        if (err) return res.status(400).json({"error": "Profile retrieving failed"})
		if (!user) return res.status(404).json({"error": "User profile not found"})
        return res.status(200).json({"gender": user.gender, "country": user.country, "email": user.email});
    })
});

app.put('/api/auth/profile/:username', (req, res) => {
    var userName = req.params.username;

    if (Validator.isEmpty(req.body.password)) return res.status(400).json({"error":'Missing password'});
    if (Validator.isEmpty(req.body.repassword)) return res.status(400).json({"error":'Missing re-enter password'});
    if (Validator.isEmpty(req.body.gender)) return res.status(400).json({"error":'Missing gender'});
    if (Validator.isEmpty(req.body.country)) return res.status(400).json({"error":'Missing contry'});
    if (Validator.isEmpty(req.body.email)) return res.status(400).json({"error":'Missing email'});

    if (!Validator.equals(req.body.password, req.body.repassword)) return res.status(400).json({"error":'Passwords are not identical'});
    if (!Validator.isEmail(req.body.email)) return res.status(400).json({"error":'Invalid email format'});
    
    const update = {
        password: req.body.password,
        gender: req.body.gender,
        country: req.body.country,
        email: req.body.email
    };
    
    bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(update.password, salt, (error, hash) => {
            update.password = hash;
            console.log(update);
            User.findOneAndUpdate({username: userName}, update, {new: true}, (err, check) => {
                if (err) return res.status(400).json({"error": "Update profile failed"});

                if (check.password != update.password || check.gender != update.gender ||
                    check.country != update.country || check.email != update.email)
                    return res.status(400).json({"error":'Update failed'});
            
                return res.status(200).json({"message":"Update success"});
            });
        })
    });
});

app.delete('/api/auth/profile/:username', (req, res) => {
    var userName = req.params.username;

    User.findOneAndDelete({username: userName}, (err, check) => {
        if (err) return res.status(400).json({"error": "Delete user failed"});
        Stats.findOneAndDelete({username: userName}, (err, check) => {
            if (err) return res.status(400).json({"error": "Delete user stats failed"});

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