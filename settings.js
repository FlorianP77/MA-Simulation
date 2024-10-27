const kiteOptions = {

  defaultKiteSize: 1000, //in m^2
  cA: 1.2,
  gZ: 6,


  kiteHeightAngleLoop: 34, //Grad
  kiteHeightAngleSinus: 30, //Grad

  windWindowPositionLoop: 4,
  windWindowPositionSinus: 5,
  



  realScale: 1000,
  maximumScale: 5000 * 30,

  minimumPixelSize: 64,
};

const shipOptions = {
  defaultTypeIndex: 0,
  defaultSpeedIndex: 0,

  realScale: 3,
  maximumScale: 5000 * 3,
  minimumPixelSize: 64,

  //meistverwendeter Treibstoff: https://www.umweltbundesamt.de/service/uba-fragen/welchem-kraftstoff-fahren-seeschiffe

  //https://de.statista.com/statistik/daten/studie/1461265/umfrage/energiedichte-verschiedener-schiffskraftstoffe/

 

  //https://www.bundestag.de/resource/blob/876928/1c1929bbc1eaa0d85553ff4ed7e4f6eb/WD-8-093-21-pdf.pdf
  // enegy density = 40'200 kj/kg = 40'200'000 j/kg
  //Dichte Schweröl MW: 965 kg/m^3
  fuelEnergyDensity: 40200000, //in J/kg

  //Carbon content Schweröl = 0,8493
  //Co2 / Fuel = 3,114
  co2PerFuel: 3.114, // koeffizient

  //https://www.wartsila.com/sustainability/climate-and-environment/innovating-for-sustainability/improving-efficiency
  motorEfficiency: 0.5,

  startTime: "2024-01-01T00:00:00Z",

  clockMultiplier: 10000,
  checkInterval: 500,
  shipLevel: 1,
};






//https://www.researchgate.net/publication/229050596_Fuel_surcharge_practices_of_container_shipping_lines_Is_it_about_cost_recovery_or_revenue-making

const shipSpeeds = [
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25"
];

const shipTypes = [
  //in tonnes/day
  {
    name: "2000-3000",
    fuelConsumption: [47.0, 56.1, 66.5, 78.1] 
  },
  {
    name: "3000-4000",
    fuelConsumption: [54.9, 65.6, 77.7, 91.3, 106.4] 
  },
  {
    name: "4000-5000",
    fuelConsumption: [52.8, 63.1, 74.7, 87.8, 102.4, 118.5, 136.4] 
  },
  {
    name: "5000-6000",
    fuelConsumption: [57.9, 69.3, 82.0, 96.4, 112.3, 130.1, 149.7, 171.3] 
  },
  {
    name: "6000-7000",
    fuelConsumption: [68.8, 82.2, 97.4, 114.4, 133.4, 154.5, 177.8, 203.4] 
  },
  {
    name: "7000-8000",
    fuelConsumption: [77.8, 93.0, 110.1, 129.4, 150.8, 174.7, 201.0, 230.0] 
  },
  {
    name: "8000-9000",
    fuelConsumption: [87.9, 105.1, 124.5, 146.2, 170.5, 197.5, 227.2, 260.0] 
  },
  {
    name: "9000-10000",
    fuelConsumption: [98.8, 118.1, 139.8, 164.2, 191.5, 211.8, 255.2, 292.0] 
  },
  {
    name: "10000+",
    fuelConsumption: [124.1, 148.4, 175.7, 206.4, 240.7, 278.7, 320.7, 367.0] 
  }
];



const shipTypeNames = shipTypes.map((shiptype) => shiptype.name);


const defaultTimeOptions = {
  windUpdateStep: 6, //in hours, min: 6, max:24
};

const ports = [
  "rotterdam",
  "shanghai",
  "newyork",
  "santos",
  "mumbai",
  "losangeles",
];

const defaultRouteOptions = {
  startingPointIndex: 0,
  destinationIndex: 1,
};

const routes = {
  "rotterdamshanghai": rotterdamshanghai,
  "shanghairotterdam": shanghairotterdam,
  "rotterdammumbai": rotterdammumbai,
  "mumbairotterdam": mumbairotterdam,
  "rotterdamnewyork": rotterdamnewyork,
  "newyorkrotterdam": newyorkrotterdam,
  "rotterdamsantos": rotterdamsantos,
  "santosrotterdam": santosrotterdam,
  "shanghailosangeles": shanghailosangeles,
  "losangelesshanghai": losangelesshanghai
}

const fileOptions = {
  dataDirectory: "dataSets/",
  glslDirectory: "glsl/",
  shipDirectory: "models/ship.glb",
  kiteDirectory: "models/kite.glb",
  routeDirectory: "routes/shipRoute.json",
};

const defaultParticleSystemOptions = {
  maxParticles: 64 * 64,
  particleHeight: 100.0,
  fadeOpacity: 0.965,
  dropRate: 0.003,
  dropRateBump: 0.01,
  speedFactor: 3.0,
  lineWidth: 3.0,
};

const globeLayers = [
  { name: "NaturalEarthII", type: "NaturalEarthII" },
  {
    name: "WMS:Air Pressure",
    type: "WMS",
    layer: "Pressure_surface",
    ColorScaleRange: "51640,103500",
  },
  {
    name: "WMS:Wind Speed",
    type: "WMS",
    layer: "Wind_speed_gust_surface",
    ColorScaleRange: "0.1095,35.31",
  },
  { name: "WorldTerrain", type: "WorldTerrain" },
];

const layerNames = globeLayers.map((layer) => layer.name);

const defaultLayerOptions = {
  globeLayer: 3,
};

const windFileDates = [
  "20240101",
  "20240102",
  "20240103",
  "20240104",
  "20240105",
  "20240106",
  "20240107",
  "20240108",
  "20240109",
  "20240110",
  "20240111",
  "20240112",
  "20240113",
  "20240114",
  "20240115",
  "20240116",
  "20240117",
  "20240118",
  "20240119",
  "20240120",
  "20240121",
  "20240122",
  "20240123",
  "20240124",
  "20240125",
  "20240126",
  "20240127",
  "20240128",
  "20240129",
  "20240130",
  "20240131",
];

const windFileTimes = [
  "0000", 
  "0600", 
  "1200",
  "1800"
  
]

const forecastHours = "006"


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






document.addEventListener('keydown', function(event) {
  if (event.key === 'r') {
    location.reload(); 
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'v') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
});
