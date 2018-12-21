import Api from 'services/Api'

export default {
  /*
   * Add a review for the quest author
   * @param   {String}    questId                Quest Id
   * @param   {String}    runId                  Run Id
   * @param   {String}    text                   comment
   * @param   {Number}    rating                 rating between 1 and 5
   */
  add (questId, runId, text, rating) {
    return Api().put('review/add', { questId, runId, text, rating })
  },
  /*
   * List reviews
   * @param   {Object}    filter         example: { questId: 'abcd123' }
   * @param   {Object}    options        Search options accepted by model 'list()' method: sort, limit, etc.
   */
  list (filter, options) {
    return Api().get('review/list', { params: { filter: JSON.stringify(filter), options: JSON.stringify(options) } })
  }
}
