<template>
  <div class="scroll" v-scroll="scrolling">
    <div class="fit" id="teaser" v-if="geolocationIsSupported">
      
      <!------------------ MAIN INFORMATION AREA ------------------------>
      
      <div class="fit" :style="'background: url(' + serverUrl + '/upload/quest/' + quest.picture + ' ) center center / cover no-repeat '" v-touch-swipe.horizontal="swipeMgmt">
        <div>
          <div class="text-center bottom-dark-banner">
            <p class="title">
              {{getLanguage() ? quest.title[getLanguage()] : $t('label.NoTitle') }}
              <img v-if="getLanguage() !== $store.state.user.language" class="image-and-text-aligned" :src="'/statics/icons/game/flag-' + getLanguage() + '.png'" />
            </p>
            <p>
              <span v-if="quest.rating">
                <q-rating readonly :value="quest.rating && quest.rating.rounded" color="primary" :max="5" size="1.7rem" />
              </span> &nbsp;
              <span>{{ $t('label.nbPointsToWin', { nb: quest.availablePoints }) }}</span>
            </p>
            <div class="text-center">
              <p>
                <q-btn v-if="getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest._id, getLanguage())" color="primary">{{ $t('label.SolveThisQuest') }}</q-btn>
                <q-btn-dropdown v-if="getAllLanguages() && getAllLanguages().length > 1" color="primary" :label="$t('label.SolveThisQuest')">
                  <q-list link>
                    <q-item 
                      v-for="lang in getAllLanguages()" :key="lang.lang" 
                      v-show="lang.published" 
                      @click.native="playQuest(quest._id, lang.lang)"
                    >
                      <q-item-main>
                        <q-item-tile label>
                          <img class="image-and-text-aligned" :src="'/statics/icons/game/flag-' + lang.lang + '.png'" />
                          {{ $t('language.' + lang.lang) }}
                        </q-item-tile>
                      </q-item-main>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </p>
              <a @click="backToTheMap()">{{ $t('label.BackToTheMap') }}</a>
            </div>
            <div class="full-width text-center" v-if="!scrolled">
              {{ $t('label.ScrollForMoreDetails') }}
              <q-icon class="text-primary big-icon" name="expand_more" @click="moveDown()" />
            </div>
          </div>
        </div>
      </div>
      
      <!------------------ DETAILS AREA ------------------------>
      
      <div class="q-pa-md q-pb-xxxl">
        <q-alert type="warning" class="q-mb-md" v-if="this.isRunFinished">
          {{ $t('label.YouAlreadyDidThisQuest') }}<br />
          {{ $t('label.YouCanResolveItAgain') }}
        </q-alert>
        <q-alert type="warning" class="q-mb-md" v-if="this.isUserTooFar">
          {{ $t('label.QuestIsFarFromUser') }}<br />
          {{ $t('label.QuestIsFarFromUserDesc') }}
        </q-alert>
        <q-alert type="warning" class="q-mb-md" v-if="typeof quest.author !== 'undefined' && quest.author._id === $store.state.user._id">
          {{ $t('label.YouAreQuestOwnerDesc') }}
        </q-alert>
        <p v-if="typeof quest.author !== 'undefined' && quest.author.name"><strong>{{ $t('label.Author') }}:</strong> {{ quest.author.name }}</span>
        <p v-if="quest.level"><strong>{{ $t('label.Difficulty') }}:</strong> <img class="image-and-text-aligned" src="/statics/icons/game/magnifying-red.png" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 1 ? 'grey' : 'red') + '.png'" /><img class="image-and-text-aligned" :src="'/statics/icons/game/magnifying-' + (quest.level === 3 ? 'red' : 'grey') + '.png'" /></p>
        <p v-if="quest.duration"><strong>{{ $t('label.Duration') }}:</strong> {{ quest.duration }} {{ $t('label.minutes') }}</p>
        <p v-if="quest.startingPlace"><strong>{{ $t('label.StartingPoint') }}:</strong> {{ quest.startingPlace }}</p>
        <p>{{getLanguage() ? quest.description[getLanguage()] : "" }}</p>
      </div>
    </div>
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="row enable-geolocation" v-if="!geolocationIsSupported">
      <div class="col-12">
        <h5>{{ $t('label.PleaseActivateGeolocation') }}</h5>
        <div v-if="isChrome">
          <p v-html="$t('message.HowToActivateGeolocationOnChrome')"></p>
          <p>
            {{ $t('message.OnceGeolocationEnabled') }}
            <!-- see https://github.com/vuejs/vue-router/issues/296 -->
            <router-link :to="$route.path + '?_=' + (new Date).getTime()">{{ $t('message.PressHere') }}</router-link>.
          </p>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'

import utils from 'src/includes/utils'

