var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
var keys = {'w': false,'a':false,'s':false,'d':false, 'p':false, 'c':false};
var leaderBoardList = ["leaderBoardEasy", "leaderBoardInter", "leaderBoardHard"];
var difficulty;
function setupGame(){
	if (difficulty=="easy"){
                stage=new Stage(document.getElementById('stage'), 20, 10, 30, 15);
        } else if (difficulty=="intermediate") {
                stage=new Stage(document.getElementById('stage'), 30, 15, 60, 10);
        } else {
                stage=new Stage(document.getElementById('stage'), 40, 20, 90, 5);
        }

	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', moveByKey);
        document.addEventListener('mousemove', mouseFollow);
        document.addEventListener('mousedown', Fire);
        document.addEventListener('mouseup', mouseup);
}
function startGame(){
	interval=setInterval(function(){
                        stage.step();
                        if(stage.isEnd||stage.isWin){
                                endGame();
                                return;
                        }
                        stage.draw(); 
                },70);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}

function endGame(){
        pauseGame();
        if(stage.isEnd){
                stage.Lose();
        }else if (stage.isWin){
                stage.Win();
        }
        updateScore(stage.player.kills);
}

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

function mouseFollow(event){
        var offsetx = document.getElementById('stage').offsetLeft + document.getElementById('stage').width/2;
        var offsety = document.getElementById('stage').offsetTop + document.getElementById('stage').height/2;
        stage.player.pointer = new Pair(event.x - offsetx , event.y - offsety);
}

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

function mouseup(event){
        clearInterval(timeout);       
}

function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

        	$("#ui_login").hide();
                lbDisplay(false);
        	$("#ui_play").show();
                $("#ui_nav").show();
                navHelper("#play");
                difficulty="easy";
		setupGame();
		startGame();

        }).fail(function(err){
                alert(err.responseJSON.error);
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function register(){
        var user = {
                "username": $("#r-username").val(),
                "password": $("#r-password").val(),
                "repassword": $("#r-repassword").val(),
                "gender": $("input[name='r-gender']:checked").val(),
                "country": $("#r-country").val(),
                "email": $("#r-email").val()
        }
        $.ajax({ 
	        method: "POST", 
		url: "/api/register/init",
		data: JSON.stringify(user),
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
		$("#ui_login").show();
                lbDisplay(true);
                $("#ui_register").hide();
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

function play(){
        $.ajax({
                method: "GET",
                url: "/api/auth/play",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                navHelper("#play");
                $(".page").hide();
                $("#ui_play").show();
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

function instruction(){
        $.ajax({
                method: "GET",
                url: "/api/auth/instruction",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
        	pauseGame();
                navHelper("#instructions");
                $(".page").hide();
                $("#ui_instruction").show();
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

function stats(){
        $.ajax({
                method: "GET",
                url: "/api/auth/stats/"+credentials.username,
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                document.getElementById('easy').innerHTML="Your highest kills for easy mode is " + data.easy;
                document.getElementById('intermediate').innerHTML="Your highest kills for intermediate mode is " + data.intermediate;
                document.getElementById('hard').innerHTML="Your highest kills for hard mode is " + data.hard;
                navHelper("#stats");
        	pauseGame();
                $(".page").hide();
                $("#ui_stats").show();
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

function profile(){
        $.ajax({
                method: "GET",
                url: "/api/auth/profile/"+credentials.username,
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
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
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                alert(err.responseJSON.error);
        });
}

function leaderBoard(type){
        $.ajax({ 
	        method: "GET", 
		url: "/api/leaderBoard/"+type,
		data: JSON.stringify({}),
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
		var scores = data.array;
                //alert(type);
                if (type=="leaderBoardEasy"){
                        var leaderboard = document.getElementById("leaderBoardEasy");
                } else if (type=="leaderBoardInter") {
                        var leaderboard = document.getElementById("leaderBoardInter");
                } else {
                        var leaderboard = document.getElementById("leaderBoardHard");
                }
                leaderboard.innerHTML = "";

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

                for(let i=0; i<scores.length; i++) {
                        var rank = document.createElement("td");
                        var name = document.createElement("td");
                        var score = document.createElement("td");
                        var row = document.createElement("tr");

                        name.classList.add("name");
                        score.classList.add("score");
                        row.classList.add("row");
                        rank.innerText = i+1;
                        name.innerText = scores[i][0];
                        score.innerText = scores[i][1];

                        row.appendChild(rank);
                        row.appendChild(name);
                        row.appendChild(score);
                        leaderboard.appendChild(row);

                }
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

function updateUser() {
        var user = {
                "password": $("#p-password").val(),
                "repassword": $("#p-repassword").val(),
                "gender": $("input[name='p-gender']:checked").val(),
                "country": $("#p-country").val(),
                "email": $("#p-email").val()
        }
        $.ajax({ 
	        method: "PUT", 
		url: "/api/auth/profile/"+credentials.username,
		data: JSON.stringify(user),
                headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
		credentials.password=data.password;
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

function deleteUser() {
        $.ajax({
                method: "DELETE",
                url: "/api/auth/profile/"+credentials.username,
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                logout();
        }).fail(function(err){
                alert(err.responseJSON.error);
        });
}

function updateScore(score) {
        var newScore = {
                "difficulty": difficulty,
                "score": score
        }
        $.ajax({ 
	        method: "PUT", 
		url: "/api/auth/updateScore/"+credentials.username,
		data: JSON.stringify(newScore),
                headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
		alert(data.message);
	}).fail(function(err){
                alert(err.responseJSON.error);
	});
}

function restart() {
        pauseGame();
        setupGame();
	startGame();
}

function navHelper(id) {
        $(".nav").css("background-color", "white");
        $(".nav").css("color", "black");
        $(id).css("background-color", "green");
        $(id).css("color", "white");
}

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

function toRegister() {
        $(".reg").val("");
        $(".reg").css("border-color", "black");
        $("#ui_login").hide();
        lbDisplay(false);
        $("#ui_register").show();
}

function toLogin() {
        $(".login").css("border-color", "black");
        $("#ui_login").show();
        lbDisplay(true);
        $("#ui_register").hide();
}

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
        } else if ($(password).val()!=$(repassword).val()){
                alert("Passwords are not identical");
                $(password).css("border-color", "red");
                $(repassword).css("border-color", "red");
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
