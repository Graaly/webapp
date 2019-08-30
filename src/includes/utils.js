import store from '../store'
import router from '../router'
import * as THREE from 'three'
import * as CryptoJS from 'crypto-js'

var self = {
  notificationsArr: [],
  
  // ----------- Error handling -------------
  
  handleError: (message) => {
    store.dispatch('setErrorMessage', message)
    router.push('/error')
  },
  
  // ----------- Forms related -------------
  
  /*
   * Retrieves data from specific fields in a JSON array, and builds an array of {value: ..., label: ...} objects
   * which can be used in property "options" of <q-select> components
   * @param   data      Array   array of objects (usually from API or JSON file)
   * @param   fields    Object  field names used for value & label of select options.
   *                            Example: { valueField: 'id', labelField: 'name' }
   * @see https://stackoverflow.com/a/111545/488666
   */ 
  buildOptionsForSelect: (data, fields, translateFct) => {
    let optionsForSelect = []
    data.forEach((item) => {
      optionsForSelect.push({ value: item[fields.valueField], label: translateFct('label.' + item[fields.labelField]) })
    })
    return optionsForSelect
  },
  
  // ----------- Data related -------------
  
  /*
   * Finds object in an array of objects given an Id. Returns null if nothing is found.
   * @param   collection    Array   Array of Javascript objects having an 'id' property
   * @param   id            Number  Id of the object to find
   */
  getById: (collection, id) => {
    for (let i = 0; i < collection.length; i++) {
      if (collection[i].id === id) {
        return collection[i]
      }
    }
    return null
  },
  
  // ----------- Math related -------------
  
  degreesToRadians: (degrees) => {
    return degrees * Math.PI / 180
  },
  
  radiansToDegrees: (radians) => {
    return radians * 180 / Math.PI
  },
  
  // ----------- Geolocation related -------------
  
  /**
   * Calculates the distance between two positions in kilometers
   * see https://www.movable-type.co.uk/scripts/latlong.html
   * and https://stackoverflow.com/a/365853/488666
   *
   * @param lat1 - The latitude of the first position
   * @param lng1 - The longitude of the first position
   * @param lat2 - The latitude of the second position
   * @param lng2 - The longitude of the second position
   *
   * @return float - The distance in kilometers
   */
  distanceInKmBetweenEarthCoordinates: (lat1, lon1, lat2, lon2) => {
    let earthRadiusKm = 6371

    let dLat = self.degreesToRadians(lat2-lat1)
    let dLon = self.degreesToRadians(lon2-lon1)

    lat1 = self.degreesToRadians(lat1)
    lat2 = self.degreesToRadians(lat2)

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return earthRadiusKm * c
  },
  
  /**
   * Calculates the initial bearing between two positions as a value in degrees in the range 0-360°
   * see https://www.movable-type.co.uk/scripts/latlong.html
   *
   * @param lat1 - The latitude of the first position in degrees
   * @param lng1 - The longitude of the first position in degrees
   * @param lat2 - The latitude of the second position in degrees
   * @param lng2 - The longitude of the second position in degrees
   *
   * @return int - The bearing between 0° and 360°
   */
  bearingBetweenEarthCoordinates: function (lat1, lng1, lat2, lng2) {
    var dLon = self.degreesToRadians(lng2 - lng1)
    let lat1InRadians = self.degreesToRadians(lat1)
    let lat2InRadians = self.degreesToRadians(lat2)
    var y = Math.sin(dLon) * Math.cos(lat2InRadians)
    var x = Math.cos(lat1InRadians) * Math.sin(lat2InRadians) - Math.sin(lat1InRadians) * Math.cos(lat2InRadians) * Math.cos(dLon)
    var brng = self.radiansToDegrees(Math.atan2(y, x))
    return (brng + 360) % 360
  },
  
  /**
   * Replace break lines by html BR tag
   *
   * @param string - string to update
   *
   * @return string - the HTML formatted string
   */
  replaceBreakByBR: function(string) {
    if (string && (typeof string === 'string')) {
      string = string.replace(/\r\n/ig, "<br />")
      string = string.replace(/\n/ig, "<br />")
      string = string.replace(/\r/ig, "<br />")
    }
    
    return string
  },
  
  /**
   * Remplace accentuated chars by non accentuate and lower case char
   *
   * @param string - string to update
   *
   * @return string - the formatted string
   */
  removeAccents: function(s) {
    var r = s.toLowerCase(), 
      nonAsciis = {'a': '[àáâãäå]', 'ae': 'æ', 'c': 'ç', 'e': '[èéêë]', 'i': '[ìíîï]', 'n': 'ñ', 'o': '[òóôõö]', 'oe': 'œ', 'u': '[ùúûűü]', 'y': '[ýÿ]'}
    for (var i in nonAsciis) { 
      r = r.replace(new RegExp(nonAsciis[i], 'g'), i)
    }
    return r
  },
  
  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */
  shuffle: function(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  },
  
  /**
   * Build an incremental array (1,2,3, ...)
   * @param {Number}   length   length of the array
   */
  buildIncrementalArray: function(length) {
    var arr = [];

    for (var i = 1; i <= length; i++) {
       arr.push(i);
    }
    return arr;
  },
  
  /**
   * Checks if an email address is valid
   * @param   {String}    email       email
   */
  isValidEmail: function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (email && re.test(email)) {
        return true
    }
    return false
  },
  /**
   * Works like native setTimeout() function, except that it keeps the timeout ID
   * in Vue store for easier cleaning with clearAllTimeouts(),
   * otherwise cleaning all timeouts can prevent Webpack's hot module reloading to work.
   * @param     {Function}    func        The function to run after the timeout
   * @param     {Number}      duration    The timeout duration in milliseconds
   */
  setTimeout: function (func, duration) {
    let timeoutId = setTimeout(func, duration)
    store.dispatch('addTimeoutId', timeoutId)
    return timeoutId
  },
  /**
   * Clear all timeouts created in other pages
   */
  clearAllTimeouts: function () {
    for (let timeoutId of store.state.runningTimeoutsIds) {
      clearTimeout(timeoutId)
    }
    store.dispatch('clearTimeoutIds')
  },
  /**
   * Works like native setInterval() function, except that it keeps the interval ID
   * in Vue store for easier cleaning with clearAllIntervals()
   * @param     {Function}    func        The function to run after the interval
   * @param     {Number}      duration    The interval duration in milliseconds
   */
  setInterval: function (func, duration) {
    let intervalId = setInterval(func, duration)
    store.dispatch('addIntervalId', intervalId)
  },
  /**
   * Clear all intervals created in other pages
   */
  clearAllIntervals: function () {
    for (let intervalId of store.state.runningIntervalIds) {
      clearInterval(intervalId)
    }
    store.dispatch('clearIntervalIds')
  },
  
  /**
   * Clear all notifications
   */
  clearAllNotifications: function () {
    if (this.notificationsArr) {
      for (var i = 0; i < this.notificationsArr.length; i++) {
        this.notificationsArr[i]()
      }
      this.notificationsArr.length = 0
    }
  },
  clearAllRunningProcesses: function() {
    this.clearAllTimeouts()
    this.clearAllIntervals()
    this.clearAllNotifications()
    /* hide QR Code scanner
    if (window.cordova && QRScanner) {
      QRScanner.destroy(function(status) {
        console.log(status)
      })
    }*/
  },
  
  /**
   * Clear all tracks of a camera stream
   * from https://stackoverflow.com/a/47357550/488666
   */
  clearCameraStream: function (stream) {
    stream.getTracks().forEach(track => track.stop())
  },
  
  /*
  * By default, Javascript copies object references when doing assignments with '='.
  * This method can be useful when you want do make deep copies of objects and change their
  * properties independently afterwards.
  * see https://stackoverflow.com/a/5344074/488666
  * 
  * @param   {Object}   obj   object to clone
  */
  clone: function (obj) {
    if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj) {
      return obj
    }
    
    let temp = obj instanceof Date ? new obj.constructor() : obj.constructor()
    
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj['isActiveClone'] = null
        temp[key] = this.clone(obj[key])
        delete obj['isActiveClone']
      }
    }
    return temp
  },
  
  /**
   * Human readable file size
   * Adapted from https://stackoverflow.com/a/14919494/488666
   * @param {Number}    bytes         file size in bytes
   * @param {Boolean}   si            true => decimal, false => binary (default)
   * @param {Function}  translateFct  translation function (this.$t() in Vue)
   */
  humanReadableFileSize(bytes, si, translateFct) {
    var thresh = si ? 1000 : 1024
    var translatedByte = translateFct('label.byteCharacter')
    if (Math.abs(bytes) < thresh) {
      return bytes + ' ' + translatedByte
    }
    var units = si
      ? ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
      : ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi']
    var u = -1;
    units = units.map((unit) => { return unit + translatedByte })
    do {
      bytes /= thresh
      ++u
    } while (Math.abs(bytes) >= thresh && u < units.length - 1)
    return bytes.toFixed(1)+' '+units[u]
  },
  /**
   * generate a random 16 char string
   */
  randomId() {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (var i = 0; i < 16; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  },
    
  // ------------------------ Utils for THREE.js -------------------------------------
  
  /*
  * detach a 3D object from its parent
  * copied from https://github.com/mrdoob/three.js/blob/master/examples/js/utils/SceneUtils.js
  */
  detachObject3D: function (child, parent, scene) {
    child.applyMatrix(parent.matrixWorld)
    parent.remove(child)
    scene.add(child)
  },

  /*
  * attach a 3D object to a parent
  * copied from https://github.com/mrdoob/three.js/blob/master/examples/js/utils/SceneUtils.js
  * WARNING: changed order of parameters compared to original version
  */
  attachObject3D: function (child, parent, scene) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld))
    scene.remove(child)
    parent.add(child)
  },
  
  // --------------------- Utils for OFFLINE MODE -------------------------------
  
  /*
   * Init file storage for file writing / reading
   */
  initFileStorage: function(directory, fileName, createFile) {
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        resolve(false)
      }
      window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        if (!directory || directory === '') {
          fs.root.getFile(fileName, { create: createFile, exclusive: false }, function (fileEntry) {
            resolve(fileEntry)
          }, function() { resolve(false) })
        } else {
          fs.root.getDirectory(directory, {create: true}, function (dirEntry) {
            dirEntry.getFile(fileName, { create: createFile, exclusive: false }, function (fileEntry) {
              resolve(fileEntry)
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        }
      }, function() { resolve(false) })
    })
  },
  
  checkIfFileExists: function(directory, fileName, createFile) {
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        resolve(false)
      }
      window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        if (!directory || directory === '') {
          fs.root.getFile(fileName, { create: createFile, exclusive: false }, function (fileEntry) {
            resolve(true)
          }, function() { resolve(false) })
        } else {
          fs.root.getDirectory(directory, {create: true}, function (dirEntry) {
            dirEntry.getFile(fileName, { create: createFile, exclusive: false }, function (fileEntry) {
              resolve(true)
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        }
      }, function() { resolve(false) })
    })
  },
  
  /*
   * Write in a text file
   */
  writeInFile: function(directory, fileName, dataObj, createFile) {
    var _this = this
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        resolve(false)
      }
      window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        if (!directory || directory === '') {
          fs.root.getFile(fileName, { create: createFile, exclusive: false }, function (fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
              fileWriter.onwriteend = function() {
                resolve(true)
              }

              fileWriter.onerror = function (e) {
                let err = "Failed file write: " + e.toString()
                console.log(err)
                resolve(false)
              }

              // If data object is not passed in,
              // create a new Blob instead.
              if (!dataObj) {
                dataObj = new Blob(['some file data'], { type: 'text/plain' })
              }
              
              const encryptedContent = _this.gcrypt(dataObj, 'Gr44lyCryp7')
              fileWriter.write(encryptedContent)
            })
          }, function() { resolve(false) })
        } else {
          fs.root.getDirectory(directory, {create: true}, function (dirEntry) {
            dirEntry.getFile(fileName, { create: createFile, exclusive: false }, function (fileEntry) {
              fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function() {
                  resolve(true)
                }

                fileWriter.onerror = function (e) {
                  let err = "Failed file write: " + e.toString()
                  console.log(err)
                  resolve(false)
                }

                // If data object is not passed in,
                // create a new Blob instead.
                if (!dataObj) {
                  dataObj = new Blob(['some file data'], { type: 'text/plain' })
                }

              const encryptedContent = _this.gcrypt(dataObj, 'Gr44lyCryp7')
              fileWriter.write(encryptedContent)
              })
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        }
      }, function() { resolve(false) })      
    })
  },
  
  /*
   * Read text file
   */
  readFile: function(directory, fileName) {
    var _this = this
    return new Promise((resolve, reject) => {
      if (!fileName) {
        resolve(false)
      }
      if (!window.cordova) {
        resolve(false)
      }
      window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        if (!fs) {
          resolve(false)
        }
        if (!directory || directory === '') {
          fs.root.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
            if (!fileEntry) {
              resolve(false)
            }
            fileEntry.file(function (file) {
              if (!file) {
                resolve(false)
              }
              var reader = new FileReader()

              reader.onloadend = function() {
                const decryptedContent = _this.gcrypt(this.result, 'Gr44lyCryp7', true)
                resolve(decryptedContent)
              };

              reader.readAsText(file)
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        } else {
          fs.root.getDirectory(directory, {create: true}, function (dirEntry) {
            dirEntry.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
              if (!fileEntry) {
                resolve(false)
              }
              fileEntry.file(function (file) {
                if (!file) {
                  resolve(false)
                }
                var reader = new FileReader()

                reader.onloadend = function() {
                  const decryptedContent = _this.gcrypt(this.result, 'Gr44lyCryp7', true)
                  resolve(decryptedContent)
                };

                reader.readAsText(file)
              }, function() { resolve(false) })
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        }
      }, function() { resolve(false) })
    })
  },
  
  /*
   * save binary file
   */
  saveBinaryFile: function(directory, path, fileName) {
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        resolve(false)
      }
      // open local directory
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
        //get picture
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path + fileName, true)
        xhr.responseType = 'blob'
     
        xhr.onload = function() {
          if (this.status === 200) {
            var blob = new Blob([this.response], { type: 'image/png' })
            if (!directory || directory === '') {
              fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                // Create a FileWriter object for our FileEntry (log.txt).
                fileEntry.createWriter(function (fileWriter) {
                  fileWriter.onwriteend = function() {
                    resolve(true)
                  }
           
                  fileWriter.onerror = function(e) {
                      console.log("Failed file write: " + e.toString())
                  }
           
                  fileWriter.write(blob)
                })
              }, function() { resolve(false) })
            } else {
              fs.root.getDirectory(directory, {create: true}, function (dirEntry) {
                dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                  // Create a FileWriter object for our FileEntry (log.txt).
                  fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function() {
                      resolve(true)
                    }
             
                    fileWriter.onerror = function(e) {
                        console.log("Failed file write: " + e.toString())
                    }
             
                    fileWriter.write(blob)
                  })
                }, function() { resolve(false) })
              }, function() { resolve(false) })
            }
          } else {
            resolve(false)
          }
        }
        xhr.send()
      }, function() { resolve(false) })
    })
  },
  
  /*
   * read binary file
   */
  readBinaryFile: function(directory, fileName) {
    var _this = this
    return new Promise((resolve, reject) => {
      if (!fileName) {
        resolve(false)
      }
      if (!window.cordova) {
        resolve(false)
      }
      // open local directory
      window.requestFileSystem(window.TEMPORARY, 20 * 1024 * 1024, function (fs) {
        if (!fs) {
          resolve(false)
        }
        if (!directory || directory === '') {
          fs.root.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
            if (!fileEntry) {
              resolve(false)
            }
            fileEntry.file(function (file) {
              if (!file) {
                resolve(false)
              }
              var reader = new FileReader()
       
              reader.onloadend = function() {
                const mimeType = _this.getMimeType(fileName)
                var blob = new Blob([new Uint8Array(this.result)], { type: mimeType })
                resolve(window.URL.createObjectURL(blob))
              }
              reader.readAsArrayBuffer(file)
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        } else {
          fs.root.getDirectory(directory, {create: true}, function (dirEntry) {
            dirEntry.getFile(fileName, { create: false, exclusive: false }, function (fileEntry) {
              if (!fileEntry) {
                resolve(false)
              }
              fileEntry.file(function (file) {
                if (!file) {
                  resolve(false)
                }
                var reader = new FileReader()
         
                reader.onloadend = function() {
                  const mimeType = _this.getMimeType(fileName)
                  var blob = new Blob([new Uint8Array(this.result)], { type: mimeType })
                  resolve(window.URL.createObjectURL(blob))
                }
                reader.readAsArrayBuffer(file)
              }, function() { resolve(false) })
            }, function() { resolve(false) })
          }, function() { resolve(false) })
        }
      }, function() { resolve(false) })
    })
  },
  /*
   * Remove a directory
   */
  removeDirectory: function(directory) {
    return new Promise((resolve, reject) => {
      if (!window.cordova) {
        resolve(false)
      }
      window.requestFileSystem(window.TEMPORARY, 0, function (fs) {
        if (!fs) {
          resolve(false)
        }
        fs.root.getDirectory(directory, {create: false}, function (dirEntry) {
          dirEntry.removeRecursively(function () {
            resolve(true)
          }, function() { resolve(false) })
        }, function() { resolve(false) })
      }, function() { resolve(false) })
    })
  }, 
  getMimeType(fileName) {
    var mimeType = 'image/png'
    const ext = fileName.substr(-4)
    switch (ext) {
      case '.avi':
        mimeType = 'video/x-msvideo'
        break
      case '.gif':
        mimeType = 'image/gif'
        break
      case '.jpg':
      case 'jpeg':
        mimeType = 'image/jpeg'
        break
      case 'mpeg':
        mimeType = 'video/mpeg'
        break
      case '.mp4':
        mimeType = 'video/mp4'
        break
      case '.svg':
        mimeType = 'image/svg+xml'
        break
      case 'webm':
        mimeType = 'video/webm'
        break
      case '.glb':
        mimeType = 'model/gltf-binary'
        break
    }
    return mimeType
  },
  gcrypt(text, key, reverse) {
    if (reverse) {
      return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8)
    } else {
      return CryptoJS.AES.encrypt(text, key).toString()
    }
  },
  /**
   * Computes the average value of numbers provided in an array
   * @param   {Array}   arr   The array of numbers
   * @return  {Number}  The average
   */
  arrayAverage(arr) {
    let sum = arr.reduce(function(a, b) { return a + b })
    return sum / arr.length
  },
  /**
   * Checks if network is available
   * @return  {Boolean}  on hybrid: true if network is available, false otherwise.
   *                     other contexts (desktop, PWA...): returns always true (cannot use Cordova plugin "cordova-plugin-network-information")
   */
  isNetworkAvailable() {
    if (typeof navigator.connection === 'undefined' || typeof navigator.connection.type === 'undefined') {
      return true
    }
    return navigator.connection.type !== Connection.NONE
  }
}

export default self
