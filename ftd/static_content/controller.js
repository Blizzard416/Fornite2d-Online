var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };
function setupGame(){
	stage=new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
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
function moveByKey(event){
	var key = event.key;
	var moveMap = { 
		'a': new Pair(-15,0),
		's': new Pair(0,15),
		'd': new Pair(15,0),
		'w': new Pair(0,-15)
	};
	if(key in moveMap){
		stage.player.velocity=moveMap[key];
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
                $("#username").val("");
                $("#password").val("");
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
		url: "/api/register/",
		data: JSON.stringify(user),
		processData:false, 
		contentType: "application/json; charset=utf-8",
		dataType:"json"
	}).done(function(data, text_status, jqXHR){
		console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
		$("#ui_login").show();
                $("#ui_register").hide();
	}).fail(function(err){
		console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
	});
}

function toRegister() {
        $("#ui_login").hide();
        $("#ui_register").show();
}

function toLogin() {
        $("#ui_login").show();
        $("#ui_register").hide();
}

function logout() {
        $("#ui_play").hide();
        $("#ui_nav").hide();
        $("#ui_login").show();
}

function loginValidation(){
        $(".login").css("border-color", "none");
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
        $( ".reg" ).css( "border-color", "black" );
        if ($("#r-username").val()=="") {
                alert("Username must be filled out");
                $("#r-username").css("border-color", "red");
        } else if ($("#r-password").val()==""){
                alert("Password must be filled out");
                $("#r-password").css("border-color", "red");
        } else if ($("#repassword").val()==""){
                alert("Confirm password must be filled out");
                $("#r-repassword").css("border-color", "red");
        } else if ($("#email").val()==""){
                alert("Email must be filled out");
                $("#email").css("border-color", "red");
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
        $("#ui_login").show();
        $("#ui_play").hide();
        $("#ui_register").hide();
        $("#ui_nav").hide();
});

