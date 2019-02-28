import AuthService from '../services/AuthService'
import store from '../store/index'
import * as Cookies from 'js-cookie'

export default ({ app, router, Vue }) => {
  // check if user is authenticated for specific routes
console.log("check")
  router.beforeEach(async (to, from, next) => {
    try {
console.log("check2")      
      if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
console.log("check4")              
        let response = await AuthService.getAccount()
console.log(response)
        if (response.data && response.data.name) {
          store.state.user = response.data
          
          next()
        } else {
          let firstusage = Cookies.get('firstusage')

          if (firstusage && firstusage === 'ok') {
            next({
              path: '/user/login',
              query: from.path === '/' ? null : { redirect: to.fullPath }
            })
          } else {
            Cookies.set('firstusage', 'ok', { expires: 432000000, secure: true })
            next({
              path: '/firstusage'
            })
          }        
        }
      } else {
console.log("check5")      
        // authentication not required for this route
        next()
      }
    } catch (e) {
console.log("check3")
      next()
    }
  })
}
