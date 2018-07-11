<template>
  
  <div class="wrapper">
    <div class="header">
      <div class="centered">
        <a class="big-avatar">
          <div v-if="form.picture && form.picture.indexOf('http') !== -1" :style="'background-image: url(' + form.picture + ');'"></div>
          <div v-if="form.picture && form.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + form.picture + ');'"></div>
          <div v-if="!form.picture" :style="'background-image: url(/statics/profiles/noprofile.png);'"></div>
          <label for="picturefile">{{ $t('message.Edit') }}</label>
          <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;">
        </a>
      </div>
      <form @submit.prevent="submit()">
        <q-field icon="account circle" :label="$t('message.EditYourInformations')" class="padding-medium">
          <q-field :error="$v.form.name.$error">
            <q-input v-model="form.name" :stack-label="$t('message.YourName')" placeholder="John Doe" @blur="$v.form.name.$touch"  />
            <div class="q-field-bottom" v-if="$v.form.name.$error">
              <div class="q-field-error" v-if="!$v.form.name.required">{{ $t('message.PleaseEnterYourName') }}</div>
            </div>
          </q-field>
          <q-field :error="$v.form.email.$error" v-if="userCanChangeEmail">
            <q-input v-model="form.email" :stack-label="$t('message.YourEmail')" :placeholder="$t('message.emailExample')" @blur="$v.form.email.$touch" />
            <div class="q-field-bottom" v-if="$v.form.email.$error">
              <div class="q-field-error" v-if="!$v.form.email.required">{{ $t('message.PleaseEnterYourEmailAddress') }}</div>
              <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('message.PleaseEnterAValidEmailAddress') }}</div>
            </div>
          </q-field>
          <q-field :error="$v.form.country.$error">
            <q-select :stack-label="$t('message.YourCountry')" v-model="form.country" :options="countries" />
            <div class="q-field-bottom" v-if="$v.form.country.$error">
               <div class="q-field-error" v-if="!$v.form.country.required">{{ $t('message.PleaseSelectYourCountry') }}</div>
            </div>
          </q-field>
          <q-field :error="$v.form.zipCode.$error">
            <q-input v-model="form.zipCode" :stack-label="$t('message.YourZipCode')" placeholder="38500"  />
            <div class="q-field-bottom" v-if="$v.form.zipCode.$error">
              <div class="q-field-error" v-if="!$v.form.zipCode.required">{{ $t('message.PleaseEnterYourZipCode') }}</div>
            </div>
          </q-field> 
          <q-btn color="primary" class="full-width" @click="submit()">{{ $t('message.Save') }}</q-btn>
        </q-field>
        <q-field icon="lock" :label="$t('message.ChangeYourPassword')" class="padding-medium" v-if="userCanChangePassword">
          <q-field>
            <q-input type="password" v-model="form.oldPassword" :stack-label="$t('message.CurrentPassword')" />
          </q-field>
          <q-field>
            <q-input type="password" v-model="form.newPassword" :stack-label="$t('message.NewPassword')" />
          </q-field>
          <q-btn color="primary" class="full-width" @click="submit()">{{ $t('message.Save') }}</q-btn>
        </q-field>
      </form>
      <p class="padding-medium">
        {{ $t('message.YouAreMemberOfTheAgency') }} <strong>{{form.team}}</strong>
        <br />
        {{ $t('message.ButYouCanChangeIt') }} :
      </p>
    </div>
    
    <q-tabs>
      <q-tab default slot="title" :label="$t('message.CreateAnAgency')" name="create" />
      <q-tab slot="title" :label="$t('message.JoinAnAgency')" name="join" />
      <q-tab-pane name="create">
        <div class="row bottom-separator">
          <div class="col-xs-3 col-sm-3 col-md-2 col-lg-1 padding-medium">
            <a class="editable" @click="getBadgeForNewTeam()">
              <div :style="'background-image: url(' + serverUrl + '/statics/badges/' + newTeam.badge + ');'"></div>
              <span>{{ $t('message.Edit') }}</span>
             </a>
          </div>
          <div class="col padding-medium">
            <q-input v-model="newTeam.name" :placeholder="$t('message.EnterANameForYourAgency')" @keyup.enter="createAndAssignNewTeam" />
            <q-btn color="primary" @click="createAndAssignNewTeam">{{ $t('message.CreateAndJoinThisAgency') }}</q-btn>
          </div>
        </div>
      </q-tab-pane>
      <q-tab-pane name="join">
        <q-list highlight>
          <q-item v-for="team in proposedTeams" :key="team._id" @click="$router.push('/team/' + team._id + '/members')">
            <q-item-side v-if="team.badge" :avatar="serverUrl + '/statics/badges/' + team.badge" />
            <q-item-side v-if="!team.badge" :avatar="'/statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ team.name }}</q-item-tile>
              <q-item-tile sublabel>{{ $t('message.MembersNearby') }}: {{ team.member.name }}</q-item-tile>
            </q-item-main>
          </q-item>
          <q-item v-if="proposedTeams.length === 0">
            <q-item-main>
              <q-item-tile label>{{ $t('message.NoTeamsNearFromYou') }}</q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
      </q-tab-pane>
    </q-tabs>
    
  </div>
  
