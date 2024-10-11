// https://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_doc/

import { extractBits, extractSignedInt} from "./bithelpers.js";

function parseGridDefinition3_0(sectionBuffer) {
  return {
    shapeOfEarth: sectionBuffer[14],
		numberOfPointsAlongParallel: sectionBuffer.readUInt32BE(30),
    numberOfPointsAlongMeridian: sectionBuffer.readUInt32BE(34),
    La1: extractSignedInt(sectionBuffer, 50, 32) / 1e6,
    Lo1: extractSignedInt(sectionBuffer, 46, 32) / 1e6,
    La2: extractSignedInt(sectionBuffer, 55, 32) / 1e6,
    Lo2: extractSignedInt(sectionBuffer, 59, 32) / 1e6, // yields -2057. instead of - 90 ??
    iInc: extractSignedInt(sectionBuffer, 63, 32) / 1e6,
    jInc: extractSignedInt(sectionBuffer, 67, 32) / 1e6,
    scanningMode: sectionBuffer[71]
  }
}

function parseProductDefinition4_0(sectionBuffer, referenceTimestamp) {
  const result = {
    parameterCategory: sectionBuffer[9],
    parameterNumber: sectionBuffer[10],
    typeOfGenerationProcess: sectionBuffer[11],
    backgroundGenerationProcessIdentifier: sectionBuffer[12],
    analysisGenerationProcessIdentifier: sectionBuffer[13],
    hoursCutOff: sectionBuffer.readInt16BE(14),
    minutesCutOff: sectionBuffer[16],
    timeUnitRange: sectionBuffer[17],
    forecastTime: sectionBuffer.readUInt32BE(18),
    typeOfFirstFixedSurface: sectionBuffer[22],
    scaleFactor1: sectionBuffer[23],
    scaledValueOfSurface1: sectionBuffer.readInt32BE(24),
  }

  var factor = 1000
  const timeUnitRange = result.timeUnitRange
  if (timeUnitRange === 0) {
    factor *= 60
  } else if (timeUnitRange === 1) {
    factor *= 60 * 60
  } else if (timeUnitRange === 2) {
    factor *= 24 * 60 * 60
  } else if (timeUnitRange === 10) {
    factor *= 3 * 60 * 60
  } else if (timeUnitRange === 11) {
    factor *= 6 * 60 * 60
  } else if (timeUnitRange === 12) {
    factor *= 12 * 60 * 60
  } else if (timeUnitRange === 13) {
    factor *= 1
  } else {
    throw new VError({
      name: 'FORECAST_TIME_NOT_SUPPORTED',
      cause: new Error(timeUnitRange + '')
    })
  }
  result.forecastTimestamp = referenceTimestamp + factor * result.forecastTime
  
  result.H = result.scaledValueOfSurface1 * Math.pow(10, -result.scaleFactor1)
  
  return result
}

function parseProductDefinition4_8(sectionBuffer) {
  const result = {
    parameterCategory: sectionBuffer[9],
    parameterNumber: sectionBuffer[10],
    typeOfGenerationProcess: sectionBuffer[11],
    backgroundGenerationProcessIdentifier: sectionBuffer[12],
    analysisGenerationProcessIdentifier: sectionBuffer[13],
    hoursCutOff: sectionBuffer.readInt16BE(14),
    minutesCutOff: sectionBuffer[16],
    timeUnitRange: sectionBuffer[17],
    foreCastTime: sectionBuffer.readInt32BE(18),
    typeOfFirstFixedSurface: sectionBuffer[22],
    scaleFactor1: sectionBuffer[23],
    scaledValueOfSurface1: sectionBuffer.readInt32BE(24),
    year: sectionBuffer.readUInt16BE(34),
    month: sectionBuffer[36],
    day: sectionBuffer[37],
    hour: sectionBuffer[38],
    minute: sectionBuffer[39],
    second: sectionBuffer[40],
  }

  result.H = result.scaledValueOfSurface1 * Math.pow(10, -result.scaleFactor1)

  return result
}

function parseDataRepresentationTemplate5_0(sectionBuffer) {
  const R = sectionBuffer.readFloatBE(11)
  var E = sectionBuffer.readUInt16BE(15) & 0x7fff
  if ((sectionBuffer.readUInt16BE(15) >> 15) > 0) {
    E *= -1
  }

  var D = sectionBuffer.readUInt16BE(17) & 0x7fff
  if ((sectionBuffer.readUInt16BE(17) >> 15) > 0) {
    D *= -1
  }

  return {
    R: R,
    E: E,
    D: D,
    numberOfBitsForPacking: sectionBuffer[19],
    typeOfOriginalFieldValues: sectionBuffer[20]
  }
}

