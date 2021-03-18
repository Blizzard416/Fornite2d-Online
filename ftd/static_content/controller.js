var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
function setupGame(){
	stage=new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', keyEvent);
        document.addEventListener('keyup', moveByKeyUP);
        document.addEventListener('mousemove', mouseFollow);
}
function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw(); },100);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}
function keyEvent(event){
	var key = event.key;
	var moveMap = { 
		'a': new Pair(-15,0),
		's': new Pair(0,15),
		'd': new Pair(15,0),
		'w': new Pair(0,-15)
	};
	if(key in moveMap){
		stage.player.velocity=moveMap[key];
	} else if (key == 'p'){
                pauseGame()
        } else if (key == 'c'){
                startGame()
        }
}
function moveByKeyUP(){
	stage.player.velocity=new Pair(0,0);
}
function mouseFollow(event){
        
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
                document.getElementById('login-err').innerHTML=err.responseJSON.error;
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function register(){
        var user = {
                "username": $("#r-username").val(),
                "password": $("#r-password").val(),
                "repassword": $("#repassword").val(),
                "difficulty": $("input[name='difficulty']:checked").val(),
                "country": $("#country").val(),
                "email": $("#email").val(),
        }
        $.ajax({ 
	        method: "POST", 
		url: "/api/register/init",
		data: JSON.stringify(user),
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
		$("#ui_login").show();
                $("#ui_register").hide();
	}).fail(function(err){
                document.getElementById('reg-err').innerHTML=err.responseJSON.error;
	});
}

function play(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/play",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

        	startGame();
                $(".page").hide();
                $("#ui_play").show();

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function instruction(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/instruction",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

        	pauseGame();
                $(".page").hide();
                $("#ui_instruction").show();

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function logout(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/logout",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

        	pauseGame();
                $("#username").val("");
                $("#password").val("");
                document.getElementById('login-err').innerHTML="";
                $(".login").css("border-color", "black");
                $(".page").hide();
                $("#ui_nav").hide();
                $("#ui_login").show();

        }).fail(function(err){
                document.getElementById('login-err').innerHTML=err.responseJSON.error;
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function toRegister() {
        $(".reg").val("");
        document.getElementById('reg-err').innerHTML="";
        $(".reg").css("border-color", "black");
        $("#ui_login").hide();
        $("#ui_register").show();
}

function toLogin() {
        document.getElementById('login-err').innerHTML="";
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

function registerValidation(){
        $(".reg").css("border-color", "black");
        if ($("#r-username").val()=="") {
                alert("Username must be filled out");
                $("#r-username").css("border-color", "red");
        } else if ($("#r-password").val()==""){
                alert("Password must be filled out");
                $("#r-password").css("border-color", "red");
        } else if ($("#repassword").val()==""){
                alert("Confirm password must be filled out");
                $("#repassword").css("border-color", "red");
        } else if ($("#email").val()==""){
                alert("Email must be filled out");
                $("#email").css("border-color", "red");
        } else if ($("#r-password").val()!=$("#repassword").val()){
                alert("Passwords are not identical");
                $("#r-password").css("border-color", "red");
                $("#repassword").css("border-color", "red");
        } else {
                register()
        }
}

$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ loginValidation(); });
        $("#registerSubmit").on('click',function(){ toRegister(); });
        $("#back").on('click',function(){ toLogin(); });
        $("#registerButton").on('click',function(){ registerValidation(); });
        $("#logoutSubmit").on('click',function(){ logout(); });
        $("#instructionsSubmit").on('click',function(){ instruction(); });
        $("#playSubmit").on('click',function(){ play(); });
        $("#ui_login").show();
        $("#ui_play").hide();
        $("#ui_register").hide();
        $("#ui_nav").hide();
        $("#ui_instruction").hide();
});

