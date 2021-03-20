var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
var keys = {'w': false,'a':false,'s':false,'d':false, 'p':false, 'c':false};
var leaderBoardList = ["leaderBoardEasy", "leaderBoardInter", "leaderBoardHard"];
var difficulty;

//setup a stage class accoring to the selected difficulty.
function setupGame(){
	if (difficulty=="easy"){
                stage=new Stage(document.getElementById('stage'), 20, 10, 70, 15);
        } else if (difficulty=="intermediate") {
                stage=new Stage(document.getElementById('stage'), 30, 15, 50, 10);
        } else {
                stage=new Stage(document.getElementById('stage'), 40, 20, 20, 5);
        }

	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', moveByKey);
        document.addEventListener('mousemove', mouseFollow);
        document.addEventListener('mousedown', Fire);
        document.addEventListener('mouseup', mouseup);
}

//draw each frame repeatly
function startGame(){
	interval=setInterval(function(){
                        stage.step();
                        //if the game end.
                        if(stage.isEnd||stage.isWin){
                                endGame();
                                return;
                        }
                        stage.draw(); 
                },70);
}

//stop drawing
function pauseGame(){
	clearInterval(interval);
	interval=null;
        if(!stage.isEnd&&!stage.isWin)stage.Pause();
}

//Game end function. If the game ended, display proper information
function endGame(){
        pauseGame();
        if(stage.isEnd){
                stage.Lose();
        }else if (stage.isWin){
                stage.Win();
        }
        updateScore(stage.player.kills);
}

//eventhandler for keys
function moveByKey(event){
        var x = y = 0;
	var e = event.key;
        keys[e] = true;
        if(event.type == 'keyup') keys[e] = false;
        if(event.type == 'keydown' && e == 'p')pauseGame();
        if(event.type == 'keydown' && e == 'c')startGame();
	if(keys['w']) y -= 10;
        if(keys['a']) x -= 10;
        if(keys['s']) y += 10;
        if(keys['d']) x += 10;
	stage.player.velocity=new Pair(x,y);
}

//eventhandler for mousemove
function mouseFollow(event){
        //get the x,y offset of the canvas and calculate the mouse position reletaed to the (o,o) on canvas
        //because the event.x,y coordinates are based on the windows not the canvas
        var offsetx = document.getElementById('stage').offsetLeft + document.getElementById('stage').width/2;
        var offsety = document.getElementById('stage').offsetTop + document.getElementById('stage').height/2;
        stage.player.pointer = new Pair(event.x - offsetx , event.y - offsety);
        console.log(event.x, event.y, offsetx, offsety);
}

//eventhandler for mousedown, start shooting
function Fire(event){
        timeout = setInterval(function () {
                        if(stage.player.ammo > 0){
                                var angle = Math.atan2(stage.player.pointer.y , stage.player.pointer.x);
                                var velocity = new Pair(stage.player.velocity.x/2 + Math.cos(angle)*30, stage.player.velocity.y/2 + Math.sin(angle)*30);
                                var colour= 'rgba(0,0,0,1)';
                                var position = new Pair(stage.player.x, stage.player.y);
                                var b = new Bullet(stage, position, velocity, colour, 2, false, true, false, stage.player);
                                stage.addActor(b);
                                stage.player.ammo -=1;
                 };
        }, stage.player.firerate);         
}

//eventhandler for mousedown, stop shooting
function mouseup(event){
        clearInterval(timeout);       
}

