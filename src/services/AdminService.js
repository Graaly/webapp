import Api from "services/Api";

export default {
  /*
   * List quests to validate
   */
  ListQuestsToValidate() {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/quests/tovalidate");
  },
  /*
   * List quests rejected
   */
  ListQuestsRejected() {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/quests/rejected");
  },
  /*
   * List the towns
   */
  ListTowns() {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/towns");
  },
  /*
   * List the statistics of best games
   */
  ListBestGames() {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/bestgames");
  },
  /*
   * List the earnings
   */
  ListEarnings() {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/earnings");
  },
  /*
   * Validate a quest
   */
  publish(id) {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/quests/publish/" + id);
  },
  /*
   * Add a town
   */
  CreateTown(data) {
    return Api(process.env.ADMIN_SERVERLESS_URL)
      .post("admin/town/add/", data)
      .catch(error => console.log(error.request));
  },
  /*
   * Reject a quest
   */
  reject(id) {
    return Api(process.env.ADMIN_SERVERLESS_URL)
    .get("admin/quests/reject/" + id);
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
