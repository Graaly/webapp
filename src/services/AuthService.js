import Api from 'services/Api'

export default {
  // user login
  login (email, password) {
    return Api().post('login', {email: email, password: password})
  },
  
  // user logout
  logout () {
    return Api().post('logout')
  }, 
  
  // get connected user account data
  getAccount (id) {
    if (id && id !== "me") {
      return Api().get('user/' + id)
    } else {
      return Api().get('account')
    }
  },
  
  // create a new user
  createAccount(data) {
    return Api().post('user/create', data)
  },
  
  // modify a user
  modifyAccount(data) {
    return Api().post('user/modify', data)  
  },
  
  //upload a user picture
  uploadAccountPicture(data) {
    return Api().post('/user/picture/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  
  // a user validate his account
  validateAccount(email, code) {
    return Api().post('account/validate', {email: email, code: code})
  }, 
  
  // accept a team invitation
  validateTeamInvitation(email, code) {
    return Api().post('team/invitation/confirm', {email: email, code: code})
  }, 
  
  // set an account as active after choosing a team (after /intro page)
  newToActive() {
    return Api().post('account/newtoactive')
  }
  
}
