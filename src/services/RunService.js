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
   * update run data from off line data
   * @param   {Object}    data        Data of the step
   */
  updateFromOffline (data) {
    return Api().put('run/' + data._id + '/quest/' + data.questId + '/update', data).catch(error => console.log(error.request))
  },
  /*
   * Get the next step of current run on a quest
   * @param   {String}    questId                ID of the quest
   */
  getNextStep (questId) {
    return Api().get('run/' + questId + '/step/next').catch(error => console.log(error.request))
  },
  /*
   * check if a market launch a new step
   * @param   {String}    questId                  ID of the quest
   * @param   {String}    markerCode             Code of the marker
   */
  getMarkerNextStep (questId, markerCode) {
    return Api().get('run/' + questId + '/marker/' + markerCode + '/next').catch(error => console.log(error.request))
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
   * @param   {String}    version               version of the step
   * @param   {String}    lang                  lang of the hint (if empty => user language)
   */
  async getHint (runId, stepId, version, lang) {
    if (!lang) {
      lang = 'default'
    }
    let res = await Api().get('run/' + runId + '/step/' + stepId + '/version/' + version + '/hint/lang/' + lang)
    return res.data
  },
  /*
   * init a new run for current user for a quest
   * @param   {String}    questId             ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    lang                Language concerned
   * @param   {Boolean}   remotePlay          is the player playing remotely
   */
  init(questId, version, lang, remotePlay) {
    return Api().post('run/quest/' + questId + '/version/' + version + '/init/' + lang + '/remote/' + remotePlay).catch(error => console.log(error.request))
  },
  /*
   * set a run as finished
   * @param   {String}    id                  ID of the run
   * @param   {Object}    offlineRunData      Data of the offline run
   * @param   {String}    questId             ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    lang                Language concerned
   */
  endRun (id, offlineRunData, questId, version, language) {
    return Api().put('run/' + id + '/quest/' + questId + '/version/' + version + '/lang/' + language + '/end', offlineRunData).catch(error => console.log(error.request))
  },
  /*
   * skip a step
   * @param   {String}    id                  ID of the run
   * @param   {String}    stepId              ID of the step
   */
  passStep(id, stepId) {
    return Api().put('run/' + id + '/passstep/' + stepId).catch(error => console.log(error.request))
  },
  /**
   * Updates run history index to go one step back
   * @param   {String}    id                  ID of the run
   */
  setHistoryOneStepBack(id) {
    return Api().get('run/' + id + '/historyonestepback').catch(error => console.log(error.request))
  }
}
