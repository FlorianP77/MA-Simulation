fetch("routes/losangelesshanghai.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Netzwerkantwort war nicht ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log(extractCoordinates(data)); 
  })
  .catch((error) => {
    console.error(
      "Beim Laden der JSON-Datei ist ein Fehler aufgetreten:",
      error
    );
  });


function extractCoordinates(data) {
  console.log(data)
  const extractedData = [];
  const features = data.features;

  const standardSpeed = 1


  features.forEach((feature) => {
    const geometry = feature.geometry;
    const properties = feature.properties;

    if (geometry.type === "MultiLineString") {
      const coordinatesList = geometry.coordinates[0];
      let currentTimestamp = properties.departure / 1000; 


      for (let i = 0; i < coordinatesList.length; i++) {
        const currentCoordinates = coordinatesList[i];
        let heading = 0;

        if (i < coordinatesList.length - 1) {
          const nextCoordinates = coordinatesList[i + 1];
          const distanceToNext = haversineDistance(
            currentCoordinates,
            nextCoordinates
          );
          const timeToNext = distanceToNext / standardSpeed;
          currentTimestamp += timeToNext;
          heading = calculateHeading(currentCoordinates, nextCoordinates);
        }

        extractedData.push([
          [...currentCoordinates, 0],
          currentTimestamp,
          heading,
        ]);
      }
      console.log(coordinatesList[coordinatesList.length - 2])

    }
  });

  return JSON.stringify(extractedData);
}


function haversineDistance(coords1, coords2) {
  const R = 6371e3;
  const lat1 = (coords1[1] * Math.PI) / 180;
  const lat2 = (coords2[1] * Math.PI) / 180;
  const deltaLat = ((coords2[1] - coords1[1]) * Math.PI) / 180;
  const deltaLon = ((coords2[0] - coords1[0]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}


function calculateHeading(coord1, coord2) {
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;

  const x = Math.sin(dLon) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const initialBearing = Math.atan2(x, y);
  return ((initialBearing * 180) / Math.PI + 360) % 360;
}