// Rest login post request
function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};
        // Post request with Authorization in header
        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        // Go to play page, set difficulty and show/hide ui
        }).done(function(data, text_status, jqXHR){
        	$("#ui_login").hide();
                lbDisplay(false);
        	$("#ui_play").show();
                $("#ui_nav").show();
                navHelper("#play");
                difficulty="easy";
		setupGame();
		startGame();
        // Display error message
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

// Rest register post request
function register(){
        // User JSON object
        var user = {
                "username": $("#r-username").val(),
                "password": $("#r-password").val(),
                "repassword": $("#r-repassword").val(),
                "gender": $("input[name='r-gender']:checked").val(),
                "country": $("#r-country").val(),
                "email": $("#r-email").val()
        }
        // Post request with user information
        $.ajax({ 
	        method: "POST", 
		url: "/api/register/init",
		data: JSON.stringify(user),
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
        // Go back to login page
	}).done(function(data, text_status, jqXHR){
		$("#ui_login").show();
                lbDisplay(true);
                $("#ui_register").hide();
        // Display error message
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

// Rest play get request
function play(){
        // Get request with credentials
        $.ajax({
                method: "GET",
                url: "/api/auth/play",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        // Display the play page
        }).done(function(data, text_status, jqXHR){
                navHelper("#play");
                $(".page").hide();
                $("#ui_play").show();
        // Display error message
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

// Rest instruction get request
function instruction(){
        // Get request with credentials
        $.ajax({
                method: "GET",
                url: "/api/auth/instruction",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        // Display instruction page
        }).done(function(data, text_status, jqXHR){
        	pauseGame();
                navHelper("#instructions");
                $(".page").hide();
                $("#ui_instruction").show();
        // Display error message
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

// Rest stats get request
function stats(){
        // Get request with credentials
        $.ajax({
                method: "GET",
                url: "/api/auth/stats/"+credentials.username,
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        // Retrieve the data from database and display the stats page
        }).done(function(data, text_status, jqXHR){
                document.getElementById('easy').innerHTML="Your highest kills for easy mode is " + data.easy;
                document.getElementById('intermediate').innerHTML="Your highest kills for intermediate mode is " + data.intermediate;
                document.getElementById('hard').innerHTML="Your highest kills for hard mode is " + data.hard;
                navHelper("#stats");
        	pauseGame();
                $(".page").hide();
                $("#ui_stats").show();
        // Display error message
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

// Rest profile get request
function profile(){
        // Get request with credentials
        $.ajax({
                method: "GET",
                url: "/api/auth/profile/"+credentials.username,
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        // Retrieve the user information from database and display the profile page
        }).done(function(data, text_status, jqXHR){
                document.getElementById('p-username').innerHTML=credentials.username;
                $("#p-password").val(credentials.password);
                $("#p-repassword").val(credentials.password);
                $('#ui_profile').find(`:radio[name=p-gender][value=${data.gender}]`).prop('checked', true);
                $("#p-country").val(data.country);
                $("#p-email").val(data.email);
                navHelper("#profile");
        	pauseGame();
                $(".page").hide();
                $("#ui_profile").show();
        // Display error message
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

// Rest leaderBoard get request
function leaderBoard(type){
        // Get request with specific type of leaderboard
        $.ajax({ 
	        method: "GET", 
		url: "/api/leaderBoard/"+type,
		data: JSON.stringify({}),
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
        // Display the leaderBoard
	}).done(function(data, text_status, jqXHR){
		var lb = data.array;
                // Identify the leaderboard type
                if (type=="leaderBoardEasy"){
                        var leaderboard = document.getElementById("leaderBoardEasy");
                } else if (type=="leaderBoardInter") {
                        var leaderboard = document.getElementById("leaderBoardInter");
                } else {
                        var leaderboard = document.getElementById("leaderBoardHard");
                }
                leaderboard.innerHTML = "";

                // Setup the table header
                var row = document.createElement("tr");
                var title = document.createElement("th");
                title.innerText="TOP";
                row.appendChild(title);
                var title = document.createElement("th");
                title.innerText="Player";
                row.appendChild(title);
                var title = document.createElement("th");
                title.innerText="Kills";
                row.appendChild(title);
                leaderboard.appendChild(row);

                // Display the player name and kills
                for(let i=0; i<10; i++) {
                        var rank = document.createElement("td");
                        var name = document.createElement("td");
                        var score = document.createElement("td");
                        var row = document.createElement("tr");

                        name.classList.add("name");
                        score.classList.add("score");
                        row.classList.add("row");
                        rank.innerText = i+1;
                        if (i<lb.length){
                                name.innerText = lb[i][0];
                                score.innerText = lb[i][1];
                        }

                        row.appendChild(rank);
                        row.appendChild(name);
                        row.appendChild(score);
                        leaderboard.appendChild(row);
                }
        // Display error message
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

// Rest user information put request
function updateUser() {
        // Prepare user JSON
        var user = {
                "password": $("#p-password").val(),
                "repassword": $("#p-repassword").val(),
                "gender": $("input[name='p-gender']:checked").val(),
                "country": $("#p-country").val(),
                "email": $("#p-email").val()
        }
        // Put request with uer JSON and credential
        $.ajax({ 
	        method: "PUT", 
		url: "/api/auth/profile/"+credentials.username,
		data: JSON.stringify(user),
                headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
        // Update the new password to credential
	}).done(function(data, text_status, jqXHR){
		credentials.password=data.password;
        // Display error message
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

// Rest delete user delete request
function deleteUser() {
        // Delete request with credential
        $.ajax({
                method: "DELETE",
                url: "/api/auth/profile/"+credentials.username,
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        // User feedback and logout
        }).done(function(data, text_status, jqXHR){
                alert("You delete you account :(");
                logout();
        // Display error message
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

// Rest update user score put request
function updateScore(score) {
        // Prepare score JSON object
        var newScore = {
                "difficulty": difficulty,
                "score": score
        }
        // Put request with credential
        $.ajax({ 
	        method: "PUT", 
		url: "/api/auth/updateScore/"+credentials.username,
		data: JSON.stringify(newScore),
                headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
        // Display error message
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

// Helper function to restart the game
function restart() {
        pauseGame();
        setupGame();
	startGame();
}

// User feedback on current page
function navHelper(id) {
        $(".nav").css("background-color", "white");
        $(".nav").css("color", "black");
        $(id).css("background-color", "green");
        $(id).css("color", "white");
}

// Logout to login page
function logout(){
        pauseGame();
        $("#username").val("");
        $("#password").val("");
        $(".login").css("border-color", "black");
        $(".page").hide();
        $("#ui_nav").hide();
        $("#ui_login").show();
        lbDisplay(true);
}

// Login to register page
function toRegister() {
        $(".reg").val("");
        $(".reg").css("border-color", "black");
        $("#ui_login").hide();
        lbDisplay(false);
        $("#ui_register").show();
}

// Register to login page
function toLogin() {
        $(".login").css("border-color", "black");
        $("#ui_login").show();
        lbDisplay(true);
        $("#ui_register").hide();
}

// Check empty for all login input
function loginValidation(){
        $(".login").css("border-color", "black");
        if ($("#username").val()=="") {
                alert("Username must be filled out");
                $("#username").css("border-color", "red");
        } else if ($("#password").val()==""){
                alert("Password must be filled out");
                $("#password").css("border-color", "red");
        } else {
                login()
        }
}

// Check valid input for profile and register page
function Validation(isReg){
        var emailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        var username, password, repassword, email;

        if (isReg){
                username="#r-username";
                password="#r-password";
                repassword="#r-repassword";
                email="#r-email";
                $(".reg").css("border-color", "black");
        } else {
                password="#p-password";
                repassword="#p-repassword";
                email="#p-email";
                $(".pro").css("border-color", "black");
        }

        // Check empty input
        if ($(username).val()=="" && isReg) {
                alert("Username must be filled out");
                $(username).css("border-color", "red");
        } else if ($(password).val()==""){
                alert("Password must be filled out");
                $(password).css("border-color", "red");
        } else if ($(repassword).val()==""){
                alert("Confirm password must be filled out");
                $(repassword).css("border-color", "red");
        } else if ($(email).val()==""){
                alert("Email must be filled out");
                $(email).css("border-color", "red");
        // Check identical password
        } else if ($(password).val()!=$(repassword).val()){
                alert("Passwords are not identical");
                $(password).css("border-color", "red");
                $(repassword).css("border-color", "red");
        // Check valid email format
        } else if (!$(email).val().match(emailformat)){
                alert("Please enter valid email");
                $(email).css("border-color", "red");
        } else {
                if (isReg){
                        register();
                } else {
                        updateUser();
                }
        }
}

// LeaderBoard display
function lbDisplay(show) {
        if (show) {
                for (i in leaderBoardList) {
                        leaderBoard(leaderBoardList[i]);
                }
                $(".lb").show();
        } else {
                $(".lb").hide();
        }
}

$(function(){
        // Setup all events here and display the appropriate UI
        $("#login").on('click',function(){ loginValidation(); });
        $("#register").on('click',function(){ toRegister(); });
        $("#back").on('click',function(){ toLogin(); });
        $("#registerSubmit").on('click',function(){ Validation(true); });
        $("#logout").on('click',function(){ logout(); });
        $("#instructions").on('click',function(){ instruction(); });
        $("#play").on('click',function(){ play(); });
        $("#stats").on('click',function(){ stats(); });
        $("#profile").on('click',function(){ profile(); });
        $("#update").on('click',function(){ Validation(false); });
        $("#delete").on('click',function(){ deleteUser(); });
        $("#restart").on('click',function(){ restart(); });
        // Change difficulty radio button
        $("input[name='difficulty']").on('change', function(){
                difficulty=$("input[name='difficulty']:checked").val();
                restart();
        });
        $("#ui_login").show();
        lbDisplay(true);
        $("#ui_register").hide();
        $("#ui_nav").hide();
        $(".page").hide();
});
