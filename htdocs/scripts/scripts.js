

$(function () {
    
    var socket = io('http://10.69.3.151:1797');
    var screenHeight = $(window).innerHeight;
    var screenWidth = $(window).innerWidth;

    $(".select-screen button").click(function() {

        const data = {
            buttonRef:$(this).attr('data-ref'),
            height: window.innerHeight,
            width: window.innerWidth,
            ready: true
        }

        socket.emit('device-connected', data);
        $('.select-screen').fadeOut('slow');
        $('.ready-screen').fadeIn('slow');

        // startGame();
        return false;
    });


    socket.on('viewer', function(data){
        $('.ready-screen .play-button').fadeIn();
    });

    if($('.ready-screen .play-button').length > 0){
        $(".ready-screen .play-button").click(function() {
            socket.emit('ready');
        });
    }

    socket.on('move_on', function(data){
        let client_id = 0;

        for (var i = 0; i < data.devices.length; i++){
            if (data.devices[i].screen == (data.screen + 1)){
                client_id =  devices[i].client_id;
            }
        }

        socket.broadcast.to(client_id).emit("move_on");
    });
    
});

function startGame(){

    // let yPos =  document.getElementById("plane").offsetTop;
    // var screenHeight = window.innerHeight;
    
    // document.getElementById("plane").style.top = screenHeight / 2 + "px";
    
    // gameLoop();
};

function gameLoop(){
    // while(yPos != (screenHeight - 50)){
    //     yPos++;
    //     document.getElementById("plane").style.top = yPos + "px";
    // }
}


