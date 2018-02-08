import Api from 'services/Api'

export default {
  getList () {
    return Api().get('quests')
  },
  
  getById (id) {
    return Api().get('quests/' + id)
  },
  
  find(keyword, position) {
    // to update : better filter with position and keyword
    return Api().get('quests?title__regex=/' + keyword + '/i')  
  },
  
  // if _id is not provided in data, create (POST), otherwise, update (PUT)
  save (data) {
    return data._id ? Api().put('quests/' + data._id, data): Api().post('quests', data)
  },
  
  // list the quests created by a user
  ListCreatedByAUser (id) {
    return Api().get('user/' + id + '/quests/created')
  }
}
