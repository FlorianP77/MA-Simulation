import {grib2} from "./grib2vanilla.js"
import { writeFileSync } from "fs"
import path from 'path'
import fetch from 'node-fetch';

const date = "20240504"
const time = "0000"
const timeStep = "003"



const fileUrl = 'https://www.ncei.noaa.gov/data/global-forecast-system/access/grid-004-0.5-degree/analysis/' + date.slice(0, -2) + '/' + date + '/gfs_4_' + date + '_' + time + '_' + timeStep + '.grb2'
const outputFilePath = path.join('../dataSets/' + date + '_' + time + '_' + timeStep + '.json')


async function processFileFromUrl(url, filePath) {

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

  writeFileSync(filePath, JSON.stringify(data))
}


processFileFromUrl(fileUrl, outputFilePath)