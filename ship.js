class Ship {
  constructor() {

    this.model3dUrl = fileOptions.shipDirectory;
    this.positionProperty = new Cesium.SampledPositionProperty();



    this.updateInterval = shipOptions.updateInterval;

    
    this.realScale = shipOptions.realScale;
    this.maximumScale = shipOptions.maximumScale;
    this.minimumPixelSize = shipOptions.minimumPixelSize;


    this.shipSpeed = panel.shipSpeed
    this.shipSpeedKnots = panel.shipSpeedKnots
    this.shipDirection = 0

    this.previousDataPointIndex = 0;
    this.nextDataPointIndex = 1;




    this.active = true;
    this.shipType = panel.shipType;

    this.shipSpeed = panel.shipSpeed
    this.shipSpeedKnots = panel.shipSpeedKnots


    this.route = routes[panel.route];
    this.routeUrl = "routes/" + panel.route + ".geojson";

    this.previousDataPointIndex = 0;
    this.nextDataPointIndex = 1;
    this.dataPoint = this.route[this.previousDataPointIndex]



    this.kiteEntity = null

    this.pathPositions = [];

    

    


    this.initialize();
  }

  initialize() {
    this.active = true;
    this.shipType = panel.shipType;

    this.shipSpeed = panel.shipSpeed
    this.shipSpeedKnots = panel.shipSpeedKnots


    this.route = routes[panel.route];
    this.routeUrl = "routes/" + panel.route + ".geojson";

    

    this.previousDataPointIndex = 0;
    this.nextDataPointIndex = 1;
    this.dataPoint = this.route[this.previousDataPointIndex]



    this.kiteEntity = null

    this.pathPositions = [];


    


    this.start = Cesium.JulianDate.fromIso8601(panel.date);
    console.log(this.route.length)
    this.end = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromIso8601(panel.date),this.route[this.route.length - 1][1] / this.shipSpeed,new Cesium.JulianDate());

    wind3D.viewer.clock.startTime = this.start.clone();
    wind3D.viewer.clock.stopTime = this.end.clone();
    wind3D.viewer.clock.currentTime = this.start.clone();
    wind3D.viewer.timeline.zoomTo(this.start, this.end);
    wind3D.viewer.clock.multiplier = shipOptions.clockMultiplier;
    wind3D.viewer.clock.shouldAnimate = false;


    this.addPositionsToProperty();

    this.loadRoute()

    this.load3dModel();

    
    kite.initialize();
  }

  addPositionsToProperty() {
    this.positionProperty = new Cesium.SampledPositionProperty(
      Cesium.ReferenceFrame.FIXED
    );
    
    this.positionProperty.setInterpolationOptions({
      interpolationDegree: 3,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });


    const startDate = Cesium.JulianDate.addSeconds(this.start, -1, new Cesium.JulianDate()); 


    const startPosition = Cesium.Cartesian3.fromDegrees(this.route[0][0][0], this.route[0][0][1], this.route[0][0][2]);

    this.positionProperty.addSample(startDate, startPosition);



    for (let i = 0; i < this.route.length; i++) {
      const dataPoint = this.route[i];
      const time = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromIso8601(panel.date), dataPoint[1] / this.shipSpeed, new Cesium.JulianDate());

      const cartographic = Cesium.Cartographic.fromDegrees(
        dataPoint[0][0], // Longitude
        dataPoint[0][1], // Latitude
        dataPoint[0][2] // Altitude/Height
      );

      const position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);

      this.positionProperty.addSample(time, position);

      this.pathPositions.push(position);
    }

    const endDate = Cesium.JulianDate.addSeconds(this.end, 1, new Cesium.JulianDate())

    const endPosition = this.positionProperty.getValue(this.end);

    this.positionProperty.addSample(endDate, endPosition);

  }



  updateDatapoint() {
    const currentTime = wind3D.viewer.clock.currentTime;

    if (Cesium.JulianDate.lessThan(currentTime, this.start) || Cesium.JulianDate.greaterThan(currentTime, this.end)) {

      this.active = false;
      wind3D.viewer.clock.shouldAnimate = false;

      if (Cesium.JulianDate.lessThan(currentTime, this.start)) {
        wind3D.viewer.clock.currentTime = this.start
        this.previousDataPointIndex = 0;
        this.nextDataPointIndex = 1;
        console.log("Ship is inactive; time is before start.");
      } 
      
      else {
        console.log(this.route.length)
        wind3D.viewer.clock.currentTime = this.end
        this.previousDataPointIndex = this.route.length - 2;
        this.nextDataPointIndex = this.route.length - 1;
        console.log("Ship has arrived.");
        this.updatePositionData(this.route[this.nextDataPointIndex]);
      }

      return;
    }
  
    this.active = true;
    
  

    while (this.nextDataPointIndex < this.route.length && Cesium.JulianDate.addSeconds(this.start, this.route[this.nextDataPointIndex] / this.shipSpeed, new Cesium.JulianDate()) <= currentTime) {
      this.previousDataPointIndex++;
      this.nextDataPointIndex++;
    }
  

    while (this.previousDataPointIndex > 0 && Cesium.JulianDate.addSeconds(this.start, this.route[this.previousDataPointIndex][1] / this.shipSpeed, new Cesium.JulianDate()) > currentTime) {
      this.previousDataPointIndex--;
      this.nextDataPointIndex--;
    }

    this.previousDataPointCartesian = Cesium.Cartesian3.fromDegrees(
      this.route[this.previousDataPointIndex][0][0],
      this.route[this.previousDataPointIndex][0][1],
      this.route[this.previousDataPointIndex][0][2]
    );

    this.nextDataPointCartesian = Cesium.Cartesian3.fromDegrees(
      this.route[this.nextDataPointIndex][0][0],
      this.route[this.nextDataPointIndex][0][1],
      this.route[this.nextDataPointIndex][0][2]
    );

    this.updatePositionData(this.route[this.previousDataPointIndex]);
  }


  updatePositionData(dataPoint) {
    this.dataPoint = dataPoint


    this.longitude = dataPoint[0][0]
    this.latitude = dataPoint[0][1];

    this.level = dataPoint[0][2];


    this.shipDirection = dataPoint[2];

    if(kite.active){
      this.showKite()
    }

    else{
      this.removeKite()
    }

  }



  loadRoute() {

    /*if (this.routeEntity) {
      wind3D.viewer.dataSources.remove(this.routeEntity)
      this.routeEntity = null;
    }
    console.log(this.routeUrl)

    this.routeEntity = wind3D.viewer.dataSources.add({
      this.routeEntity = wind3D.viewer.dataSources.add({
        stroke: Cesium.Color.HOTPINK,
        fill: Cesium.Color.PINK,
        strokeWidth: 1,
        zIndex: 1
      });
    });*/

    if (this.routeEntity) {
      wind3D.viewer.entities.remove(this.routeEntity)
      this.routeEntity = null;
    }

    this.routeEntity = wind3D.viewer.entities.add({
      polyline: {
        positions: this.pathPositions,
        width: 2,
        material: Cesium.Color.HOTPINK,
        /*material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.PINK,
          dashLength: 16, 
          gapColor: Cesium.Color.TRANSPARENT ,
          dashPattern: 0b111111110
        }),*/
      }
    })
  }

  load3dModel() {
    if (this.shipEntity) {
      wind3D.viewer.entities.remove(this.shipEntity);
      this.shipEntity = null;
    }

    this.shipEntity = wind3D.viewer.entities.add({
      position: this.positionProperty,

      model: {
        uri: this.model3dUrl,
        minimumPixelSize: this.minimumPixelSize,
        maximumScale: this.maximumScale,
        scale: this.realScale,
        zIndex: 999,
      },

      orientation: new Cesium.VelocityOrientationProperty(
        this.positionProperty
      ),
    });
  }

  showKite() {
    if(this.kiteEntity == null){
      this.kiteEntity = wind3D.viewer.entities.add({
        position: this.positionProperty,
        model: {
          uri: kite.model3dUrl,
          minimumPixelSize: kite.minimumPixelSize,
          maximumScale: kite.maximumScale,
          scale: kite.realScale,
          zIndex: 999,
        },
        orientation: new Cesium.VelocityOrientationProperty(this.positionProperty),
      });
    }
    
  }

  removeKite() {
    if(this.kiteEntity) {
      wind3D.viewer.entities.remove(this.kiteEntity)
      this.kiteEntity = null;
    }
  }


  reset() {


    this.initialize();
  }
}
