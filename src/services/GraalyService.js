import Api from 'services/Api'

export default {
  getList () {
    return Api().get('graalies')
  },
  
  getById (id) {
    return Api().get('graalies/' + id)
  },
  
  find(keyword, position) {
    // to update : better filter with position and keyword
    return Api().get('graalies?title__regex=/' + keyword + '/i')  
  },
  
  // if _id is not provided in data, create (POST), otherwise, update (PUT)
  save (data) {
    return data._id ? Api().put('graalies/' + data._id, data): Api().post('graalies', data)
  }
}
