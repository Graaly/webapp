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
  
  // list monthly rankings for a team
  listMonthlyRankings (id) {
    return Api().get('team/' + id + '/rankings/list')
  },
  
  // list a team join requests based on team ID
  // TODO : display join requests only to users members of the team
  listJoinRequests (id) {
    return Api().get('users/?team.wishedId=' + id)
  },
  
  // list nearest teams
  listNearestTeams () {
    return Api().get('teams/nearest')
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
