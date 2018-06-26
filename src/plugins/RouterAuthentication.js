import AuthService from '../services/AuthService'
import store from '../store/index'

export default ({ app, router, Vue }) => {
  // check if user is authenticated for specific routes
  // see https://forum.vuejs.org/t/how-to-set-up-a-global-middleware-or-a-route-guard-to-vue-router-js-help
  // see https://medium.com/front-end-hacking/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
  router.beforeEach(async (to, from, next) => {
    if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
      // this route requires auth, check if user is logged in.
      // if not, redirect to login page.
      if (!store.state.isLoggedIn || store.state.user === null || !store.state.user.hasOwnProperty('_id')) {
        next({
          path: '/user/login',
          query: from.path === '/' ? null : { redirect: to.fullPath }
        })
      } else {
        // call '/account'. if it returns a 404 error, user is not authenticated
        // => redirect to '/user/login' & clear store data
        let authRes = await AuthService.getAccount()
        if (authRes.status === 404) {
          // data in Vue store tells user is logged in, but '/account' call tells user is not authenticated => session has expired
          store.dispatch('logout')
          next({
            path: '/user/login',
            query: from.path === '/' ? null : { redirect: to.fullPath }
          })
        } else {
          // if user loads '/', redirect him to last loaded page (if possible)
          if (from.path === '/' && store.state.lastLoadedRoute !== null) {
            let lastLoadedRoute = store.state.lastLoadedRoute
            store.dispatch('setLastLoadedRoute', null).then(res => {
              next(lastLoadedRoute)
            })
          } else {
            store.dispatch('setLastLoadedRoute', to.path)
            next()
          }
        }
      }
    } else {
      // authentication not required for this route
      next()
    }
  })
}
