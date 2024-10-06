class Panel {
  constructor() {
    this.startingPoint = ports[defaultRouteOptions.startingPointIndex];
    this.destination = ports[defaultRouteOptions.destinationIndex];

    this.route = this.startingPoint + this.destination;

    this.date = shipOptions.startTime;
    this.forecastHours = defaultTimeOptions.forecastHours;


    this.windUpdateStep = defaultTimeOptions.windUpdateStep;

    this.windFileDate = this.date.slice(0, 4) + this.date.slice(5, 7) + this.date.slice(8, 10);
    this.windFileTime = String( Math.floor( parseInt(this.date.slice(11, 13), 10) / this.windUpdateStep ) * this.windUpdateStep ).padStart(2, "0") + "00";

    this.maxParticles = defaultParticleSystemOptions.maxParticles;
    this.particleHeight = defaultParticleSystemOptions.particleHeight;
    this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
    this.dropRate = defaultParticleSystemOptions.dropRate;
    this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
    this.speedFactor = defaultParticleSystemOptions.speedFactor;
    this.lineWidth = defaultParticleSystemOptions.lineWidth;

    this.WMS_URL = "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/" + this.windFileDate.slice(0, 6) + "/" + this.windFileDate + "/gfs_4_" + this.windFileDate + "_" + this.windFileTime + "_" + this.forecastHours + ".grb2";

    this.globeLayer = globeLayers[defaultLayerOptions.globeLayer];
    this.layerToShow = layerNames[defaultLayerOptions.globeLayer];

    this.shipType = shipTypes[shipOptions.defaultTypeIndex];
    this.panelShipTypeName = shipTypeNames[shipOptions.defaultTypeIndex];
    this.panelShipSpeedKnots = shipSpeeds[shipOptions.defaultSpeedIndex];
    this.shipSpeedKnots = this.panelShipSpeedKnots
    this.shipSpeed = parseInt(this.panelShipSpeedKnots) * 0.5144;



    document.addEventListener("DOMContentLoaded", () => {
      this.initGUI(layerNames, shipTypeNames);
    });
  }

  initGUI(layerNames, shipTypeNames) {
    const gui = new dat.GUI({ autoPlace: false });
    gui.add(this, "maxParticles", 1, 256 * 256, 1).name("Max Particles").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "particleHeight", 1, 10000, 1).name("Particle Height").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "fadeOpacity", 0.9, 0.999, 0.001).name("Fade Opacity").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "dropRate", 0.0, 0.1).name("Drop Rate").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "dropRateBump", 0, 0.2).name("Drop Rate Bump").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "speedFactor", 1, 10).name("Speed Factor").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "lineWidth", 1, 10).name("Line Width").onFinishChange(this.onParticleSystemOptionsChange.bind(this));
    gui.add(this, "layerToShow", layerNames).name("Layer to Show").onFinishChange(this.onLayerOptionsChange.bind(this));
    gui.add(this, "date").name("Date").onFinishChange(this.actualizeTime.bind(this));
    gui.add(this, "forecastHours").name("Forecast Hours").onFinishChange(this.actualizeTime.bind(this));
    gui.add(this, "startingPoint", ports).name("Starting Point").onFinishChange(this.onRouteOptionsChange.bind(this));
    gui.add(this, "destination", ports).name("Destination").onFinishChange(this.onRouteOptionsChange.bind(this));
    gui.add(this, "panelShipTypeName", shipTypeNames).name("Ship Type").onFinishChange(this.onShipOptionsChange.bind(this));
    gui.add(this, "panelShipSpeedKnots", shipSpeeds).name("Ship Speed (knots)").onFinishChange(this.onShipOptionsChange.bind(this));
    gui.add(kite, "kiteSize").name("Kite Size (m²)").onFinishChange(this.onShipOptionsChange.bind(this));


    const panelContainer = document.getElementsByClassName("cesium-widget").item(0);


    gui.domElement.classList.add("myPanel");
    panelContainer.appendChild(gui.domElement);
  }

  actualizeTime() {
    if (windFileDates.includes(this.date.slice(0, 4) + this.date.slice(5, 7) + this.date.slice(8, 10))){
      window.dispatchEvent(new CustomEvent("reset"));
    }

    else{
      console.log("Dieses Datum ist nicht verfügbar")
    }
  }

  onParticleSystemOptionsChange() {

    window.dispatchEvent(new CustomEvent("particleSystemOptionsChanged"));
  }

  onLayerOptionsChange() {
    this.globeLayer = globeLayers.find(
      (layer) => layer.name === this.layerToShow
    );

    window.dispatchEvent(new CustomEvent("layerOptionsChanged"));
  }

  onTimeOptionsChange() {
    if (windFileDates.includes(this.windFileDate) && windFileTimes.includes(this.windFileTime) && forecastHours.includes(this.forecastHours)) {
      this.WMS_URL = "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/" + this.windFileDate.slice(0, 4) + "/" + this.windFileDate + "/gfs_4_" + this.windFileDate + "_" + this.windFileTime + "_" + this.forecastHours + ".grb2"; wind3D.dataFile = this.windFileDate + "_" + this.windFileTime + "_" + this.forecastHours + ".json";
      console.log(this.WMS_URL);

      window.dispatchEvent(new CustomEvent("timeOptionsChanged"));
    } 
    else {
      console.log("Winddaten werden nicht mehr aktualisiert!");
    }
  }

  onRouteOptionsChange() {
    if (this.startingPoint + this.destination in routes) {
      this.route = this.startingPoint + this.destination;
      wind3D.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(
        shipOptions.startTime
      );

      window.dispatchEvent(new CustomEvent("reset"));
    } 
    else {
      console.log("Route gibt es nicht");
    }
  }

  onShipOptionsChange() {

    const panelShipType = shipTypes.find((ship) => ship.name === this.panelShipTypeName)

    console.log(panelShipType.fuelConsumption.length)
    if (shipSpeeds.indexOf(this.panelShipSpeedKnots) <= panelShipType.fuelConsumption.length - 1) {

      this.shipType = panelShipType
      this.shipSpeedKnots = this.panelShipSpeedKnots
      this.shipSpeed = parseInt(this.panelShipSpeedKnots) * 0.5144;

      window.dispatchEvent(new CustomEvent("reset"));
    } 
    else {
      console.log("Diese Geschwindigkeit ist für diesen Schiffstyp nicht vorhanden!");
    }
  }

  checkWindFile(currentTime) {
    if (parseInt(currentTime.slice(11, 13), 10) - parseInt(this.windFileTime.slice(0, 2), 10) >= this.windUpdateStep / 2 || currentTime.slice(0, 4) + currentTime.slice(5, 7) + currentTime.slice(8, 10) != this.windFileDate) {
      this.windFileDate = currentTime.slice(0, 4) + currentTime.slice(5, 7) + currentTime.slice(8, 10);

      const roundedHours = Math.round(parseInt(currentTime.slice(11, 13), 10) / this.windUpdateStep) * this.windUpdateStep;

      this.windFileTime = String(roundedHours).padStart(2, "0") + "00";
      return true;
    } 
    
    else {
      return false;
    }
  }

  getUserInput() {
    // make sure maxParticles is exactly the square of particlesTextureSize
    var particlesTextureSize = Math.ceil(Math.sqrt(this.maxParticles));
    this.maxParticles = particlesTextureSize * particlesTextureSize;

    return {
      particlesTextureSize: particlesTextureSize,
      maxParticles: this.maxParticles,
      particleHeight: this.particleHeight,
      fadeOpacity: this.fadeOpacity,
      dropRate: this.dropRate,
      dropRateBump: this.dropRateBump,
      speedFactor: this.speedFactor,
      lineWidth: this.lineWidth,
      globeLayer: this.globeLayer,
      WMS_URL: this.WMS_URL,
      date: this.date,
      timeStep: this.forecastHours,
      startingPoint: this.startingPoint,
      destination: this.destination,
    };
  }
}


