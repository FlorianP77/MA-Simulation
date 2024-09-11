const kiteOptions = {
    force: 30,
    maxAngle: 90,

    realScale: 1,
    maximumScale: 400000,
    offsetHeight: - 1000000,
    offsetSideward: 0,
    offsetForward: 0
}



const shipOptions = {
    //alles in Newton
    weight: 1000,
    resistanceAtTopspeed: 100,

    realScale: 1,
    maximumScale: 40000,
    


    startTime: "2024-06-16T00:00:00Z",

    clockMultiplier: 1,
    updateInterval: 1,
    checkInterval: 1000,
    shipLevel: 1
}

const defaultTimeOptions = {

    timeStep: "003",


    windUpdateStep: 6  //in hours, min: 6, max:24
}

const routes = {
    "genuaNewYork": genuaNewYork, 
    "test": testRoute
};

const defaultRouteOptions = {
    startingPoint: "null",
    destination: "null",
    route: routes["genuaNewYork"]
}

const fileOptions = {
    dataDirectory: 'dataSets/',
    dataFile: defaultTimeOptions.date + '_' + defaultTimeOptions.time + '_' + defaultTimeOptions.timeStep + '.json',
    glslDirectory: 'glsl/',
    shipDirectory: 'models/ship.glb',
    kiteDirectory: 'models/kite.glb',
    routeDirectory: 'routes/shipRoute.json'
}



const defaultParticleSystemOptions = {
    maxParticles: 64 * 64,
    particleHeight: 100.0,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 5.0,
    lineWidth: 2.0
}

const globeLayers = [
    { name: "NaturalEarthII", type: "NaturalEarthII" },
    { name: "WMS:Air Pressure", type: "WMS", layer: "Pressure_surface", ColorScaleRange: '51640,103500' },
    { name: "WMS:Wind Speed", type: "WMS", layer: "Wind_speed_gust_surface", ColorScaleRange: '0.1095,35.31' },
    { name: "WorldTerrain", type: "WorldTerrain" }
]


const defaultLayerOptions = {
    globeLayer: globeLayers[0]
}