import Api from 'services/Api'
import utils from 'src/includes/utils'

export default {
  async getOne (params) {
    let data = await this.get(params)
    return data.shift()
  },
  
  async get (params) {
    let res = await Api().get('steps?' + utils.encodeQueryData(params))
    return res.data
  },
  
  async count(params) {
    let res = await Api().get('steps/count?' + utils.encodeQueryData(params))
    return res.data.count
  },
  
  // if _id is not provided in data, create (POST), otherwise, update (PUT)
  save (data) {
    return data._id ? Api().put('steps/' + data._id, data): Api().post('steps', data)
  },
  
  // upload a background image for step
  uploadBackgroundImage(questId, data) {
    console.log('uploadBackgroundImage', data)
    return Api().post('/quest/' + questId + '/step/background/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // upload a video for 'info-video' step
  uploadVideo(questId, data) {
    console.log('uploadVideo', data)
    return Api().post('/quest/' + questId + '/step/video/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  }
}
