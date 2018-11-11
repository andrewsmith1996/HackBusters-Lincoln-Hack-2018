

$(function () {
    
    var socket = io('http://10.69.3.151:1797');

    var up_timer;
    var down_timer;
    var score;
    const speed = 8;

    
    // Have we pressed the begin button?
    $('.begin button.device-begin').on('click',function(){

        // Animate out the begin screen
        $('.begin').animate({opacity:0});
        $(".begin").hide();

        // Animate in the introduction screen
        $('.introduction').animate({opacity:1});
        $(".introduction").show();
        
        // Fade in the story text
        $(".introduction h1").fadeIn(2000, () =>
            $(".introduction h3.heading-1").fadeIn(2000, () =>
                $(".introduction h3.heading-2").fadeIn(2000, () => 
                    { $(".introduction img").fadeIn(3000).css('display', 'block');
                    $(".introduction button").fadeIn(3000); }
                )
            )
        )
    });

    // Have we clicked the continue button?
    $('.introduction button').on('click',function(){
        if($(this).hasClass("stop_music")){
            document.getElementById('guile').pause();
        } else{
            document.getElementById('guile').play();
        }
    });

   



    // Have we selected the device number?
    $(".select-screen button").on('click',function(){
        if($(this).attr('data-ref') != "viewer"){

            // Fade out previous screens
            $('.select-screen').animate({opacity:0});
            $(".select-screen").hide();
            $(".select-screen").remove();

            $('.game-over-screen').animate({opacity:0});
            $(".game-over-screen").hide();

            // Will this device be used to control the plane?
            if($(this).attr('data-ref') == "control"){
                $(".ready-screen").animate({opacity:1});
                $(".ready-screen").show();
            } else{

                // Show the animate screen
                $(".play-screen").animate({opacity:1});
                $(".play-screen").show();
                
                // Add the background image to the playing screens
                $('body').addClass('play');
                $('.play-screen').css('height', $(window).height());
                var area = "Scampton, Lincoln";

                var areas = ['Walcheren (Netherlands)', 'Schouwen (Netherlands)', 'Gilze-Rijen (Netherlands)', 'Eindhoven (Netherlands)', 'Ruhr (Germany)', 'Möhne River (Germany)', 'Vlieland (Germany)', 'Wesel (Germany)', 'Eder Dam (Germany)']

                if($(this).attr('data-ref') != 1){
                    area = areas[Math.floor((Math.random() * (areas.length - 1)) + 1)];
                }
                $(".play-screen #area").text(area);

            }
        } else {

            // Animate out the select screen
            $(".select-screen").animate({opacity:0});
            $(".select-screen").hide();

            // Animate in the begin screen
            $(".begin").animate({opacity:1});
            $(".begin").show();

            $('.audo')
        }

        // Construct the object data
        const data = {
            buttonRef:$(this).attr('data-ref'),
            height: $(window).height(),
            width: $(window).width(),
            ready: true
        }

        // Tell the server a device has connected
        socket.emit('device-connected', data);
        
        return false;
    });

    // Tell the server we're ready to play and use the hover button
    socket.on('control', function(data){
       
        $('.ready-screen .play-button').fadeIn();

        // Do we have a play button on this screen?
        if($('.ready-screen .play-button').length > 0){

            // Have we clicked the play button?
            $(".ready-screen .play-button").on('click',function(){
       
                // Tell the server we're now ready to ply
                socket.emit('ready');

                // Hide the play button
                $(".ready-screen .play-button").hide();
                $(".ready-screen .hover-button").css("display", "block");
    
                // Add the control button
                $('.ready-screen .hover-button').css('cursor','pointer');
                
                // Add the event listeners for the control button
                $('.ready-screen .hover-button')
                .on('touchstart', function() {
                    socket.emit("control_button_up", screen);
                }).on('touchend', function() {
                    socket.emit("control_button_down", screen);
                });
            });
        }
    });

    // When the control button has been pressed to move the plane up 
    socket.on("move_plane_up", function(data){

        $('.play-screen').css('height', $(window).height());

        // Stop moving the plane down and up 
        clearInterval(down_timer);
        clearInterval(up_timer);

        // Get the plane's current position
        let xPos = $("#plane").offset().left;

        // Move the plane up 
        up_timer = setInterval (function () { 
    
            xPos++;

            // Position the plane
            $('#plane').css('left', xPos + "px");

              // Have we hit top or bottom?
              if((xPos <= 0) || (xPos >= $(window).width())){
                clearInterval(timer);
                clearInterval(down_timer);
                clearInterval(up_timer);
                // alert("END");
                socket.emit("game_over", score);
            }
        }, speed);
    });

     // When the control button has been released to move the plane down
    socket.on("move_plane_down", function(data){

        $('.play-screen').css('height', $(window).height());

        // Stop moving the plane
        clearInterval(up_timer);
        clearInterval(down_timer)

        // Get the left position of the plane
        let xPos = $("#plane").offset().left;

        down_timer = setInterval (function () {
            xPos--;

            // Position the plane on the screen
            $('#plane').css('left', xPos + "px");

              // Have we hit top or bottom?
              if((xPos <= 0) || (xPos >= $(window).width())){
                clearInterval(down_timer);
                clearInterval(up_timer);
                clearInterval(timer);
                socket.emit("game_over", score);
            }
        }, speed - 3);
    });

    // When the plane needs to move to the next screen
    socket.on("move_screen", function(data){
       
        $('.play-screen').css('height', $(window).height());

        // Get the current score
        score = data.score;
        $(".play-screen #score").text(score);

        // Get the passed position of the plane
        let yPos = -20; 

        // Show the plane on this new screen
        $("#plane").show();
        $('#plane').css('top', yPos + "px");

         // Get the left position of the plane
         let xPos = $("#plane").offset().left;

         down_timer = setInterval (function () {
             xPos--;
 
             // Position the plane on the screen
             $('#plane').css('left', xPos + "px");
 
               // Have we hit top or bottom?
               if((xPos <= 0) || (xPos >= $(window).width())){
                 clearInterval(down_timer);
                 clearInterval(up_timer);
                 clearInterval(timer);
                 // alert("END");
                 socket.emit("game_over", score);
             }
         }, speed - 3);
      
        // Set to mvoe the plane across the screen
        timer = setInterval (function () {
            
            // Move the plane
            yPos++;
            $('#plane').css('top', yPos + "px");
            
            // Increase the user's score
            score++;
            $(".play-screen p").text("Score:" + score);

            // Have we hit top or bottom?
            if((xPos <= 0) || xPos >= $(window).width()){
                console.log("HIT BOTTOM OR TOP");
                clearInterval(timer);
                clearInterval(down_timer);
                clearInterval(up_timer);
                // alert("END");
                socket.emit("game_over", score);
            }
            
            // Have we hit the end of the screen?
            if (yPos >= ($(window).height() - $("#plane").height())){
                // alert(data.screen >= data.devices.length - 1);
               
                // Are we on the last device?
                if(data.screen >= data.devices.length - 1){
                    clearInterval(timer);
                    clearInterval(down_timer);
                    clearInterval(up_timer);
                    // End the game
                    socket.emit("game_over", score);

                } else{
                    
                    $("#plane").hide();
                    clearInterval(timer);
                    
                    // Construct an object of the new data
                    data = {
                        xPos: xPos,
                        yPos: yPos,
                        score: parseInt(score),
                        screenHeight: $(window).height(),
                        screenWidth: data.screenWidth,
                    }

                    // Tell the server we need to move onto the next screen
                    socket.emit("next_screen", data);
                }
            }
        }, speed);
    });

    // On the end game
    socket.on("game_end", function(score){


        $('body').removeClass('play');

        
       
        // Fade out all the previous screens
        $(".play-screen").fadeOut();
        $(".introduction").fadeOut();
        $(".begin").fadeOut();
        $(".ready-screen").fadeOut();
        $(".select-screen").fadeOut();

        
        var game_over_element = `
        <div class="container game-over-screen">
        <div class="row">
        <div class="col-md-12">
        <h1>GAME OVER!</h1>
        <h2>Your score was ${ score } </h2>
        </div>
        </div>
        </div>`
        
        //Fade in the new screen, with the score text
        $("body").append(game_over_element);
        $(".game-over-screen").show();
        $(".game-over-screen").css("opacity", "1");

        socket.disconnect();
        
    });
    
});


