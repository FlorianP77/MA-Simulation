import {readFile} from "fs/promises"
import {grib2} from "./grib2vanilla.js"
import { writeFileSync } from "fs"

const fileContentBuffer = await readFile('./g.grb2')


  // the result is an array, as multiple grib2 files can be concatenated to a single
  const grib2Data = grib2(fileContentBuffer).filter(d=>!d.skipped)

  console.log(JSON.stringify(grib2Data.map(d=>d.sections.section4), null, 2))

  let windData = grib2Data.filter(d=>
    d.sections.section0.data.discipline===0 &&
    d.sections.section4.data.productDefinitionTemplate.parameterCategory===2
  )

  let uData = windData.find(d=>d.sections.section4.data.productDefinitionTemplate.parameterNumber===2)
  let vData = windData.find(d=>d.sections.section4.data.productDefinitionTemplate.parameterNumber===3)

  let switzerland = 722 ///2 * (90-47) * 720 + 2 * 7
  let u = uData.sections.section7.points[switzerland]
  let v = vData.sections.section7.points[switzerland]

  let windSpeed = Math.sqrt(u**2 + v**2) / 0.5144444444444444 // in knts
  

  let dir = Math.atan2(v, u) * 180 / Math.PI
  console.log(u, v, windSpeed, dir)

  let data = {
    u: uData.sections.section7.points,
    v: vData.sections.section7.points,
  }

  writeFileSync('./data.json', JSON.stringify(data))