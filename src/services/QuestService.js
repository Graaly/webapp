import Api from 'services/Api'

export default {
  /*
   * list quest near the user
   * @param   {Object}    location            user location
   * @param   {String}    type                type of quest
   */
  listNearest (location, type) {
    return Api().get('quests/nearest/' + location.lng + '-' + location.lat + '/' + type).catch(error => console.log(error.request))
  },
  /*
   * get a quest based on its ID
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    version             version of the quest
   */
  getById (id, version) {
    return Api().get('quest/' + id + '/version/' + version).catch(error => console.log(error.request))
  },
  /*
   * get the last version of a quest based on its ID
   * @param   {String}    id                  ID of the quest
   */
  getLastById (id) {
    return Api().get('quest/' + id + '/version/last').catch(error => console.log(error.request))
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
   * Create a quest
   * @param   {String}    id                Quest Id
   */
  createNewVersion (id) {
    return Api().post('quest/' + id + '/clone/draft').catch(error => console.log(error.request))
  },
  /*
   * Save a quest data
   * @param   {Object}    data                Quest data to update
   */
  save (data) {
    return Api().put('quest/' + data.questId + '/version/' + data.version + '/update', data).catch(error => console.log(error.request))
  },
  /*
   * Remove a quest
   * @param   {String}    id                Quest Id
   * @param   {Number}    version             version of the quest
   */
  remove (id, version) {
    return Api().delete('quest/' + id + '/version/' + version + '/remove')
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
    return Api().get('user/' + id + '/quests/created/count').catch(error => console.log(error.request))
  },
  /*
   * List the quests created by a user
   * @param   {String}    id                  ID of the user
   */
  ListCreatedByAUser (id) {
    return Api().get('user/' + id + '/quests/created').catch(error => console.log(error.request))
  },
  /*
   * List the quests played by a user
   * @param   {String}    id                  ID of the user
   */
  ListPlayedByAUser (id) {
    return Api().get('user/' + id + '/quests/played').catch(error => console.log(error.request))
  },
  /*
   * Upload a quest picture
   * @param   {Object}    data                picture data
   */
  uploadPicture(data) {
    return Api().post('/quest/picture/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
  },
  /*
   * Upload a quest thumb
   * @param   {Object}    data                picture data
   */
  uploadThumb(data) {
    return Api().post('/quest/thumb/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
  },
  
  /*
   * List the editors of a quest
   * @param   {String}    questId              questId
   * @param   {Number}    version             version of the quest
   */
  listEditors(questId, version) {
    return Api().get('quest/' + questId + '/version/' + version + '/editor/list').catch(error => console.log(error.request))
  },
  /*
   * Add an editor to a quest
   * @param   {String}    questId              questId
   * @param   {Number}    version             version of the quest
   * @param   {String}    email           email of the editor
   */
  addEditor (questId, version, email) {
    return Api().put('quest/' + questId + '/version/' + version + '/editor/add/' + email).catch(error => console.log(error.request))
  },
  /*
   * Remove a quest
   * @param   {String}    questId                Quest Id
   * @param   {Number}    version             version of the quest
   * @param   {String}    editorId               Editor Id
   */
  removeEditor (questId, version, editorId) {
    return Api().delete('quest/' + questId + '/version/' + version + '/editor/remove/' + editorId)
  }
}
