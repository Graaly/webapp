import Api from 'services/Api'

export default {
  /*
   * get run based on its ID (only for connected user)
   * @param   {String}    id                  ID of the run
   */
  getById (id) {
    return Api().get('run/' + id).catch(error => console.log(error.request))
  },
  /*
   * list runs for a quest and a user
   * @param   {String}    questId                  ID of the quest
   */
  listForAQuest (questId) {
    return Api().get('run/quest/' + questId).catch(error => console.log(error.request))
  },
  /*
   * list players that played this quest
   * @param   {String}    questId                  ID of the quest
   */
  listPlayersForThisQuest (questId) {
    return Api().get('run/quest/' + questId + '/ranking').catch(error => console.log(error.request))
  },
  /*
   * Get the next step of a run
   * @param   {String}    runId                  ID of the run
   */
  getNextStep (runId) {
    return Api().get('run/' + runId + '/step/next').catch(error => console.log(error.request))
  },
  /*
   * check if a market launch a new step
   * @param   {String}    runId                  ID of the run
   * @param   {String}    markerCode             Code of the marker
   */
  getMarkerNextStep (runId, markerCode) {
    return Api().get('run/' + runId + '/marker/' + markerCode + '/next').catch(error => console.log(error.request))
  },
  /*
   * list the objects won until a specific run
   * @param   {String}    questId        ID of the quest
   * @param   {String}    runId          ID of the run
   */
  async listWonObjects (questId, runId) {
    let res = await Api().get('quest/' + questId + '/runs/' + runId + '/objectswon').catch(error => console.log(error.request))
    return res
  },
  /*
   * get a step hint
   * @param   {String}    runId                 ID of the run
   * @param   {String}    stepId                ID of the step
   */
  async getHint (runId, stepId) {
    let res = await Api().get('run/' + runId + '/step/' + stepId + '/hint')
    return res.data
  },
  /*
   * init a new run for current user for a quest
   * @param   {String}    questId             ID of the quest
   * @param   {String}    lang                Language concerned
   * @param   {Boolean}   remotePlay          is the player playing remotely
   */
  init(questId, lang, remotePlay) {
    return Api().post('run/quest/' + questId + '/init/' + lang + '/remote/' + remotePlay).catch(error => console.log(error.request))
  },
  /*
   * set a run as finished
   * @param   {String}    id                  ID of the run
   */
  endRun (id) {
    return Api().put('run/' + id + '/end').catch(error => console.log(error.request))
  },
  /*
   * skip a step
   * @param   {String}    id                  ID of the run
   * @param   {String}    stepId              ID of the step
   */
  passStep(id, stepId) {
    return Api().put('run/' + id + '/passstep/' + stepId).catch(error => console.log(error.request))
  }
}
