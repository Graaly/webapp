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
   * List the statistics of best games
   */
  ListBestGames() {
    return Api().get("admin/bestgames");
  },
  /*
   * List the earnings
   */
  ListEarnings() {
    return Api().get("admin/earnings");
  },
  /*
   * List the limitations (nb games buyed, ...)
   */
  ListLimitations() {
    return Api().get("admin/limitations");
  },
  /*
   * Validate a quest
   */
  publish(id) {
    return Api().get("admin/quests/publish/" + id);
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
  }
};
