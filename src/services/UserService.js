import Api from 'services/Api'

export default {
    
  // get connected user account data
  listFriends (id) {
    return Api().get('user/friends/list')
  },
  // challenge a friend
  challengeFriend (friendId, runId) {
    return Api().post('user/friend/' + friendId + '/challenge/' + runId)
  }
  
}
