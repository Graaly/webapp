import AuthService from '../services/AuthService'
import store from '../store/index'
import * as Cookies from 'js-cookie'
import { Loading } from 'quasar'

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
              "coins": 100, 
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
          
          next()
        } else {
          Loading.show()
          let response = await AuthService.getAccount()
          Loading.hide()

          if (response && response.data && response.data.name) {
            if (response.data.clientSupportedVersion && response.data.clientSupportedVersion > "1.6.2") {
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
                // cookie expiration is in days. 36500 days = 100 years
                Cookies.set('firstusage', 'ok', { expires: 36500, secure: true })
                next({
                  path: '/firstusage'
                })
              }       
            } else {
              if (response && response.status) {
                if (response.status === 403) {
                  next({
                    path: '/user/login',
                    query: from.path === '/' ? null : { redirect: to.fullPath }
                  })
                } else {
                  next()
                }
              } else {
                // offline mode with store user data
                next()
              }
            }
          }
        }
      } else {
        // authentication not required for this route
        next()
      }
    } catch (e) {
      console.log(e)
      next()
    }
  })
}
