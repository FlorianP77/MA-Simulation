const viewer = wind3D.viewer


const shipRoute = JSON.parse(
  '[{"longitude":4,"latitude":52,"height":0},{"longitude":286,"latitude":40,"height":0}]'
);


const timeStepInSeconds = 30;
const totalSeconds = timeStepInSeconds * (shipRoute.length - 1);
const start = Cesium.JulianDate.fromIso8601("2020-03-09T23:10:00Z");
const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.timeline.zoomTo(start, stop);
viewer.clock.multiplier = 1;
viewer.clock.shouldAnimate = true;


const positionProperty = new Cesium.SampledPositionProperty();

for (let i = 0; i < shipRoute.length; i++) {
  const dataPoint = shipRoute[i];


  const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
  const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);

  positionProperty.addSample(time, position);

  viewer.entities.add({
    description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
    position: position,
  });
}


const shipEntity = viewer.entities.add({
  availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
  position: positionProperty,
  point: {
    pixelSize: 30,
    color: Cesium.Color.GREEN,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    zIndex: 1,
  },
  path: {
    resolution: 1,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.3,
      color: Cesium.Color.RED,
    }),
    width: 3,
    zIndex: 1,
  },
});



// Make the camera track this moving entity.
//viewer.trackedEntity = shipEntity;