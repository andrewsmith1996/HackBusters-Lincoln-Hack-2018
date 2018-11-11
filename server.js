var express = require('express');
var app = express();
var server = app.listen(1797);

var io = require('socket.io').listen(server);

// Send our base file
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var devices = [];
var screen_count = 1;

// On initial connection
io.on('connection', function(socket){    

    socket.send(socket.id);
    
    // When a device has connected
    socket.on('device-connected', function(data){

        console.log('Screen ' + data.buttonRef + ' has connected.');
        
        // Set the device variables
        device = {};
        device['buttonRef'] = data.buttonRef;
        device['deviceHeight'] = data.height;
        device['deviceWidth'] = data.width;
        device['ready'] = data.ready;
        device['client_id'] = socket.id;
        
        console.log(device);

        // Add the device to the array
        devices.push(device);

        // Is this the viewer?
        if(data.buttonRef == 'control'){
            socket.emit('control', true);
        }
    });

    // When all devices are ready
    socket.on('ready', function(){
        let client_id = 0;
       
        var data = {};

        // Get the device data
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
      
        // Send to the specific screen our data
        socket.broadcast.to(client_id).emit("move_screen", data);
        console.log("(First) Emitting to client " + client_id + " screen " + data.screen)
    });

    // When user holds the control hover bottom down
    socket.on("control_button_up", function(data){
        let client_id = getClientId();
        socket.broadcast.to(client_id).emit("move_plane_up", data);
    });

    // When user holds the control hover bottom down
    socket.on("control_button_down", function(data){
        let client_id = getClientId();
        socket.broadcast.to(client_id).emit("move_plane_down", data);
     });

    // Returns the client ID for a screen number
    function getClientId(){
        let client_id = 0;
        for (var i = 0; i < devices.length; i++){
            if (parseInt(devices[i].buttonRef) == screen_count){
                client_id = devices[i].client_id;
            }
        }

        return client_id;
    }

    // When moving onto the next screen
    socket.on("next_screen", function(move_data){

        let client_id = 0;
        let data = {};

        screen_count++;
        
        // Get the data for this device
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
                    yPos: 1,
                    score:move_data.score
                }
            }
        }
        
        console.log("Emitting to client " + client_id + " screen " + screen_count);
        socket.broadcast.to(client_id).emit("move_screen", data);
    });

    // On game over
    socket.on("game_over", function(score){
        io.emit('game_end', score, {for: 'everyone'});
        socket.disconnect();
    });
  });

// Use our static files, CSS and JS
app.use(express.static('htdocs'));