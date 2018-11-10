

$(function () {
    
    var socket = io('http://10.69.3.151:1797');
    var screenHeight = $(window).innerHeight;
    var screenWidth = $(window).innerWidth;
    var up_timer;
    var down_timer;
    const speed = 7;
    var score;

    

    $('.begin button.device-begin').click(function(){
        $('.begin').animate({opacity:0});
        $(".begin").hide();

        $('.introduction').animate({opacity:1});
        $(".introduction").show();
        
        $(".introduction h1").fadeIn(1, () =>
            $(".introduction h3.heading-1").fadeIn(1, () =>
                $(".introduction h3.heading-2").fadeIn(1, () => 
                    { $(".introduction img").fadeIn(1).css('display', 'block');
                    $(".introduction button").fadeIn(1); }
                )
            )
        )
    });

    $('.introduction button').click(function(){
        $('.introduction').animate({opacity:0});
        $(".introduction").hide();
        
        $(".ready-screen").animate({opacity:1});
        $(".ready-screen").show();
    });

    $(".select-screen button").click(function() {

        if($(this).attr('data-ref') != "viewer"){

            $('.select-screen').animate({opacity:0});
            $(".select-screen").hide();
    
            $('.select-screen').animate({opacity:0});
            $(".select-screen").hide();

            $('.game-over-screen').animate({opacity:0});
            $(".game-over-screen").hide();

            $(".play-screen").animate({opacity:1});
            $(".play-screen").show();

            $('body').addClass('play');

            if($(this).attr('data-ref') != 1){

                var maxObstacleHeight = window.innerWidth / 2;
                var minObstacleHeight = 50
    
                var b = window.innerHeight - 60;
                var a = 80;
    
                // $('.play-screen .obstacle').each(function(){
                //     $(this).show();
                //     $(this).css("top", Math.floor((Math.random() * b) + a)) + "px";
                //     $(this).css("width", Math.floor((Math.random() * maxObstacleHeight) + minObstacleHeight)) + "px";
                // });

            }    

        } else {

            $(".select-screen").animate({opacity:0});
            $(".select-screen").hide();

            $(".begin").animate({opacity:1});
            $(".begin").show();
        }

        const data = {
            buttonRef:$(this).attr('data-ref'),
            height: window.innerHeight,
            width: window.innerWidth,
            ready: true
        }

        socket.emit('device-connected', data);
        
        return false;
    });

    socket.on('viewer', function(data){
        $('.ready-screen .play-button').fadeIn();

        if($('.ready-screen .play-button').length > 0){
            $(".ready-screen .play-button").click(function() {
       
                socket.emit('ready');

                $(".ready-screen .play-button").hide();
                $(".ready-screen .hover-button").css("display", "block");
    
                $('.ready-screen .hover-button').css('cursor','pointer');
                $('.ready-screen .hover-button')
                .on('mousedown touchstart', function() {
                    socket.emit("up", screen);
                }).on('mouseup touchend', function() {
                    socket.emit("down", screen);
                });
            });
        }
    });

    socket.on("up", function(data){
        clearInterval(down_timer);
        clearInterval(up_timer);
        var offset = $("#plane").offset();
        let xPos = offset.left; 
        up_timer = setInterval (function () { 
            xPos++;

            $('#plane').css('left', xPos + "px");

              // Have we hit top or bottom?
              if((xPos <= -40) || (xPos >= (data.screenWidth - 40))){
                clearInterval(timer);
                // alert("END");
                socket.emit("game_over", score);
            }
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

              // Have we hit top or bottom?
              if((xPos <= -40) || (xPos >= (data.screenWidth - 40))){
                clearInterval(timer);
                // alert("END");
                socket.emit("game_over", score);
            }
        }, speed - 5);
    });


    socket.on("move_on", function(data){
        score = data.score;
        $(".play-screen p").html("Score:" + score);
        $(".play-screen h3").html(data.area);

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
            score++;
            $(".play-screen p").text("Score:" + score);

            $('#plane').css('top', yPos + "px");

            // Have we hit top or bottom?
            if((xPos <= -40) || (xPos >= (data.screenWidth))){
                clearInterval(timer);
                // alert("END");
                socket.emit("game_over", score);
            }

            if (yPos == data.screenHeight){
                if(data.screen == data.devices.length - 1){
                    clearInterval(timer);
                    socket.emit("game_over", score);
                } else{
                    clearInterval(timer);
                   
                    data = {
                        xPos: xPos,
                        yPos: yPos,
                        score: parseInt(score)
                    }

                    socket.emit("moved", data);
                }
            }
        }, speed);
    });

    socket.on("game_end", function(score){
        $(".play-screen").fadeOut();
        // $(".ready-screen").fadeOut();
        $(".select-screen").fadeOut();
        $(".game-over-screen").fadeIn();
        $(".game-over-screen h2").text("Your score was " + score + "!");
    });
    
});


