import Api from 'services/Api'

export default {
  getList (params) {
    return Api().get('runs', { params: params })
  },
  
  getById (id) {
    return Api().get('runs/' + id)
  },
  
  async getOne (params) {
    let res = await this.getList(params)
    return res.data.shift()
  },
  
  // if _id is not provided in data, create (POST), otherwise, update (PUT)
  save (data) {
    return data._id ? Api().put('runs/' + data._id, data): Api().post('runs', data)
  },
  
  endRun (id) {
    return Api().put('run/' + id + '/end')
  }
}
