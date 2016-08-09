/* INSTALLATION NOTES
 *
 * This runs on the WiFi-3g/LTE bridge that is attached to the aircraft 
 * If the device is capable of running Node.js 6 and can be configured as a WiFi hotspot 
 * then the code will run properly - I suggest something small and light like a Raspberry Pi Zero with  
 * an LTE modem added on, or a Smartwatch (the kind that can function as a standalone smartphone, 
 * and runs a real OS. 
 * 
 * You can also run this on a (ordinary, stock, unrooted) Android phone using Termux, Gnuroot Debian, 
 * or the Linux-on-Android distro of your choice - if you can find one that's light enough and small enough
 * for the Bebop to lift (and an appropriate place to mount it). This code was actually developed and tested on an LG Nexus 5 - which was sufficiently light for the aircraft
 * to take off and fly around.
 *
 * STEP 1: Configure the BEBOP to connect to your hotspot rather than being the hotspot. Complete instructions are 
 * in /server/device/wifiswitch.sh - once configured, the BEBOP can be toggled between WiFi modes by a long press 
 * on the power button. Test your configuration and ensure that the drone connects to the hotspot. 
 *
 * STEP 2: Update aircraftIP (below) to match the IP you set for the BEBOP. Update gatewayUrl below to match 
 * the Url you will be deploying the server code to. 
 *
 * STEP 3: Deploy the entire /server folder (including this file) to your web server and test it - enter the gatewayUrl into your browser
 * and you should get a mobile webpage with a virtual joystick UI. 
 * 
 * STEP 4: Install Node.js 6 on the Wifi / LTE device, then the dependencies:
 * npm install socket.io-client && npm install node-bebop. 
 * 
 * STEP 5: Copy this script onto the device (an easy way is to pull it from the server, wget http://my.gateway.url:port/getflightscript) 
 * but it doesn't really matter
 *
 * STEP 6: Get ready to fly. Put the device in hotspot mode, connect the BEBOP using the long-press you set up in step 1, then start this script:
 * node kittyhawk.js - if everything has been done properly, you will get a few messages ending with "Ready to fly". If either the gateway Url or 
 * aircraft IP are incorrect, or the aircraft is not connected to the hotspot, the script will crash with a "connection refused" error. Tweak 
 * your settings and try again.
 *
 * STEP 7: Securely attach the device to the aircraft (the velcro strap you already have may be sufficient if the device is small), and hit the 
 * gateway Url on the iOS device you will be using as a controller. The rest is self-explanatory if you've ever flown a drone before (and if you 
 * haven't, please get some experience before you try this. If the device is too heavy or you have attached it in an unbalanced way, the aircraft 
 * will wobble in flight and generally be difficult to control. Stay low, and if you lose control, the emergency landing button will cut the power 
 * (obviously, get as low as you can before you do this). 
 
/* NETWORK AND AIRCRAFT SETTINGS - MODIFY AS NEEDED */
var gatewayUrl = 'http://107.191.49.129:3000'; //The root URL of this server (public facing IP or hostname:port)
var aircraftIP = '192.168.43.200';

/* PROGRAMMERS ONLY BEYOND THIS POINT */
var io = require( 'socket.io-client' );
var client = io.connect(gatewayUrl);
var bebop = require('node-bebop'); 					//Node.js wrapper for Parrot Bebop SDK
var uav;
var uavData = require('./uavdata.js');
var uavStatus = new uavData.UavStatus('bebop');
var uavConfig = new uavData.UavConfig(100, 0, 1); 	//Max altitude, hull, outdoor mode
var testMode = true; 								//If true, connects to the server but bypasses the aircraft

/* Transmit flight status back to the piloting app */
var updateFlightStatus = function() {
	uavStatus.lastUpdated = new Date();
	client.emit('status', uavStatus);
};

/* TODO: Put these in a config file or DB */
var updateUavSettings = function() {
					//We should read back and see if these actually 'take'
					uav.PilotingSettings.maxAltitude(uavConfig.maxAltitude);
					uav.SpeedSettings.hullProtection(uavConfig.hull);
					uav.SpeedSettings.outdoor(uavConfig.outdoor);
					uav.WifiSettings.outdoorSetting(uavConfig.outdoor);
					
					if (uavConfig.outdoor == 1)
						uav.GPSSettings.resetHome();

};


