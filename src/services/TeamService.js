import Api from 'services/Api'

export default {
  
  // get a team based on its ID
  getById (id) {
    return Api().get('team/' + id)
  },
  
  // create a new team
  create (data) {
    return Api().post('team/create', data)
  },
  
  // list a team members based on team ID
  listMembers (id) {
    return Api().get('team/' + id + '/members/list')
  },
  
  // list a team challenges
  listChallenges (id) {
    return Api().get('team/' + id + '/challenges/list')
  },
  
  // list monthly rankings for a team in town
  listMonthlyRankingsByTown (id) {
    return Api().get('team/' + id + '/rankings/bytown/list')
  },
  // list monthly rankings for a team
  listMonthlyRankings (id) {
    return Api().get('team/' + id + '/rankings/list')
  },
  
  // list a team join requests based on team ID
  // TODO : display join requests only to users members of the team
  listJoinRequests (id) {
    return Api().get('team/' + id + '/members/requests')
  },
  
  // list nearest teams
  listNearestTeams () {
    return Api().get('teams/nearest')
  },
  
  // list a team news
  listNews (id, skip, limit, done) {
    return Api().get('team/' + id + '/news/' + skip + '/' + limit).then(function (response) {
      done(false, response)
    })
  },
  
  // save a news
  saveNews(teamId, commentData) {
    return Api().post('/team/' + teamId + '/news/create', commentData)
  },
  
  // save a like on news
  likeNews(teamId, newsId) {
    return Api().put('/team/' + teamId + '/news/' + newsId + '/like')
  },
  // save a unlike on news
  unlikeNews(teamId, newsId) {
    return Api().put('/team/' + teamId + '/news/' + newsId + '/unlike')
  },
  
  // send an invitation in a team
  sendFriendInvitation(invitationData) {
    return Api().post('team/invitation', invitationData)
  },
  
  // send a join team request
  joinTeam(teamId) {
    return Api().get('team/' + teamId + '/join')
  },
  
  // accept team join request
  acceptJoinRequest(userId, teamId) {
    return Api().get('team/' + teamId + '/join/accept/' + userId)
  },
  // reject team join request
  rejectJoinRequest(userId, teamId) {
    return Api().get('team/' + teamId + '/join/reject/' + userId)
  },
  
  validChallenge(teamId, challengeId) {
    return Api().post('team/' + teamId + '/challenge/' + challengeId + '/validate')  
  }
  
}
