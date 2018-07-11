<template>
  <div class="wrapper">
    <transition appear enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight">
      <div>
      
        <!------------------ HEADER AREA ------------------------>
        
        <div class="header row">
          <div class="col-4">
            <div class="big-avatar">
              <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
              <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
              <div v-if="!$store.state.user.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
              <label for="picturefile">{{ $t('label.Edit') }}</label>
            <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;">
            </div>
          </div>
          <div class="col">
            <div class="title">{{ $store.state.user.name }}</div>
            <q-btn :label="$t('label.SignOut')" icon="power_settings_new" @click="Disconnect()" flat />
          </div>
        </div>
        
        <!------------------ LEVEL AREA ------------------------>
        
        <div class="q-pa-md">
          <p class="centered">{{ $t('label.MyLevel') }} : {{ $store.state.user.level }}</p>
          <q-progress :percentage="level.progress" stripe animate height="30px" color="primary"></q-progress>
          {{ $t('label.ReachScoreOf', {score: level.max}) }} <a @click="openHowTo()">{{ $t('label.HowTo') }}</a>
        </div>
        
        <!------------------ TABS AREA ------------------------>
        
        <q-tabs>
          <q-tab slot="title" name="profile" icon="face" :label="$t('label.MyProfile')" />
          <q-tab slot="title" name="friends" icon="supervised_user_circle" :label="$t('label.Friends')" />
          <q-tab slot="title" name="news" icon="notifications" :label="$t('label.News')" default />
        
          <!------------------ PROFILE TAB ------------------------>
          
          <q-tab-pane name="profile">
            <form @submit.prevent="submit()">
              <q-field icon="account circle" :label="$t('label.EditYourInformations')" class="padding-medium">
                <q-field :error="form.name.$error">
                  <q-input v-model="form.name" :stack-label="$t('label.YourName')" placeholder="John Doe" @blur="form.name.$touch"  />
                  <div class="q-field-bottom" v-if="form.name.$error">
                    <div class="q-field-error" v-if="!form.name.required">{{ $t('label.PleaseEnterYourName') }}</div>
                  </div>
                </q-field>
                <q-field :error="form.email.$error" v-if="userCanChangeEmail">
                  <q-input v-model="form.email" :stack-label="$t('label.YourEmail')" :placeholder="$t('label.emailExample')" @blur="form.email.$touch" />
                  <div class="q-field-bottom" v-if="form.email.$error">
                    <div class="q-field-error" v-if="!form.email.required">{{ $t('label.PleaseEnterYourEmailAddress') }}</div>
                    <div class="q-field-error" v-if="!form.email.email">{{ $t('label.PleaseEnterAValidEmailAddress') }}</div>
                  </div>
                </q-field>
                <q-field :error="form.country.$error">
                  <q-select :stack-label="$t('label.YourCountry')" v-model="form.country" :options="countries" />
                  <div class="q-field-bottom" v-if="form.country.$error">
                     <div class="q-field-error" v-if="!form.country.required">{{ $t('label.PleaseSelectYourCountry') }}</div>
                  </div>
                </q-field>
                <q-field :error="form.zipCode.$error">
                  <q-input v-model="form.zipCode" :stack-label="$t('label.YourZipCode')" placeholder="38500"  />
                  <div class="q-field-bottom" v-if="form.zipCode.$error">
                    <div class="q-field-error" v-if="!form.zipCode.required">{{ $t('label.PleaseEnterYourZipCode') }}</div>
                  </div>
                </q-field> 
                <q-btn color="primary" class="full-width" @click="submit()">{{ $t('label.Save') }}</q-btn>
              </q-field>
              <q-field icon="lock" :label="$t('label.ChangeYourPassword')" class="padding-medium" v-if="userCanChangePassword">
                <q-field>
                  <q-input type="password" v-model="form.oldPassword" :stack-label="$t('label.CurrentPassword')" />
                </q-field>
                <q-field>
                  <q-input type="password" v-model="form.newPassword" :stack-label="$t('label.NewPassword')" />
                </q-field>
                <q-btn color="primary" class="full-width" @click="submit()">{{ $t('label.Save') }}</q-btn>
              </q-field>
            </form>
          </q-tab-pane>
          
          <!------------------ FRIENDS TAB ------------------------>
          
          <q-tab-pane name="friends">
            <q-list highlight>
            <q-item v-if="quests.played && quests.played.length > 0" v-for="quest in quests.played" :key="quest._id" @click.native="$router.push('/quest/play/'+quest.questId)">
              <q-item-side v-if="quest.questData && quest.questData.picture" :avatar="serverUrl + '/upload/quest/' + quest.questData.picture" />
              <q-item-side v-if="!quest.questData || !quest.questData.picture" :avatar="'/statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ quest.questData.title }}</q-item-tile>
                <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && !quest.score">
                  {{ $t('label.PlayedOn') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && quest.score">
                  {{ $t('label.Succeeded') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="!quest.dateCreated">
                  {{ $t('label.Succeeded') }}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'in-progress'">
                  {{ $t('label.ContinueThisQuest') }}
                </q-item-tile>
              </q-item-main>
              <q-item-side right class="score">
                {{ quest.score }}
              </q-item-side>
            </q-item>
            <q-item v-if="quests.played.length === 0">
              <q-item-main>
                <q-item-tile label>{{ $t('label.NoQuestPlayed') }}</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
          </q-tab-pane>
          
          <!------------------ NEWS TAB ------------------------>
          
          <q-tab-pane name="news">
          </q-tab-pane>
          
        </q-tabs>
        
        <!------------------ MENU AREA ------------------------>
        
        <div class="menu-background"></div>
        <div class="menu row">
          <div class="col q-pl-xl" @click="backToMap()">
            <q-btn @click="backToMap()" rounded color="primary" size="xl" :label="$t('label.BackToMap')" icon="arrow_back" />
          </div>
        </div>   
      </div>
    </transition>
  </div>
</template>

<script>
import AuthService from 'services/AuthService'
import Notification from 'plugins/NotifyHelper'
import LevelCompute from 'plugins/LevelCompute'

import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'

export default {
  data () {
    return {
      quests: {
        played: [],
        built: []
      },
      level: {},
      userId: '',
      profile: {},
      progress: 10,
      serverUrl: process.env.SERVER_URL,
      form: {name: "--", picture: "", email: "", zipCode: "", country: "", oldPassword: "", newPassword: ""},
      countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
      userCanChangeEmail: true,
      userCanChangePassword: true
    }
  },
  mounted() {
    this.getAccountInformations(this.$store.state.user._id)
    this.level = LevelCompute(this.$store.state.user.score)
  },
  methods: {
    /*
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getAccountInformations(id) {
      this.form = {
        name: this.$store.state.user.name,
        email: this.$store.state.user.email,
        picture: this.$store.state.user.picture,
        zipCode: this.$store.state.user.location.postalCode,
        country: this.$store.state.user.location.country
      }
      
console.log(this.$store.state.user)
      // check if user can change his email
      if (this.$store.state.user.provider && this.$store.state.user.provider.name !== 'graaly') {
        this.userCanChangeEmail = false
        this.userCanChangePassword = false
      }
    },
    /*
     * Submit account changes
     */
    async submit() {      
      if (!this.form.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.form.name,
          email: this.form.email,
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          zipCode: this.form.zipCode,
          country: this.form.country,
          language: "fr"
        }
        let modificationStatus = await AuthService.modifyAccount(modifications)
        
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Notification(modificationStatus.data.message, 'warning')
        } else {
          Notification(this.$t('label.AccountModifiedLong'), 'positive')
        }
      }
    },
    /*
     * upload a profile image
     */
    async uploadImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      // MP 2018-02-12 should not be necessary because picture info is now updated in user session data
      // remove the commented lines below after a while if no problem occurs with user picture "refreshing" when a new picture is uploaded
      /*var reader = new FileReader()
      reader.onload = (e) => {
        this.form.picture = e.target.result;
      };*/
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture) {
        this.$store.state.user.picture = uploadPicture.data.file
      }
    },
    /*
     * Back to the map
     */
    backToMap() {
      this.$router.push('/map')
    },
    /*
     * Disconnection
     */
    Disconnect() {
      this.$router.push('/user/logout')
    },
    /*
     * Open How to popup
     */
    openHowTo() {
      this.$q.dialog({
        //title: 'Positioned',
        message: 'to complete',
        position: 'top'
      })
    }
  }
}
</script>

<style scoped>

</style>
