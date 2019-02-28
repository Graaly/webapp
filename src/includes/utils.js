import store from '../store'
import router from '../router'
import * as THREE from 'three'

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
   * Calculates the bearing between two positions as a value from 0-360
   * see https://www.movable-type.co.uk/scripts/latlong.html
   *
   * @param lat1 - The latitude of the first position
   * @param lng1 - The longitude of the first position
   * @param lat2 - The latitude of the second position
   * @param lng2 - The longitude of the second position
   *
   * @return int - The bearing between 0 and 360
   */
  bearingBetweenEarthCoordinates: function (lat1, lng1, lat2, lng2) {
    var dLon = (lng2 - lng1)
    var y = Math.sin(dLon) * Math.cos(lat2)
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
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
    // hide QR Code scanner
    if (window.cordova && QRScanner) {
      QRScanner.destroy(function(status) {
        console.log(status)
      })
    }
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
  
  // ------- Utils for THREE.js --------
  
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
  }
}

export default self
