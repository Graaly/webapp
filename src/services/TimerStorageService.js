export default {
  /**
   * Store in local storage the time left of a specifique step on a specifique run
   * @param {*} runid
   * @param {*} stepid
   * @param {*} timeleft
   */
  storeTimeLeft(runid, stepid, timeleft) {
    var l = {
      runid: runid,
      stepid: stepid,
      timeleft: timeleft
    };
    l = JSON.stringify(l)
    localStorage.setItem("timer-" + runid + "-" + stepid, l)
  },

  /**
   * returns all the timers in the localstorage
   */
  allStorage() {
    let values = [];
    for (var j = 0, len = localStorage.length; j < len; j++) {
      var key = localStorage.key(j)
      var value = localStorage[key]
      if (key.includes("timer-")) {
        var l = {
          key: key,
          value: value
        };
        values.push(l)
      }
    }
    //console.log(values);
    return values
  },

  /**
   * get the time left base on the step and the run id
   * @param {*} runid
   * @param {*} stepid
   */
  getTimeLeft(runid, stepid) {
    var timers = this.allStorage()
    for (const t of timers) {
      var val = JSON.parse(t.value)
      if (val.runid === runid && val.stepid === stepid) {
        if (val.timeleft < 0) {
          //this should not appear offten but we never know
          val.timeleft = 0
        }
        return val.timeleft
      }
    }
    //if we found nothing retunr null
    return null
  },

  /**
   * Clear all the stored timers in the localstorage
   */
  clearStoredTimers() {
    var timers = this.allStorage()
    timers.forEach(t => {
      localStorage.removeItem(t.key)
    });
  }
};
