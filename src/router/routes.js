import MainLayout from 'layouts/main'

import QuestMap from 'pages/quest/map'
import QuestPlayHome from 'pages/quest/game/home'
import QuestPlayStep from 'pages/quest/game/step'
import QuestEnd from 'pages/quest/game/end'

import QuestManageWelcome from 'pages/quest/builder/welcome'
import QuestManageSettings from 'pages/quest/builder/settings'

import UserLogin from 'pages/user/login'
import UserLogout from 'pages/user/logout'
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
        redirect: '/map',
        meta: { requiresAuth: true }
      },
      {
        path: 'home',
        redirect: '/map',
        meta: { requiresAuth: true }
      },
      {
        path: 'firstusage',
        component: UserFirstUsage,
        meta: { requiresAuth: false }
      },
      {
        path: 'map',
        component: QuestMap,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/play/:id(\\w{24})',
        component: QuestPlayHome,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/play/:questId(\\w{24})/step/:stepNumber/:lang',
        component: QuestPlayStep,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/:questId(\\w{24})/end',
        component: QuestEnd,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/create',
        redirect: '/quest/create/welcome',
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/create/welcome',
        component: QuestManageWelcome,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/settings/:questId(\\w{24})',
        component: QuestManageSettings,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/createAccount/:email/:step',
        component: UserCreateAccount,
        meta: { requiresAuth: false }
      },
      {
        path: 'user/login',
        component: UserLogin,
        meta: { requiresAuth: false }
      },
      {
        path: 'user/logout',
        component: UserLogout,
        meta: { requiresAuth: true }
      },
      {
        path: 'error',
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