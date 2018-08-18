import Api from 'services/Api'

export default {
  /*
   * get run based on its ID (only for connected user)
   * @param   {String}    id                  ID f the run
   */
  getById (id) {
    return Api().get('run/' + id)
  },
  /*
   * list runs for a quest and a user
   * @param   {String}    questId                  ID f the quest
   */
  listForAQuest (questId) {
    return Api().get('run/quest/' + questId)
  },
  /*
   * list players that played this quest
   * @param   {String}    questId                  ID f the quest
   */
  listPlayersForThisQuest (questId) {
    return Api().get('run/quest/' + questId + '/ranking')
  },
  /*
   * get a step hint
   * @param   {String}    runId                 ID f the run
   * @param   {String}    stepId                ID of the step
   */
  async getHint (runId, stepId) {
    let res = await Api().get('run/' + runId + '/step/' + stepId + '/hint')
    return res.data
  },
  /*
   * init a new run for current user for a quest
   * @param   {String}    questId             ID f the quest
   * @param   {String}    lang                Language concerned
   */
  init(questId, lang) {
    return Api().post('run/quest/' + questId + '/init/' + lang)
  },
  /*
   * set a run as finished
   * @param   {String}    id                  ID f the run
   */
  endRun (id) {
    return Api().put('run/' + id + '/end')
  },
  /*
   * rate a run & a quest
   * @param   {String}    id                  ID f the run
   * @param   {String}    rating              Rating (1 > 5)
   */
  rate (id, rating) {
    return Api().put('run/' + id + '/rate/' + rating)
  }
}
