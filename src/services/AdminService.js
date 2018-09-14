import Api from 'services/Api'

export default {
    
  /*
   * List quests to validate
   */
  ListQuestsToValidate () {
    return Api().get('admin/quests/tovalidate')
  },
  /*
   * List quests rejected
   */
  ListQuestsRejected () {
    return Api().get('admin/quests/rejected')
  },
  /*
   * Validate a quest
   */
  publish (id) {
    return Api().get('admin/quests/publish/' + id)
  },
  /*
   * Reject a quest
   */
  reject (id) {
    return Api().get('admin/quests/reject/' + id)
  }
}
