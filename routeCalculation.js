function httpGetAsync(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText);
        }
    }
}
function getInfoVessel(IMO){
    httpGetAsync('http://services.marinetraffic.com/api/exportvessel/v:5/7[herecomesthekey]/protocol:jsono/imo:' + IMO, function(response) {
        console.log(response)
        document.getElementById('pr').innerHTML = response;
    });
}

getInfoVessel("9146314");


varS