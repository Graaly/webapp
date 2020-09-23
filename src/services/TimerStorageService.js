import { v4 as uuidv4 } from 'uuid';
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
        }
        l = JSON.stringify(l);
        console.log(l);
        localStorage.setItem("timer-" + uuidv4(), l)
    },

    /**
     * returns all the timers in the localstorage
     */
    allStorage() {
        let values = [];
        for (var j = 0, len = localStorage.length; j < len; j++) {
            var key = localStorage.key(j);
            var value = localStorage[key];
            if (key.includes("timer-")) {
                var l = {
                    key: key,
                    value: value
                }
                values.push(l);
            }
        }
        console.log(values);
        return values;
    },

    /**
     * get the time left base on the step and the run id
     * @param {*} runid 
     * @param {*} stepid 
     */
    getTimeLeft(runid, stepid) {
        var timers = this.allStorage();
        timers.forEach(t => {
            var val = JSON.parse(t.value);
            if (val.runid === runid && val.stepid === stepid) {
                console.log("nljsdjflsdjfksjdlf")
                return val.timeleft;
            }
        })
        return null;
    },

    /**
     * Clear all the stored timers in the localstorage
     */
    clearStoredTimers() {
        var timers = this.allStorage();
        timers.forEach(t => {
            localStorage.removeItem(t.key);
        })
    }
}
