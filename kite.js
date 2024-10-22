class Kite{
    constructor(){


        this.model3dUrl = fileOptions.kiteDirectory

        this.realScale = kiteOptions.realScale;
        this.maximumScale = kiteOptions.maximumScale;
        this.minimumPixelSize = kiteOptions.minimumPixelSize;


        this.deltaUpdateTime = 0;
        this.deltaTime = 0;

        

        this.kiteSize = kiteOptions.defaultKiteSize

        this.cA = kiteOptions.cA
        this.gZ = kiteOptions.gZ
        

        this.gamma = Math.atan(1 / this.gZ) * 180 / Math.PI;

        this.windowAngleLoop = (90 - this.gamma) / 10 * kiteOptions.windWindowPositionLoop
        this.windowAngleSinus = (90 - this.gamma) / 10 * kiteOptions.windWindowPositionSinus

        this.heightAngleLoop = kiteOptions.kiteHeightAngleLoop
        this.heightAngleSinus = kiteOptions.kiteHeightAngleSinus

        
        this.u = 0;
        this.v = 0;

        this.windDirection = 0;
        this.windSpeed = 0;
        this.differenceDirection = 0;
        



        this.active = false
        this.flymode = "nothing"


        this.shipWindSpeed = 0;
        this.shipWindDirection = 0;


        this.fuelEnergyDensity = shipOptions.fuelEnergyDensity;
        this.motorEfficiency = shipOptions.motorEfficiency;
        

        this.motorForceWithoutKite = 0;
        this.motorForceWithKite = 0;
        this.kiteForce = 0;

        this.fuelConsumptionWithoutKite = 0;
        this.fuelConsumptionWithKite = 0;
        this.fuelSavings = 0;

        this.co2EmissionsWithoutKite = 0;
        this.co2EmissionsWithKite = 0;
        this.co2Savings = 0;

        this.currentKiteEfficiency = 0;
        this.overallKiteEfficiency = 0;

        this.kiteFormula = "formula";
        this.motorFormula = "formula";

        this.co2PerFuel = shipOptions.co2PerFuel
        
        this.fuelConsumptionInKgPerSecond = 0;
    }









    initialize() {
        this.timestampLastUpdate = 0;


        this.fuelConsumptionWithoutKite = 0;
        this.fuelConsumptionWithKite = 0;
        this.fuelSavings = 0;

        this.co2EmissionsWithoutKite = 0;
        this.co2EmissionsWithKite = 0;
        this.co2Savings = 0;

        this.previousTime = wind3D.viewer.clock.startTime

        this.fuelConsumptionInKgPerSecond = (panel.shipType.fuelConsumption[shipSpeeds.indexOf(panel.shipSpeedKnots)] / 86400) * 1000;
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


    getWindData(windData, lon, lat, lev) {
        
        let lonCoordinateIndex = this.findNearestCoordinateIndex(windData.lon.array, lon);
        let latCoordinateIndex = this.findNearestCoordinateIndex(windData.lat.array, lat);
        let levCoordinateIndex = this.findNearestCoordinateIndex(windData.lev.array, lev);


        let windIndex = (lonCoordinateIndex) + (720 * (latCoordinateIndex));

        this.u = windData.U.array[windIndex];
        this.v = windData.V.array[windIndex];
  


    }

    
    calculateOutput(){

        this.getWindData(wind3D.windData, ship.longitude, ship.latitude, ship.level)

        this.windSpeed = Math.sqrt(this.u ** 2 + this.v ** 2);

        let dirReal = Math.atan2(-this.u, -this.v)   //0 = Osten; 90:Norden
        this.windDirection = ((2.5*Math.PI - dirReal) % 2*Math.PI) * 180 / Math.PI;   //0 = Norden; 90:Osten

 
        this.differenceDirection = Math.abs(this.windDirection - ship.shipDirection)

        if (this.differenceDirection > 180){
            this.differenceDirection = 360 - this.differenceDirection
        }

        if(ship.shipSpeed != 0) {

            this.shipWindSpeed = (this.windSpeed**2 + ship.shipSpeed**2 - 2 * this.windSpeed * ship.shipSpeed * Math.cos(this.differenceDirection / 180 * Math.PI))**0.5

            this.shipWindDirection = Math.acos((this.shipWindSpeed**2 + ship.shipSpeed**2 - this.windSpeed**2) / (2 * this.shipWindSpeed * ship.shipSpeed)) * 180 / Math.PI
        }

        else {
            this.shipWindSpeed = this.windSpeed

            this.shipWindDirection = this.differenceDirection
        }
        

        

        if (this.shipWindDirection > (90 + 53)  && this.shipWindSpeed != 0){
            
            this.active = true
            this.flymode = "figure-eight flight curve"


            
            let flowVelocity = (this.shipWindSpeed * Math.sin((90 - this.windowAngleLoop) * Math.PI / 180)) / Math.sin((this.gamma) * Math.PI / 180);

            let allKiteForce = 1.224 / 2 * (flowVelocity**2) * this.kiteSize * this.cA

            this.kiteForce = allKiteForce * Math.cos((180 - this.shipWindDirection) / 180 * Math.PI) * Math.cos(this.heightAngleLoop / 180 * Math.PI)
        }

        else if ((this.shipWindDirection + this.windowAngleSinus) > 90 && this.shipWindSpeed != 0){
            
            this.active = true
            this.flymode = "sine wave flight path"


            let flowVelocity = (this.shipWindSpeed * Math.sin((90 - this.windowAngleSinus) * Math.PI / 180)) / Math.sin(this.gamma * Math.PI / 180);

            let allKiteForce = 1.224 / 2 * (flowVelocity**2) * this.kiteSize * this.cA

            this.kiteForce = allKiteForce * Math.cos((180 - (this.shipWindDirection + this.windowAngleSinus)) / 180 * Math.PI) * Math.cos(this.heightAngleSinus / 180 * Math.PI)

        }

        else{
            this.active = false
            this.flymode = "not flying"
            this.kiteForce = 0
        }
        

        

        this.motorForceWithoutKite = (this.fuelConsumptionInKgPerSecond * this.fuelEnergyDensity * this.motorEfficiency) / ship.shipSpeed; 


        if ((this.motorForceWithoutKite - this.kiteForce) > 0){
            this.motorForceWithKite = this.motorForceWithoutKite - this.kiteForce
        }

        else {
            this.motorForceWithKite = 0
            this.kiteForce = this.motorForceWithoutKite
        }

        
        this.currentKiteEfficiency = (this.kiteForce === 0) 
        ? 0 
        : 100 - ((this.motorForceWithKite / this.motorForceWithoutKite) * 100);


        
        this.deltaUpdateTime = Cesium.JulianDate.secondsDifference(wind3D.viewer.clock.currentTime, this.previousTime)
        this.previousTime = Cesium.JulianDate.clone(wind3D.viewer.clock.currentTime)
        this.deltaTime = Cesium.JulianDate.secondsDifference(wind3D.viewer.clock.currentTime, wind3D.viewer.clock.startTime)

    

        this.fuelConsumptionWithoutKite = this.fuelConsumptionInKgPerSecond * this.deltaTime;

        this.fuelSavings += ((this.kiteForce * ship.shipSpeed) / (this.fuelEnergyDensity * this.motorEfficiency)) * this.deltaUpdateTime

        this.fuelConsumptionWithKite = this.fuelConsumptionWithoutKite - this.fuelSavings



        this.co2EmissionsWithoutKite = this.fuelConsumptionWithoutKite * this.co2PerFuel

        this.co2Savings = this.fuelSavings * this.co2PerFuel

        this.co2EmissionsWithKite = this.fuelConsumptionWithKite * this.co2PerFuel
        
                
        this.overallKiteEfficiency = (this.co2EmissionsWithoutKite === 0) 
        ? 0 
        : 100 - ((this.co2EmissionsWithKite / this.co2EmissionsWithoutKite) * 100);

        
    }
        
}