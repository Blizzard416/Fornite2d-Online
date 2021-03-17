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

app.post('/api/register', function (req, res) {
		console.log(JSON.stringify(req.body));

		if (!"username" in req.body || !"password" in req.body || !"repassword" in req.body) {
			res.status(400);
			res.json({"error":'Missing username, password or confirm password'});
			return;
		}
		if(req.body.password!=req.body.repassword){
				res.status(400);
				res.json({"error":'Password and confirm password are not identical'});
				return;
		}
	// Need work
	let sql = 'INSERT INTO ftduser(username, password, difficulty, country, email, score) VALUES ($1,sha512($2),$3,$4,$5,0);';
		pool.query(sql, [req.body.username, req.body.password, req.body.difficulty, req.body.country, req.body.email], (err, pgRes) => {
		if(err && err.code==23505){ // pg duplicate key error
			res.status(409);
			res.json({"error":`${req.body.username} is already in database`});
			return;
		}
		if (err) {
			res.status(500);
			res.json({"error":err.message});
			return;
		} 
			if(pgRes.rowCount == 1){
				res.status(200);
				res.json({[req.body.username]: req.body.password});
				return;
			} else {
				res.status(500);
				res.json({"error":`couldn't add ${counterName}`});
				return;
			}
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
			res.status(403).json({ error: 'Username cannot be empty'});
		} else if (password==""){
			res.status(403).json({ error: 'Password cannot be empty'});
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

app.use('/',express.static('static_content')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

