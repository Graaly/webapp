import MainLayout from 'layouts/main'

import QuestMap from 'pages/quest/map'
import QuestPlayHome from 'pages/quest/game/home'
import QuestPlayStep from 'pages/quest/game/step'
import QuestEnd from 'pages/quest/game/end'

import QuestManageWelcome from 'pages/quest/builder/welcome'
import QuestManageSettings from 'pages/quest/builder/settings'
import QuestManageStepType from 'pages/quest/builder/stepType'
import QuestManageStepSettings from 'pages/quest/builder/stepSettings'
//import QuestManageStepList from 'pages/quest/builder/stepList'

import UserLogin from 'pages/user/login'
import UserLogout from 'pages/user/logout'
import UserCreateAccount from 'pages/user/createAccount'
import UserFirstUsage from 'pages/user/firstusage'
/*import UserIntro from 'pages/user/intro'
import UserHelp from 'pages/user/help'
import UserSuccess from 'pages/user/success'
import UserProfile from 'pages/user/profile'
import UserProfileModify from 'pages/user/updateProfile'

import TeamMembersList from 'pages/team/membersList'
import TeamNewsList from 'pages/team/newsList'
import TeamChallengesList from 'pages/team/challengesList'
import TeamRankingList from 'pages/team/ranking'
*/
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
        path: 'quest/play/:questId(\\w{24})/step/:stepNumber',
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
        path: 'quest/:action(create|edit)/step/type',
        component: QuestManageStepType,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/create/step/settings',
        component: QuestManageStepSettings,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/edit/step/:stepId(\\w{24})',
        component: QuestManageStepSettings,
        meta: { requiresAuth: true }
      },
      /*{
        path: 'quest/:action(create|edit)/step/list',
        component: QuestManageStepList,
        meta: { requiresAuth: true }
      },
      {
        path: 'quest/edit/:questId(\\w{24})',
        component: QuestManageStepList,
        meta: { requiresAuth: true }
      },*/
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
      /*{
        path: 'intro',
        component: UserIntro,
        meta: { requiresAuth: false }
      },
      {
        path: 'help',
        component: UserHelp,
        meta: { requiresAuth: false }
      },
      {
        path: 'user/:id(\\w{24}|me)/success',
        name: 'success',
        component: UserSuccess,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/profile',
        name: 'profile',
        component: UserProfile,
        meta: { requiresAuth: true }
      },
      {
        path: 'user/profile/:id(\\w{24}|me)/modify',
        name: 'profileModification',
        component: UserProfileModify,
        meta: { requiresAuth: true }
      },
      {
        path: 'team/:id(\\w{24})/members',
        name: 'teamMembersList',
        component: TeamMembersList,
        meta: { requiresAuth: true }
      },
      {
        path: 'team/:id(\\w{24})/news',
        name: 'teamNewsList',
        component: TeamNewsList,
        meta: { requiresAuth: true }
      },
      {
        path: 'team/:id(\\w{24})/challenges',
        name: 'teamChallengesList',
        component: TeamChallengesList,
        meta: { requiresAuth: true }
      },
      {
        path: 'team/:id(\\w{24})/ranking',
        name: 'teamRankingList',
        component: TeamRankingList,
        meta: { requiresAuth: true }
      },*/
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