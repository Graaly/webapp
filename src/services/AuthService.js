import Api from 'services/Api'

export default {
  /*
   * check if email is existing in Graaly
   * @param   {String}    email         Email to check
   */
  checkEmail(email) {
    return Api().get('check/email/' + email)
  },
  /*
   * Sign-in user
   * @param   {String}    email         User email
   * @param   {String}    password      User password
   */
  login (email, password) {
    return Api().post('login', {email: email, password: password})
  },
  /*
   * Sign-out user
   */
  logout () {
    return Api().post('logout')
  }, 
  /*
   * get connected user data
   * @param   {String}    id          User ID
   */
  getAccount (id) {
    if (id && id !== "me") {
      return Api().get('user/' + id)
    } else {
      return Api().get('account')
    }
  },
  /*
   * Create a new user
   * @param   {Object}    data          User data
   */
  createAccount(data) {
    return Api().post('user/create', data)
  },
  /*
   * Modify a user account
   * @param   {Object}    data          User data
   */
  modifyAccount(data) {
    return Api().post('user/modify', data)  
  },
  /*
   * Upload a user profile picture
   * @param   {Object}    data          Upload data
   */
  uploadAccountPicture(data) {
    return Api().post('/user/picture/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })  
  },
  /*
   * Validate a user account
   * @param   {String}    email         User email
   * @param   {String}    code          Validation code
   */
  // a user validate his account
  validateAccount(email, code) {
    return Api().post('account/validate', {email: email, code: code})
  },
  /*
   * Change a user password
   * @param   {String}    email         User email
   * @param   {String}    password      User password
   * @param   {String}    code          Validation code
   */
  changePassword(email, password, code) {
    return Api().post('user/forgottenpassword/code/validate', {email: email, password: password, code: code})
  },
  /*
   * Send a code to secure password modification (user not authentifyed)
   * @param   {String}    email         User email
   */
  sendForgottenPasswordCode(email) {
    return Api().post('user/forgottenpassword/code/generate', {email: email})
  },
  /*
   * Send a code to secure password modification (user authentified)
   * @param   {String}    email         User email
   */
  generateANewValidationCode(email) {
    return Api().post('user/validate/code/new', {email: email})
  }
}
