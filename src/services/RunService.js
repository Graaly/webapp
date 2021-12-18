import Api from "services/Api";

export default {
  /*
   * get run based on its ID (only for connected user)
   * @param   {String}    id                  ID of the run
   */
  getById(id) {
    return Api()
      .get("run/" + id)
      .catch(error => console.log(error.request));
  },
  /**
   * list runs for a quest and a user
   * @param   {String}    questId                  ID of the quest
   */
  listForAQuest(questId) {
    return Api()
      .get("run/quest/" + questId)
      .catch(error => console.log(error.request));
  },
  /*
   * list players that played this quest
   * @param   {String}    questId                  ID of the quest
   */
  listScoresForThisQuest(questId) {
    return Api()
      .get("run/quest/" + questId + "/ranking/scores")
      .catch(error => console.log(error.request));
  },
  /*
   * Get user score
   * @param   {String}    questId                  ID of the quest
   */
  listPlayersForThisQuest(questId) {
    return Api()
      .get("run/quest/" + questId + "/ranking/friends")
      .catch(error => console.log(error.request));
  },
  /*
   * get the number of players for a quest
   * @param   {String}    questId                  ID of the quest
   */
  checkNumberOfPlayers(questId) {
    return Api()
      .get("run/quest/" + questId + "/players/number")
      .catch(error => console.log(error.request));
  },
  /*
   * list players that played this quest
   * @param   {String}    questId                  ID of the quest
   */
  getRankingForAQuest(questId) {
    return Api()
      .get("run/quest/" + questId + "/ranking")
      .catch(error => console.log(error.request));
  },
  /*
   * update run data from off line data
   * @param   {Object}    data        Data of the step
   */
  updateFromOffline(data) {
    return Api()
      .put("run/" + data._id + "/quest/" + data.questId + "/update", data)
      .catch(error => console.log(error.request));
  },
  /*
   * Get the next step of current run on a quest
   * @param   {String}    questId                ID of the quest
   * @param   {String}    player                 Player number ('P1', 'P2', ...)
   */
  getNextStep(questId, player) {
    return Api()
      .get("run/" + questId + "/step/next/player/" + player)
      .catch(error => console.log(error.request));
  },
  /*
   * check if a market launch a new step
   * @param   {String}    questId                  ID of the quest
   * @param   {String}    markerCode             Code of the marker
   * @param   {String}    player                 Player number ('P1', 'P2', ...)
   */
  getMarkerNextStep(questId, markerCode, player) {
    return Api()
      .get(
        "run/" + questId + "/marker/" + markerCode + "/next/player/" + player
      )
      .catch(error => console.log(error.request));
  },
  /*
   * list the objects won until a specific run
   * @param   {String}    questId        ID of the quest
   * @param   {String}    runId          ID of the run
   */
  async listWonObjects(questId, runId) {
    let res = await Api()
      .get("quest/" + questId + "/runs/" + runId + "/objectswon")
      .catch(error => console.log(error.request));
    return res;
  },
  /*
   * get a step hint
   * @param   {String}    runId                 ID of the run
   * @param   {String}    stepId                ID of the step
   * @param   {String}    version               version of the step
   * @param   {String}    lang                  lang of the hint (if empty => user language)
   */
  async getHint(runId, stepId, version, lang) {
    if (!lang) {
      lang = "default";
    }
    let res = await Api().get(
      "run/" +
        runId +
        "/step/" +
        stepId +
        "/version/" +
        version +
        "/hint/lang/" +
        lang
    );
    return res.data;
  },
  /*
   * init a new run for current user for a quest
   * @param   {String}    questId             ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    lang                Language concerned
   * @param   {Boolean}   remotePlay          is the player playing remotely
   * @param   {Boolean}   dataSharedWithPartner          are the user data shared with partner
   * @param   {String}    teamNam             Name of the team (optional)
   */
  init(questId, version, lang, remotePlay, teamName, dataSharedWithPartner) {
    if (!teamName) {
      teamName = "noteamnamedefined";
    }
    return Api()
      .post(
        "run/quest/" +
          questId +
          "/version/" +
          version +
          "/init/" +
          lang +
          "/remote/" +
          remotePlay +
          "/team/" +
          teamName + 
          "/datashared/" +
          dataSharedWithPartner
      )
      .catch(error => console.log(error.request));
  },
  /*
   * init a new run for a teamplay
   * @param   {String}    questId             ID of the quest
   * @param   {String}    lang                Language concerned
   * @param   {String}    teamId              ID of the team
   * @param   {String}    teamName            Name of the team
   * @param   {String}    name                Name of the player
   */
  initTeamPlay(questId, lang, teamId, teamName, name) {
    return Api()
      .post(
        "run/teamplay/quest/" +
          questId +
          "/init/" +
          lang +
          "/" +
          teamId +
          "/" +
          teamName +
          "/" +
          name
      )
      .catch(error => console.log(error.request));
  },
  /*
   * add a team player
   * @param   {String}    code                Code to join
   */
  addTeamPlayer(code) {
    return Api()
      .post("run/join/" + code)
      .catch(error => console.log(error.request));
  },
  /*
   * create a team for a multiplayer game
   * @param   {String}    runId               ID of the run
   * @param   {String}    name                Team name
   */
  createATeam(runId, name) {
    return Api()
      .post(
        "run/quest/" +
          questId +
          "/version/" +
          version +
          "/init/" +
          lang +
          "/remote/" +
          remotePlay
      )
      .catch(error => console.log(error.request));
  },
  /*
   * check if a team is ready to start for a multiplayer game
   * @param   {String}    runId               ID of the run
   */
  checkTeamIsReady(runId) {
    return Api()
      .get("run/" + runId + "/check/team/ready")
      .catch(error => console.log(error.request));
  },
  /*
   * set a run as finished
   * @param   {String}    id                  ID of the run
   * @param   {Object}    offlineRunData      Data of the offline run
   * @param   {String}    questId             ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    lang                Language concerned
   */
  endRun(id, offlineRunData, questId, version, language) {
    return Api()
      .put(
        "run/" +
          id +
          "/quest/" +
          questId +
          "/version/" +
          version +
          "/lang/" +
          language +
          "/end",
        offlineRunData
      )
      .catch(error => console.log(error.request));
  },
  /*
   * skip a step
   * @param   {String}    id                  ID of the run
   * @param   {String}    stepId              ID of the step
   * @param   {String}    player              Player number ('P1', 'P2', ...)
   */
  passStep(id, stepId, player) {
    return Api()
      .put("run/" + id + "/passstep/" + stepId + "/player/" + player)
      .catch(error => console.log(error.request));
  },
  /*
   * remove in-progress runs for a user
   * @param   {String}    id                  ID of the quest
   */
  closeInProgressRuns(id) {
    return Api()
      .post("run/quest/" + id + "/close")
      .catch(error => console.log(error.request));
  },
  /*
   * create a multiplayer run for testers of the quest
   * @param   {String}    id                  ID of the quest
   */
  createMultiplayerRunForTesters(id) {
    return Api()
      .post("run/quest/" + id + "/test/create")
      .catch(error => console.log(error.request));
  }
};
