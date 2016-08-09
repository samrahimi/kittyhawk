module.exports = { UavStatus: function(uavType) {
									this.uavType = uavType; 
									this.connected = false;
									this.flying = false;
									this.flightStatus = 'Unknown';
									this.altitude = null;
									this.battery = null;
									this.gps = null;
									this.location= null;
									this.homepoint = null;
									this.navData = null;
									this.lastUpdated = new Date();
								},
					UavConfig: function(maxAltitude, hull, outdoor) {
									this.maxAltitude = maxAltitude;
									this.hull = hull;
									this.outdoor = outdoor;
					}
				};