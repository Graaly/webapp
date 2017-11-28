import Vue from 'vue'
import VueRouter from 'vue-router'

import GraalySearch from '@/graaly/search'
import GraalyPlay from '@/graaly/play'
import GraalyCreate from '@/graaly/create'

import store from './store'

Vue.use(VueRouter)

/*
 * Uncomment this section and use "load()" if you want
 * to lazy load routes.
function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`)
}
*/

var router = new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      path: '/',
      redirect: '/graaly/search'
    },
    {
      path: '/graaly/search',
      component: GraalySearch
    },
    {
      path: '/graaly/play/:id',
      component: GraalyPlay
    },
    {
      path: '/graaly/create',
      component: GraalyCreate
    }
    /*{
      path: '/graaly/play/:id',
      component: GraalyPlay
    },{
      path: '/graaly/create',
      component: GraalyCreate
    },{
      path: '/user/profile',
      component: UserProfile
    },*/
  ]
})

// required to always have header title rendered ("Carte", "Graaly"...) after route change
// resetTitle() action is defined in store
router.beforeEach((to, from, next) => {
  store.dispatch('resetTitle')
  next()
})

export default router
