*Kittyhawk*

Kittyhawk is a cross-platform stack for controlling drone aircraft via 3g / 4g cellular networks; supports Parrot Bebop out of the box.

There are 3 components:

- /Device/Kittyhawk.js is installed on a mobile device with SIM card and WiFI tethering capabilities that is attached to the aircraft. Opens a socket connection with the server, listens for messages, and translates them into API calls that fly the aircraft.  

- Server.js is installed on a web server with a public-facing IP and takes care of routing messages between the mobile webapp used by the pilot to control the aircraft, and the device running Kittyhawk.js 

- Index.html and the associated files in /client-scripts is a simple mobile webapp with a virtual "dpad" joystick UI, throttle control, and automatic takeoff/landing buttons.

*INSTALLATION NOTES*

Kittyhawk.js should be installed on a single board Linux PC or Android mobile device (with WiFi as well as 3g / 4g connectivity), which in turn should be securely fastened to your Parrot BEBOP drone. If the device is capable of running Node.js 6 and can be configured as a WiFi hotspot then it will work (provided that it is under 200g, the absolute maximum weight that a BEBOP can carry).

To run this on an (ordinary, stock, unrooted) Android phone, install Linux and Node using Termux, Gnuroot Debian, 
or the Linux-on-Android distro of your choice - if you can find one that's light enough and small enough
for the Bebop to lift (and an appropriate place to mount it). The alpha was developed and tested on an LG Nexus 5 - 
sufficiently light for the aircraft to take off and manuever with acceptable control.
 
STEP 1: Configure the BEBOP to connect to your hotspot (default mode is to act as its own access point). Complete instructions are 
contained in the comments in /device/wifiswitch.sh - once configured, the BEBOP can be toggled between WiFi modes by a long press 
on the power button. Test your configuration and ensure that the drone connects to the hotspot. 

STEP 2: Deploy the entire /server folder (including this file) to your web server (must have node.js 6) and test it - enter the hostname and port into your browser and you should get a mobile webpage with a virtual joystick UI. 

STEP 3: Update *aircraftIP* and *gatewayUrl* in /device/kittyhawk.js to match your network configuration. 

STEP 4: Install Node.js 6 on the Wifi / LTE device, then the dependencies:
npm install socket.io-client && npm install node-bebop. 

STEP 5: Copy /device/kittyhawk.js onto the mobile device (or use wget to pull it from the server - http://my.server.url/getflightscript points to the file) 

STEP 6: Get ready to fly. Put the device in hotspot mode, connect the BEBOP using the long-press you set up in step 1, then start this script: node kittyhawk.js - if everything has been done properly, you will get a few messages ending with "Ready to fly". If either the gateway Url or aircraft IP are incorrect, or the aircraft is not connected to the hotspot, the script will crash with a "connection refused" error. Reboot the aircraft and try again.

STEP 7: Securely attach the device to the aircraft (the velcro strap you already have may be sufficient if the device is small), and hit the gateway Url on the iOS device you will be using as a controller. The rest is self-explanatory if you've ever flown a drone before (and if you haven't, please learn the basics before you attach a payload and use experimental software). If the device is too heavy or has been attached to the aircraft in a way that interferes with its balance, you will notice a pronounced wobble when flying. Until you see how it handles, stay low and go slow!
