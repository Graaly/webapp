import AuthService from '../services/AuthService'
import store from '../store/index'
import * as Cookies from 'js-cookie'

export default ({ app, router, Vue }) => {
  // check if user is authenticated for specific routes
  router.beforeEach(async (to, from, next) => {
    try {
      if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
        // check if user is connected on hybrid app
        if (navigator.connection && navigator.connection.type && typeof Connection !== 'undefined' && navigator.connection.type === Connection.NONE) {
          // if session user data not already stored
          if (!store.state.user) {
            store.state.user = {
              "name": "Stranger", 
              "email": "-",
              "picture": "statics/icons/game/profile-big.png", 
              "sex": "male", 
              "age": "40-49", 
              "language": "fr", 
              "score": 0, 
              "coins": 0, 
              "status": "active", 
              "rankings": { "world": 99999999, "town": 99999999 }, 
              "level": 1, 
              "location": { 
                "postalCode": "75000",
                "country": "FRA",
                "geometry": { "coordinates": [ 5.7165413, 45.18942980000001 ], "type": "Point" }
              },
              "isAdmin": false, 
              "story": { "step": 17, "status": "new" } 
            }
          }
        } else {
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
            if (!store.state.user) {
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
            } else {
              next()
            }
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
