import Api from 'services/Api'

export default {
  login (email, password) {
    return Api().post('login', {email: email, password: password})
  },
  
  logout () {
    return Api().post('logout')
  }
}
