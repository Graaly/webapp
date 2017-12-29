import Api from 'services/Api'

export default {
  getList () {
    return Api().get('teams')
  },
  
  getById (id) {
    return Api().get('teams/' + id)
  },
  
  listMembers (id) {
    return Api().get('users/?team.currentId=' + id)
  },
  listNews (id) {
    return Api().get('news/?teamId=' + id + '&sort=-creation.date')
  },
  
  saveNews(commentData) {
    return Api().post('news', commentData)
  }
}
