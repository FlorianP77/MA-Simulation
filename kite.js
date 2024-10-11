class Kite{
    constructor(){


        this.model3dUrl = fileOptions.kiteDirectory

        this.realScale = kiteOptions.realScale;
        this.maximumScale = kiteOptions.maximumScale;
        this.minimumPixelSize = kiteOptions.minimumPixelSize;


        this.deltaUpdateTime = 0;
        

        this.kiteSize = kiteOptions.defaultKiteSize

        this.cA = kiteOptions.cA
        this.gZ = kiteOptions.gZ
        

        this.gamma = Math.atan(1 / this.gZ) * 180 / Math.PI;//ARCTAN(1/this.gZ)*180/PI()

        this.windowAngle = (90 - this.gamma) / 10 * kiteOptions.windWindowPosition

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

        this.kiteEfficiency = 0;

        this.kiteFormula = "formula";
        this.motorFormula = "formula";

        this.co2PerFuel = shipOptions.co2PerFuel
        
    }









    initialize() {
        this.timestampLastUpdate = 0;


        this.fuelConsumptionWithoutKite = 0;
        this.fuelConsumptionWithKite = 0;
        this.fuelSavings = 0;

        this.co2EmissionsWithoutKite = 0;
        this.co2EmissionsWithKite = 0;
        this.co2Savings = 0;
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


    getWindData(lon, lat, lev) {
        
        let lonCoordinateIndex = this.findNearestCoordinateIndex(this.windData.lon.array, lon);
        let latCoordinateIndex = this.findNearestCoordinateIndex(this.windData.lat.array, lat);
        let levCoordinateIndex = this.findNearestCoordinateIndex(this.windData.lev.array, lev);


        let windIndex = (lonCoordinateIndex) + (720 * (latCoordinateIndex));

        this.u = this.windData.U.array[windIndex];
        this.v = this.windData.V.array[windIndex];
  


    }

    
    calculateOutput(){
        this.deltaUpdateTime = (ship.dataPoint[1] / ship.shipSpeed) - this.timestampLastUpdate

        this.getWindData(ship.longitude, ship.latitude, ship.level)

        this.windSpeed = Math.sqrt(this.u ** 2 + this.v ** 2);

        let dirReal = Math.atan2(-this.u, -this.v)   //0 = Osten; 90:Norden
        this.windDirection = ((2.5*Math.PI - dirReal) % 2*Math.PI) * 180 / Math.PI;   //0 = Norden; 90:Osten

 
        this.differenceDirection = Math.abs(this.windDirection - ship.shipDirection)

        if (this.differenceDirection > 180){
            this.differenceDirection = 360 - this.differenceDirection
        }

        



        this.shipWindSpeed = (this.windSpeed**2 + ship.shipSpeed**2 - 2 * this.windSpeed * ship.shipSpeed * Math.cos(this.differenceDirection / 180 * Math.PI))**0.5


        

        this.shipWindDirection = Math.acos((this.shipWindSpeed**2 + ship.shipSpeed**2 - this.windSpeed**2) / (2 * this.shipWindSpeed * ship.shipSpeed)) * 180 / Math.PI
        console.log(this.shipWindDirection)


        

        if (this.shipWindDirection > (90 + 53)  && this.shipWindSpeed != 0){
            
            this.active = true
            this.flymode = "looping"


            
            let flowVelocity = (this.shipWindSpeed * Math.sin((90 - this.windowAngle) * Math.PI / 180)) / Math.sin((this.gamma) * Math.PI / 180);//(this.windSpeed*SIN((90-this.averageWindowAngle)*PI()/180))/(SIN((gamma)*PI()/180))

            let allKiteForce = 1.224 / 2 * (flowVelocity**2) * this.kiteSize * this.cA

            this.kiteForce = allKiteForce * Math.cos((180 - this.shipWindDirection) / 180 * Math.PI) * Math.cos(this.heightAngleLoop / 180 * Math.PI)
        }

        else if ((this.shipWindDirection + this.windowAngle) > 90 && this.shipWindSpeed != 0){
            
            this.active = true
            this.flymode = "sinus"


            let flowVelocity = (this.shipWindSpeed * Math.sin((90 - this.windowAngle) * Math.PI / 180)) / Math.sin(this.gamma * Math.PI / 180);//(this.windSpeed*SIN((90-this.averageWindowAngle)*PI()/180))/(SIN((gamma)*PI()/180))

            let allKiteForce = 1.224 / 2 * (flowVelocity**2) * this.kiteSize * this.cA

            this.kiteForce = allKiteForce * Math.cos((180 - (this.shipWindDirection + this.windowAngle)) / 180 * Math.PI) * Math.cos(this.heightAngleSinus / 180 * Math.PI)

        }

        else{
            this.active = false
            this.flymode = "nothing"
            this.kiteForce = 0
        }

        
        
        
        // P = (Treibstoffverbrauch * Energiedichte * Wirkungsgrad)
        // F = P / Geschwindigkeit des Schiffs
        let fuelConsumptionInKgPerSecond = (ship.shipType.fuelConsumption[shipSpeeds.indexOf(ship.shipSpeedKnots)] / 86400) * 1000;

        this.motorForceWithoutKite = (fuelConsumptionInKgPerSecond * this.fuelEnergyDensity * this.motorEfficiency) / 3600 / ship.shipSpeed; //****** */

        this.motorForceWithKite = this.motorForceWithoutKite - this.kiteForce;


        
    

        this.fuelConsumptionWithoutKite += fuelConsumptionInKgPerSecond * this.deltaUpdateTime;

        this.fuelSavings += fuelConsumptionInKgPerSecond * (this.kiteForce / this.motorForceWithoutKite) * this.deltaUpdateTime

        this.fuelConsumptionWithKite = this.fuelConsumptionWithoutKite - this.fuelSavings

        
        this.kiteEfficiency = (this.fuelConsumptionWithoutKite === 0) 
        ? 0 
        : 100 - (this.fuelConsumptionWithKite / this.fuelConsumptionWithoutKite * 100);



        this.co2EmissionsWithoutKite = this.fuelConsumptionWithoutKite * this.co2PerFuel

        this.co2Savings = this.fuelSavings * this.co2PerFuel

        this.co2EmissionsWithKite = this.fuelConsumptionWithKite * this.co2PerFuel

        this.timestampLastUpdate = ship.dataPoint[1] / ship.shipSpeed

        
        
        
        
        
        
        /*
        Ein Kite kann effektiv genutzt werden, wenn der Wind aus einem Winkel von etwa 45° bis 135° relativ zur Fahrtrichtung des Schiffes kommt.
        https://www.oceanergy.com/technology-kite-propulsion-systems-ships/
        https://www.cargo-partner.com/de/trendletter/issue-10/segel-und-kites-unterstuetzen-frachtschiffe
        */
        
        
        
        
        
        
        

        /*
        Asien-Europa-Route:
        Shanghai, China (122.056762, 30.616986)
        Rotterdam, Niederlande (4.080639, 51.982069)

        Transpazifische Route:
        Shanghai, China (122.056762, 30.616986)
        Los Angeles, USA (-118.248328, 33.709820)

        Transatlantische Route:
        Rotterdam, Niederlande (4.080639, 51.982069)
        New York, USA (-74.042676, 40.602249)

        Indien-Europa-Route:
        Mumbai, Indien (72.926917, 18.941615)
        Rotterdam, Niederlande (4.080639, 51.982069)

        Südamerikanische Route:
        Santos, Brasilien (-46.306774, -23.992960)
        Rotterdam, Niederlande (4.080639, 51.982069)

        https://worldoceanreview.com/de/wor-1/transport/der-weltseeverkehr/
        https://geohilfe.de/welthandel-seeweg-visualisiert/
        */


        
        
    }
        
}