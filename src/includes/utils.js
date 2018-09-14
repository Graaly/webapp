import store from '../store'
import router from '../router'

var self = {
  
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
  }
}

export default self
