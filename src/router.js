import Vue from 'vue'
import VueRouter from 'vue-router'

import AuthService from './services/AuthService'

import QuestSearchMap from '@/quest/searchMap'
import QuestSearchText from '@/quest/searchText'
import QuestPlayHome from '@/quest/playHome'
import QuestPlayStep from '@/quest/playStep'
import QuestEnd from '@/quest/end'
import QuestManageWelcome from '@/quest/manage/welcome'
import QuestManageSettings from '@/quest/manage/settings'
import QuestManageStepType from '@/quest/manage/stepType'
import QuestManageStepSettings from '@/quest/manage/stepSettings'
import QuestManageStepList from '@/quest/manage/stepList'

import UserLogin from '@/user/login'
import UserLogout from '@/user/logout'
import UserCreateAccount from '@/user/createAccount'
import UserIntro from '@/user/intro'
import UserHelp from '@/user/help'
import UserProfile from '@/user/profile'
import UserPlayedQuests from '@/user/played'
import UserProfileModify from '@/user/updateProfile'

//import UserProfile from '@/user/profile'

import TeamMembersList from '@/team/membersList'
import TeamNewsList from '@/team/newsList'
import TeamChallengesList from '@/team/challengesList'

import ErrorMessage from '@/errorMessage'

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
      path: '/quest/play/:id(\\w{24})',
      component: QuestPlayHome
    },
    {
      path: '/quest/play/:questId(\\w{24})/step/:stepNumber',
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
      component: QuestManageWelcome
    },
    {
      path: '/quest/:action(create|edit)/settings',
      component: QuestManageSettings
    },
    {
      path: '/quest/:action(create|edit)/step/type',
      component: QuestManageStepType
    },
    {
      path: '/quest/create/step/settings',
      component: QuestManageStepSettings
    },
    {
      path: '/quest/edit/step/:stepId(\\w{24})',
      component: QuestManageStepSettings
    },
    {
      path: '/quest/:action(create|edit)/step/list',
      component: QuestManageStepList
    },
    {
      path: '/quest/edit/:questId(\\w{24})',
      component: QuestManageStepList
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
    {
      path: '/intro',
      component: UserIntro
    },
    {
      path: '/help',
      component: UserHelp
    },
    {
      path: '/user/profile/:id(\\w{24}|me)',
      name: 'profile',
      component: UserProfile
    },
    {
      path: '/user/quests/:id(\\w{24}|me)',
      name: 'playedQuests',
      component: UserPlayedQuests
    },
    {
      path: '/user/profile/:id(\\w{24}|me)/modify',
      name: 'profileModification',
      component: UserProfileModify
    },
    {
      path: '/team/:id(\\w{24})/members',
      name: 'teamMembersList',
      component: TeamMembersList
    },
    {
      path: '/team/:id(\\w{24})/news',
      name: 'teamNewsList',
      component: TeamNewsList
    },
    {
      path: '/team/:id(\\w{24})/challenges',
      name: 'teamChallengesList',
      component: TeamChallengesList
    },
    {
      path: '/team/:id(\\w{24})/ranking',
      name: 'teamRankingList',
      component: TeamChallengesList
    },
    {
      path: '/error',
      component: ErrorMessage
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
router.beforeEach(async (to, from, next) => {
  if (!to.meta.hasOwnProperty('requiresAuth') || to.meta.requiresAuth) {
    // this route requires auth, check if user is logged in.
    // if not, redirect to login page.
    if (!store.state.isLoggedIn || store.state.user === null || !store.state.user.hasOwnProperty('_id')) {
      next({
        path: '/user/login',
        query: { redirect: to.fullPath }
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
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    }
  } else {
    // authentication not required for this route
    next()
  }
})

export default router