function parseDataRepresentationTemplate5_3(sectionBuffer) {

  const R = sectionBuffer.readFloatBE(11)
  var E = sectionBuffer.readUInt16BE(15) & 0x7fff
  if ((sectionBuffer.readUInt16BE(15) >> 15) > 0) {
    E *= -1
  }
  var D = sectionBuffer.readUInt16BE(17) & 0x7fff
  if ((sectionBuffer.readUInt16BE(17) >> 15) > 0) {
    D *= -1
  }

  return {
    R: R,
    E: E,
    D: D,
    numberOfBitsForPacking: sectionBuffer[19],
    typeOfOriginalFieldValues: sectionBuffer[20],
    groupSplittingMethodUsed: sectionBuffer[21],
    missingValueManagementUsed: sectionBuffer[22],
    primaryMissingValueSubstitute: sectionBuffer.readInt32BE(23),
    secondaryMissingValueSubstitute: sectionBuffer.readInt32BE(27),
    numberOfGroupsOfDataValues: sectionBuffer.readUInt32BE(31),
    referenceForGroupWidths: sectionBuffer[35],
    numberOfBitsForGroupWidths: sectionBuffer[36],
    referenceForGroupLengths: sectionBuffer.readUInt32BE(37),
    lengthIncrementForGroupLengths: sectionBuffer[41],
    trueLengthOfLastGroup: sectionBuffer.readUInt32BE(42),
    numberOfBitsForScaledGroupLengths: sectionBuffer[46],
    orderOfSpatialDifference: sectionBuffer[47],
    numberOfBytesForInitials: sectionBuffer[48],
  }
}

function parseSection0(buffer, startIndex) {
  const result = {
    discipline: buffer[startIndex + 6], // https://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_doc/grib2_table0-0.shtml
    edition: buffer[startIndex + 7],
    totalLength: buffer.readUInt32BE(startIndex + 12)
  }

  return {
    startIndex: startIndex,
    lengthOfRawData: 16,
    data: result
  }
}

