var fs = require('fs')
var ws = require('ws')


if (process.argv.length != 4) {
	console.log("Please specify the number of streams and the interval as arguments.")
	process.exit(1)
}

var n = +process.argv[2];
var sendInterval = +process.argv[3]

startupServer(n)

function startupServer(n) {

	var WebSocketServer = ws.Server;
	var wss = new WebSocketServer({ port: 8081 });
	var count = 1;

	wss.on('connection', function connection(ws) {
		console.log('received connection');
	});

	function broadcast() {

		var data = { n: n };
		for (var i = 0 ; i < n ; i++) {
			data[i] = Math.random()*Math.random()*Math.random();
		}

		wss.clients.forEach(function each(client) {
			client.send(JSON.stringify(data), {}, function(cb) {});
		});

		count++;

	};

	setInterval(function() { broadcast(); }, sendInterval);
}
