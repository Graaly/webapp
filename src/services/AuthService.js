import Api from 'services/Api'

export default {
  login (email, password) {
    return Api().post('login', {email: email, password: password})
  },
  
  logout () {
    return Api().post('logout')
  }, 
  
  getAccount (id) {
    if (id && id !== "me") {
      return Api().get('user/' + id)
    } else {
      return Api().get('account')
    }
  },
  
  createAccount(data) {
    return Api().post('user/create', data)
  },
  
  validateAccount(email, code) {
    return Api().post('account/validate', {email: email, code: code})
  }, 
  
  validateTeamInvitation(email, code) {
    return Api().post('team/invitation/confirm', {email: email, code: code})
  }, 
  
  newToActive() {
    return Api().post('account/newtoactive')
  }
  
}