</template>

<script>
import AuthService from 'services/AuthService'
import TeamService from 'services/TeamService'
import { required, email } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      user: {name: "--", picture: "", id: "", team: {}, location: {}},
      form: {name: "--", picture: "", email: "", zipCode: "", country: "", team: {currentName: ""}},
      newTeam: {name: "", badge: "1"},
      proposedTeams: [],
      countries: [
        { label: this.$t('message.Belgium'), value: 'belgium' },
        { label: this.$t('message.Spain'), value: 'spain' },
        { label: this.$t('message.France'), value: 'france' }
      ],
      serverUrl: process.env.SERVER_URL,
      userCanChangeEmail: true,
      userCanChangePassword: true
    }
  },
  mounted() {
    this.getAccountInformations()
    
    this.getBadgeForNewTeam()
    
    this.getNearTeams()
  },
  methods: {
    async getAccountInformations() {
      let response = await AuthService.getAccount()
      this.user = response.data
      this.form = {
        name: this.user.name,
        email: this.user.email,
        picture: this.user.picture,
        zipCode: this.user.location.postalCode,
        country: this.user.location.country,
        team: this.user.team.currentName ? this.user.team.currentName : ""
      }
      
      // check if user can change his email
      if (this.user.provider && this.user.provider.name !== 'graaly') {
        this.userCanChangeEmail = false
        this.userCanChangePassword = false
      }
    },
    async getBadgeForNewTeam() {
      // get random badge => TO DO : define in the BO the badge
      let nbBadges = 17219
      let badgeId = Math.floor((Math.random() * nbBadges) + 1)
      this.newTeam.badge = "badge" + badgeId + ".png"
    },
    async createAndAssignNewTeam() {
      // form validator : team name must be set
      if (this.newTeam.name === "") {
        this.$q.notify(this.$t('message.PleaseEnterYourAgencyName'))
        return
      }
      // save the new team
      let saveTeam = TeamService.create({ name: this.newTeam.name, badge: this.newTeam.badge })
        
      if (!saveTeam) {
        this.$q.notify(this.$t('message.TechnicalIssue'))
      } else {
        this.team = this.newTeam.name
        this.user.team.currentName = this.newTeam.name
      }
    },
    async getNearTeams() {
      let response = await TeamService.listNearestTeams()
      this.proposedTeams = response.data
    },
    async submit() {
      this.$v.form.$touch()
      
      if (!this.$v.form.$error) {
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
          this.$q.notify(modificationStatus.data.message)
        } else {
          Toast.create['positive']({html: this.$t('message.AccountModifiedLong')})
        }
      }
    },
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
        this.getAccountInformations()
      }
    }
  },
  validations: {
    form: {
      email: { required, email },
      name: { required },
      country: { required },
      zipCode: { required }
    }
  }
}
</script>

<style scoped>

</style>
