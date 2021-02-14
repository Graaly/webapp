import Api from "services/Api";

export default {
  /**
   * Makes a basic call to the web API (its only purpose being to check network
   * stability).
   * 
   * - If it fails due to timeout, app will detect that network is unstable
   * and therefore will switch automatically to "full offline" mode for quest playing
   * 
   * - If it succeeds, app will switch automatically to online mode
   */
  basicApiCall() {
    //console.log('*NetworkService basicApiCall*')
    return Api()
      .get("/", {'axios-retry': { retries: 0 }})
      .catch(error => console.log(error.request));
  }
}
