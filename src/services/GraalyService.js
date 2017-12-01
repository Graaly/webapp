import Api from 'services/Api'

export default {
  getList () {
    return Api().get('graalies')
  },
  
  getById (id) {
    return Api().get('graalies/' + id)
  }
}
