import Api from 'services/Api'

export default {
  /*
   * list the steps of a quest
   * @param   {String}    questId        ID of the quest
   */
  async listForAQuest (questId) {
    let res = await Api().get('quest/' + questId + '/steps').catch(error => console.log(error.request))
    return res
  },
  /*
   * list the steps of a chapter
   * @param   {String}    questId        ID of the quest
   * @param   {String}    chapterId      ID of the chapter
   */
  async listForAChapter (questId, chapterId) {
    let res = await Api().get('quest/' + questId + '/chapter/' + chapterId + '/steps').catch(error => console.log(error.request))
    return res
  },
  /*
   * list the objects won until a specific step of a quest
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId         ID of the step
   */
  async listWonObjects (questId, stepId) {
    let res = await Api().get('quest/' + questId + '/steps/' + stepId + '/objectswon').catch(error => console.log(error.request))
    return res
  },
  /*
   * get a step by its ID
   * @param   {String}    stepId         ID of the step
   */
  async getById (stepId) {
    let res = await Api().get('step/' + stepId).catch(error => console.log(error.request))
    return res
  },
  /*
   * get a step by its number
   * @param   {String}    questId        ID of the quest
   * @param   {String}    number         Number of the step
   */
  async getByNumber (questId, number) {
    let res = await Api().get('quest/' + questId + '/step/number/' + number).catch(error => console.log(error.request))
    return res
  },
  /*
   * check an answer
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId          ID of the step
   * @param   {String}    runId           ID of the run
   * @param   {Object}    answer          Answer to the step
   */
  async checkAnswer (questId, stepId, runId, answer) {
    let res = await Api().post('quest/' + questId + '/step/' + stepId + '/check/' + runId, answer).catch(error => console.log(error.request))
    return res
  },
  /*
   * count the steps for a quest
   * @param   {String}    questId        ID of the quest
   */
  async countForAQuest(questId) {
    let res = await Api().get('quest/' + questId + '/steps/count').catch(error => console.log(error.request))
    return res
  },
  /*
   * Save a step settings (or create if the step is not existing)
   * @param   {Object}    data        Data of the step
   */
  save (data) {
    return Api().put('quest/' + data.questId + '/step/' + data._id + '/update', data).catch(error => console.log(error.request))
  },
  /*
   * Save a chapter settings (or create if the channel is not existing)
   * @param   {Object}    data        Data of the step
   */
  modifyChapter (data) {
    return Api().put('quest/' + data.questId + '/chapter/' + data._id + '/update', data).catch(error => console.log(error.request))
  },
  /*
   * Remove a step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId         ID of the step
   */
  remove(questId, stepId) {
    return Api().delete('quest/' + questId + '/step/' + stepId + '/remove')
  },
  /*
   * Remove a chapter
   * @param   {String}    questId        ID of the quest
   * @param   {String}    chapterId      ID of the chapter
   */
  removeChapter(questId, chapterId) {
    return Api().delete('quest/' + questId + '/chapter/' + chapterId + '/remove')
  },
  /*
   * Move a step
   * @param   {String}    questId        ID of the quest
   * @param   {Number}    oldPosition    Old position of the step
   * @param   {Number}    newPosition    New position of the step
   */
  move(questId, oldPosition, newPosition) {
    return Api().put('quest/' + questId + '/step/' + oldPosition + '/move/' + newPosition).catch(error => console.log(error.request))
  },
  /*
   * Move a chapter
   * @param   {String}    questId        ID of the quest
   * @param   {Number}    oldPosition    Old position of the chapter
   * @param   {Number}    newPosition    New position of the chapter
   */
  moveChapter(questId, oldPosition, newPosition) {
    return Api().put('quest/' + questId + '/chapter/' + oldPosition + '/move/' + newPosition).catch(error => console.log(error.request))
  },
  /*
   * upload a background image for step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadBackgroundImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/background/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
  },
  /*
   * upload an image to recognize (for steps 'image-recognition')
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadImageToRecognize(questId, data) {
    return Api().post('/quest/' + questId + '/step/image-recognition/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request)) 
  },
  /*
   * upload an "answer image" (for step 'choose') 
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadAnswerImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/choose-image/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
  },
  /*
   * upload an "image" (for step 'memory') 
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadMemoryImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/memory/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request)) 
  },
  /*
   * upload an "answer image" (for step 'code-image') 
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadCodeAnswerImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/code-image/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request)) 
  },
  /*
   * upload a video for 'info-video' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadVideo(questId, data) {
    return Api().post('/quest/' + questId + '/step/video/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request)) 
  },
  /*
   * upload a jigsaw picture 'jigsaw puzzle' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadPuzzleImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/jigsaw-puzzle/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request)) 
  },
  /*
   * upload a item picture for 'new item' step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepType       step type code, like 'new-item'
   * @param   {Object}    data           upload data
   */
  uploadItemImage(questId, stepType, data) {
    return Api().post('/quest/' + questId + '/step/' + stepType + '/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
  }
}
