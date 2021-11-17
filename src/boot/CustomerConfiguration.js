// ============== CONSEIL DE L'EUROPE =============
import CustomerUserLogin from '../customers/conseil-europe/pages/user/login'
import CustomerQuestPlayHome from '../customers/conseil-europe/pages/quest/game/intro'
import CustomerQuestPlayStep from '../customers/conseil-europe/pages/quest/game/step'
import CustomerQuestPlayEnd from '../customers/conseil-europe/pages/quest/game/end'
// ============== OUIGO =============
//import CustomerQuestPlayHome from '../customers/ouigo/pages/quest/game/intro'
//import CustomerQuestPlayStep from '../customers/ouigo/pages/quest/game/step'
//import CustomerTeamPlay from '../customers/ouigo/pages/user/teamplay'

export default {
  LOGIN_PAGE: CustomerUserLogin,
  QUEST_PLAY_HOME: CustomerQuestPlayHome,
  QUEST_PLAY_STEP: CustomerQuestPlayStep,
  QUEST_PLAY_END: CustomerQuestPlayEnd,
  //TEAM_PLAY: CustomerTeamPlay
}