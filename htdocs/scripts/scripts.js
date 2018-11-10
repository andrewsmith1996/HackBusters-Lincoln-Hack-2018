

$(function () {
    
    var socket = io('http://10.69.3.151:1797');
    var screenHeight = $(window).innerHeight;
    var screenWidth = $(window).innerWidth;
    var up_timer;
    var down_timer;
    const speed = 1;

    $(".select-screen button").click(function() {

        if($(this).attr('data-ref') != "viewer"){
            $(".ready-screen").hide();
            $(".game-over-screen").hide();
            $('body').addClass('play');
        }

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

    

        // var x = 10;
        // var y = 60;

        // var a = 20;
        // var b = data.screenHeight - 20;

        // $('.play-screen .obstacle').each(function(){
        //     $(this).css("width", Math.floor((Math.random() * y) + x)) + "px";
        //     $(this).css("y", Math.floor((Math.random() * b) + a)) + "px";
        // });

        let yPos = data.yPos;
        let xPos = data.xPos;  

        $("#plane").show();
        $('#plane').css('top', yPos + "px");
      
        down_timer = setInterval (function () {
            xPos--;
            $('#plane').css('left', xPos + "px");
        }, speed);
      
        timer = setInterval (function () { // timer to move element slowly
            yPos++;
            $('#plane').css('top',yPos + "px");
            setTimeout(function(){
                $("#plane:after").css("background-position", "0 -20px");
            }, 100);
            $("#plane:after").css("background-position", "0 -20px");
            if (yPos == data.screenHeight){
                if(data.screen == data.devices.length - 1){
                    clearInterval(timer);
                    socket.emit("game_over");
                } else{
                    clearInterval(timer);
                   
                    data = {
                        xPos: xPos,
                        yPos: yPos
                    }
                    socket.emit("moved", data);
                }
            }
        }, speed);
    });

    socket.on("game_end", function(screen){
        $(".play-screen").fadeOut();
        $(".ready-screen").fadeOut();
        $(".select-screen").fadeOut();

        $(".game-over-screen").fadeIn();
    });
    
});


