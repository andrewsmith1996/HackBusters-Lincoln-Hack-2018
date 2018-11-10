var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var devices = [];
var screen_count = 1;

io.on('connection', function(socket){    

    socket.send(socket.id);
    
    socket.on('device-connected', function(data){

        console.log('Screen ' + data.buttonRef + ' has connected.');
        
        device = {};
        device['buttonRef'] = data.buttonRef;
        device['deviceHeight'] = data.height;
        device['deviceWidth'] = data.width;
        device['ready'] = data.ready;
        device['client_id'] = socket.id;
       
        console.log(device);
        devices.push(device);

        // Is this the viewer?
        if(data.buttonRef == 'viewer'){
            socket.emit('viewer', true);
        }
    });

    socket.on('game_over', function(data){
        console.log("over");
    });

    socket.on('ready', function(){
       
        let client_id = 0;
        var data = {};

        for (var i = 0; i < devices.length; i++){
            if (devices[i].buttonRef == screen_count){
                client_id = devices[i].client_id;
                
                data = {
                    client_id:client_id,
                    screen: screen_count,
                    devices:devices,
                    screenWidth:devices[i].deviceWidth,
                    screenHeight:devices[i].deviceHeight,
                }
            }
        }
      
        console.log("Emitting to client " + client_id + " screen " + data.screen);
        socket.broadcast.to(client_id).emit("move_on", data);
    });

    socket.on("up", function(data){
        let client_id = getClientId();
        socket.broadcast.to(client_id).emit("up");
    });

    socket.on("down", function(data){
        let client_id = getClientId();
        socket.broadcast.to(client_id).emit("down");
     });

    function getClientId(){
        let client_id = 0;
        for (var i = 0; i < devices.length; i++){
            if (devices[i].buttonRef == screen_count){
                client_id = devices[i].client_id;
            }
        }

        return client_id;
    }

    socket.on("moved", function(data){
        
        let client_id = 0;

        var data = {};

        screen_count++;
        
        for (var i = 0; i < devices.length; i++){
            if (devices[i].buttonRef == screen_count){
                client_id = devices[i].client_id;
                
                data = {
                    client_id:client_id,
                    screen: screen_count,
                    devices:devices,
                    screenWidth:devices[i].deviceWidth,
                    screenHeight:devices[i].deviceHeight,
                }
            }
        }
        
        console.log("Emitting to client " + client_id + " screen " + screen_count);
        socket.broadcast.to(client_id).emit("move_on", data);
    });

    socket.on("game_over", function(screen_count){
        socket.broadcast.emit("game_end");
        socket.disconnect();
    });


  });

app.use(express.static('htdocs'));

http.listen(1797, function(){
  console.log('listening on *:1797');
});

function checkIfReady(){
    let ready = true;
    devices.forEach((item) => {
        if(item.ready == false){
            ready = false;
        }
    });

    return ready;
}