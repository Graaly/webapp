import Api from "services/Api"
import utils from "src/includes/utils"
import store from '../store/index'

export default {
  /*
   * list quest near the user
   * @param   {Object}    location            user location
   * @param   {String}    lang                language
   */
  listNearest(location, lang) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get(
        "quests/nearest/" +
          location.longitude +
          "-" +
          location.latitude +
          "/0/lang/" +
          lang
      )
      .catch(error => console.log(error.request));
  },
  listNearestSync(location, lang, skip, done) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get(
        "quests/nearest/" +
          location.longitude +
          "-" +
          location.latitude +
          "/" +
          skip +
          "/lang/" +
          lang
      )
      .then(function(response) {
        done(false, response);
      });
  },
  /*
   * list quest displayed on home page
   * @param   {Object}    location            user location
   * @param   {String}    type                type of quest
   * @param   {String}    lang                language
   */
  listHomeQuests(location, lang) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get("quests/home/" + location.lng + "-" + location.lat + "/lang/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * list quests for a country
   */
  listAllForCountry() {
    return Api()
      .get("quests/country/FR")
      .catch(error => console.log(error.request));
  },
  /*
   * list quests played by friends
   * @param   {String}    lang                language
   */
  listFriendQuests(lang) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get("quests/friends/played/0/lang/" + lang)
      .catch(error => console.log(error.request));
  },
  listFriendQuestsync(lang, skip, done) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get("quests/friends/played/" + skip + "/lang/" + lang)
      .then(function(response) {
        done(false, response);
      });
  },
  /**
   * Get quest data based on its ID when playing a step
   * It uses local caching mechanism & uses Vuex store info about network
   * to decide if it should call server or retrieve local data
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    lang                language
   */
  async getByIdForStep(id, version = 999, lang = "default") {
    // Note: quest.customization.forceOnline info is stored in Vuex store & cannot be used for this method
    
    if (!window.cordova) {
      const onlineQuest = await this.getByIdOnline(id, version, lang)
      return onlineQuest.data
    }
    
    // check if the quest data are not already saved on device
    let isQuestOfflineLoaded = this.isCached(id)
    
    if (!isQuestOfflineLoaded && store.state.networkMode === 'online') {
      try {
        const onlineQuest2 = await this.getByIdOnline(id, version, lang)
        return onlineQuest2.data
      } catch (err) {
        if (store.state.forceOnline) {
          console.error("getByIdForStep(): could not retrieve quest data (online mode)", err)
          throw err
        }
        
        // timeout => go reach offline loading below + switch to offline mode
        store.commit('setNetworkMode', 'offline')
        console.log('switch to offline mode')
      }
    }
    
    // reaching this point means that we have to retrieve quest data from local cache
    return this.getByIdOffline(id, version, lang)
  },
  /**
   * get a quest based on its ID (online mode)
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    lang                language
   */
  async getByIdOnline(id, version = "999", lang = "default") {
    let res = await Api().get("quest/" + id + "/version/" + version + "/lang/" + lang)
    if (!res.hasOwnProperty('data')) {
      throw new Error("Could not retrieve quest data from server, for id '" + id + "', version '" + version + "', lang '" + lang + "'")
    }
    return res
  },
  /**
   * get a quest based on its ID (offline mode)
   * @param   {String}    id                  ID of the quest
   */
  async getByIdOffline(id) {
    // get quest data from device storage
    let quest = await utils.readFile(id, 'quest_' + id + '.json')
    
    if (!quest) {
      throw new Error("Could not load quest with Id '" + id + "' from cache")
    }
    
    quest = JSON.parse(quest)

    const pictureUrl = await utils.readBinaryFile(id, quest.picture[this.lang])
    if (pictureUrl) {
      quest.picture = pictureUrl
    }
    // get customized logo
    if (quest.customization && quest.customization.logo && quest.customization.logo !== '') {
      const logoUrl = await utils.readBinaryFile(id, quest.customization.logo)
      if (logoUrl) {
        quest.customization.logo = logoUrl
      }
    }
    // get customized sound
    if (quest.customization && quest.customization.audio) {
      let mainLang = quest.mainLanguage
      if (quest.customization.audio[this.lang] && quest.customization.audio[this.lang] !== '') {
        const audioUrl = await utils.readBinaryFile(id, quest.customization.audio[this.lang])
        if (audioUrl) {
          quest.customization.audio[this.lang] = audioUrl
        }
      } else if (this.lang !== mainLang && quest.customization.audio[mainLang] && quest.customization.audio[mainLang] !== '') {
        // no audio available in current language => try to load audio for main language if different from current language 
        const audioUrl = await utils.readBinaryFile(id, quest.customization.audio[mainLang])
        if (audioUrl) {
          quest.customization.audio[mainLang] = audioUrl
        }
      }
    }
    // get customized hint character
    if (quest.customization && quest.customization.character && quest.customization.character !== '') {
      const characterUrl = await utils.readBinaryFile(id, quest.customization.character)
      if (characterUrl) {
        quest.customization.character = characterUrl
      }
    }
  
    return quest
  },
  /*
   * get a quest media size
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    version             version of the quest
   */
  getSize(id, version) {
    return Api()
      .get("quest/" + id + "/version/" + version + "/size")
      .catch(error => console.log(error.request));
  },
  /**
   * get the last version of a quest based on its ID
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                language
   */
  getLastById(id, lang = "default") {
    return this.getByIdOnline(id, 999, lang)
  },
  /*
   * Find quests based on keyword
   * @param   {String}    keyword             keyword
   * @param   {Object}    location            user location
   * @param   {String}    lang                language
   */
  find(keyword, location, lang) {
    if (!lang) {
      lang = "default";
    }
    // to update : better filter with position and keyword
    return Api().get(
      "quests/find/" +
        keyword +
        "/nearest/" +
        location.longitude +
        "-" +
        location.latitude +
        "/0/lang/" +
        lang
    );
  },
  findSync(keyword, location, lang, skip, done) {
    if (!lang) {
      lang = "default";
    }
    // to update : better filter with position and keyword
    return Api()
      .get(
        "quests/find/" +
          keyword +
          "/nearest/" +
          location.longitude +
          "-" +
          location.latitude +
          "/" +
          skip +
          "/lang/" +
          lang
      )
      .then(function(response) {
        done(false, response);
      });
  },
  /*
   * Create a quest
   * @param   {Object}    data                Quest data (title, ...)
   * @param   {String}    access              public or private
   * @param   {String}    userType            pro / individual
   * @param   {String}    questType           quest / room
   */
  create(data, access, userType, questType) {
    return Api()
      .post("quest/create/" + questType + "/" + access + "/" + userType, data)
      .catch(error => console.log(error.request));
  },
  /*
   * Create a quest
   * @param   {String}    id                Quest Id
   */
  createNewVersion(id) {
    return Api()
      .post("quest/" + id + "/clone/draft")
      .catch(error => console.log(error.request));
  },
  /*
   * Save a quest data
   * @param   {Object}    data                Quest data to update
   */
  save(data) {
    return Api()
      .put(
        "quest/" + data.questId + "/version/" + data.version + "/update",
        data
      )
      .catch(error => console.log(error.request));
  },
  /*
   * Remove a quest
   * @param   {String}    id                Quest Id
   * @param   {Number}    version             version of the quest
   */
  remove(id, version) {
    return Api().delete("quest/" + id + "/version/" + version + "/remove");
  },
  /*
   * Duplicate a quest
   * @param   {String}    id                Quest Id
   * @param   {Number}    version             version of the quest
   */
  clone(id, version) {
    return Api().post("quest/" + id + "/version/" + version + "/clone");
  },
  /*
   * Create for a sample quest
   * @param   {String}    id                Quest Id
   * @param   {Number}    version             version of the quest
   */
  createFromSample(id, version, access, premium) {
    return Api().post("quest/" + id + "/version/" + version + "/createfromsample/" + access + "/" + (premium ? "pro" : "individual"));
  },
  /*
   * Close a private quest
   * @param   {String}    id                  Quest Id
   * @param   {Number}    version             version of the quest
   */
  closePrivate(id, version) {
    return Api().post("quest/" + id + "/version/" + version + "/close");
  },
  /*
   * Add a language for the quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                language of the quest (en, fr, ...)
   */
  addLanguage(questId, lang) {
    return Api()
      .put("quest/" + questId + "/lang/add/" + lang)
      .catch(error =>
        console.log("addLanguage(): could not retrieve quest data", error)
      );
  },
  /*
   * Publish a quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                Language concerned
   */
  publish(id, lang) {
    return Api()
      .put("quest/" + id + "/publish/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * Unpublish a quest
   * @param   {String}    id                  ID of the quest
   * @param   {String}    lang                Language concerned
   */
  unpublish(id, lang) {
    return Api()
      .put("quest/" + id + "/unpublish/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * Count the quests created by a user
   * @param   {String}    id                  ID of the user
   */
  countForUser(id) {
    return Api()
      .get("user/" + id + "/quests/created/count")
      .catch(error => console.log(error.request));
  },
  /*
   * List the quests created by a user
   * @param   {String}    id                  ID of the user
   * @param   {String}    lang                language
   */
  ListCreatedByAUser(id, lang) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get("user/" + id + "/quests/created/lang/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * List the quests played by a user
   * @param   {String}    id                  ID of the user
   * @param   {String}    lang                language
   */
  ListPlayedByAUser(id, lang) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get("user/" + id + "/quests/played/0/lang/" + lang)
      .catch(error => console.log(error.request));
  },
  ListPlayedByAUserSync(id, lang, skip, done) {
    if (!lang) {
      lang = "default";
    }
    return Api()
      .get("user/" + id + "/quests/played/" + skip + "/lang/" + lang)
      .then(function(response) {
        done(false, response);
      });
  },
  /*
   * List the quests medias
   * @param   {String}    id                  ID of the quest
   * @param   {Number}    version             version of the quest
   * @param   {String}    type                type of files (see type values in media collection - without /step/ string)
   */
  listMedia(id, version, type) {
    if (!type) {
      type = "all";
    }
    return Api()
      .get("quest/" + id + "/version/" + version + "/media/" + type + "/list")
      .catch(error => console.log(error.request));
  },
  /*
   * Remove a media
   * @param   {String}    id                Quest Id
   * @param   {Number}    version           version of the quest
   * @param   {String}    mediaId           Media Id
   */
  removeMedia(id, version, mediaId) {
    return Api().delete(
      "quest/" + id + "/version/" + version + "/media/" + mediaId + "/remove"
    );
  },
  /*
   * List the object files
   * @param   {String}    questId             ID of the quest
   * @param   {String}    model               name of the model
   */
  listObjectFiles(model, questId) {
    return Api()
      .get("quest/" + questId + "/offline/object/" + model + "/files")
      .catch(error => console.log(error.request));
  },
  /*
   * get the quest statistics
   * @param   {String}    questId           Quest Id
   * @param   {Number}    version           version of the quest
   * @param   {Date}      date              Date
   */
  getStatistics(questId, version, date) {
    return Api()
      .get("quest/" + questId + "/version/" + version + "/statistics/" + date)
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest picture
   * @param   {Object}    data                picture data
   */
  uploadPicture(data) {
    return Api()
      .post("/quest/picture/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest logo
   * @param   {Object}    data                picture data
   */
  uploadLogo(data) {
    return Api()
      .post("/quest/logo/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest music
   * @param   {Object}    data                audio data
   */
  uploadAudio(data) {
    return Api()
      .post("/quest/audio/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest character
   * @param   {Object}    data                picture data
   */
  uploadCharacter(data) {
    return Api()
      .post("/quest/character/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest reward
   * @param   {Object}    data                picture data
   */
  uploadReward(data) {
    return Api()
      .post("/quest/reward/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest thumb
   * @param   {Object}    data                picture data
   */
  uploadThumb(data) {
    return Api()
      .post("/quest/thumb/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },
  /*
   * Upload a quest snapshot
   * @param   {Object}    data                picture data
   */
  uploadSnapshot(data, questId) {
    return Api()
      .post("/quest/" + questId + "/gamesnapshot/upload", data, {
        timeout: 60000,
        headers: { "Content-Type": "multipart/form-data" }
      })
      .catch(error => console.log(error.request));
  },

  /*
   * Check if the quest can be moved premium
   * @param   {String}    questId              questId
   */
  CheckIfCanBeMovedPremium(questId) {
    return Api()
      .get("quest/" + questId + "/premium/check")
      .catch(error => console.log(error.request));
  },
  /*
   * Move a quest to premium
   * @param   {String}    questId              questId
   */
  MoveToPremium(questId) {
    return Api()
      .post("quest/" + questId + "/premium/set")
      .catch(error => console.log(error.request));
  },
  /*
   * Check a tier payment for the user
   * @param   {String}    questId             questId
   */
  checkTierPayment(questId) {
    return Api()
      .get("quest/" + questId + "/payment/tier/check")
      .catch(error => console.log(error.request));
  },
  /*
   * Create a tier payment
   * @param   {String}    questId             questId
   * @param   {String}    price               price
   */
  createTierPayment(questId, price) {
    return Api()
      .post("quest/" + questId + "/payment/tier/add", { price: price })
      .catch(error => console.log(error.request));
  },
  /*
   * Remove a tier payment
   * @param   {String}    questId             questId
   * @param   {String}    codeId              Id of the code to remove
   */
  removeTierPayment(questId, code) {
    return Api()
      .delete("quest/" + questId + "/payment/tier/remove/" + code)
      .catch(error => console.log(error.request));
  },
  /*
   * List the tier payments
   * @param   {String}    questId              questId
   */
  listTierPayments(questId) {
    return Api()
      .get("quest/" + questId + "/payment/tier/list")
      .catch(error => console.log(error.request));
  },
  /*
   * Use a tier Payment QR code
   * @param   {String}    questId             questId
   * @param   {String}    code                user language
   */
  useTierPaymentCode(questId, code) {
    return Api()
      .post("quest/" + questId + "/payment/tier/use", { code: code })
      .catch(error => console.log(error.request));
  },
  /*
   * Purchase to play a premium quest
   * @param   {String}    questId              questId
   * @param   {String}    product              product buyed
   */
  purchasePremium(questId, product) {
    return Api()
      .post("quest/" + questId + "/premium/buy", product)
      .catch(error => console.log(error.request));
  },
  /*
   * Purchase a private quest
   * @param   {String}    questId              questId
   */
  purchasePrivateQuest(questId, product) {
    return Api()
      .post("quest/" + questId + "/private/buy", product)
      .catch(error => console.log(error.request));
  },
  /*
   * Check if the user has payed for a quest
   * @param   {String}    questId              questId
   */
  hasPayed(questId) {
    return Api()
      .get("quest/" + questId + "/premium/ispayed")
      .catch(error => console.log(error.request));
  },
  /*
   * Check if a QR Code can opens a quest, and create a dummy account
   * @param   {String}    questId              questId
   * @param   {String}    lang                user language
   */
  checkLoginQRCode(questId, lang) {
    // replace / sign
    questId = questId.replace(/\//g, "-slash-");
    return Api()
      .get("quest/" + questId + "/connectandplay/qrcode/lang/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * Check if a QR Code can opens a quest, and create a dummy account
   * @param   {String}    questId              questId
   * @param   {String}    lang                user language
   */
  checkQRCode(questId, lang) {
    // replace / sign
    questId = questId.replace(/\//g, "-slash-");
    return Api()
      .get("quest/" + questId + "/play/qrcode/lang/" + lang)
      .catch(error => console.log(error.request));
  },
  /*
   * Submit a suggestion
   * @param   {Object}    place              place for the quest
   */
  submitSuggestion(place) {
    return Api()
      .post("quest/suggest", place)
      .catch(error => console.log(error.request));
  },

  /*
   * List the editors of a quest
   * @param   {String}    questId              questId
   * @param   {Number}    version             version of the quest
   */
  listEditors(questId, version) {
    return Api()
      .get("quest/" + questId + "/version/" + version + "/editor/list")
      .catch(error => console.log(error.request));
  },
  /*
   * Add an editor to a quest
   * @param   {String}    questId              questId
   * @param   {Number}    version             version of the quest
   * @param   {String}    email           email of the editor
   */
  addEditor(questId, version, email) {
    return Api()
      .put("quest/" + questId + "/version/" + version + "/editor/add/" + email)
      .catch(error => console.log(error.request));
  },
  /*
   * Remove an editor of a quest
   * @param   {String}    questId                Quest Id
   * @param   {Number}    version             version of the quest
   * @param   {String}    editorId            Editor Id
   */
  removeEditor(questId, version, editorId) {
    return Api().delete(
      "quest/" + questId + "/version/" + version + "/editor/remove/" + editorId
    );
  },

  /*
   * List the invitees of a quest
   * @param   {String}    questId              questId
   * @param   {Number}    version              version of the quest
   */
  listInvitees(questId, version) {
    return Api()
      .get("quest/" + questId + "/version/" + version + "/invitee/list")
      .catch(error => console.log(error.request));
  },
  /*
   * Add an invitee to a quest
   * @param   {String}    questId             questId
   * @param   {Number}    version             version of the quest
   * @param   {String}    email               email of the invitee
   */
  addInvitee(questId, version, email) {
    return Api()
      .put("quest/" + questId + "/version/" + version + "/invitee/add/" + email)
      .catch(error => console.log(error.request));
  },
  /*
   * Remove an invitee of a quest
   * @param   {String}    questId                Quest Id
   * @param   {Number}    version                version of the quest
   * @param   {String}    inviteeId              Invitee Id
   */
  removeInvitee(questId, version, inviteeId) {
    return Api().delete(
      "quest/" +
        questId +
        "/version/" +
        version +
        "/invitee/remove/" +
        inviteeId
    );
  },

  /**
   * Checks if questId is in cache.
   * If network is available, checks as well that the latest version is in cache.
   * @param   {String}  questId
   * @return  {Boolean} true if latest known version of the quest is stored in cache, false otherwise
   */
  isCached(questId) {
    if (!window.cordova) {
      return false;
    } else {
      return utils.checkIfFileExists(questId, "quest_" + questId + ".json")
    }
  },

  /**
   * Removes quest data from cache corresponding to a questId
   * @param   {String}  questId
   */
  async removeFromCache(questId) {
    await utils.removeDirectory(questId);
  },

  /**
   * get background image given quest object
   */
  getBackgroundImage(quest) {
    if (quest.picture && quest.picture[0] === "_") {
      return "statics/images/quest/" + quest.picture;
    } else if (quest.picture && quest.picture.indexOf("blob:") !== -1) {
      return quest.picture;
    } else if (quest.picture) {
      return process.env.SERVER_URL + "/upload/quest/" + quest.picture;
    } else {
      return "statics/images/quest/default-quest-picture.jpg";
    }
  }
};
