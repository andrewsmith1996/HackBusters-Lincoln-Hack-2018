

$(function () {
    
    var socket = io('http://10.69.3.151:1797');
    var screenHeight = $(window).innerHeight;
    var screenWidth = $(window).innerWidth;
    var up_timer;
    
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
    
                $('.ready-screen .hover-button').on('mousedown', function() {
            
                    socket.emit("up", screen);
                }).on('mouseup mouseleave', function() {
                    socket.emit("down", screen);
                });
            });
        }
    });

    socket.on("up", function(data){
        var offset = $("#plane").offset();
        let xPos = offset.left; 
        up_timer = setInterval (function () { // timer to move element slowly
            xPos++;
            $('#plane').css('left', xPos + "px");
        }, 100);
    });

    socket.on("down", function(data){
        clearInterval(up_timer);
    });



  
    socket.on("move_on", function(data){

      
        $("#plane").show();

       
        // $("#plane").css
        // while(xPos != (data.screenWidth - 50)){
    
            // }
        $('#plane').css('top',"0px");
        $('#plane').css('left', (data.screenWidth / 2) + "px");
      
        let yPos = 0;
        var offset = $("#plane").offset();
        let xPos = offset.left;      

        timer = setInterval (function () { // timer to move element slowly
            yPos++;
            xPos--;
            $('#plane').css('top',yPos + "px");
            $('#plane').css('left', xPos + "px");
            if (yPos == data.screenHeight){
                clearInterval(timer);
                socket.emit("moved", data);
            }
        }, 100);
       
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


