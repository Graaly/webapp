import MainLayout from 'layouts/main'

import QuestMap from 'pages/quest/map'
import QuestPlayHome from 'pages/quest/game/home'
import QuestPlayStep from 'pages/quest/game/step'
import QuestEnd from 'pages/quest/game/end'

import QuestManageWelcome from 'pages/quest/builder/welcome'
import QuestManageSettings from 'pages/quest/builder/settings'

import UserLogin from 'pages/user/login'
import UserLogout from 'pages/user/logout'
import UserProfile from 'pages/user/updateprofile'

import Admin from 'pages/admin/admin'
import AdminValidation from 'pages/admin/validation'
import AdminMinigamesBuilder from 'pages/admin/minigamebuilder.vue'

import UserCreateAccount from 'pages/user/createAccount'
import UserFirstUsage from 'pages/user/firstusage'
import ErrorMessage from 'pages/errorMessage'

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'none',
        redirect: '/map',
        meta: { requiresAuth: true }
      },
      {
        path: 'home',
        name: 'home',
        redirect: '/map',
        meta: { requiresAuth: true }
      },
      {
        path: 'firstusage',
        name: 'firstusage',
        component: UserFirstUsage,
        meta: { requiresAuth: false }
      },
      {
        path: 'map',
        name: 'map',
        component: QuestMap,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/play/:id(\\w{24})',
        name: 'playhome',
        component: QuestPlayHome,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/play/:questId(\\w{24})/step/:stepNumber/:lang',
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
        path: 'quest/settings/:questId(\\w{24})',
        name: 'buildsettings',
        component: QuestManageSettings,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/createAccount/:email/:step',
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
        path: 'user/updateprofile',
        name: 'profile',
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
        path: 'admin/validate/:questId(\\w{24})',
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
        path: 'error',
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