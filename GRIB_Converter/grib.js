import { grib2 } from "./grib2vanilla.js";
import { writeFileSync } from "fs";
import path from "path";
import fetch from "node-fetch";

// Define the time steps to iterate over
const timeSteps = ["00", "06", "12", "18"];

async function processFileFromUrl(url, filePath) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const fileContentBuffer = Buffer.from(arrayBuffer);

  // the result is an array, as multiple grib2 files can be concatenated to a single
  const grib2Data = grib2(fileContentBuffer).filter((d) => !d.skipped);

  let windData = grib2Data.filter(
    (d) =>
      d.sections.section0.data.discipline === 0 &&
      d.sections.section4.data.productDefinitionTemplate.parameterCategory === 2
  );

  let uData = windData.find(
    (d) => d.sections.section4.data.productDefinitionTemplate.parameterNumber === 2
  );
  let vData = windData.find(
    (d) => d.sections.section4.data.productDefinitionTemplate.parameterNumber === 3
  );

  let data = {
    u: uData.sections.section7.points,
    v: vData.sections.section7.points,
  };

  writeFileSync(filePath, JSON.stringify(data));
}

(async () => {
  // Loop through each day in January
  for (let day = 1; day <= 31; day++) {
    // Format the day to have two digits (e.g., "01", "02", ...)
    const formattedDay = day.toString().padStart(2, "0");
    const date = `202401${formattedDay}`;

    // Loop through each time step
    for (const time of timeSteps) {
      // Format the time to have four digits (e.g., "0000", "0600", ...)
      const formattedTime = `${time}00`;

      const fileUrl = "https://www.ncei.noaa.gov/data/global-forecast-system/access/grid-004-0.5-degree/analysis/" + date.slice(0, -2) + "/" + date + "/gfs_4_" + date + "_" + formattedTime + "_006.grb2";
        

      const outputFilePath = path.join(
        "../dataSets/" + date + "_" + formattedTime + "_006.json"
      );

      try {
        await processFileFromUrl(fileUrl, outputFilePath);
        console.log(`Processed data for date: ${date} and time: ${formattedTime}`);
      } 
      catch (error) {
        console.error(`Failed to process data for date: ${date} and time: ${formattedTime}`, error);
      }
    }
  }
})();
