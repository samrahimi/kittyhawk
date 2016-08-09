### Wifi Switcher
# NOTE RE: ACCESS CONTROL. Turn on the aircraft. Immediately after you hear the beeps and the propellers twitch, press the power button 4 times, quickly. 
# this will allow you to telnet in from a device that's connected to its hotspot. 
# Once you are in, run: mount -o remount,rw / - this makes it possible to edit the config files on the device.
# Then proceed as per: Parrot's instructions (this script was on their official Github)

ESSID=InFlight #Or whatever you've named your hotspot
DEFAULT_WIFI_SETUP=/sbin/broadcom_setup.sh

# Set light to orange
BLDC_Test_Bench -G 1 1 0 >/dev/null

# Check whether drone is in access point mode
if [ $(bcmwl ap) -eq 1 ]
then
        echo "Trying to connect to $ESSID" | logger -s -t "LongPress" -p user.info

        # Bring access point mode down
        $DEFAULT_WIFI_SETUP remove_net_interface
        # Configure wifi to connect to given essid
        ifconfig eth0 down
        bcmwl down
        bcmwl band auto
        bcmwl autocountry 1
        bcmwl up
        bcmwl ap 0
        bcmwl join ${ESSID} 
        #You will need to change the IP to match the subnet that your Wifi / LTE device uses for its hotspot - run ifconfig and note the first 3 octets being 
        #used on the wlan interface (e.g. if the IP is 192.168.43.1, then pick an IP below that is 192.168.43.*)
        ifconfig eth0 192.168.43.200 netmask 255.255.255.0 up

        # Run dhpc client
        #udhcpc -b -i eth0 --hostname=$(hostname)
else
        # Should make drone an access point again
        # Bug: does not work yet (turn drone off & on instead)
        $DEFAULT_WIFI_SETUP create_net_interface
fi

# Set light back to green after 1 second
(sleep 1; BLDC_Test_Bench -G 0 1 0 >/dev/null) &
