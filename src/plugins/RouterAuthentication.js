import AuthService from '../services/AuthService'
import store from '../store/index'

export default ({ app, router, Vue }) => {
  // check if user is authenticated for specific routes
  router.beforeEach(async (to, from, next) => {
    if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
      let response = await AuthService.getAccount()
      if (response.data && response.data.name) {
        store.state.user = response.data
        
        next()
      } else {
        next({
          path: '/user/login',
          query: from.path === '/' ? null : { redirect: to.fullPath }
        })
      }
    } else {
      // authentication not required for this route
      next()
    }
  })
}