function parseSection1(buffer, startIndex) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    originationCenterId: buffer.readUInt16BE(startIndex + 5),
    originationSubCenterId: buffer.readUInt16BE(startIndex + 7),
    masterTableVersion: buffer[startIndex + 9],
    localTableVersionNumber: buffer[startIndex + 10],
    significanceOfReferenceTime: buffer[startIndex + 11],
    year: buffer.readUInt16BE(startIndex + 12),
    month: buffer[startIndex + 14],
    day: buffer[startIndex + 15],
    hour: buffer[startIndex + 16],
    minute: buffer[startIndex + 17],
    second: buffer[startIndex + 18],
    productionStatus: buffer[startIndex + 19],
    typeOfProcessedData: buffer[startIndex + 20]
  }
  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseSection2(buffer, startIndex) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    localUse: buffer.slice(startIndex + 5, startIndex + buffer.readUInt32BE(startIndex))
  }
  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseSection3(buffer, startIndex) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    sourceOfGridDefinition: buffer[startIndex + 5],
    numberOfDataPoints: buffer.readUInt32BE(startIndex + 6),
    numberOfOctetsForOptionalDefinitions: buffer[10],
    interpretationOfOptionalDefinitions: buffer[11],
    gridDefinitionTemplateNumber: buffer.readUInt16BE(startIndex + 12),
    gridDefinitionTemplate: parseGridDefinition3_0(buffer.slice(startIndex))
  }

  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseSection4(buffer, startIndex, referenceTimestamp) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    numberOfCoordinateValuesAfterTemplate: buffer.readUInt16BE(startIndex + 5),
    productDefinitionTemplateNumber: buffer.readUInt16BE(startIndex + 7),
    productDefinitionTemplate: null
  }

  if (result.productDefinitionTemplateNumber === 0) {
    result.productDefinitionTemplate = parseProductDefinition4_0(buffer.slice(startIndex), referenceTimestamp)
  } else if (result.productDefinitionTemplateNumber === 8) {
    result.productDefinitionTemplate = parseProductDefinition4_8(buffer.slice(startIndex))
  // } else if (result.productDefinitionTemplateNumber === 43) {
  //   result.productDefinitionTemplate = parseProductDefinition4_43x(buffer.slice(startIndex))
  // } else if (result.productDefinitionTemplateNumber === 63) {
  //   result.productDefinitionTemplate = parseProductDefinition4_63x(buffer.slice(startIndex))
  } else {
    // throw new VError({
    //   name: 'PRODUCT_DEFINITION_TEMPLATE_NOT_SUPPORTED',
    //   cause: new Error(result.productDefinitionTemplateNumber + '')
    // })
    console.log(`SKIPPED ${result.productDefinitionTemplateNumber}`)
  }

  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseSection5(buffer, startIndex) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    numberOfDataPoints: buffer.readUInt32BE(startIndex + 5),
    dataRepresentationTemplateNumber: buffer.readUInt16BE(startIndex + 9),
  }

  if(result.dataRepresentationTemplateNumber === 0) {
    result.dataRepresentationTemplate = parseDataRepresentationTemplate5_0(buffer.slice(startIndex))
  } else if (result.dataRepresentationTemplateNumber === 3) {
    result.dataRepresentationTemplate = parseDataRepresentationTemplate5_3(buffer.slice(startIndex))
  }
  else {
    console.log(`SKIPPED ${result.dataRepresentationTemplateNumber}`)
  }

  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseSection6(buffer, startIndex) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    bitMapIndicator: buffer[startIndex + 5],
    bitMap: buffer.slice(startIndex + 6, startIndex + buffer.readUInt32BE(startIndex))
  }
  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseSection7_3(buffer, startIndex, section3, section5) {
  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
  }
  let numberOfDataPoints = section5.data.numberOfDataPoints
  let {R, E, D, 
    numberOfGroupsOfDataValues,
    numberOfBitsForPacking,
    referenceForGroupLengths, lengthIncrementForGroupLengths,
    numberOfBitsForScaledGroupLengths,
    numberOfBitsForGroupWidths, referenceForGroupWidths,
    orderOfSpatialDifference,
    trueLengthOfLastGroup
  } = section5.data.dataRepresentationTemplate



  // for(let i = 0; i < numberOfDataPoints; i++) {
  //   dataPoints.push(calcPoint(buffer, startIndex + 5 + i * numberOfBitsForPacking))
  // }
  if(orderOfSpatialDifference !== 2) {
    console.log('not implemented order of spatial difference', orderOfSpatialDifference)
    return result
  }

  let v0scaled = extractSignedInt(buffer, startIndex + 5, 16)
  let v1scaled = extractSignedInt(buffer, startIndex + 7, 16)
  let minDiff = extractSignedInt(buffer, startIndex + 9, 16)

  let groupReferences = []
  let currentBitIndex = (startIndex + 11) * 8

  for(let i = 0; i < numberOfGroupsOfDataValues; i++) {
    let groupRef = extractBits(buffer, currentBitIndex, numberOfBitsForPacking)
    currentBitIndex += numberOfBitsForPacking
    groupReferences.push(groupRef)
  }
  let fillZeroes = (8 - currentBitIndex % 8) % 8
  let zeroes = extractBits(buffer, currentBitIndex, fillZeroes)
  currentBitIndex += fillZeroes

  //console.log({v0scaled, v1scaled, minDiff, grs: groupReferences.slice(0,10), fz: fillZeroes, zeroes})

  let groupWidths = []
  for(let i = 0; i < numberOfGroupsOfDataValues; i++) {
    let width = referenceForGroupWidths + extractBits(buffer, currentBitIndex, numberOfBitsForGroupWidths)
    currentBitIndex += numberOfBitsForGroupWidths
    groupWidths.push(width)
  }
  fillZeroes = (8 - currentBitIndex % 8) % 8
  zeroes = extractBits(buffer, currentBitIndex, fillZeroes)
  currentBitIndex += fillZeroes

  let groupLenghts = []
  for(let i = 0; i < numberOfGroupsOfDataValues; i++) {
    let length = referenceForGroupLengths + extractBits(buffer, currentBitIndex, numberOfBitsForScaledGroupLengths) * lengthIncrementForGroupLengths
    currentBitIndex += numberOfBitsForScaledGroupLengths
    groupLenghts.push(length)
  }
  groupLenghts[numberOfGroupsOfDataValues - 1] = trueLengthOfLastGroup

  fillZeroes = (8 - currentBitIndex % 8) % 8
  zeroes = extractBits(buffer, currentBitIndex, fillZeroes)
  currentBitIndex += fillZeroes

  let rawDataPoints = []
  let shiftedDataPoints = []
  
  let flast = v1scaled
  let glast = v1scaled - v0scaled

  function calcPoint(p) {
    return (R + p * 2 ** E) * Math.pow(10, -D);
  }

  let scaledDataPoints = [v0scaled, v1scaled]
  let points = [calcPoint(v0scaled), calcPoint(v1scaled)]

  for(let i = 0; i < numberOfGroupsOfDataValues; i++) {
    for(let p = 0; p < groupLenghts[i]; p++) {
      let width = groupWidths[i]
      let raw = extractBits(buffer, currentBitIndex, width)
      currentBitIndex += width
      rawDataPoints.push(raw)
      let h = raw + minDiff + groupReferences[i]
      shiftedDataPoints.push(h)
      let g = glast + h
      let f = flast + g
      scaledDataPoints.push(f)
      points.push(calcPoint(f))
      flast = f
      glast = g
    }
  }

  let rp = points
  //console.log({L: rp.length, v: rp.slice(0, 20), d: scaledDataPoints.slice(0, 20)});
  
  result.points = points
  //console.log(dataPoints.slice(0, 10));
  return result
}

