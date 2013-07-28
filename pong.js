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

app.get('/output.html', function (req, res) {
  res.sendfile(__dirname + '/output.html');
});

var players = 0;

io.sockets.on('connection', function (socket) {
	players++;
  socket.emit('playerConnected', { player: 'player'+players });
  socket.on('move', function (data) {
  	console.log(data);
  	io.sockets.emit('updatePlayer', data);
  }); 

  
});

io.sockets.on('disconnect', function (socket) {
	console.log('disconnected');
	players--;
});