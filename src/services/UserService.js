import Api from 'services/Api'

export default {
    
  /*
   * List friends for the user
   */
  listFriends () {
    return Api().get('user/friends/list').catch(error => console.log(error.request))
  },
  /*
   * list creators near from connected user
   * @param   {Object}    location            user location
   * @param   {Number}    number              number of results
   */
  listNearCreators (location, number) {
    return Api().get('user/creators/' + location.lng + '-' + location.lat + '/' + number).catch(error => console.log(error.request))
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
    return Api().put('user/friends/news/' + id + '/like').catch(error => console.log(error.request))
  },
  /*
   * UnLike a news
   * @param   {String}    id                  ID of the news
   */
  unlikeNews(id) {
    return Api().put('user/friends/news/' + id + '/unlike').catch(error => console.log(error.request))
  },
  /*
   * Get a friend data
   * @param   {String}    id                  ID of the friend
   */
  getFriend (id) {
    return Api().get('user/' + id + '/profile').catch(error => console.log(error.request))
  },
  /*
   * Get current user ranking data
   */
  getRanking () {
    return Api().get('account/ranking').catch(error => console.log(error.request))
  },
  /*
   * challenge a friend
   * @param   {String}    friendId              ID of the friend
   * @param   {String}    runId                 ID of the run concerned
   */
  challengeFriend (friendId, runId) {
    return Api().post('user/friend/' + friendId + '/challenge/' + runId).catch(error => console.log(error.request))
  },
  /*
   * Get current user's best friends)
   */
  getBestFriends () {
    return Api().get('user/bestfriends').catch(error => console.log(error.request))
  },
  /*
   * Get organization data
   */
  getOrganization () {
    return Api().get('user/organization').catch(error => console.log(error.request))
  },
  /*
   * buy coins
   * @param   {String}    offer                  ID of the offer
   */
  buy (offer) {
    return Api().post('user/buy/offer/' + offer).catch(error => console.log(error.request))
  },
  /*
   * Save the new story step of the user
   * @param   {number}    step                  ID of the next story step
   */
  nextStoryStep (step) {
    return Api().post('user/story/step/' + step).catch(error => console.log(error.request))
  },
  /*
   * add friend
   * @param   {Object or String}    friendData          Data of the friend (phone, email, ID of friend...)
   */
  addFriend(friendData) {
    if (friendData.email && friendData.email.length > 0) {
      return Api().post('user/friends/add/email/' + friendData.email).catch(error => console.log(error.request))
    } else if (friendData.phone && friendData.phone.length > 0) {
      return Api().post('user/friends/add/phone/' + friendData.phone).catch(error => console.log(error.request))
    } else {
      return Api().post('user/friend/add/' + friendData).catch(error => console.log(error.request))
    }
  },
  /*
   * remove friend
   * @param   {String}    friendId          Id of the friend
   */
  removeFriend(id) {
    return Api().delete('user/friend/remove/' + id)
  },
  /*
   * check if contacts are app accounts
   * @param   {Array}    contacts          Array of contacts
   */
  checkContacts(contacts) {
    return Api().post('user/friends/contacts/check', {contacts: contacts}).catch(error => console.log(error.request))
  },
  /*
   * send a feedback
   * @param   {String}   message          Message
   * @param   {Object}   context          Context of the page the feedback is sent from
   */
  sendFeedback(message, context) {
    return Api().post('user/feedback/send', {message: message, context: context}).catch(error => console.log(error.request))
  }
  
}
