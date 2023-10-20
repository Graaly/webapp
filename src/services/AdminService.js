import Api from "services/Api";

export default {
  /*
   * List quests to validate
   */
  ListQuestsToValidate() {
    return Api().get("admin/quests/tovalidate");
  },
  /*
   * List quests rejected
   */
  ListQuestsRejected() {
    return Api().get("admin/quests/rejected");
  },
  /*
   * List the towns
   */
  ListTowns() {
    return Api().get("admin/towns");
  },
  /*
   * List the statistics of best games of month
   */
  ListBestGames() {
    return Api().get("admin/bestgames");
  },
  /*
   * List the statistics of best games of month
   */
  ListBestGamesForMonth() {
    return Api().get("admin/bestgames/month");
  },
  /*
   * List the statistics of best games of year
   */
  ListBestGamesForYear() {
    return Api().get("admin/bestgames/year");
  },
  /*
   * List what needs to by payed
   */
  ListNeedToPay() {
    return Api().get("admin/needtopay");
  },
  /*
   * List the earnings
   */
  ListEarnings() {
    return Api().get("admin/earnings");
  },
  /*
   * List the missing credits
   */
  ListMissingCredits() {
    return Api().get("admin/missingcredits");
  },
  /*
   * List the limitations (nb games buyed, ...)
   */
  ListLimitations() {
    return Api().get("admin/limitations");
  },
  /*
    * List the disabled quest (nquest.status = "disabled")
    */
  countQuestDisabled() {
    return Api().get("admin/quests/countDisabled")
  },
  /*
    * List the disabled quest (nquest.status = "disabled")
    */
  ListQuestDisabled(page, limit) {
    return Api().get("admin/quests/disabled/" + page + "/" + limit)
  },
  /*
   * Validate a quest
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    nbplays             Number of plays allowed
   */
  publish(id, nbplays) {
    return Api().get("admin/quests/publish/" + id + "/nbplays/" + nbplays);
  },
  /*
   * Increase number of plays allowed
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    nbplays             Number of plays allowed
   */
  increaseNumberOfPlaysAllowed(id, nbplays) {
    return Api().get("admin/quests/" + id + "/nbplays/" + nbplays);
  },
  /*
   * get Mail by UserId
   */
  getUserMail(id) {
    return Api().get("/user/" + id + "/profile/private");
  },
  /*
   * Add a town
   */
  CreateTown(data) {
    return Api()
      .post("admin/town/add/", data)
      .catch(error => console.log(error.request));
  },
  /*
   * Reject a quest
   */
  reject(id) {
    return Api().get("admin/quests/reject/" + id);
  },
  /*
   * Upload a place picture
   * @param   {Object}    data                picture data
   */
  uploadPlaceImage(data) {
    return Api()
      .post("/admin/town/place/picture/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  deleteFolder(id) {
    return Api().delete('/admin/delete/quest/' + id)
  }
};
