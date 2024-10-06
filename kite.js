class Kite{
    constructor(){


        this.model3dUrl = fileOptions.kiteDirectory

        this.realScale = kiteOptions.realScale;
        this.maximumScale = kiteOptions.maximumScale;
        this.minimumPixelSize = kiteOptions.minimumPixelSize;


        this.deltaUpdateTime = 0;
        

        this.kiteSize = kiteOptions.defaultKiteSize

        this.kiteAngle = kiteOptions.kiteAngle
        this.cA = kiteOptions.cA
        this.gZ = kiteOptions.gZ

        
        this.u = 0;
        this.v = 0;

        this.windDirection = 0;
        this.windSpeed = 0;
        this.differenceDirection = 0;
        this.shipWindDirection



        this.active = false
        this.shipWindSpeed = 0;


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

        let dirRealRad = Math.atan2(this.u, this.v)   //0 = Osten; 90:Norden
        let dirReal = ((dirRealRad * 180) / Math.PI + 360) % 360;
        this.windDirection = (360 - ((dirReal + 90) % 360)) % 360;   //0 = Norden; 90:Osten

 
        this.differenceDirection = Math.abs(this.windDirection - ship.shipDirection)

        if (this.differenceDirection > 180){
            this.differenceDirection = 360 - this.differenceDirection
        }

        

        ship.sp


        this.shipWindSpeed = (this.windSpeed**2 + ship.shipSpeed**2 - 2 * this.windSpeed * ship.shipSpeed * Math.cos(this.differenceDirection))**0.5

        this.shipWindDirection = this.differenceDirection
        //this.shipWindDirection = Math.acos(this.windSpeed * Math.cos(this.differenceDirection) + ship.shipSpeed / this.shipWindSpeed)


        

        if (this.shipWindDirection < 90  && this.shipWindSpeed > 0){


            let gamma = Math.atan(1 / this.gZ) * (180 / Math.PI);//ARCTAN(1/this.gZ)*180/PI()
            let flowVelocity = (this.shipWindSpeed * Math.sin((90 - this.kiteAngle) * Math.PI / 180)) / Math.sin(gamma * Math.PI / 180);//(this.windSpeed*SIN((90-this.kiteAngle)*PI()/180))/(SIN((gamma)*PI()/180))

            let allKiteForce = 1.224 / 2 * (flowVelocity**2) * this.kiteSize * this.cA

            this.active = true
            this.kiteForce = allKiteForce * Math.cos(this.shipWindDirection * Math.PI / 180)
        }

        else{
            this.active = false
            this.kiteForce = 0
        }

        
        
        
        // P = (Treibstoffverbrauch * Energiedichte * Wirkungsgrad)
        // F = P / Geschwindigkeit des Schiffs
        let fuelConsumptionInKgPerSecond = (ship.shipType.fuelConsumption[shipSpeeds.indexOf(ship.shipSpeedKnots)] / 86400) * 1000;

        this.motorForceWithoutKite = (fuelConsumptionInKgPerSecond * this.fuelEnergyDensity * this.motorEfficiency) / ship.shipSpeed; 

        this.motorForceWithKite = this.motorForceWithoutKite - this.kiteForce;


        
    

        this.fuelConsumptionWithoutKite += fuelConsumptionInKgPerSecond * this.deltaUpdateTime;

        this.fuelSavings += fuelConsumptionInKgPerSecond * (this.kiteForce / this.motorForceWithoutKite) * this.deltaUpdateTime

        this.fuelConsumptionWithKite = this.fuelConsumptionWithoutKite - this.fuelSavings



        this.co2EmissionsWithoutKite = this.fuelConsumptionWithoutKite * this.co2PerFuel
        this.co2Savings = this.fuelSavings * this.co2PerFuel
        this.co2EmissionsWithKite = this.fuelConsumptionWithKite * this.co2PerFuel

        this.timestampLastUpdate = ship.dataPoint[1] / ship.shipSpeed

        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        //https://www.mimikama.org/co2-ausstoss-von-containerschiffen/
        // 26,23 Newton pro Tonne
        //https://casualnavigation.com/cargo-ship-speed-comparison-how-fast-do-they-go/




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

        /*

        https://www.vesselfinder.com/
        https://www.rechnerabisz.de/hobby-und-freizeit/wassersport/bootsportrechner/
        https://hansa-online.de/2011/06/schiffstechnik/68338/stroemungsmechanische-grundlagen-zum-widerstand-von-schiffen/
        
        */

        /*
        Ein Kite kann effektiv genutzt werden, wenn der Wind aus einem Winkel von etwa 45° bis 135° relativ zur Fahrtrichtung des Schiffes kommt.
        https://www.oceanergy.com/technology-kite-propulsion-systems-ships/
        https://www.cargo-partner.com/de/trendletter/issue-10/segel-und-kites-unterstuetzen-frachtschiffe
        */
        
    }
        
}