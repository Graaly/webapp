import Api from 'services/Api'

export default {
  // list the steps of a quest
  async listForAQuest (questId) {
    let res = await Api().get('quest/' + questId + '/steps')
    return res.data
  },
  // list the objects won at a step
  async listWonObjects (questId, stepId) {
    let res = await Api().get('quest/' + questId + '/steps/' + stepId + '/objectswon/')
    return res.data
  },
  // get a step by its ID
  async getById (stepId) {
    let res = await Api().get('step/' + stepId)
    return res.data
  },
  // get a step by its number
  async getByNumber (questId, number) {
    let res = await Api().get('quest/' + questId + '/step/number/' + number)
    return res.data
  },
  // count the steps for a quest
  async countForAQuest(questId) {
    let res = await Api().get('quest/' + questId + '/steps/count')
    return res.data.count
  },
  
  // if _id is not provided in data, create (POST), otherwise, update (PUT)
  save (data) {
    return data._id 
      ? Api().put('quest/' + data.questId + '/step/' + data._id + '/update', data)
      : Api().post('quest/' + data.questId + '/step/create', data)
  },
  
  // remove a step
  remove(questId, stepId) {
    return Api().delete('quest/' + questId + '/step/' + stepId + '/remove')
  },
  
  // upload a background image for step
  uploadBackgroundImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/background/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload an image to recognize (for steps 'image-recognition')
  uploadImageToRecognize(questId, data) {
    return Api().post('/quest/' + questId + '/step/image-recognition/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload an "answer image" (for step 'choose') 
  uploadAnswerImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/choose-image/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload an "answer image" (for step 'code-image') 
  uploadCodeAnswerImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/code-image/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload a video for 'info-video' step
  uploadVideo(questId, data) {
    return Api().post('/quest/' + questId + '/step/video/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload a jigsaw picture 'jigsaw puzzle' step
  uploadPuzzleImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/jigsaw-puzzle/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  // upload a item picture for 'new item' step
  uploadItemImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/new-item/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  }
}
