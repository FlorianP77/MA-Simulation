const fileOptions = {
    dataDirectory: 'dataSets/',
    dataFile: 'windData.json',
    glslDirectory: 'glsl/',
    shipDirectory: 'models/ship.gltf',
    routeDirectory: 'routes/shipRoute.json'
}



const defaultParticleSystemOptions = {
    maxParticles: 64 * 64,
    particleHeight: 100.0,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 1.0,
    lineWidth: 4.0
}

const globeLayers = [
    { name: "NaturalEarthII", type: "NaturalEarthII" },
    { name: "WMS:Air Pressure", type: "WMS", layer: "Pressure_surface", ColorScaleRange: '51640,103500' },
    { name: "WMS:Wind Speed", type: "WMS", layer: "Wind_speed_gust_surface", ColorScaleRange: '0.1095,35.31' },
    { name: "WorldTerrain", type: "WorldTerrain" }
]

const defaultLayerOptions = {
    "globeLayer": globeLayers[0],
    "WMS_URL": "https://www.ncei.noaa.gov/thredds/wms/model-gfs-g4-anl-files/202212/20221206/gfs_4_20221206_1800_003.grb2",
}

const defaultTimeOptions = {
    date: "20240806",
    time: "0000"
}

const defaultShipOptions = {
    startTime: "2020-03-09T23:10:00Z",
    clockMultiplier: 1
}
