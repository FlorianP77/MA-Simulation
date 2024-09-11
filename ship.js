class Ship{
  constructor(){
  
    this.active = true

    this.route = null

    this.viewer = wind3D.viewer;
    this.routeUrl = fileOptions.routeDirectory;
    this.modelUrl = fileOptions.shipDirectory;
    this.positionProperty = new Cesium.SampledPositionProperty;

    
    this.route = [];
    this.start = null;
    this.end = null;
    this.updateInterval = shipOptions.updateInterval;

    this.weight = shipOptions.weight
    this.resistanceAtTopspeed = shipOptions.resistanceAtTopspeed
    this.realScale = shipOptions.realScale
    this.maximumScale = shipOptions.maximumScale

    this.position = null;
    this.cartographicPosition = null;
    this.longitude = null;
    this.latitude = null;
    this.level = null;
    this.direction = null;
    this.currentSpeed = 0;


    this.previousDataPoint = null;
    this.nextDataPoint = null;

    this.previousDataPointCartesian = null;
    this.nextDataPointCartesian = null;

    this.pathEntity = null

    this.initialize();
  }










  initialize() {

    //await this.calculateRoute()
    this.route = panel.route
    
    console.log(panel.date)
    this.start = Cesium.JulianDate.fromIso8601(panel.date);
    this.end = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromIso8601(panel.date), this.route[this.route.length-1].timestamp, new Cesium.JulianDate());

    this.viewer.clock.startTime = this.start.clone();
    this.viewer.clock.stopTime = this.end.clone();
    this.viewer.clock.currentTime = this.start.clone();
    this.viewer.timeline.zoomTo(this.start, this.end);
    this.viewer.clock.multiplier = shipOptions.clockMultiplier;
    this.viewer.clock.shouldAnimate = true;

    this.pathPositions = [];
    

    this.addPositionsToProperty();

    this.loadModel();

    kite.initialize();
  }











  addPositionsToProperty() {
    /*const startDate2000 = Cesium.JulianDate.fromDate(new Date(Date.UTC(2000, 0, 1, 0, 0, 0))); 

    const startPosition = Cesium.Cartesian3.fromDegrees(this.route[0].longitude, this.route[0].latitude, this.level);

    this.positionProperty.addSample(startDate2000, startPosition);*/

    this.positionProperty = new Cesium.SampledPositionProperty(Cesium.ReferenceFrame.FIXED);
    this.positionProperty.setInterpolationOptions({
        interpolationDegree: 5,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
    });

    console.log("panel.date:", panel.date)


    for (let i = 0; i < this.route.length; i++) {
      const dataPoint = this.route[i]
      const time = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromIso8601(panel.date), dataPoint.timestamp, new Cesium.JulianDate());

      const cartographic = Cesium.Cartographic.fromDegrees(
        dataPoint.coordinates[0], // Longitude
        dataPoint.coordinates[1], // Latitude
        dataPoint.coordinates[2]  // Altitude/Height
    );

      const position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

      this.positionProperty.addSample(time, position);

      this.pathPositions.push(position);
    }



    /*const endDateToday = Cesium.JulianDate.fromDate(new Date());

    const endPosition = this.positionProperty.getValue(this.end);

    this.positionProperty.addSample(endDateToday, endPosition);*/
  }












  


  getCurrentDatapoints() {
    const currentTime = this.viewer.clock.currentTime

    for (let i = 0; i < this.route.length - 1; i++) {
      const currentPointTime = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromIso8601(panel.date), this.route[i].timestamp, new Cesium.JulianDate());
      const nextPointTime = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromIso8601(panel.date), this.route[i + 1].timestamp, new Cesium.JulianDate());

      //console.log("Timestamp for route point", i, ":", this.route[i].timestamp);
      //console.log(currentPointTime)

      if ((Cesium.JulianDate.lessThanOrEquals(currentPointTime, currentTime) && Cesium.JulianDate.greaterThan(nextPointTime, currentTime))) {
        this.previousDataPoint = this.route[i];
        this.nextDataPoint = this.route[i + 1];
        break;
      }
    }
  

    

    this.previousDataPointCartesian = Cesium.Cartesian3.fromDegrees(this.previousDataPoint.coordinates[0], this.previousDataPoint.coordinates[1], this.nextDataPoint.coordinates[2]);
    this.nextDataPointCartesian = Cesium.Cartesian3.fromDegrees(this.nextDataPoint.coordinates[0], this.nextDataPoint.coordinates[1], this.nextDataPoint.coordinates[2]);
  }

  getCurrentSpeed() {
    
    const distance = Cesium.Cartesian3.distance(this.previousDataPointCartesian, this.nextDataPointCartesian);

    const timeDifference = this.nextDataPoint.timestamp - this.previousDataPoint.timestamp

    return distance / timeDifference;
    
  }

  getDirection() {

    const directionVector = Cesium.Cartesian3.subtract(this.nextDataPointCartesian, this.previousDataPointCartesian, new Cesium.Cartesian3());

    const directionHorizontal = new Cesium.Cartesian2(directionVector.x, directionVector.y);
    const angle = Cesium.Math.toDegrees(Math.atan2(directionHorizontal.y, directionHorizontal.x));


    const direction = (angle + 360) % 360;

    return direction;
  }

  positionTracker() {
    this.position = this.positionProperty.getValue(this.viewer.clock.currentTime);

    if (this.position){
      this.active = true
      
      this.cartographicPosition = Cesium.Cartographic.fromCartesian(this.position);
      this.longitude = Cesium.Math.toDegrees(this.cartographicPosition.longitude);
      this.latitude = Cesium.Math.toDegrees(this.cartographicPosition.latitude);
      this.level = this.cartographicPosition.height;

      //console.log(this.level)

      this.getCurrentDatapoints()
      this.direction = this.getDirection()

      this.currentSpeed = this.getCurrentSpeed()




      return{
        longitude: this.longitude,
        latitude: this.latitude,
        level: this.level,

        direction: this.direction,
        currentSpeed: this.currentSpeed
      }

    }

    else{
      console.log("ship has arrived")

      return{
        longitude: this.longitude,
        latitude: this.latitude,
        level: this.level,

        direction: this.direction,

        speed: this.currentSpeed
      }
      
    }
    
  }




















  


  loadModel() {

    if (this.shipEntity) {
      this.viewer.entities.remove(this.shipEntity);
    }


    this.shipEntity = this.viewer.entities.add({
      //availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: this.start, stop: this.end })]),
      position: this.positionProperty,

      /*point: {
        pixelSize: 10, // Größe des Punkts
        color: Cesium.Color.BLUE, // Farbe des Punkts
        outlineColor: Cesium.Color.WHITE, // Farbe des Randes
        outlineWidth: 2, // Breite des Randes
      },*/

      model: {
        uri: this.modelUrl,
        minimumPixelSize: 1024,
        maximumScale: this.maximumScale,
        scale: this.realScale,
        //zIndex: 10,
      },

      orientation: new Cesium.VelocityOrientationProperty(this.positionProperty),

      polyline: {
        positions: this.pathPositions,
        width: 3,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: Cesium.Color.RED,
        }),
      },
      
    });
  }










  async calculateRoute(){
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-api-key': 'rhijhsECAA3eF4RfWMoGX6JOpVlRongr85EmTJAu'
      }
    };
  
    const response = await fetch('https://api.searoutes.com/route/v2/sea/46.052606%2C-6.492771%3B50.356845%2C-27.339043?continuousCoordinates=true&allowIceAreas=false&avoidHRA=false&avoidSeca=false&departure=1714687200&imo=9776418&speed=42&vesselDraft=17', options)
    const data = await response.json();
      
    const coordinates = data.features[0].geometry.coordinates;
    const departureTime = data.features[0].properties.departure * 1000;
    console.log(new Date (departureTime).toISOString())
    const arrivalTime = data.features[0].properties.arrival * 1000;
    console.log(new Date (arrivalTime).toISOString())

    const totalTime = arrivalTime - departureTime;
    const timeIntervalPerPoint = totalTime / (coordinates.length - 1);

    this.route = coordinates.map((coords, index) => ({
      coordinates: [coords[0], coords[1], shipOptions.shipLevel],
      timestamp: index * timeIntervalPerPoint
    }));
  }


















  reset() {
    
    if (this.pathEntity) {
      this.viewer.entities.remove(this.pathEntity);
    }
    if (this.shipEntity) {
      this.viewer.entities.remove(this.shipEntity);
    }

    kite.reset()

    this.initialize();
  }

  
}