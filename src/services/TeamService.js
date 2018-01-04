import Api from 'services/Api'

export default {
  // get teams list
  getList () {
    return Api().get('teams')
  },
  
  // get a team based on its ID
  getById (id) {
    return Api().get('teams/' + id)
  },
  
  // list a team members based on team ID
  listMembers (id) {
    return Api().get('users/?team.currentId=' + id)
  },
  
  // list a team news
  listNewsAsync (id, skip, limit, done) {
    return Api().get('news/?teamId=' + id + '&sort=-creation.date&skip=' + skip + '&limit=' + limit).then(function (response) {
      done(false, response)
    })
  },
  
  // save a news
  saveNews(commentData) {
    return Api().post('news', commentData)
  },
  
  // save a like on news
  saveNewsLike(id, likeData) {
    return Api().put('news/' + id, likeData)
  },
  
  // send an invitation in a team
  sendFriendInvitation(invitationData) {
    return Api().post('team/invitation', invitationData)
  }
}
