class Ship{
  constructor(){
    this.viewer = wind3D.viewer;
    this.routeUrl = fileOptions.routeDirectory;
    this.modelUrl = fileOptions.shipDirectory;
    this.positionProperty = new Cesium.SampledPositionProperty;
    
    this.shipRoute = [];
    this.start = null;
    this.end = null;
  }

  async initialize() {
    console.log(this.routeUrl)
    this.shipRoute = await (await fetch(this.routeUrl)).json();

    this.start = Cesium.JulianDate.fromIso8601(this.shipRoute[0].time);
    this.end = Cesium.JulianDate.fromIso8601(this.shipRoute[this.shipRoute.length - 1].time);

    this.viewer.clock.startTime = this.start.clone();
    this.viewer.clock.stopTime = this.end.clone();
    this.viewer.clock.currentTime = this.start.clone();
    this.viewer.timeline.zoomTo(this.start, this.end);
    this.viewer.clock.multiplier = defaultShipOptions.clockMultiplier;
    this.viewer.clock.shouldAnimate = true;
    

    this.addPositionsToProperty();

    await this.loadModel();
  }

  addPositionsToProperty() {
    for (let i = 0; i < this.shipRoute.length; i++) {

      const dataPoint = this.shipRoute[i];

      const time = Cesium.JulianDate.fromIso8601(dataPoint.time);

      const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);

      this.positionProperty.addSample(time, position);

      this.viewer.entities.add({
        description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
        position: position
      });
    }
  }

  async loadModel() {

    const shipEntity = this.viewer.entities.add({

      availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: this.start, stop: this.end })]),
      position: this.positionProperty,

      model: {
        uri: this.modelUrl,
        minimumPixelSize: 128,
        maximumScale: 20000,
        scale: 1000,
        zIndex: 1
      },

      orientation: new Cesium.VelocityOrientationProperty(this.positionProperty),

      path: {
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: Cesium.Color.RED
        }),
        width: 3,
        zIndex: 1
      }

    });

    // Optionale Zeile, um das Modell zu verfolgen
    // this.viewer.trackedEntity = shipEntity;
  }
}