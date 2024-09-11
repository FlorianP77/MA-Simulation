class Panel {
    constructor() {
        this.route = defaultRouteOptions.route

        
        this.date = shipOptions.startTime;
        this.timeStep = defaultTimeOptions.timeStep;

        this.windUpdateStep = defaultTimeOptions.windUpdateStep

        this.windFileDate = this.date.slice(0, 4) + this.date.slice(5, 7) + this.date.slice(8, 10)
        this.windFileTime = String((Math.floor(parseInt(this.date.slice(11, 13), 10) / this.windUpdateStep) * this.windUpdateStep)).padStart(2, '0') + '00'



        this.maxParticles = defaultParticleSystemOptions.maxParticles;
        this.particleHeight = defaultParticleSystemOptions.particleHeight;
        this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
        this.dropRate = defaultParticleSystemOptions.dropRate;
        this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
        this.speedFactor = defaultParticleSystemOptions.speedFactor;
        this.lineWidth = defaultParticleSystemOptions.lineWidth;

        this.globeLayer = defaultLayerOptions.globeLayer
        this.WMS_URL = "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/" + this.windFileDate.slice(0, 6) + "/" + this.windFileDate + "/gfs_4_" + this.windFileDate + "_" + this.windFileTime + "_" + this.timeStep + ".grb2"

        const layerNames = globeLayers.map(layer => layer.name);

        this.layerToShow = layerNames[0]


        this.startingPoint = defaultRouteOptions.startingPoint
        this.destination = defaultRouteOptions.destination



        


        document.addEventListener('DOMContentLoaded', () => {
            this.initGUI(layerNames);
        });
            
    }

    initGUI(layerNames) {
        const gui = new dat.GUI({ autoPlace: false });
        gui.add(this, 'maxParticles', 1, 256 * 256, 1).onFinishChange(this.onParticleSystemOptionsChange.bind(this));
        gui.add(this, 'particleHeight', 1, 10000, 1).onFinishChange(this.onParticleSystemOptionsChange.bind(this));
        gui.add(this, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(this.onParticleSystemOptionsChange.bind(this));
        gui.add(this, 'dropRate', 0.0, 0.1).onFinishChange(this.onParticleSystemOptionsChange.bind(this));
        gui.add(this, 'dropRateBump', 0, 0.2).onFinishChange(this.onParticleSystemOptionsChange.bind(this));
        gui.add(this, 'speedFactor', 1, 10).onFinishChange(this.onParticleSystemOptionsChange.bind(this));
        gui.add(this, 'lineWidth', 1, 10).onFinishChange(this.onParticleSystemOptionsChange.bind(this));

        gui.add(this, 'layerToShow', layerNames).onFinishChange(this.onLayerOptionsChange.bind(this));

        gui.add(this, 'date').onFinishChange(this.actualizeTime.bind(this));
        gui.add(this, 'timeStep').onFinishChange(this.onTimeOptionsChange.bind(this));

        gui.add(this, 'startingPoint').onFinishChange(this.onRouteOptionsChange.bind(this));
        gui.add(this, 'destination').onFinishChange(this.onRouteOptionsChange.bind(this));

        gui.add(this, 'route', routes).onFinishChange(this.onRouteOptionsChange.bind(this));

        const panelContainer = document.getElementsByClassName('cesium-widget').item(0);
        gui.domElement.classList.add('myPanel');
        panelContainer.appendChild(gui.domElement);
    };

    actualizeTime() {
        wind3D.viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(this.date)
    }


    onParticleSystemOptionsChange() {
        var event = new CustomEvent('particleSystemOptionsChanged');
        window.dispatchEvent(event);
    }

    onLayerOptionsChange() {
        this.globeLayer = globeLayers.find(layer => layer.name === this.layerToShow);
        var layerEvent = new CustomEvent('layerOptionsChanged');
        window.dispatchEvent(layerEvent);
    }

    onTimeOptionsChange() {

        this.WMS_URL = "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/" + this.windFileDate.slice(0, 4) + "/" + this.windFileDate + "/gfs_4_" + this.windFileDate + "_" + this.windFileTime + "_" + this.timeStep + ".grb2"
        wind3D.dataFile = this.windFileDate + '_' + this.windFileTime + '_' + this.timeStep + '.json'


        var timeEvent = new CustomEvent('timeOptionsChanged');
        window.dispatchEvent(timeEvent);
    }

    onRouteOptionsChange(){
        var routeEvent = new CustomEvent('routeOptionsChanged');
        window.dispatchEvent(routeEvent);
    }






    checkWindFile(currentTime) {


        if (parseInt(currentTime.slice(11, 13), 10) - parseInt(this.windFileTime.slice(0, 2), 10) >= this.windUpdateStep/2 || currentTime.slice(0, 4) + currentTime.slice(5, 7) + currentTime.slice(8, 10) != this.windFileDate){
            this.windFileDate = currentTime.slice(0, 4) + currentTime.slice(5, 7) + currentTime.slice(8, 10)
            const roundedHours = (Math.round(parseInt(currentTime.slice(11, 13), 10) / this.windUpdateStep) * this.windUpdateStep)
            this.windFileTime = String(roundedHours).padStart(2, '0') + '00'
            return true
        }

        else{
            return false
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
            timeStep: this.timeStep,
            startingPoint: this.startingPoint,
            destination: this.destination
        }
    }
}


class OutputPanel {
    constructor() {

        this.viewer = wind3D.viewer;

        document.addEventListener('DOMContentLoaded', () => {
            this.initGUI();
        });

        this.startRealTimeUpdates()
    }


    initGUI() {
        const gui = new dat.GUI({ autoPlace: false, width: 400});

        gui.add(kite, 'fuelConsumptionWithoutKite')./*name.*/listen();
        gui.add(kite, 'fuelConsumptionWithKite').listen();
        gui.add(kite, 'fuelSavings').listen();
        gui.add(ship, 'currentSpeed').listen();
        gui.add(kite, 'isKiteEnabled').listen();
        gui.add(kite, 'forceProducedByKite').listen();
        gui.add(kite, 'forceProducedByMotor').listen();
        gui.add(kite, 'currentWindDirection').listen();
        gui.add(panel, 'windFileDate').listen();
        gui.add(panel, 'windFileTime').listen();

        var panelContainer = document.getElementsByClassName('cesium-widget').item(0);
        gui.domElement.classList.add('myOutputPanel');
        panelContainer.appendChild(gui.domElement);
    };



    startRealTimeUpdates() {

        let oldTime = -1

        setInterval(() => {
            const elapsedTime = Cesium.JulianDate.secondsDifference(ship.viewer.clock.currentTime, ship.start);

            

            if (elapsedTime > oldTime) {
                
                oldTime += ship.updateInterval

                if (ship.active){
                    ship.positionTracker()

                    kite.outputCalculation(ship.longitude, ship.latitude, ship.level, ship.direction)
                }

                const currentTime = Cesium.JulianDate.toIso8601(this.viewer.clock.currentTime)
                if(panel.checkWindFile(currentTime)){
                    panel.onTimeOptionsChange()

                };
            }
        }, shipOptions.checkInterval * ship.viewer.clock.multiplier);

    }
}