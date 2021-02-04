/**
 * Utility initializing, then checking periodically network quality
 * Used when playing a quest:
 * - stable network: check answers and update runs using web API
 * - unstable network: switch to 100% offline, including quest progression data handling
 */

//import Notification from "./NotifyHelper"
import utils from "../includes/utils"

export default ({ store }) => {
  store.setNetworkStatus(utils.isNetworkAvailable())
  
  // listen to navigator events telling if network has been disabled / enabled
  window.addEventListener('online', () => { console.log('ONLINE EVENT - Internet connection available'); store.setNetworkStatus(true) })
  window.addEventListener('offline', () => { console.log('OFFLINE EVENT - Internet connection lost'); store.setNetworkStatus(false) })
  
  // check periodically network quality
  // insipired from https://dev.to/oskarcodes/quick-javascript-tip-setinterval-with-modifiable-delay-4h1g and https://github.com/HubSpot/offline
  function checkNetwork () {
    let delay = store.state.networkCheckDelay
    console.log('NETWORK WILL BE CHECKED IN ' + delay + ' SECONDS')
    if (delay.current === null) {
      delay.current = delay.initial
    } else {
      // double the delay between each call, capped at 1 hour (in seconds)
      delay.current = Math.max(delay.current * 2, 3600) 
    }
    setTimeout(checkNetwork, store.state.networkCheckDelay.initial);
  }
  
  checkNetwork()
}
