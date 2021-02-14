/**
 * Utility initializing, then checking periodically network quality
 * Used when playing a quest:
 * - stable network: check answers and update runs using web API
 * - unstable network: switch to 100% offline, including quest progression data handling
 */

import utils from "../includes/utils"

export default ({ store }) => {
  // listen to navigator events telling if network has been disabled / enabled
  window.addEventListener('online', () => {
    console.log('ONLINE EVENT - Internet connection available');
    store.dispatch('setNetworkStatus', true)
  })
  window.addEventListener('offline', () => {
    console.log('OFFLINE EVENT - Internet connection lost');
    store.dispatch('setNetworkStatus', false)
  })
  
  store.dispatch('setNetworkStatus', utils.isNetworkAvailable())
  store.dispatch('setNetworkCheckDelay', null) // reset delay
  // TEMP FOR TESTING
  //store.dispatch("checkNetworkPeriodically")
}
