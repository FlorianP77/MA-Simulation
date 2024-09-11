class Wind3D {
    constructor(panel) {
        var options = {
            // use Sentinel-2 instead of the default Bing Maps because Bing Maps sessions is limited
            imageryProvider: new Cesium.IonImageryProvider({ assetId: 3954 }),
            baseLayerPicker: false,
            geocoder: false,
            infoBox: false,
            selectionIndicator: false,
            fullscreenElement: 'cesiumContainer',
            // useBrowserRecommendedResolution can be set to false to improve the render quality
            useBrowserRecommendedResolution: false,
            
            scene3DOnly: true,

            homeButton: false,
            navigationHelpButton: false,
            sceneModePicker: false,
        }

        this.viewer = new Cesium.Viewer('cesiumContainer', options);
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;

        this.panel = panel;

        this.dataFile = panel.windFileDate + '_' + panel.windFileTime + '_' + panel.timeStep + '.json'


        var creditContainer = document.getElementsByClassName('cesium-credit-textContainer')[0];
        creditContainer.style.display = 'none';

        var cesiumCredit = document.getElementsByClassName('cesium-credit-logoContainer')[0];
        cesiumCredit.style.display = 'none';


        this.viewerParameters = {
            lonRange: new Cesium.Cartesian2(),
            latRange: new Cesium.Cartesian2(),
            pixelSize: 0.0
        };
        // use a smaller earth radius to make sure distance to camera > 0
        this.globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0);
        this.updateViewerParameters();

        this.initializeData();

        this.setGlobeLayer(this.panel.getUserInput());

        this.setupEventListeners();
    }

    initializeData() {

        DataProcess.loadData(fileOptions.dataDirectory + this.dataFile).then(
            (data) => {
                this.particleSystem = new ParticleSystem(this.scene.context, data, this.panel.getUserInput(), this.viewerParameters);
                this.addPrimitives();
            }
        );
    }

    clearParticleSystem() {

        this.particleSystem.particlesComputing.destroyParticlesTextures();
    
        Object.keys(this.particleSystem.particlesComputing.windTextures).forEach((key) => {
            this.particleSystem.particlesComputing.windTextures[key].destroy();
        });

        Object.keys(this.particleSystem.particlesRendering.framebuffers).forEach((key) => {
            this.particleSystem.particlesRendering.framebuffers[key].destroy();
        });
        
        this.scene.primitives.remove(this.particleSystem.particlesComputing.primitives.calculateSpeed);
        this.scene.primitives.remove(this.particleSystem.particlesComputing.primitives.updatePosition);
        this.scene.primitives.remove(this.particleSystem.particlesComputing.primitives.postProcessingPosition);
        this.scene.primitives.remove(this.particleSystem.particlesRendering.primitives.segments);
        this.scene.primitives.remove(this.particleSystem.particlesRendering.primitives.trails);
        this.scene.primitives.remove(this.particleSystem.particlesRendering.primitives.screen);

        // Setze das Partikelsystem-Objekt auf null, um es freizugeben
        this.particleSystem = null;
    }

    addPrimitives() {
        // the order of primitives.add() should respect the dependency of primitives
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.calculateSpeed);
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition);
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition);

        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments);
        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails);
        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen);
    }

    updateViewerParameters() {
        var viewRectangle = this.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
        this.viewerParameters.lonRange.x = lonLatRange.lon.min;
        this.viewerParameters.lonRange.y = lonLatRange.lon.max;
        this.viewerParameters.latRange.x = lonLatRange.lat.min;
        this.viewerParameters.latRange.y = lonLatRange.lat.max;

        var pixelSize = this.camera.getPixelSize(
            this.globeBoundingSphere,
            this.scene.drawingBufferWidth,
            this.scene.drawingBufferHeight
        );

        if (pixelSize > 0) {
            this.viewerParameters.pixelSize = pixelSize;
        }
    }

    setGlobeLayer(userInput) {
        this.viewer.imageryLayers.removeAll();
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

        var globeLayer = userInput.globeLayer;
        switch (globeLayer.type) {
            case "NaturalEarthII": {
                this.viewer.imageryLayers.addImageryProvider(
                    new Cesium.TileMapServiceImageryProvider({
                        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
                    })
                );
                break;
            }
            case "WMS": {
                this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                    url: userInput.WMS_URL,
                    layers: globeLayer.layer,
                    parameters: {
                        ColorScaleRange: globeLayer.ColorScaleRange
                    }
                }));
                break;
            }
            case "WorldTerrain": {
                this.viewer.imageryLayers.addImageryProvider(
                    new Cesium.IonImageryProvider({ assetId: 3954 })
                );
                this.viewer.terrainProvider = Cesium.createWorldTerrain();
                break;
            }
        }
    }

    setupEventListeners() {
        const that = this;

        this.camera.moveStart.addEventListener(function () {
            that.scene.primitives.show = false;
        });

        this.camera.moveEnd.addEventListener(function () {
            that.updateViewerParameters();
            that.particleSystem.applyViewerParameters(that.viewerParameters);
            that.scene.primitives.show = true;
        });

        var resized = false;
        window.addEventListener("resize", function () {
            resized = true;
            that.scene.primitives.show = false;
            that.scene.primitives.removeAll();
        });

        this.scene.preRender.addEventListener(function () {
            if (resized) {
                that.particleSystem.canvasResize(that.scene.context);
                resized = false;
                that.addPrimitives();
                that.scene.primitives.show = true;
            }
        });

        window.addEventListener('particleSystemOptionsChanged', function () {
            that.particleSystem.applyUserInput(that.panel.getUserInput());
        });
        window.addEventListener('layerOptionsChanged', function () {
            that.setGlobeLayer(that.panel.getUserInput());
        });
        window.addEventListener('timeOptionsChanged', function () {
            that.clearParticleSystem();
            that.initializeData();
        })

        window.addEventListener('routeOptionsChanged', function () {
            ship.reset()
        })
    }
}