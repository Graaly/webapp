import Api from 'services/Api'

export default {
  
  // check email
  checkEmail(email) {
    return Api().get('check/email/' + email)
  },
  
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
  
  // change the password
  changePassword(email, password, code) {
    return Api().post('user/forgottenpassword/code/validate', {email: email, password: password, code: code})
  },
  
  // send a code for a new password
  sendForgottenPasswordCode(email) {
    return Api().post('user/forgottenpassword/code/generate', {email: email})
  },
  
  // send a code for a new password
  generateANewValidationCode(email) {
    return Api().post('user/validate/code/new', {email: email})
  }
}
