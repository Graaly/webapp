import Vue from 'vue'
import VueRouter from 'vue-router'

import QuestSearchMap from '@/quest/searchMap'
import QuestSearchText from '@/quest/searchText'
import QuestPlayHome from '@/quest/playHome'
import QuestPlayStep from '@/quest/playStep'
import QuestEnd from '@/quest/end'
import QuestCreateWelcome from '@/quest/create/welcome'
import QuestCreateSettings from '@/quest/create/settings'
import QuestCreateStepType from '@/quest/create/stepType'
import QuestCreateStepSettings from '@/quest/create/stepSettings'
import QuestCreateStepList from '@/quest/create/stepList'

import UserLogin from '@/user/login'
import UserLogout from '@/user/logout'
import UserCreateAccount from '@/user/createAccount'
//import UserProfile from '@/user/profile'

import TeamMembersList from '@/team/membersList'
import TeamNewsList from '@/team/newsList'
import TeamChallengesList from '@/team/challengesList'

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
      redirect: '/user/login',
      meta: { requiresAuth: false }
    },
    {
      path: '/home',
      redirect: '/quest/search/map'
    },
    {
      path: '/quest/search/text/:searchText',
      component: QuestSearchText
    },
    {
      path: '/quest/search/map',
      component: QuestSearchMap
    },
    {
      path: '/quest/play/:id',
      component: QuestPlayHome
    },
    {
      path: '/quest/play/:questId/step/:stepNumber',
      component: QuestPlayStep
    },
    {
      path: '/quest/end',
      component: QuestEnd
    },
    {
      path: '/quest/create',
      redirect: '/quest/create/welcome'
    },
    {
      path: '/quest/create/welcome',
      component: QuestCreateWelcome
    },
    {
      path: '/quest/create/settings',
      component: QuestCreateSettings
    },
    {
      path: '/quest/create/step/type',
      component: QuestCreateStepType
    },
    {
      path: '/quest/create/step/settings',
      component: QuestCreateStepSettings
    },
    {
      path: '/quest/create/step/list',
      component: QuestCreateStepList
    },
    {
      path: '/user/createAccount',
      component: UserCreateAccount,
      meta: { requiresAuth: false }
    },
    {
      path: '/user/login',
      component: UserLogin,
      meta: { requiresAuth: false }
    },
    {
      path: '/user/logout',
      component: UserLogout
    },
    /*{
      path: '/user/profile',
      component: UserProfile
    },*/
    {
      path: '/team/:id/members',
      name: 'teamMembersList',
      component: TeamMembersList
    },
    {
      path: '/team/:id/news',
      name: 'teamNewsList',
      component: TeamNewsList
    },
    {
      path: '/team/:id/challenges',
      name: 'teamChallengesList',
      component: TeamChallengesList
    },
    {
      path: '/team/:id/ranking',
      name: 'teamRankingList',
      component: TeamChallengesList
    },
    {
      path: '*',
      component: { template: '<div><p>Page not found</p></div>' } // TODO: better handling (log an error + show 'page not found' message + redirect to quest search ?)
    }
  ]
})

// required to always have header title rendered ("Carte", "Enquête"...) after route change
// resetTitle() action is defined in store
router.beforeEach((to, from, next) => {
  store.dispatch('resetTitle')
  next()
})

// check if user is authenticated for specific routes
// see https://forum.vuejs.org/t/how-to-set-up-a-global-middleware-or-a-route-guard-to-vue-router-js-help
// see https://medium.com/front-end-hacking/persisting-user-authentication-with-vuex-in-vue-b1514d5d3278
router.beforeEach((to, from, next) => {
  if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!store.state.isLoggedIn) {
      next({
        path: '/user/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
