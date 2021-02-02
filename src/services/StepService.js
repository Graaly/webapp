import Api from "services/Api"
import QuestService from "services/QuestService"

export default {
  /*
   * list the steps of a quest
   * @param   {String}    questId        ID of the quest
   * @param   {Number}    version        version of the quest
   * @param   {string}    lang           language
   */
  async listForAQuest(questId, version, lang) {
    if (!lang) {
      lang = "default"
    }
    let res = await Api()
      .get("quest/" + questId + "/version/" + version + "/steps/lang/" + lang)
      .catch(error => console.log(error.request))
    return res
  },
  /*
   * list the steps of a chapter
   * @param   {String}    questId        ID of the quest
   * @param   {String}    chapterId      ID of the chapter
   * @param   {Number}    version        version of the quest
   * @param   {string}    lang           language
   */
  async listForAChapter(questId, chapterId, version, lang) {
    if (!lang) {
      lang = "default"
    }
    let res = await Api()
      .get(
        "quest/" +
          questId +
          "/version/" +
          version +
          "/chapter/" +
          chapterId +
          "/steps/lang/" +
          lang
      )
      .catch(error => console.log(error.request))
    return res
  },
  /*
   * list the objects won until a specific step of a quest
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId         ID of the step
   * @param   {Number}    version        version of the quest
   */
  async listWonObjects(questId, stepId, version) {
    let res = await Api()
      .get(
        "quest/" +
          questId +
          "/version/" +
          version +
          "/steps/" +
          stepId +
          "/objectswon"
      )
      .catch(error => console.log(error.request))
    return res
  },
  /*
   * get a step by its ID
   * @param   {String}    stepId         ID of the step
   * @param   {String}    version        version of the quest
   * @param   {String}    lang           language
   */
  async getById(stepId, version, lang) {
    if (!lang) {
      lang = "default"
    }
    let res = await Api()
      .get("step/" + stepId + "/version/" + version + "/lang/" + lang)
      .catch(error => console.log(error.request))
    return res
  },
  /*
   * get a step by its number
   * @param   {String}    questId        ID of the quest
   * @param   {String}    number         Number of the step
   *
  async getByNumber (questId, number) {
    let res = await Api().get('quest/' + questId + '/step/number/' + number).catch(error => console.log(error.request))
    return res
  },*/
  /*
   * check an answer
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId          ID of the step
   * @param   {String}    runId           ID of the run
   * @param   {Object}    answer          Answer to the step
   * @param   {String}    player          Player number ('P1', 'P2', ...)
   */
  async checkAnswer(questId, stepId, version, runId, answer, player) {
    let res = await Api()
      .post(
        "quest/" +
          questId +
          "/version/" +
          version +
          "/step/" +
          stepId +
          "/check/" +
          runId +
          "/player/" +
          player,
        answer
      )
      .catch(error => console.log(error.request))
    return res
  },
  /*
   * count the steps for a quest
   * @param   {String}    questId        ID of the quest
   * @param   {Number}    version        version of the quest
   */
  async countForAQuest(questId, version) {
    let res = await Api()
      .get("quest/" + questId + "/version/" + version + "/steps/count")
      .catch(error => console.log(error.request))
    return res
  },
  /*
   * Save a step settings (or create if the step is not existing)
   * @param   {Object}    data        Data of the step
   */
  async save(data) {
    let res = await Api()
      .put(
        "quest/" +
          data.questId +
          "/version/" +
          data.version +
          "/step/" +
          data.stepId +
          "/update",
        data
      )
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    // TODO: clear + store new data only for current step
    await QuestService.removeFromCache(data.questId)

    return res
  },
  /*
   * Save a chapter settings (or create if the channel is not existing)
   * @param   {Object}    data        Data of the step
   */
  async modifyChapter(data) {
    let res = await Api()
      .put(
        "quest/" +
          data.questId +
          "/version/" +
          data.version +
          "/chapter/" +
          data.chapterId +
          "/update",
        data
      )
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    // TODO: clear + store new data only for current chapter
    await QuestService.removeFromCache(data.questId)

    return res
  },
  /*
   * Remove a step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepId         ID of the step
   */
  async remove(questId, stepId, version) {
    let res = await Api().delete(
      "quest/" + questId + "/version/" + version + "/step/" + stepId + "/remove"
    )

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * Remove a chapter
   * @param   {String}    questId        ID of the quest
   * @param   {String}    chapterId      ID of the chapter
   * @param   {Number}    version        version of the quest
   */
  async removeChapter(questId, chapterId, version) {
    let res = await Api().delete(
      "quest/" +
        questId +
        "/version/" +
        version +
        "/chapter/" +
        chapterId +
        "/remove"
    )

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * Move a step
   * @param   {String}    questId        ID of the quest
   * @param   {Number}    oldPosition    Old position of the step
   * @param   {Number}    newPosition    New position of the step
   * @param   {Number}    version        version of the quest
   */
  async move(questId, version, oldPosition, newPosition) {
    let res = await Api()
      .put(
        "quest/" +
          questId +
          "/version/" +
          version +
          "/step/" +
          oldPosition +
          "/move/" +
          newPosition
      )
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * Move a chapter
   * @param   {String}    questId        ID of the quest
   * @param   {Number}    oldPosition    Old position of the chapter
   * @param   {Number}    newPosition    New position of the chapter
   * @param   {Number}    version        version of the quest
   */
  async moveChapter(questId, version, oldPosition, newPosition) {
    let res = await Api()
      .put(
        "quest/" +
          questId +
          "/version/" +
          version +
          "/chapter/" +
          oldPosition +
          "/move/" +
          newPosition
      )
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a background image for step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadBackgroundImage(questId, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/background/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload an image to recognize (for steps 'image-recognition') - MPA 2020-09-24 not used since several months
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  /*async uploadImageToRecognize (questId, data) {
    let res = await Api().post('/quest/' + questId + '/step/image-recognition/upload', data, { timeout: 60000, headers: { 'Content-Type': 'multipart/form-data' } }).catch(error => console.log(error.request))
    
    // clears cached data if there is any
    await QuestService.removeFromCache(questId)
    
    return res
  },*/
  /*
   * upload an "answer image" (for step 'choose')
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadAnswerImage(questId, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/choose-image/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload an "image" (for step 'memory')
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadMemoryImage(questId, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/memory/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload an "answer image" (for step 'code-image')
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadCodeAnswerImage(questId, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/code-image/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a video for 'info-video' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadVideo(questId, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/video/upload", data, {
        timeout: 120000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a jigsaw picture 'jigsaw puzzle' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadPuzzleImage(questId, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/jigsaw-puzzle/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a item picture for 'new item' step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepType       step type code, like 'new-item'
   * @param   {Object}    data           upload data
   */
  async uploadItemImage(questId, stepType, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/" + stepType + "/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a 3D object for 'locate item ar' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadItemObject(questId, stepType, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/3dobject/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a picture for 'character' step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepType       step type code, like 'new-item'
   * @param   {Object}    data           upload data
   */
  async uploadCharacterImage(questId, stepType, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/character/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload alt picture for 'use-item' and 'find-item' step
   * @param   {String}    questId        ID of the quest
   * @param   {String}    stepType       step type code, like 'new-item'
   * @param   {Object}    data           upload data
   */
  async uploadAlternativeImage(questId, stepType, data) {
    let res = await Api()
      .post("/quest/" + questId + "/step/" + stepType + "/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request))

    // clears cached data if there is any
    await QuestService.removeFromCache(questId)

    return res
  },
  /*
   * upload a player snapshot for 'image-over-flow' step
   * @param   {String}    questId        ID of the quest
   * @param   {Object}    data           upload data
   */
  async uploadSnapshot(questId, data, done) {
    return Api().post("/quest/" + questId + "/snapshot/upload", data, { timeout: 600000, headers: { 'Content-Type': 'multipart/form-data' } }).then(function (response) {
      done(false, response)
    })
  },
  /*
   * Export the texts of the game
   * @param   {String}    questId        ID of the quest
   * @param   {String}    lang           language concerned
   * @param   {Number}    version        version of the quest
   */
  async generateTextsExportFile(questId, version, lang) {
    let res = await Api()
      .get(
        "quest/" +
          questId +
          "/version/" +
          version +
          "/" +
          lang +
          "/export/texts"
      )
      .catch(error => console.log(error.request))
    return res
  }
}
