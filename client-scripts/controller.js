    /* Client-side JS for the drone controller webapp 
     * Dependencies: socket.io 1.2.0, jQuery 1.11.1 */   
      
    $(document).ready(function() {
	
	var socket = io();
	var uavStatus = {};
	//TODO: Add first-person video support to kittyhawk.js 
	var fpvStatus = {};
	  

	 //Sends controller actions as JSON to Kittyhawk.js (which runs on the mobile device on board the aircraft). 
	 //Kittyhawk is a mobile network bridge and high-level API for controlling drone aircraft via 3g / 4g networks.
	 //Currently Kittyhawk implements the Parrot Bebop quadcopter APIs via node-bebop but can
	 //easily be extended to control other makes and models of UAV (by implementing their proprietary APIs). To access low-level
	 //drone or device-specific APIs, use {action:"execute", params:"arbitrary javascript to execute on the receiving device"}
	
	var sendFlightControlMessage = function(action, params) {
      	socket.emit('control', {action: action, params: params});
      	//console.log('Control state: '+controlState.toString());
      }

	  //Listens for status updates from the aircraft. This part needs to be expanded
      socket.on('status', function(msg){
        	uavStatus = msg;
        	console.log(msg.flightStatus);

			//Takeoff and Land are the same button - function is toggled based on aircraft status
			if (uavStatus.flying == true)
			{
					   $(".takeoff-land").attr("action", "land");
					   $(".takeoff-land").text("Land");
			}
			else	
			{	
					   $(".takeoff-land").attr("action", "takeoff");
					   $(".takeoff-land").text("Take Off");
			}

      });
      
      //Bind buttons and flight controls
      $(".takeoff-land").on("click", function() {
      	if ($(".takeoff-land").attr("action") == "takeoff")
      	{
      		if (confirm("Do you accept"))
      			sendFlightControlMessage("takeoff");
      	}
      	else
      	{
      		//clearInterval(pollingLoop);
      		sendFlightControlMessage("land");
      	}
      });
      
      $(".emergency").on("click", function() {
      	if (confirm("Shut down engines?"))
      	{
      		sendFlightControlMessage("emergency");
      	}
      });
      
      //TODO: integrate throttle control into the d-pad and vary the speed based on pressure (or replace d-pad with 
      //a virtual analog joystick widget).
      
      $(".dpad-button").on("touchstart", function() {
        $(this).addClass("pressed");
      	console.log($(this).attr("direction"));
      	console.log("Throttle is "+parseInt($("#speed").val()));
      	sendFlightControlMessage('fly', {direction: $(this).attr("direction"), velocity: parseInt($("#speed").val()) });
      });
      
      $(".dpad-button").on("touchend", function() {
        $(this).removeClass("pressed");
        console.log("stop");
      	sendFlightControlMessage('stop');
      });
	});
