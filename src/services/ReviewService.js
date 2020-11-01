import Api from "services/Api";

export default {
  /*
   * Add a review for the quest author
   * @param   {String}    questId                Quest Id
   * @param   {String}    version                Quest version
   * @param   {String}    runId                  Run Id
   * @param   {String}    text                   comment
   * @param   {Number}    rating                 rating between 1 and 5
   */
  add(questId, version, runId, text, rating) {
    return Api()
      .put("review/add", { questId, version, runId, text, rating })
      .catch(error => console.log(error.request));
  },
  /*
   * List reviews
   * @param   {Object}    filter         example: { questId: 'abcd123' }
   * @param   {Object}    options        Search options accepted by model 'list()' method: sort, limit, etc.
   */
  async list(filter, options) {
    let result = await Api().get("review/list", {
      params: {
        filter: JSON.stringify(filter),
        options: JSON.stringify(options)
      }
    });
    if (result.status !== 200) {
      throw new Error(
        "Request " +
          result.config.url +
          " failed with code " +
          result.status +
          "/" +
          result.statusText +
          ". Data returned: " +
          result.data
      );
    }
    return result;
  }
};