class OutputPanel {
    constructor() {

        wind3D.viewer = wind3D.viewer;

        document.addEventListener('DOMContentLoaded', () => {
            this.initGUI();
        });

        this.update()
    }


    initGUI() {
      const gui = new dat.GUI({ autoPlace: false, width: 400 });

      gui.add(kite, "windDirection").name("Wind Direction (deg)").listen(); // degrees
      gui.add(ship, "shipDirection").name("Ship Direction (deg)").listen(); // degrees
      gui.add(kite, "differenceDirection").name("Angular difference (deg)").listen(); // degrees

      gui.add(kite, "windSpeed").name("Wind Speed (m/s)").listen(); // m/s
      gui.add(ship, "shipSpeed").name("Ship Speed (m/s)").listen(); // m/s
      gui.add(kite, "shipWindSpeed").name("Wind Speed on the ship (m/s)").listen(); // m/s

      gui.add(kite, "motorForceWithoutKite").name("Motor Force without Kite (N)").listen(); // N
      gui.add(kite, "motorForceWithKite").name("Motor Force with Kite (N)").listen(); // N
      gui.add(kite, "kiteForce").name("Kite Force (N)").listen(); // N
      gui.add(kite, "kiteFormula").name("Kite Formula").listen();
      gui.add(kite, "motorFormula").name("Motor Formula").listen();
      gui.add(kite, "active").name("is Kite active?").listen(); // boolean

      gui.add(kite, "fuelConsumptionWithoutKite").name("Consumption without Kite (kg)").listen(); // kg
      gui.add(kite, "fuelConsumptionWithKite").name("Consumption with Kite (kg)").listen(); // kg
      gui.add(kite, "fuelSavings").name("Fuel Savings (kg)").listen(); // kg


      gui.add(kite, "co2EmissionsWithoutKite").name("CO2 Emissions without Kite (kg)").listen(); // kg
      gui.add(kite, "co2EmissionsWithKite").name("CO2 Emissions with Kite (kg)").listen(); // kg
      gui.add(kite, "co2Savings").name("CO2 Savings (kg)").listen(); // kg
    

      gui.add(panel, "windFileDate").name("Wind File Date").listen();
      gui.add(panel, "windFileTime").name("Wind File Time").listen();

      var panelContainer = document.getElementsByClassName("cesium-widget").item(0);
      gui.domElement.classList.add("myOutputPanel");
      panelContainer.appendChild(gui.domElement);
    };



    update() {

        
        //wind3D.viewer.clock.onTick.addEventListener(() => {
        setInterval(() => {
            if (ship.active){
                ship.updateDatapoint()

                kite.calculateOutput()
            }



            if (panel.checkWindFile(Cesium.JulianDate.toIso8601(wind3D.viewer.clock.currentTime))) {
              panel.onTimeOptionsChange();
            };
        }, shipOptions.checkInterval)
        //});

    }
}