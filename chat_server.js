
var mongo = require('mongodb').MongoClient,
	client = require('socket.io').listen(8080).sockets; //create connection socket, port 8080
var mydb;

mongo.connect('mongodb://127.0.0.1/chat', function(err, database){ //mangodb, use chat db
	if(err) throw err;
	
	client.on('connection', function(socket){ //connection success
		mydb = database.db('chat');
		var col = mydb.collection('messages');
			sendStatus = function(s){
				socket.emit('status', s);
			};
		//send all db message
		col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
			if(err) throw err;
			socket.emit('output', res);
		});
		console.log('Someone has connected...');
		//Wait for input
		socket.on('input', function(data){
			console.log(data);

			var name = data.name,
				message = data.message,
				invalidPattern = /^\s*$/;

			if(invalidPattern.test(name) || invalidPattern.test(message)){
				console.log('Name and message is required.');
			}else{
				col.insert({name: name, message: message}, function(){
					//broadcast message
					client.emit('output',[data]);//send by object
					sendStatus({
						message: "message sent",
						clear: true
					});
				});
			}
		});
	});
});
