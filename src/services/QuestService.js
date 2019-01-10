import Api from 'services/Api'

export default {
  /*
   * list quest near the user
   * @param   {Object}    location            user location
   * @param   {String}    type                type of quest
   */
  listNearest (location, type) {
    return Api().get('quests/nearest/' + location.lng + '-' + location.lat + '/' + type)
  },
  /*
   * get a quest based on its ID
   * @param   {String}    id                  ID of the quest
   */
  getById (id) {
    return Api().get('quest/' + id)
  },
  /*
   * Find quests based on keyword
   * @param   {String}    keyword             keyword
   * @param   {Object}    location            user location
   */
  find(keyword, location) {
    // to update : better filter with position and keyword
    return Api().get('quests/find/' + keyword + '/nearest/' + location.longitude + '-' + location.latitude)  
  },
  /*
   * Create a quest
   * @param   {Object}    data                Quest data (title, ...)
   */
  create (data) {
    return Api().post('quest/create', data).catch(error => console.log(error.request))
  },
  /*
   * Save a quest data
   * @param   {Object}    data                Quest data to update
   */
  save (data) {
    return Api().put('quest/' + data._id + '/update', data).catch(error => console.log(error.request))
  },
  /*
   * Remove a quest
   * @param   {String}    id                Quest Id
   */
  remove (id) {
    return Api().delete('quest/' + id + '/remove')
  },
  /*
   * Set the main language of a quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                language of the quest (en, fr, ...)
   */
  /*setFirstLanguage (questId, lang) {
    return Api().put('quest/' + questId + '/lang/set/' + lang)
  },*/
  /*
   * Add a language for the quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                language of the quest (en, fr, ...)
   */
  addLanguage (questId, lang) {
    return Api().put('quest/' + questId + '/lang/add/' + lang).catch(error => console.log(error.request))
  },
  /*
   * Publish a quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                Language concerned
   */
  publish (id, lang) {
    return Api().put('quest/' + id + '/publish/' + lang).catch(error => console.log(error.request))
  },
  /*
   * Unpublish a quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                Language concerned
   */
  unpublish (id, lang) {
    return Api().put('quest/' + id + '/unpublish/' + lang).catch(error => console.log(error.request))
  },
  /*
   * Count the quests created by a user
   * @param   {String}    id                  ID of the user
   */
  countForUser (id) {
    return Api().get('user/' + id + '/quests/created/count')
  },
  /*
   * List the quests created by a user
   * @param   {String}    id                  ID of the user
   */
  ListCreatedByAUser (id) {
    return Api().get('user/' + id + '/quests/created')
  },
  /*
   * List the quests played by a user
   * @param   {String}    id                  ID of the user
   */
  ListPlayedByAUser (id) {
    return Api().get('user/' + id + '/quests/played')
  },
  /*
   * Upload a quest picture
   * @param   {Object}    data                picture data
   */
  uploadPicture(data) {
    return Api().post('/quest/picture/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
  },
  
  /*
   * List the editors of a quest
   * @param   {String}    questId              questId
   */
  listEditors(questId) {
    return Api().get('quest/' + questId + '/editor/list')  
  },
  /*
   * Add an editor to a quest
   * @param   {String}    questId              questId
   * @param   {String}    email           email of the editor
   */
  addEditor (questId, email) {
    return Api().put('quest/' + questId + '/editor/add/' + email).catch(error => console.log(error.request))
  },
  /*
   * Remove a quest
   * @param   {String}    questId                Quest Id
   * @param   {String}    editorId               Editor Id
   */
  removeEditor (questId, editorId) {
    return Api().delete('quest/' + questId + '/editor/remove/' + editorId)
  }
}