/* The aircraft fires various events (navigational, power, flight status, etc) - we listen for them, update 
 * uavStatus, and push the updates in real time to the piloting app */ 
var createEventListeners = function() {
  uav.on("ready", function() {
    console.log("ready");
    uavStatus.flightStatus = "Ready";
    uavStatus.flying = false;
    updateFlightStatus();
  });

  uav.on("battery", function(data) {
    console.log(data);
    uavStatus.battery = data;
    updateFlightStatus();
  });

  uav.on("landed", function() {
    console.log("landed");
    uavStatus.flightStatus = "Landed";
    uavStatus.flying = false;
    updateFlightStatus();

  });

  uav.on("takingOff", function() {
    console.log("takingOff");
    uavStatus.flightStatus = "Taking Off";
    uavStatus.flying = true;
    updateFlightStatus();

  });

  uav.on("hovering", function() {
    console.log("hovering");
    uavStatus.flightStatus = "Hovering";
    uavStatus.flying = true;
    updateFlightStatus();

  });

  uav.on("flying", function() {
    console.log("flying");
    uavStatus.flightStatus = "Flying";
    uavStatus.flying = true;
    updateFlightStatus();
  });

  uav.on("landing", function() {
    console.log("landing");
    uavStatus.flightStatus = "Landing";
    uavStatus.flying = true;
    updateFlightStatus();
  });

  uav.on("unknown", function(data) {
    console.log("unknown", data);
  });
  
  uav.on("navData", function (data) {
	console.log("Alt changed: " + data);
	uavStatus.navData = data;
	updateFlightStatus();
  }); 
  
  uav.on("GPSFixStateChanged", function(data) {
    console.log("GPSFixStateChanged", data);
    uavStatus.gps = data;
    updateFlightStatus();
  });
  
  uav.on("PositionChanged", function(data) {
    console.log(data);
    uavStatus.position = data;
    updateFlightStatus();
  });
  
};

/* Connect, configure, and set up the event listeners */
client.on("connect", function () {
    		console.log('Connected to ATC server '+gatewayUrl );
			uav = bebop.createClient({ip:aircraftIP});
			if (testMode == true) {
				uavStatus.connected=true;
				updateFlightStatus();	
				console.log('Ready to fly');
			}
			else {
				uav.connect(function() {
					uavStatus.connected=true;
					console.log('Connected to aircraft. Binding events');
					createEventListeners();
					console.log('Applying settings.');
					updateUavSettings();
					updateFlightStatus();
					console.log('Ready to fly. You are cleared for takeoff.');
	
				});
			}
});

/* This is how the user controls the plane */
client.on("control", function(msg) {
	switch (msg.action) {
		case "takeoff":
			console.log('Taking off...');
			if (testMode == true) {
				uavStatus.flying = true;
				updateFlightStatus();
			}
			else {
				uav.takeoff(function() {
					uavStatus.flying = true;
					updateFlightStatus();
				});
			}
			break;
		case "land":
			console.log('Aircraft is landing');
			uav.land(function() {
				uavStatus.flying = false;
				updateFlightStatus();
			});
			break;
		case "stop":
			uav.stop();
			console.log('Stop command received, hovering');
			updateFlightStatus();
			break;
		case "emergency":
			console.log('Emergency stop. Aircraft will power down');
			uav.emergency(); //Mid-air shutdown of all engines. Use with caution
			updateFlightStatus();
			break;
		case "fly": 
			var flightCommandJs = 'uav.'+msg.params.direction+'('+msg.params.velocity+');';
			console.log("Executing "+flightCommandJs);
			eval(flightCommandJs);
			console.log("Done");
			break;
		case "execute":
			//executes arbitrary node.js sent by the client - such as low-level aircraft APIs 
			console.log("Executing "+msg.params.js);
			eval(msg.js);
			console.log("Done");
			break;
			
	}
});
