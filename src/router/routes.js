import MainLayout from 'layouts/main'

import Home from 'pages/home'
import Map from 'pages/quest/map'

import QuestPlayHome from 'pages/quest/game/intro'
import QuestPlayStep from 'pages/quest/game/step'
import QuestEnd from 'pages/quest/game/end'

import QuestManage from 'pages/quest/builder/redirection'
import QuestManageWelcome from 'pages/quest/builder/welcome'
import QuestManageSettings from 'pages/quest/builder/settings'

import UserLogin from 'pages/user/login'
import UserLogout from 'pages/user/logout'
import UserProfile from 'pages/user/updateprofile'
import UserRanking from 'pages/user/ranking'
import UserQuests from 'pages/user/quests'
import UserFriends from 'pages/user/friends'
import UserBadges from 'pages/user/badges'
import Profile from 'pages/user/profile'

import Search from 'pages/search'

import Admin from 'pages/admin/admin'
import AdminValidation from 'pages/admin/validation'
import AdminMinigamesBuilder from 'pages/admin/minigamebuilder.vue'

import UserCreateAccount from 'pages/user/createAccount'
//import UserFirstUsage from 'pages/user/firstusage'
import ErrorMessage from 'pages/errorMessage'

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'none',
        redirect: '/home',
        meta: { requiresAuth: true }
      },
      {
        path: 'firstusage',
        name: 'firstusage',
        //component: UserFirstUsage,
        redirect: '/user/login',
        meta: { requiresAuth: false }
      },
      {
        path: 'home',
        name: 'home',
        component: Home,
        meta: { requiresAuth: true }
      },
      {
        path: 'map',
        name: 'map',
        component: Map,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/play/:id(\\w{24})',
        name: 'playhome',
        component: QuestPlayHome,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/play/:questId(\\w{24})/version/:version/step/:stepId/:lang',
        name: 'playstep',
        component: QuestPlayStep,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/:questId(\\w{24})/end',
        name: 'playend',
        component: QuestEnd,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/create',
        name: 'build',
        redirect: '/quest/create/welcome',
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/create/welcome',
        name: 'buildhome',
        component: QuestManageWelcome,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/builder/:questId(\\w{24})',
        name: 'builder',
        component: QuestManage,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/settings/:questId(\\w{24})',
        name: 'buildsettings',
        component: QuestManageSettings,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/createAccount/:step',
        name: 'signup',
        component: UserCreateAccount,
        meta: { requiresAuth: false }
      },
      {
        path: 'user/login',
        name: 'signin',
        component: UserLogin,
        meta: { requiresAuth: false }
      },
      {
        path: 'user/logout',
        name: 'signout',
        component: UserLogout,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/:id/quests/:type',
        name: 'quests',
        component: UserQuests,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/:id/friends',
        name: 'friends',
        component: UserFriends,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/:id/badges',
        name: 'badges',
        component: UserBadges,
        meta: { requiresAuth: true }
      },
      {
        path: 'search/:type/:subtype',
        name: 'search',
        component: Search,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/ranking/:type/:subtype',
        name: 'ranking',
        component: UserRanking,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile/:id',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/updateprofile',
        name: 'updateprofile',
        component: UserProfile,
        meta: { requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'admin',
        component: Admin,
        meta: { requiresAuth: true }
      },
      {
        path: 'admin/validate/:questId(\\w{24})/version/:version',
        name: 'adminvalidate',
        component: AdminValidation,
        meta: { requiresAuth: true }
      },
      {
        path: 'admin/minigames/builder',
        name: 'adminminigame',
        component: AdminMinigamesBuilder,
        meta: { requiresAuth: true }
      },
      {
        path: 'error/:errorType',
        name: 'error',
        component: ErrorMessage,
        meta: { requiresAuth: false }
      }
    ]
  },
  {
    path: '*',
    component: () => import('pages/404')
  }
]