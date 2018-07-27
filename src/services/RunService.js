import Api from 'services/Api'

export default {
  // get run based on its ID (only for connected user)
  getById (id) {
    return Api().get('run/' + id)
  },
  // list runs for a quest and a user
  listForAQuest (questId) {
    return Api().get('run/quest/' + questId)
  },
  // get a step hint
  async getHint (runId, stepId) {
    let res = await Api().get('run/' + runId + '/step/' + stepId + '/hint')
    return res.data
  },
  // Save results of a step
  saveResult (runId, stepId, success) {
    return Api().put('run/' + runId + '/step/' + stepId + '/save/' + success)
  },
  // init a new run for current user for a quest
  init(questId) {
    return Api().post('run/quest/' + questId + '/init/')
  },
  // set a run as finished
  endRun (id) {
    return Api().put('run/' + id + '/end')
  },
  // rate a run & a quest
  rate (id, rating) {
    return Api().put('run/' + id + '/rate/' + rating)
  }
}
