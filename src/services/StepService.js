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
  }
}
