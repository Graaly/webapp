import Api from 'services/Api'

export default {
  // list quest near the user
  listNearest (location, type) {
    return Api().get('quests/nearest/' + location.lng + '-' + location.lat + '/' + type)
  },
  // get a quest based on its ID
  getById (id) {
    return Api().get('quest/' + id)
  },
  
  find(keyword, location) {
    // to update : better filter with position and keyword
    return Api().get('quests/find/' + keyword + '/nearest/' + location.longitude + '-' + location.latitude)  
  },
  
  // Create a quest
  create (data) {
    return Api().post('quest/create', data)
  },
  // Save a quest data
  save (data) {
    return Api().put('quest/' + data._id + '/update', data)
  },
  
  // Publish a quest
  publish (id) {
    return Api().put('quest/' + id + '/publish')
  },
  // Publish a quest
  unpublish (id) {
    return Api().put('quest/' + id + '/unpublish')
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
