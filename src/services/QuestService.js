import Api from 'services/Api'

export default {
  getList (params) {
    return Api().get('quests', { params: params })
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
  },
  
  // list the quests played by a user
  ListPlayedByAUser (id) {
    return Api().get('user/' + id + '/quests/played')
  },
  
  // upload a quest picture
  uploadPicture(data) {
    return Api().post('/quest/picture/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  }
}
