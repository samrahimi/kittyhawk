var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = []; //Future: when we add support for multiple aircraft-controller pairs we will need to keep track of the connected devices


/* The status and control panel UI */
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/* Onboard flight computer calls this API to download the code it needs to operate.
    Eventually it will be smart emough to figure out what kind of drone is being used and download the correct 
    script */
app.get('/getflightscript', function(req, res) {
	res.sendFile(__dirname+'/device/kittyhawk.js');
});

app.get('/getwifiscript', function(req,res) {
	res.sendFile(__dirname+'/device/wifiswitch.sh');

});


//HTML, JS, and CSS files should go here
app.use(express.static(__dirname+'/client-scripts'));
 
/* GET /fpv - returns info about the video feed coming from the drone */
app.get('/fpv', function(req, res) {
	res.send(fpvInfo);
});

/* A message router - pilot sends control messages to drone's flight computer (kittyhawk), 
   drone sends telemetry data back to pilot (UAV raises events, kittyhawk packages event data in status messages, 
   and sends here)
   
   Todo: 
   
   */
io.on('connection', function(socket){

  socket.on('control', function(msg){
    io.emit('control', msg);
  });
  
  socket.on('status', function(msg) {
  	io.emit('status', msg);
  });
  
  sockets.push(socket); //For later
  
  //Broadcast connection success
  io.emit('clientconnected','clientinfo');

});

/* I believe that's all. WARNING: An early version of the kittyhawk code caused a drone to accelerate into 
  the authors face at maximum pitch instead of landing. 
  Thankfully it was a tiny little nano drone, and he walked away with 
  a cut on his lip. A bebop would have been rather unpleasant,and a Phantom could do some serious damage.
  Be smart - one of the luxuries of a cellular drone is that you can stand FAR away from it at all times. */ 

http.listen(3000, function(){
  console.log('listening on port 3k');
});
