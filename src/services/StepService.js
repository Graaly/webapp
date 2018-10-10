import Api from 'services/Api'

export default {
  /*
   * list the steps of a quest
   * @param   {String}    questId        ID of the quest
   */
  async listForAQuest (questId) {
    let res = await Api().get('quest/' + questId + '/steps')
    return res.data
  },
  /*
   * list the objects won until a specific step of a quest
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId         ID of the step
   */
  async listWonObjects (questId, stepId) {
    let res = await Api().get('quest/' + questId + '/steps/' + stepId + '/objectswon')
    return res.data
  },
  /*
   * get a step by its ID
   * @param   {String}    stepId         ID of the step
   */
  async getById (stepId) {
    let res = await Api().get('step/' + stepId)
    return res.data
  },
  /*
   * get a step by its number
   * @param   {String}    questId        ID of the quest
   * @param   {String}    number         Number of the step
   */
  async getByNumber (questId, number) {
    let res = await Api().get('quest/' + questId + '/step/number/' + number)
    return res.data
  },
  /*
   * check an answer
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId          ID of the step
   * @param   {String}    runId           ID of the run
   * @param   {Object}    answer          Answer to the step
   */
  async checkAnswer (questId, stepId, runId, answer) {
    let res = await Api().post('quest/' + questId + '/step/' + stepId + '/check/' + runId, answer)
    return res.data
  },
  /*
   * count the steps for a quest
   * @param   {String}    questId        ID of the quest
   */
  async countForAQuest(questId) {
    let res = await Api().get('quest/' + questId + '/steps/count')
    return res.data.count
  },
  /*
   * Save a step settings (or create if the step is not existing)
   * @param   {Object}    data        Data of the step
   */
  save (data) {
    return Api().put('quest/' + data.questId + '/step/' + data._id + '/update', data)
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
   * upload a background image for step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadBackgroundImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/background/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload an image to recognize (for steps 'image-recognition')
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadImageToRecognize(questId, data) {
    return Api().post('/quest/' + questId + '/step/image-recognition/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload an "answer image" (for step 'choose') 
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadAnswerImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/choose-image/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload an "image" (for step 'memory') 
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadMemoryImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/memory/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload an "answer image" (for step 'code-image') 
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadCodeAnswerImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/code-image/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload a video for 'info-video' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadVideo(questId, data) {
    return Api().post('/quest/' + questId + '/step/video/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload a jigsaw picture 'jigsaw puzzle' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  uploadPuzzleImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/jigsaw-puzzle/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * upload a item picture for 'new item' step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepType       step type code, like 'new-item'
   * @param   {Object}    data           upload data
   */
  uploadItemImage(questId, stepType, data) {
    return Api().post('/quest/' + questId + '/step/' + stepType + '/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  }
}
