class Panel {
    constructor() {
        this.maxParticles = defaultParticleSystemOptions.maxParticles;
        this.particleHeight = defaultParticleSystemOptions.particleHeight;
        this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
        this.dropRate = defaultParticleSystemOptions.dropRate;
        this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
        this.speedFactor = defaultParticleSystemOptions.speedFactor;
        this.lineWidth = defaultParticleSystemOptions.lineWidth;

        this.globeLayer = defaultLayerOptions.globeLayer;
        this.WMS_URL = defaultLayerOptions.WMS_URL;

        this.date = defaultTimeOptions.date;
        this.time = defaultTimeOptions.time;

        var layerNames = [];
        globeLayers.forEach(function (layer) {
            layerNames.push(layer.name);
        });
        this.layerToShow = layerNames[0];

        var onParticleSystemOptionsChange = function () {
            var event = new CustomEvent('particleSystemOptionsChanged');
            window.dispatchEvent(event);
        }

        const that = this;
        var onLayerOptionsChange = function () {
            for (var i = 0; i < globeLayers.length; i++) {
                if (that.layerToShow == globeLayers[i].name) {
                    that.globeLayer = globeLayers[i];
                    break;
                }
            }
            var layerEvent = new CustomEvent('layerOptionsChanged');
            window.dispatchEvent(layerEvent);
        }

        var onTimeOptionsChange = function() {
            console.log(that.time)
            console.log(that.date.slice(0, -2))
                            //https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/      202402                  /    20240205     /gfs_4_     20240205   _     1800        _003.grb2",
            var changedUrl = "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/" + that.date.slice(0, -2) + "/" + that.date + "/gfs_4_" + that.date + "_" + that.time + "_003.grb2"
            console.log(changedUrl)
            that.WMS_URL = changedUrl 

            var timeEvent = new CustomEvent('timeOptionsChanged');
            window.dispatchEvent(timeEvent);
        }

        window.onload = function () {
            var gui = new dat.GUI({ autoPlace: false });
            gui.add(that, 'maxParticles', 1, 256 * 256, 1).onFinishChange(onParticleSystemOptionsChange);
            gui.add(that, 'particleHeight', 1, 10000, 1).onFinishChange(onParticleSystemOptionsChange);
            gui.add(that, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(onParticleSystemOptionsChange);
            gui.add(that, 'dropRate', 0.0, 0.1).onFinishChange(onParticleSystemOptionsChange);
            gui.add(that, 'dropRateBump', 0, 0.2).onFinishChange(onParticleSystemOptionsChange);
            gui.add(that, 'speedFactor', 0.05, 8).onFinishChange(onParticleSystemOptionsChange);
            gui.add(that, 'lineWidth', 0.01, 16.0).onFinishChange(onParticleSystemOptionsChange);

            gui.add(that, 'layerToShow', layerNames).onFinishChange(onLayerOptionsChange);

            gui.add(that, 'date').onFinishChange(onTimeOptionsChange);
            gui.add(that, 'time').onFinishChange(onTimeOptionsChange);

            var panelContainer = document.getElementsByClassName('cesium-widget').item(0);
            gui.domElement.classList.add('myPanel');
            panelContainer.appendChild(gui.domElement);
        };
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
            time: this.time
        }
    }
}


class OutputPanel {
    constructor() {
        this.dataValue1 = 0;
        this.dataValue2 = 0;
        this.dataValue3 = 0;

        window.onload = function () {
            
            var gui = new dat.GUI({ autoPlace: false });

            // Füge Kontroll-Elemente hinzu
            gui.add(this, 'dataValue1').name('Value 1').listen();
            gui.add(this, 'dataValue2').name('Value 2').listen();
            gui.add(this, 'dataValue3').name('Value 3').listen();

            gui.domElement.classList.add('myOutputPanel');
            document.body.appendChild(gui.domElement);

        }.bind(this);

        // Update die Daten in Echtzeit
        this.startRealTimeUpdates();
    }

    startRealTimeUpdates() {
        // Beispielhafte Aktualisierung der Datenwerte
        setInterval(() => {
            this.dataValue1 = Math.random() * 100;
            this.dataValue2 = Math.random() * 50;
            this.dataValue3 = Math.random() * 200;
        }, 1000); // Aktualisierung alle 1000 ms (1 Sekunde)

    }
}