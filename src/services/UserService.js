import Api from 'services/Api'

export default {
    
  /*
   * List friends for the user
   */
  listFriends () {
    return Api().get('user/friends/list')
  },  
  /*
   * List news of user's friend
   */
  listNews (limit, skip, done) {
    return Api().get('user/friends/news/list/' + limit + '/' + skip).then(function (response) {
      done(false, response)
    })
  },
  /*
   * Like a news
   * @param   {String}    id                  ID of the news
   */
  likeNews(id) {
    return Api().put('user/friends/news/' + id + '/like')
  },
  /*
   * UnLike a news
   * @param   {String}    id                  ID of the news
   */
  unlikeNews(id) {
    return Api().put('user/friends/news/' + id + '/unlike')
  },
  /*
   * Get a friend data
   * @param   {String}    id                  ID of the friend
   */
  getFriend (id) {
    return Api().get('user/' + id + '/profile')
  },
  /*
   * Get current user ranking data
   */
  getRanking () {
    return Api().get('account/ranking')
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
  },
  /*
   * Get current user's best friends)
   */
  getBestFriends () {
    return Api().get('user/bestfriends')
  },
  /*
   * buy coins
   * @param   {String}    offer                  ID of the offer
   */
  buy (offer) {
    return Api().post('user/buy/offer/' + offer)
  }
  
}
