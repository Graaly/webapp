import AuthService from '../services/AuthService'
import store from '../store/index'
import * as Cookies from 'js-cookie'

export default ({ app, router, Vue }) => {
  // check if user is authenticated for specific routes
  router.beforeEach(async (to, from, next) => {
    try {
      if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
        let response = await AuthService.getAccount()
        
        if (response && response.data && response.data.name) {
          if (response.data.clientSupportedVersion && response.data.clientSupportedVersion > "1.3") {
            next({
              path: '/error/upgraderequired'
            })
          } else {
            store.state.user = response.data
          
            next()
          }
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
        // authentication not required for this route
        next()
      }
    } catch (e) {
      next()
    }
  })
}