function parseSection7(buffer, startIndex, section3, section5) {

  if(section5.data.dataRepresentationTemplateNumber === 3) {
    return parseSection7_3(buffer, startIndex, section3, section5)
  }

  const result = {
    length: buffer.readUInt32BE(startIndex),
    numberOfSection: buffer[startIndex + 4],
    rawData: buffer.slice(startIndex + 5, startIndex + buffer.readUInt32BE(startIndex))
  }

  return {
    startIndex: startIndex,
    lengthOfRawData: result.length,
    data: result
  }
}

function parseAllSections(gribBuffer, startIndex) {
  const section0 = parseSection0(gribBuffer, startIndex)

  if (section0.data.totalLength > (gribBuffer.length - startIndex)) {
    throw new Error('INVALID_LENGTH_ERROR')
  }

  const section1 = parseSection1(gribBuffer, section0.startIndex + section0.lengthOfRawData)
	let nextIndex = section1.startIndex + section1.lengthOfRawData
	let nextSection = gribBuffer[nextIndex + 4]
  const section2 = nextSection === 2 // section to is optional
		? parseSection2(gribBuffer, section1.startIndex + section1.lengthOfRawData)
		: {lengthOfRawData: 0, data: null, startIndex: nextIndex}
  const section3 = parseSection3(gribBuffer, section2.startIndex + section2.lengthOfRawData)
  const section4 = parseSection4(gribBuffer, section3.startIndex + section3.lengthOfRawData, section1.data.referenceTimestamp)
  const section5 = parseSection5(gribBuffer, section4.startIndex + section4.lengthOfRawData)
  
  let isSurfaceWind = section0.data.discipline===0
    && section4.data.productDefinitionTemplate.parameterCategory===2
    && [2, 3].includes(section4.data.productDefinitionTemplate.parameterNumber)
    && section4.data.productDefinitionTemplate.typeOfFirstFixedSurface === 103
    && section4.data.productDefinitionTemplate.H === 10

  let isSurfaceTemp = section0.data.discipline===0
    && section4.data.productDefinitionTemplate.parameterCategory===0
    && [0].includes(section4.data.productDefinitionTemplate.parameterNumber)
    && section4.data.productDefinitionTemplate.typeOfFirstFixedSurface === 103
    && section4.data.productDefinitionTemplate.H === 2
    
  if(!isSurfaceWind && !isSurfaceTemp) {
    return {_lengthOfRawData: section0.data.totalLength, skipped: true}
  }
  
  const section6 = parseSection6(gribBuffer, section5.startIndex + section5.lengthOfRawData)
  const section7 = parseSection7(gribBuffer, section6.startIndex + section6.lengthOfRawData, section3, section5)

  return {
    referenceTimestamp: section1.data.referenceTimestamp,
    //forecastTimestamp: section4.data.productDefinitionTemplate?.forecastTimestamp,
    _startIndex: startIndex,
    _lengthOfRawData: section0.data.totalLength,
    sections: {
      section0: section0,
      section1: section1,
      section2: section2,
      section3: section3,
      section4: section4,
      section5: section5,
      section6: section6,
      section7: section7
    },
  }
}

export function grib2(grib2Buffer) {

  var completeResult = []
  var startIndex = 0

  while(startIndex < grib2Buffer.length) {

    const result = parseAllSections(grib2Buffer, startIndex)
    startIndex += result._lengthOfRawData

    completeResult.push(result)
  }

  return completeResult
}
