class Kite{
    constructor(){
        this.force = kiteOptions.force
        this.maxAngle = kiteOptions.maxAngle

        this.viewer = wind3D.viewer;

        this.modelUrl = fileOptions.kiteDirectory

        this.wind = null;


        this.fuelConsumptionWithoutKite = 0;
        this.fuelConsumptionWithKite = 0;
        this.fuelSavings = 0;

        this.isKiteEnabled = true;
        //this.isKiteEnabled = false

        this.forceProducedByKite = 0;
        this.forceProducedByMotor = 0;
        this.currentWindDirection = 0;

        this.realScale = kiteOptions.realScale
        this.maximumScale = kiteOptions.maximumScale
        this.offsteSideward = kiteOptions.offsteSideward
        this.offsetForward = kiteOptions.offsetForward
        this.offsetHeight = kiteOptions.offsetHeight


        this.modelUrl = fileOptions.kiteDirectory;
        
    }









    initialize() {
        this.windData = DataProcess.getData();
        

        this.loadModel();
    }
























    findNearestCoordinateIndex(array, value) {
        return array.reduce((nearestIndex, currentValue, currentIndex) => {

            if (Math.abs(currentValue - value) < Math.abs(array[nearestIndex] - value)) {
                
                return currentIndex;
                
            } 
            else {
                return nearestIndex;
            }

        }, 0);
    }


    getWindSpeed(lon, lat, lev) {
        console.log(this.windData.lon.array)
        
        var lonCoordinateIndex = this.findNearestCoordinateIndex(this.windData.lon.array, lon);
        var latCoordinateIndex = this.findNearestCoordinateIndex(this.windData.lat.array, lat);
        var levCoordinateIndex = this.findNearestCoordinateIndex(this.windData.lev.array, lev);


        var windIndex = (lonCoordinateIndex) + (720 * (latCoordinateIndex));

        var u = this.windData.U.array[windIndex];
        var v = this.windData.V.array[windIndex];

        let windSpeed = Math.sqrt(u**2 + v**2)

        let dir = ((Math.atan2(v, u) * 180 / Math.PI) + 360) % 360;
  


        return {
            u: u,
            v: v,
            speed: windSpeed,
            dir: dir
        };
    }

    
    outputCalculation(lon, lat, lev){
        this.wind = this.getWindSpeed(lon, lat, lev);
        console.log(this.wind)
        
    }
















    loadModel(){
        const kiteOffset = Cesium.Cartesian3.fromElements(this.offsetForward, this.offsteSideward, this.offsetHeight);

        const kitePosition = new Cesium.CallbackProperty(() => {
            const shipPosition = ship.positionProperty.getValue(this.viewer.clock.currentTime);
            if (this.isKiteEnabled && shipPosition) {
                return Cesium.Cartesian3.add(shipPosition, kiteOffset, new Cesium.Cartesian3());
            }
        
            return Cesium.Cartesian3.ZERO;
        }, false);

        const rotationQuaternion = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(0));
        

      
        this.kiteEntity = this.viewer.entities.add({
          position: kitePosition,
          model: {
            uri: this.modelUrl,
            minimumPixelSize: 1028,
            maximumScale: this.maximumScale,
            scale: this.realScale,
            zIndex: 11,
          },
          orientation: new Cesium.VelocityOrientationProperty(kitePosition),
        });
    }


    reset() {
    
        if (this.kiteEntity) {
          this.viewer.entities.remove(this.kiteEntity);
        }
    
        this.initialize();
      }
        
}