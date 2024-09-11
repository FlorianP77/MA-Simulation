var DataProcess = (function () {
    var data;

    //var loadData = async function (){
    var loadData = async function(filePath){
        data = {};
        //var rawdata = await processFileFromUrl(fileUrl)

    
        var rawdata = await fetch(filePath).then(r=>r.json());

        function getMinMax(array) {
            let min = array[0], max = array[0];
            for (let i = 1; i < array.length; i++) {
                if (array[i] < min) min = array[i];
                if (array[i] > max) max = array[i];
            }
            return { min, max };
        }

        var steps = function(start, end, step) {
            let s = [];
            for (let i = start; i <= end; i += step) {
            s.push(i);
            };

            return s;
        };
            


        data.dimensions = {
            lon: 720,
            lat: 361,
            lev: 1
        };

        data.lon = {
            array: new Float32Array(steps(0, 359.5, 0.5)),
            min: 0,
            max: 359.5
        };

        data.lat = {
            array: new Float32Array(steps(-90, 90, 0.5)),
            min: -90,
            max: 90
        };

        data.lev = {
            array: new Float32Array([0]),
            min: 0,
            max: 0
        };

        data.U = {
            array: new Float32Array(rawdata.u),
            ...getMinMax(rawdata.u)
        };


        data.V = {
            array: new Float32Array(rawdata.v),
            ...getMinMax(rawdata.u)
        };

        return data
    }

    var getData = function() {
        return data;
    }


    var randomizeParticles = function (maxParticles, viewerParameters) {
        var array = new Float32Array(4 * maxParticles);
        for (var i = 0; i < maxParticles; i++) {
            array[4 * i] = Cesium.Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y);
            array[4 * i + 1] = Cesium.Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y);
            array[4 * i + 2] = Cesium.Math.randomBetween(data.lev.min, data.lev.max);
            array[4 * i + 3] = 0.0;
        }
        return array;
    }
        

    return {
        loadData: loadData,
        getData: getData,
        randomizeParticles: randomizeParticles,
    };

})();