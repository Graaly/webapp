import MainLayout from 'layouts/main'

import QuestSearchMap from 'pages/quest/searchMap'
import QuestSearchText from 'pages/quest/searchText'
import QuestPlayHome from 'pages/quest/playHome'
import QuestPlayStep from 'pages/quest/playStep'
import QuestEnd from 'pages/quest/end'
import QuestManageWelcome from 'pages/quest/manage/welcome'
import QuestManageSettings from 'pages/quest/manage/settings'
import QuestManageStepType from 'pages/quest/manage/stepType'
import QuestManageStepSettings from 'pages/quest/manage/stepSettings'
import QuestManageStepList from 'pages/quest/manage/stepList'

import UserLogin from 'pages/user/login'
import UserLogout from 'pages/user/logout'
import UserCreateAccount from 'pages/user/createAccount'
import UserIntro from 'pages/user/intro'
import UserHelp from 'pages/user/help'
import UserProfile from 'pages/user/profile'
import UserPlayedQuests from 'pages/user/played'
import UserProfileModify from 'pages/user/updateProfile'

import TeamMembersList from 'pages/team/membersList'
import TeamNewsList from 'pages/team/newsList'
import TeamChallengesList from 'pages/team/challengesList'
import TeamRankingList from 'pages/team/ranking'

import ErrorMessage from 'pages/errorMessage'

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/quest/search/map'
      },
      {
        path: 'home',
        redirect: '/quest/search/map'
      },
      {
        path: 'quest/search/text/:searchText',
        component: QuestSearchText
      },
      {
        path: 'quest/search/map',
        component: QuestSearchMap
      },
      {
        path: 'quest/play/:id(\\w{24})',
        component: QuestPlayHome
      },
      {
        path: 'quest/play/:questId(\\w{24})/step/:stepNumber',
        component: QuestPlayStep
      },
      {
        path: 'quest/:questId(\\w{24})/end',
        component: QuestEnd
      },
      {
        path: 'quest/create',
        redirect: '/quest/create/welcome'
      },
      {
        path: 'quest/create/welcome',
        component: QuestManageWelcome
      },
      {
        path: 'quest/:action(create|edit)/settings',
        component: QuestManageSettings
      },
      {
        path: 'quest/:action(create|edit)/step/type',
        component: QuestManageStepType
      },
      {
        path: 'quest/create/step/settings',
        component: QuestManageStepSettings
      },
      {
        path: 'quest/edit/step/:stepId(\\w{24})',
        component: QuestManageStepSettings
      },
      {
        path: 'quest/:action(create|edit)/step/list',
        component: QuestManageStepList
      },
      {
        path: 'quest/edit/:questId(\\w{24})',
        component: QuestManageStepList
      },
      {
        path: 'user/createAccount',
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
        component: UserLogout
      },
      {
        path: 'intro',
        component: UserIntro
      },
      {
        path: 'help',
        component: UserHelp
      },
      {
        path: 'user/profile/:id(\\w{24}|me)',
        name: 'profile',
        component: UserProfile
      },
      {
        path: 'user/quests/:id(\\w{24}|me)',
        name: 'playedQuests',
        component: UserPlayedQuests
      },
      {
        path: 'user/profile/:id(\\w{24}|me)/modify',
        name: 'profileModification',
        component: UserProfileModify
      },
      {
        path: 'team/:id(\\w{24})/members',
        name: 'teamMembersList',
        component: TeamMembersList
      },
      {
        path: 'team/:id(\\w{24})/news',
        name: 'teamNewsList',
        component: TeamNewsList
      },
      {
        path: 'team/:id(\\w{24})/challenges',
        name: 'teamChallengesList',
        component: TeamChallengesList
      },
      {
        path: 'team/:id(\\w{24})/ranking',
        name: 'teamRankingList',
        component: TeamRankingList
      },
      {
        path: 'error',
        component: ErrorMessage
      }
    ]
  },
  {
    path: '*',
    component: () => import('pages/404')
  }
]