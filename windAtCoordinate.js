setTimeout(() => {

        var lon = 4.0;
        var lat = -80;
        var lev = 0.0; 
    
    
        var wind = DataProcess.getWindSpeed(lon, lat, lev);
            console.log(`Wind at lon: ${lon}, lat: ${lat}, lev: ${lev}`);
            console.log(`U component: ${wind.u}`);
            console.log(`V component: ${wind.v}`);
            console.log(`Wind speed: ${wind.speed} m/s`);
            console.log(`Direction: ${wind.dir}`);
}, 2000);