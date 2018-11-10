

$(function () {
    
    var socket = io('http://10.69.3.151:1797');
    var screenHeight = $(window).innerHeight;
    var screenWidth = $(window).innerWidth;
    var up_timer;
    var down_timer;
    const speed = 1;

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

        return false;
    });


    socket.on('viewer', function(data){

        $('.ready-screen .play-button').fadeIn();

        if($('.ready-screen .play-button').length > 0){
            $(".ready-screen .play-button").click(function() {
       
                socket.emit('ready');

                $(".ready-screen .play-button").hide();
                $(".ready-screen .hover-button").css("display", "block");
    
                $('.ready-screen .hover-button')
                .on('mousedown', function() {
                    socket.emit("up", screen);
                }).on('mouseup ', function() {
                    socket.emit("down", screen);
                });
            });
        }
    });

    socket.on("up", function(data){
        clearInterval(down_timer);
        var offset = $("#plane").offset();
        let xPos = offset.left; 
        up_timer = setInterval (function () { 
            xPos++;
            $('#plane').css('left', xPos + "px");
        }, speed);
    });

    socket.on("down", function(data){
        clearInterval(up_timer);
        clearInterval(down_timer)
        var offset = $("#plane").offset();
        let xPos = offset.left; 
        down_timer = setInterval (function () {
            xPos--;
            $('#plane').css('left', xPos + "px");
        }, speed);
    });


    socket.on("move_on", function(data){

        $("#plane").show();
        $('#plane').css('top',"0px");
      
        let yPos = 0;

        var offset = $("#plane").offset();  
        let xPos = offset.left; 
        down_timer = setInterval (function () {
            xPos--;
            $('#plane').css('left', xPos + "px");
        }, speed);
      
        timer = setInterval (function () { // timer to move element slowly
            yPos++;
            $('#plane').css('top',yPos + "px");
            if (yPos == data.screenHeight){
                if(data.screen == data.devices.length - 1){
                    clearInterval(timer);
                    socket.emit("game_over");
                    socket.disconnect();
                } else{
                    clearInterval(timer);
                    socket.emit("moved", data);
                }
            }
        }, speed);
    });

    socket.on("game_end", function(screen){
        $("*").fadeOut();
        $("game-over-screen").fadeIn();
    });
    
});


