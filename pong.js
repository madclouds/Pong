var express = require('express')
	, app = express()
	, http = require('http')
	, server = http.createServer(app)
  	, io = require('socket.io').listen(server);

server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
app.get('/main.css', function (req, res) {
  res.sendfile(__dirname + '/main.css');
});

app.get('/input.html', function (req, res) {
  res.sendfile(__dirname + '/input.html');
});

app.get('/output.html', function (req, res) {
  res.sendfile(__dirname + '/output.html');
});

app.get('/game.js', function (req, res) {
  res.sendfile(__dirname + '/game.js');
});

var players = 0;

io.sockets.on('connection', function (socket) {
	players = (players==1)? 2 :1;
  socket.emit('playerConnected', { player: 'player'+players });
  socket.on('move', function (data) {
  	console.log(data);
  	io.sockets.volatile.emit('updatePlayer', data);
  }); 

  
});

io.sockets.on('disconnect', function (socket) {
	console.log('disconnected');
	players--;
});