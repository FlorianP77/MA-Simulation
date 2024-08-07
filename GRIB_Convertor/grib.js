import {readFile} from "fs/promises"
import {grib2} from "./grib2vanilla.js"
import { writeFileSync } from "fs"
import path from 'path'
import fetch from 'node-fetch';

const fileUrl = 'https://www.ncei.noaa.gov/data/global-forecast-system/access/grid-004-0.5-degree/analysis/202206/20220605/gfs_4_20220605_0000_000.grb2'


async function processFileFromUrl(url) {

  const response = await fetch(url);

  const arrayBuffer = await response.arrayBuffer();
  const fileContentBuffer = Buffer.from(arrayBuffer);


  // the result is an array, as multiple grib2 files can be concatenated to a single
  const grib2Data = grib2(fileContentBuffer).filter(d=>!d.skipped)

  //console.log(JSON.stringify(grib2Data.map(d=>d.sections.section4), null, 2))

  let windData = grib2Data.filter(d=>
    d.sections.section0.data.discipline===0 &&
    d.sections.section4.data.productDefinitionTemplate.parameterCategory===2
  )

  let uData = windData.find(d=>d.sections.section4.data.productDefinitionTemplate.parameterNumber===2)
  let vData = windData.find(d=>d.sections.section4.data.productDefinitionTemplate.parameterNumber===3)

  let data = {
    u: uData.sections.section7.points,
    v: vData.sections.section7.points,
  }

  return data

  //writeFileSync(outputFilePath, JSON.stringify(data))
}


//processFileFromUrl(fileUrl)