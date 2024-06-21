setTimeout(() => {
    var lon = 40.0;
    var lat = 74.0;
    var lev = 0.0; 

    console.log(DataProcess.getWindSpeed(lon, lat, lev))

    var wind = DataProcess.getWindSpeed(lon, lat, lev);
        console.log(`Wind at lon: ${lon}, lat: ${lat}, lev: ${lev}`);
        console.log(`U component: ${wind.u}`);
        console.log(`V component: ${wind.v}`);
        console.log(`Wind speed: ${wind.speed} m/s`);

        var lon = 4.0;
        var lat = 52.0;
        var lev = 0.0; 
    
        console.log(DataProcess.getWindSpeed(lon, lat, lev))
    
        var wind = DataProcess.getWindSpeed(lon, lat, lev);
            console.log(`Wind at lon: ${lon}, lat: ${lat}, lev: ${lev}`);
            console.log(`U component: ${wind.u}`);
            console.log(`V component: ${wind.v}`);
            console.log(`Wind speed: ${wind.speed} m/s`);
}, 2000);