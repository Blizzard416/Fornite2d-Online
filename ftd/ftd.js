// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

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

function isObject(o){ return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

app.use('/api/register', function (req, res,next) {
	var emailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	if (!"username" in req.body || !"password" in req.body || !"repassword" in req.body || !"gender" in req.body || !"country" in req.body || !"email" in req.body) {
		return res.status(400).json({"error":'Missing required input'});
	}
	if(req.body.password!=req.body.repassword){
		return res.status(400).json({"error":'Password and confirm password are not identical'});
	}
	
	if (!req.body.email.match(emailformat)){
		return res.status(400).json({"error":'Password and confirm password are not identical'});
	}
	
	let sql = 'INSERT INTO ftduser(username, password, gender, country, email) VALUES ($1,sha512($2),$3,$4,$5);';
		pool.query(sql, [req.body.username, req.body.password, req.body.gender, req.body.country, req.body.email], (err, pgRes) => {
		if(err && err.code==23505){ // pg duplicate key error
			res.status(409);
			res.json({"error":`Username ${req.body.username} is already in database`});
			return;
		}
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		if(pgRes.rowCount == 1){
			next();
		} else {
			res.status(500);
			res.json({"error":`couldn't add ${req.body.username}`});
			return;
		}
	});
});

app.post('/api/register/init', function (req, res) {
	let sql = 'INSERT INTO stats(username, easyHighest, interHighest, hardHighest) VALUES ($1, 0, 0, 0);';
		pool.query(sql, [req.body.username], (err, pgRes) => {
		if (err) {
			console.log(req.body.username);
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"message":"success"}); 
			return;
		} else {
			res.status(500);
			res.json({"error":`couldn't initialize ${req.body.username}`});
			return;
		}
	});
});

app.get('/api/:leaderBoardType', function (req, res) {
	var type = req.params.leaderBoardType, score;
	let sql;
	if (type=="leaderBoardEasy") {
		sql = 'SELECT username, easyhighest AS score FROM stats ORDER BY easyhighest DESC LIMIT 10;';
	} else if (type=="leaderBoardInter") {
		sql = 'SELECT username, interhighest AS score FROM stats ORDER BY interhighest DESC LIMIT 10;';
	} else {
		sql = 'SELECT username, hardhighest AS score FROM stats ORDER BY hardhighest DESC LIMIT 10;';
	}

		pool.query(sql, [], (err, pgRes) => {
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
		console.log(response);
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
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		var username = m[1];
		var password = m[2];

		if (username==""){
			return res.status(403).json({ error: 'Username cannot be empty'});
		} else if (password==""){
			return res.status(403).json({ error: 'Password cannot be empty'});
		}

		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql, [username, password], (err, pgRes) => {
  			if (err){
                res.status(403).json({ error: 'Wrong username or password'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
                res.status(403).json({ error: 'Wrong username or password'});
        	}
		});
	} catch(err) {
    	res.status(403).json({ error: 'Not authorized'});
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

app.get('/api/auth/stats/:username', function (req, res) {
	var userName = req.params.username;

	let sql = 'SELECT * FROM stats WHERE username=$1;';
		pool.query(sql, [userName], (err, pgRes) => {
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"easy":pgRes.rows[0].easyhighest, "intermediate":pgRes.rows[0].interhighest, "hard":pgRes.rows[0].hardhighest}); 
			return;
		} else {
			res.status(500);
			res.json({"error":`couldn't find user ${userName}`});
			return;
		}
	});
});

app.get('/api/auth/profile/:username', function (req, res) {
	var userName = req.params.username;

	let sql = 'SELECT * FROM ftduser WHERE username=$1;';
		pool.query(sql, [userName], (err, pgRes) => {
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"gender":pgRes.rows[0].gender, "country":pgRes.rows[0].country, "email":pgRes.rows[0].email}); 
			return;
		} else {
			res.status(500);
			res.json({"error":`couldn't find user ${userName}`});
			return;
		}
	});
});

app.put('/api/auth/profile/:username', function (req, res) {
	var userName = req.params.username;
	var emailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

	if (!"password" in req.body || !"repassword" in req.body || !"gender" in req.body || !"country" in req.body || !"email" in req.body) {
		return res.status(400).json({"error":'Missing required input'});
	}
	if(req.body.password!=req.body.repassword){
		return res.status(400).json({"error":'Password and confirm password are not identical'});
	}

	if (!req.body.email.match(emailformat)){
		return res.status(400).json({"error":'Password and confirm password are not identical'});
	}
	
	let sql = 'UPDATE ftduser SET password=sha512($2), gender=$3, country=$4, email=$5 WHERE username=$1;';
	pool.query(sql, [userName, req.body.password, req.body.gender, req.body.country, req.body.email], (err, pgRes) => {
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"password":req.body.password}); 
			return;
		} else {
			res.status(500);
			res.json({"error":`couldn't update ${userName}`});
			return;
		}
	});
});

app.delete('/api/auth/profile/:username', function (req, res) {
	var userName = req.params.username;

	let sql = 'DELETE FROM ftduser WHERE username=$1;';
		pool.query(sql, [userName], (err, pgRes) => {
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
		if(pgRes.rowCount == 1){
			res.status(200);
			res.json({"message":"success"}); 
			return;
		} else {
			res.status(500);
			res.json({"error":`couldn't find user ${userName}`});
			return;
		}
	});
});

app.use('/',express.static('static_content')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

