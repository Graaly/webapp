// adapted from https://github.com/bitlyfied/js-image-similarity

// for the moment, those two values must be the same
const HASH_MIN_WIDTH = 16
const HASH_MIN_HEIGHT = 16

/*
 * compares the content of two 2d canvas elements (different sizes allowed)
 * - shrinks the biggest image (pixel size) to match the smalles image area
 * - crops images so they share the same "center"
 * - dramatically shrink both images so that dimensions are HASH_MIN_WIDTH * HASH_MIN_HEIGHT at minimum
 * - compares shrinked images using this simple algorithm (first part): http://www.hackerfactor.com/blog/index.php?/archives/432-Looks-Like-It.html
 * => returns a comparison index between 0 and 100
 * @param    canvas1    canvas element
 * @param    canvas2    canvas element
 */
function compare (canvas1, canvas2) {
  if (canvas1.width !== canvas2.width || canvas1.height !== canvas2.height) {
    // resize biggest image to match scale of smallest one
    let canvas1Area = canvas1.width * canvas1.height
    let canvas2Area = canvas2.width * canvas2.height
    
    // always store biggest image in canvas1 to simplify process
    if (canvas1Area < canvas2Area) {
      [canvas2, canvas1, canvas2Area, canvas1Area] = [canvas1, canvas2, canvas1Area, canvas2Area]
    }
    
    // compute which ratio apply to canvas1 dimensions, to skrink it to same 'scale' as canvas2.
    let sizeRatio = Math.sqrt(canvas2Area / canvas1Area)
    
    let canvas1NewWidth = Math.round(canvas1.width * sizeRatio)
    let canvas1NewHeight = Math.round(canvas1.height * sizeRatio)
    
    canvas1 = resizeCanvasTo(canvas1, canvas1NewWidth, canvas1NewHeight)
    
    // apply vertical or horizontal centered crop
    
    // if canvas1 is larger, crop image1 width
    // else, crop image2 width
    let offsetWidth = 0
    let croppedWidth = Math.min(canvas1.width, canvas2.width)
    let canvas1IsLarger = canvas1.width > canvas2.width
    if (canvas1.width !== canvas2.width) {
      offsetWidth = Math.round(Math.abs(canvas1.width - canvas2.width) / 2)
    }
                          
    // if canvas1 is taller, crop image1 height
    // else, crop image2 height
    let offsetHeight = 0
    let croppedHeight = Math.min(canvas1.height, canvas2.height)
    let canvas1IsTaller = canvas1.height > canvas2.height
    if (canvas1.height !== canvas2.height) {
      offsetHeight = Math.round(Math.abs(canvas1.height - canvas2.height) / 2)
    }
    
    let canvasTmp = canvas1
    canvas1 = document.createElement('canvas')
    
    canvas1.width = croppedWidth
    canvas1.height = croppedHeight
    canvas1.getContext('2d').drawImage(canvasTmp,
      (canvas1IsLarger ? offsetWidth : 0), (canvas1IsTaller ? offsetHeight : 0),
      croppedWidth, croppedHeight,
      0, 0,
      croppedWidth, croppedHeight
    )
    
    canvasTmp = canvas2
    canvas2 = document.createElement('canvas')
    canvas2.width = croppedWidth
    canvas2.height = croppedHeight
    canvas2.getContext('2d').drawImage(canvasTmp,
      (canvas1IsLarger ? 0 : offsetWidth), (canvas1IsTaller ? 0 : offsetHeight),
      croppedWidth, croppedHeight,
      0, 0,
      croppedWidth, croppedHeight
    )
  }
  
  let hashWidth = HASH_MIN_WIDTH
  let hashHeight = HASH_MIN_HEIGHT
  
  // resize both canvas so that minimal size is hashWidth * hashHeight in pixels
  
  let ratioWidthHeight = canvas1.width / canvas1.height
  if (canvas1.width > canvas1.height) { // ratio > 1
    hashWidth = Math.round(hashWidth * ratioWidthHeight)
  } else if (canvas1.width < canvas1.height) { // 0 < ratio < 1
    hashHeight = Math.round(hashHeight / ratioWidthHeight)
  }
  
  canvas1 = resizeCanvasTo(canvas1, hashWidth, hashHeight)
  canvas2 = resizeCanvasTo(canvas2, hashWidth, hashHeight)
  
  // apply hash comparison algorithm (desaturate, average, threshold map)
  
  return compareHash(canvas1, canvas2)
}

function resizeCanvasTo(canvas, width, height) {
  let tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  tmpCanvas.getContext('2d').drawImage(canvas, 0, 0, width, height)
  return tmpCanvas
}

// compares two threshold maps, then returns comparison index between 0 and 100
function compareHash (first, second) {
  let firstHash = hash(first)
  let secondHash = hash(second)
  
  let distance = utils.hammingDistance(firstHash, secondHash, first.width) * 100

  return distance.toFixed(3)
}

function hash (canvas) {
  let pixelsMap = utils.pixelsMap(canvas),
      bytesMap = utils.desaturate(pixelsMap),
      average = utils.average(bytesMap),
      thresholdMap = utils.thresholdMap(bytesMap, average)
  
  let humanReadable = ''
  for (let i = 0; i < thresholdMap.length; i++) {
    humanReadable += (thresholdMap[i] ? '-' : 'X')
    humanReadable += ((i + 1) % canvas.width === 0 ? '\n' : '')
  }
  console.log(humanReadable)
  
  return thresholdMap
}

var utils = {
  /**
   * Returns an array with averaged colors (shades of gray)
   * @param data
   */
  desaturate: function(data) {
    let grays = new Array(data.length / 4)
    for (let i = 0; i < grays.length; i++) {
      let j = i * 4
      grays[i] = Math.round((data[j] + data[j+1] + data[j+2]) / 3)
    }
    return grays
  },

  /**
   * Returns the average of an array of numbers
   * @param data
   * @return Number
   */
  average: function(data) {
    let total = 0
    for (let i = 0; i < data.length; i++) {
      total += data[i]
    }
    return (total / data.length)
  },

  /**
   * Generates a long bitmask (64bit) from an array of 64 bytes.
   * Each byte is converted in a positive bit if the byte is greater
   * or equal than the specified threshold
   *
   * @param data
   * @param threshold
   * @return Number bitmap
   */
  thresholdMap: function(data, threshold) {
    return data.map((pixel) => { return pixel >= threshold })
  },

  /**
   * returns an array of pixels from canvas object
   *
   * @param image
   * @param width
   * @param height
   * @return CanvasPixelArray
   */
  pixelsMap: function(canvas) {
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
  },

  /**
   * Returning the Hamming distance between two series of bits
   *
   * @param bitsA
   * @param bitsB
   * @return Number distance
   */
  hammingDistance: function(bitsA, bitsB, width) {
    let countIdenticalBits = 0
    let humanReadable = ''
    for (let i = 0; i < bitsA.length; i++) {
      if (typeof bitsB[i] !== 'undefined' && bitsA[i] === bitsB[i]) {
        countIdenticalBits++
        humanReadable += '.'
      } else {
        humanReadable += '*'
      }
      humanReadable += ((i + 1) % width === 0 ? '\n' : '')
    }
    console.log(humanReadable)
    
    return bitsA.length > 0 ? countIdenticalBits / bitsA.length : 0
  }
}

export default {
    hash: hash,
    compare: compare,
    compareHash: compareHash,
    utils: utils
}
