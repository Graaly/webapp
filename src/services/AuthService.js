import Api from "services/Api";

export default {
  /*
   * check if email is existing in Graaly
   * @param   {String}    email         Email to check
   */
  checkEmail(email) {
    return Api()
      .get("check/email/" + email)
      .catch(error => {
        console.log("checkEmail error: " + error);
      });
  },
  /*
   * Sign-in user
   * @param   {String}    email         User email
   * @param   {String}    password      User password
   */
  login(email, password) {
    return Api()
      .post("login", { email: email, password: password })
      .catch(error => console.log(error.request));
  },
  /*
   * Check the user facebook Id and facebook token, and sign him in
   * @param   {String}    fbId          Facebook Id
   * @param   {String}    token         Facebook Access Token
   */
  checkFacebookToken(fbId, token, done) {
    return Api()
      .post("login/facebook", { id: fbId, token: token })
      .then(function(response) {
        done(false, response);
      });
  },
  /*
   * create a dummy account for Anonymous game
   * @param   {String}    lang              user language
   */
  playAnonymous(lang) {
    return Api()
      .post("user/create/anonymous/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * Sign-out user
   */
  logout() {
    return Api()
      .post("logout")
      .catch(error => console.log(error.request));
  },
  /*
   * Remove a user account
   */
  removeAccount() {
    return Api()
      .post("account/remove")
      .catch(error => console.log(error.request));
  },
  /*
   * get connected user data
   * @param   {String}    id          User ID
   */
  getAccount(id) {
    if (id && id !== "me") {
      return Api()
        .get("user/" + id + "/profile")
        .catch(error => console.log(error.request));
    } else {
      return Api()
        .post("account", {})
        .catch(error => console.log(error.request));
    }
  },
  /*
   * Create a new user
   * @param   {Object}    data          User data
   */
  createAccount(data) {
    return Api()
      .post("user/create", data)
      .catch(error => console.log(error.request));
  },
  /*
   * Modify a user account
   * @param   {Object}    data          User data
   */
  modifyAccount(data) {
    return Api()
      .post("user/modify", data)
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a user profile picture
   * @param   {Object}    data          Upload data
   */
  uploadAccountPicture(data) {
    return Api()
      .post("/user/picture/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Validate a user account
   * @param   {String}    email         User email
   * @param   {String}    code          Validation code
   */
  // a user validate his account
  validateAccount(email, code) {
    return Api()
      .post("account/validate", { email: email, code: code })
      .catch(error => console.log(error.request));
  },
  /*
   * Change a user password
   * @param   {String}    email         User email
   * @param   {String}    password      User password
   * @param   {String}    code          Validation code
   */
  changePassword(email, password, code) {
    return Api()
      .post("user/forgottenpassword/code/validate", {
        email: email,
        password: password,
        code: code
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Send a code to secure password modification (user not authentifyed)
   * @param   {String}    email         User email
   */
  sendForgottenPasswordCode(email) {
    return Api()
      .post("user/forgottenpassword/code/generate", { email: email })
      .catch(error => console.log(error.request));
  },
  /*
   * Send a code to secure password modification (user authentified)
   * @param   {String}    email         User email
   */
  generateANewValidationCode(email) {
    return Api()
      .post("user/validate/code/new", { email: email })
      .catch(error => console.log(error.request));
  }
};
