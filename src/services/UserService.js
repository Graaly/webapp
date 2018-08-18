import Api from 'services/Api'

export default {
    
  /*
   * List friends for the user
   */
  listFriends (id) {
    return Api().get('user/friends/list')
  },
  /*
   * Add a friend to the connected user
   * @param   {String}    id                  ID of the user
   */
  addFriend (id) {
    return Api().post('user/friend/add/' + id)
  },
  /*
   * challenge a friend
   * @param   {String}    friendId              ID of the friend
   * @param   {String}    runId                 ID of the run concerned
   */
  challengeFriend (friendId, runId) {
    return Api().post('user/friend/' + friendId + '/challenge/' + runId)
  }
  
}