export default {
  data () {
    return {
      quest: {},
      serverUrl: process.env.SERVER_URL,
      isRunFinished: false,
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false,
      scrolled: false
    }
  },
  computed: {
    // from https://stackoverflow.com/a/13348618/488666
    // adapted because my Android Chrome User Agent contains 'OPR'!
    // (Mozilla/5.0 (Linux; Android 8.0.0; ASUS_Z012D Build/OPR1.170623.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36)
    isChrome() {
      let isChromium = window.chrome,
        winNav = window.navigator,
        vendorName = winNav.vendor,
        //isOpera = winNav.userAgent.indexOf("OPR") > -1,
        isIEedge = winNav.userAgent.indexOf("Edge") > -1,
        isIOSChrome = winNav.userAgent.match("CriOS");
      if (isIOSChrome) {
        return true;
      } else if (
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        //isOpera === false &&
        isIEedge === false
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  async mounted() {
    // get quest information
    await this.getQuest(this.$route.params.id)
    
    // get user runs for this quest
    await this.getRun()
    
    //check if location tracking is turned on
    if (this.$data.geolocationIsSupported) {
      navigator.geolocation.getCurrentPosition((position) => {
        //compare quest starting point with user localisation (1km distance)
        if (this.quest.location && this.quest.location.coordinates && this.quest.location.coordinates.length > 1 && position.coords && position.coords.latitude) {
          if ((Math.abs(position.coords.latitude - this.quest.location.coordinates[0]) > 0.009) || (Math.abs(position.coords.longitude - this.quest.location.coordinates[1]) > 0.013)) {
            this.isUserTooFar = true
          }
        }
      }, () => {
        console.error('geolocation failed')
        this.geolocationIsSupported = false
      }, { timeout: 10000, maximumAge: 10000 });
    }
  },
  methods: {
    /*
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    async getQuest(id) {
      let response = await QuestService.getById(id)
      this.quest = response.data
      if (typeof this.quest.authorUserId !== 'undefined') {
        response = await AuthService.getAccount(this.quest.authorUserId)
        this.$set(this.quest, 'author', response.data)
        this.quest.description = utils.replaceBreakByBR(this.quest.description)
      }
    },
    /*
     * Get the connected user information about previous runs for this quest
     */
    async getRun() {
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest._id)
      var maxStepComplete = 0
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep > maxStepComplete) {
            maxStepComplete = runs.data[i].currentStep
          }
        }
        if (maxStepComplete > 0) {
          var self = this
          this.$q.dialog({
            title: this.$t('label.ContinueThisStep'),
            message: this.$t('label.YouAlreadyStartThisQuest'),
            ok: this.$t('label.Continue'),
            cancel: this.$t('label.Restart')
          }).then(() => {
            return self.$router.push('/quest/play/' + self.quest._id + '/step/' + maxStepComplete)
          }).catch(() => {
            return self.$router.push('/quest/play/' + self.quest._id + '/step/1')
          })
        }
      }
    },
    /*
     * Get the default language for this quest
     * @param   {object}    quest            quest data
     */
    getLanguage(quest) {
      if (!quest) {
        quest = this.quest
      }
      // check that at least a language is set
      if (!quest.languages || quest.languages.length === 0) {
        return false
      }
      // get only published languages
      var publishedLanguages = quest.languages.filter(language => language.published)
      if (publishedLanguages && publishedLanguages.length > 0) {
        // check if the user language is set => default language
        var defaultLanguage = ''
        for (var i = 0; i < publishedLanguages.length; i++) {
          if (publishedLanguages[i].lang === this.$store.state.user.language) {
            defaultLanguage = this.$store.state.user.language
          }
        }
        if (defaultLanguage === '' && publishedLanguages.length > 0) {
          defaultLanguage = publishedLanguages[0].lang
        }
      } else if (quest.languages.length > 0) {
        defaultLanguage = quest.languages[0].lang
      }
      return defaultLanguage
    },
    /*
     * Get all the published language for this quest
     * @param   {object}    quest            quest data
     */
    getAllLanguages(quest) {
      if (!quest) {
        quest = this.quest
      }
      // check that at least a language is set
      if (!quest || !quest.languages || quest.languages.length === 0) {
        return false
      }
      // get only published languages
      var publishedLanguages = quest.languages.filter(language => language.published)
      
      // when testing, no language published => Provide one
      if (publishedLanguages && publishedLanguages.length === 0 && quest.languages.length > 0) {
        publishedLanguages.push(quest.languages[0])
      }
      
      return publishedLanguages
    },
    /*
     * Launch a quest with default language
     * @param   {Object}    obj         Swipe object
     */
    swipeMgmt(obj) {
      if (obj.direction === 'right') {
        this.backToTheMap()
      }
      if (obj.direction === 'left') {
        const languages = this.getAllLanguages(this.quest)
        const lang = languages[0].lang
        alert(lang)
        this.playQuest(this.quest._id, lang)
      }
    },
    /*
     * Launch a quest
     * @param   {String}    questId            ID of the quest
     * @param   {String}    lang               lang of the quest
     */
    playQuest(questId, lang) {
      this.$router.push('/quest/play/' + questId + '/step/1/' + lang)
    },
    /*
     * Follow scroll position
     * @param   {Number}    position             scroll position
     */
    scrolling (position) {
      if (position > 40) {
        this.scrolled = true
      } else {
        this.scrolled = false
      }
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.push('/map')
    }
  }
}
</script>
