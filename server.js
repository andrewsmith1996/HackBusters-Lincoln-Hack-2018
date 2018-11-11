var express = require('express');
var app = express();
var server = app.listen(1797);

var io = require('socket.io').listen(server);

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
        if(data.buttonRef == 'control'){
            socket.emit('control', true);
        }
    });

    socket.on('ready', function(){
        console.log("Ready to play");
        let client_id = 0;
       
        var data = {};

        console.log(screen_count);

        for (var i = 0; i < devices.length; i++){
            if (devices[i].buttonRef == '1'){
                client_id = devices[i].client_id;
                data = {
                    client_id:client_id,
                    screen: screen_count,
                    devices:devices,
                    screenWidth:devices[i].deviceWidth,
                    screenHeight:devices[i].deviceHeight,
                    xPos:((devices[i].deviceWidth / 2)) - 35,
                    yPos:0,
                    score:0
                }
            }
        }
      
        socket.broadcast.to(client_id).emit("move_screen", data);
        console.log("(First) Emitting to client " + client_id + " screen " + data.screen)
    });

    socket.on("control_button_up", function(data){
        let client_id = getClientId();
        socket.broadcast.to(client_id).emit("move_plane_up", data);
    });

    socket.on("control_button_down", function(data){
        let client_id = getClientId();
        socket.broadcast.to(client_id).emit("move_plane_down", data);
     });

    function getClientId(){
        let client_id = 0;
        for (var i = 0; i < devices.length; i++){
            if (parseInt(devices[i].buttonRef) == screen_count){
                client_id = devices[i].client_id;
            }
        }

        return client_id;
    }

    socket.on("next_screen", function(move_data){

        console.log("Moving to screen" + move_data.client_id);
        let client_id = 0;

        var data = {};

        screen_count++;
        
        for (var i = 0; i < devices.length; i++){
            if (parseInt(devices[i].buttonRef) == screen_count){
                client_id = devices[i].client_id;
                
                data = {
                    client_id:client_id,
                    screen: screen_count,
                    devices:devices,
                    screenWidth:move_data.deviceWidth,
                    screenHeight:move_data.deviceHeight,
                    xPos: move_data.xPos,
                    yPos: 0,
                    score:move_data.score
                }
            }
        }
        
        console.log("Emitting to client " + client_id + " screen " + screen_count);
        socket.broadcast.to(client_id).emit("move_screen", data);
    });

    socket.on("game_over", function(score){
        console.log("Game Ended");
        io.emit('game_end', score, {for: 'everyone'});
        socket.disconnect();
    });


  });

app.use(express.static('htdocs'));

function checkIfReady(){
    let ready = true;
    devices.forEach((item) => {
        if(item.ready == false){
            ready = false;
        }
    });

    return ready;
}