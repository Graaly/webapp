var self = module.exports = {
  /*
   * Encodes query data for URL queries
   * @param   data   Object   key/values to encode in URL
   * @see https://stackoverflow.com/a/111545/488666
   */ 
  encodeQueryData: (data) => {
    let ret = []
    for (let d in data) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
    }
    return ret.join('&')
  },
  
  degreesToRadians: (degrees) => {
    return degrees * Math.PI / 180
  },
  
  radiansToDegrees: (radians) => {
    return radians * 180 / Math.PI
  },
  
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
  }
}
