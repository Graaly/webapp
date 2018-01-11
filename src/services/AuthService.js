import Api from 'services/Api'

export default {
  login (email, password) {
    return Api().post('login', {email: email, password: password})
  },
  
  logout () {
    return Api().post('logout')
  }, 
  
  getAccount () {
    return Api().get('account')
  },
  
  createAccount(data) {
    return Api().post('users', data)
  }
}
