var socket;

function send(){
	socket.send($('#message').val());
	$('#message').val("");
}

$(function(){
	socket = new WebSocket(`ws://${window.location.hostname}:8001`);
	socket.onopen = function (event) {
		$('#sendButton').removeAttr('disabled');
		console.log("connected");
	};
	socket.onclose = function (event) {
		alert("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
	};
	socket.onmessage = function (event) {
		$('#messages').append("<br/>"+event.data);
	}
});