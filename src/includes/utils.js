export default {
  /*
   * Encodes query data for URL queries
   * @param   data   Object   key/values to encode in URL
   * @see https://stackoverflow.com/a/111545/488666
   */ 
  encodeQueryData(data) {
    let ret = []
    for (let d in data) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
    }
    return ret.join('&')
  }
}
