import Api from 'services/Api'

export default {
  async getOne (params) {
    let data = await this.get(params)
    return data.shift()
  },
  
  async get (params) {
    let res = await Api().get('steps', { params: params })
    return res.data
  },
  
  async getById (id) {
    let res = await Api().get('steps/' + id)
    return res.data
  },
  
  async count(params) {
    let res = await Api().get('steps/count', { params: params })
    return res.data.count
  },
  
  // if _id is not provided in data, create (POST), otherwise, update (PUT)
  save (data) {
    return data._id ? Api().put('steps/' + data._id, data): Api().post('steps', data)
  },
  
  remove(id) {
    return Api().delete('steps/' + id)
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
  
  // upload a video for 'info-video' step
  uploadVideo(questId, data) {
    return Api().post('/quest/' + questId + '/step/video/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload a jigsaw picture 'jigsaw puzzle' step
  uploadPuzzleImage(questId, data) {
    return Api().post('/quest/' + questId + '/step/jigsaw-puzzle/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  }
  
}
