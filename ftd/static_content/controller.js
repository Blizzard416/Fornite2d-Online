var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
var keys = {'w': false,'a':false,'s':false,'d':false, 'p':false, 'c':false};
function setupGame(){
	stage=new Stage(document.getElementById('stage'), 50, 10, 50, 5);

	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', moveByKey);
        document.addEventListener('mousemove', mouseFollow);
        document.addEventListener('mousedown', Fire);
}
function startGame(){
	interval=setInterval(function(){
                 stage.step();
                 if(stage.isEnd)endGame();
                 stage.draw(); 
                },70);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}

function endGame(){
	pauseGame(); // placeholder
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
        if(event.button === 0){
                if(stage.player.ammo > 0){
                        var angle = Math.atan2(stage.player.pointer.y , stage.player.pointer.x);
                        var velocity = new Pair(stage.player.velocity.x/2 + Math.cos(angle)*30, stage.player.velocity.y/2 + Math.sin(angle)*30);
                        var colour= 'rgba(0,0,0,1)';
                        var position = new Pair(stage.player.x, stage.player.y);
                        var b = new Bullet(stage, position, velocity, colour, 1, false, true, false, stage.player);
                        stage.addActor(b);
                        stage.player.ammo -=1;
                }
        }
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
        	$("#ui_play").show();
                $("#ui_nav").show();
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
                "difficulty": $("input[name='r-difficulty']:checked").val(),
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
        	startGame();
                $(".page").hide();
                $("#ui_play").show();
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
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
                $(".page").hide();
                $("#ui_instruction").show();
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
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
                document.getElementById('playtimes').innerHTML="You played this game " + data.playtimes + " times";
                document.getElementById('total').innerHTML="You total kill is " + data.total;
                document.getElementById('highest').innerHTML="You highest kill is " + data.highest;
        	pauseGame();
                $(".page").hide();
                $("#ui_stats").show();
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
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
                $('#ui_profile').find(`:radio[name=p-difficulty][value=${data.difficulty}]`).prop('checked', true);
                $("#p-country").val(data.country);
                $("#p-email").val(data.email);
        	pauseGame();
                $(".page").hide();
                $("#ui_profile").show();
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
                alert(err.responseJSON.error);
        });
}

function updateUser() {
        var user = {
                "password": $("#p-password").val(),
                "repassword": $("#p-repassword").val(),
                "difficulty": $("input[name='p-difficulty']:checked").val(),
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

function logout(){
        pauseGame();
        $("#username").val("");
        $("#password").val("");
        $(".login").css("border-color", "black");
        $(".page").hide();
        $("#ui_nav").hide();
        $("#ui_login").show();
}
/**
function logout(){
        $.ajax({
                method: "POST",
                url: "/api/auth/logout",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
        	pauseGame();
                $("#username").val("");
                $("#password").val("");
                $(".login").css("border-color", "black");
                $(".page").hide();
                $("#ui_nav").hide();
                $("#ui_login").show();
        }).fail(function(err){
                document.getElementById('login-err').innerHTML=err.responseJSON.error;
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}
*/
function toRegister() {
        $(".reg").val("");
        $(".reg").css("border-color", "black");
        $("#ui_login").hide();
        $("#ui_register").show();
}

function toLogin() {
        $(".login").css("border-color", "black");
        $("#ui_login").show();
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
        $("#ui_login").show();
        $("#ui_register").hide();
        $("#ui_nav").hide();
        $(".page").hide();
});