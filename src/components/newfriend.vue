<template>
  <div>
    <div v-if="canFindContacts">
      <q-tabs v-model="newFriendTab" class="bg-primary text-white">
        <q-tab name="suggestions" :label="$t('label.Suggestions')" />
        <q-tab name="addfriends" :label="$t('label.Add')" />
      </q-tabs>
      
      <q-separator />
      
      <q-tab-panels v-model="newFriendTab" animated>
        <!-- ========================================== FRIENDS SUGGESTIONS ====================================== -->
        
        <q-tab-panel name="suggestions">
          <div class="centered" v-if="loadingContacts">
            <q-spinner color="primary" size="3em" />
            {{ $t('label.LoadingContacts') }}
          </div>
          <div class="centered" v-if="loadingContacts === null">
            <q-btn @click="this.getContacts" :label="$t('label.LoadContactsFromPhone')" />
          </div>
          
          <div v-if="validatedContacts && validatedContacts.length > 0">
            <q-list highlight>
              <q-item v-for="contact in validatedContacts" :key="contact._id">
                <q-item-section avatar>
                  <q-avatar>
                    <img v-if="contact.picture && contact.picture !== '' && contact.picture.indexOf('http') !== -1" :src="contact.picture" />
                    <img v-if="contact.picture && contact.picture !== '' && contact.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + contact.picture" />
                    <img v-if="!contact.picture || contact.picture === ''" src="statics/icons/game/profile-small.png" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ contact.name }}</q-item-label>
                  <q-btn :label="$t('label.Add')" @click="addFriend(contact._id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div v-if="loadingContacts === false && (!validatedContacts || validatedContacts.length === 0)">
            {{ $t('label.NoMoreContactFound') }}
          </div>
        </q-tab-panel>
        
        <!-- ========================================== ADD FRIEND MANUALLY ====================================== -->
        
        <q-tab-panel name="addfriends">
          <form @submit.prevent="formSubmit()" class="q-pt-md">
          
            {{ $t('label.FindWithEmail') }}
            <div class="row q-pb-md">
              <div class="col-8">
                <q-input color="secondary" type="email" :label="$t('label.Email')" v-model="form.email" @blur="$v.form.email.$touch()" />
                <div class="q-field-bottom" v-if="$v.form.email.$error">
                  <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('label.EmailIsNotValid') }}</div>
                </div>
              </div>
              <div class="col-4 centered">
                <q-btn :label="$t('label.Add')" @click="formSubmit" />
              </div>
            </div>
            {{ $t('label.FindWithPhone') }}
            <div class="row">
              <div class="col-8">
                <q-input color="secondary" :label="$t('label.PhoneNumber')" v-model="form.phone" @blur="$v.form.phone.$touch()" />
                <div class="q-field-bottom" v-if="$v.form.phone.$error">
                  <div class="q-field-error" v-if="!$v.form.phone.checkPhone">{{ $t('label.InvalidPhoneNumber') }}</div>
                </div>
              </div>
              <div class="col-4 centered">
                <q-btn :label="$t('label.Add')" @click="formSubmit" />
              </div>
            </div>
          </form>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    
    <div v-if="!canFindContacts">
      <form @submit.prevent="formSubmit()" class="q-pt-md">
        
        {{ $t('label.FindWithEmail') }}
        <div class="row q-pb-md">
          <div class="col-8">
            <q-input color="secondary" type="email" :label="$t('label.Email')" v-model="form.email" @blur="$v.form.email.$touch()" />
            <div class="q-field-bottom" v-if="$v.form.email.$error">
              <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('label.EmailIsNotValid') }}</div>
            </div>
          </div>
          <div class="col-4 centered">
            <q-btn :label="$t('label.Add')" @click="formSubmit" />
          </div>
        </div>
        {{ $t('label.FindWithPhone') }}
        <div class="row">
          <div class="col-8">
            <q-input color="secondary" :label="$t('label.PhoneNumber')" v-model="form.phone" @blur="$v.form.phone.$touch()" />
            <div class="q-field-bottom" v-if="$v.form.phone.$error">
              <div class="q-field-error" v-if="!$v.form.phone.checkPhone">{{ $t('label.InvalidPhoneNumber') }}</div>
            </div>
          </div>
          <div class="col-4 centered">
            <q-btn :label="$t('label.Add')" @click="formSubmit" />
          </div>
        </div>
      </form>
    </div>

  </div>
</template>

<script>
import UserService from 'services/UserService'
import { email } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import checkPhone from 'boot/CheckPhone'

export default {
  props: ['load'],
  watch: { 
    // load contacts
    load: async function(newVal, oldVal) {
      if (newVal === true || newVal === 'true') {
        await this.getContacts()
      }
    }
  },
  data() {
    return {
      form: {
        email: "",
        phone: ""
      },
      phoneContacts: "",
      validatedContacts: null,
      canFindContacts: true,
      serverUrl: process.env.SERVER_URL,
      submitting: false,
      loadingContacts: null,
      console: '',
      newFriendTab: "suggestions"
    }
  },
  async mounted() {

  },
  methods: {
    /*
     * Manage login
     */
    async formSubmit() {
      if (!this.$v.form.email.$error || !this.$v.form.phone.$error) {
        let addFriendStatus = await UserService.addFriend({email: this.form.email, phone: this.form.phone})

        if (addFriendStatus) {
          if (addFriendStatus.status === 200) {
            if (addFriendStatus.data && addFriendStatus.data.hasOwnProperty('status') && addFriendStatus.data.status === 'invitationsent') {
              Notification(this.$t('label.InvitationSent'), 'success')
            } else {
              Notification(this.$t('label.FriendsAdded'), 'success')
              this.$emit('friendadded')
            }
            this.form.email = ''
            this.form.phone = ''
          } else {
            if (addFriendStatus.data && addFriendStatus.data.message === 'Friend not found') {
              Notification(this.$t('label.FriendNotFound'), 'error')
            } else if (addFriendStatus.data && addFriendStatus.data.message === 'Too much friends') {
              Notification(this.$t('label.TooMuchFriends'), 'error')
            } else if (addFriendStatus.data && addFriendStatus.data.message === 'User can not be friend with him') {
              Notification(this.$t('label.UserCanNotBeFriendWithHim'), 'error')
            } else if (addFriendStatus.data && addFriendStatus.data.message === 'Already friends') {
              Notification(this.$t('label.AlreadyFriends'), 'error')
            } else {
              Notification(this.$t('label.ErrorStandardMessage'), 'error')
            }
          }
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
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
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture && uploadPicture.data) {
        if (uploadPicture.data.file) {
          this.$store.state.user.picture = uploadPicture.data.file
        } else if (uploadPicture.data.message && uploadPicture.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      }
    },
    async getContacts() {
      if (window.cordova) {
        this.loadingContacts = true
        // find all contacts
        var options = new ContactFindOptions()

        options.filter = ""
        options.multiple = true
        var filter = ["displayName", "emails", "phoneNumbers"]

        navigator.contacts.find(filter, this.checkContacts, this.onError, options)

        this.loadingContacts = false
      } else {
        this.canFindContacts = false
      }
    },
    checkContacts(contacts) {
      // get contacts with phone number or email address
      // TODO : remove doubloons
      // TODO : remove current user
      var usefulContacts = []
      for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].emails && contacts[i].emails.length > 0) {
          let formatedContact = contacts[i].emails[0].value
          formatedContact = formatedContact.toLowerCase()
          usefulContacts.push({name: contacts[i].displayName, email: formatedContact})
        } else if (contacts[i].phoneNumbers && contacts[i].phoneNumbers.length > 0) {
          let formatedContact = contacts[i].phoneNumbers[0].value
          let phoneDigits = formatedContact.match(/\d/g)
          usefulContacts.push({name: contacts[i].displayName, phone: phoneDigits.join('')})
        }
      }
      this.checkContactsWithExisting(usefulContacts)
    },
    async checkContactsWithExisting(usefulContacts) {
      // get list of contact that have a graaly account
      let response = await UserService.checkContacts(usefulContacts)
      if (response && response.data && response.data.contacts) {
        this.validatedContacts = response.data.contacts
      }
      await this.hideContactsAlreadyfriends()
    },
    async hideContactsAlreadyfriends() {
      let response = await UserService.listFriends()
      var friends = response.data
      
      for (var i = this.validatedContacts.length - 1; i >= 0; i--) {
        for (var j = 0; j < friends.length; j++) {
          if (this.validatedContacts.length > i && this.validatedContacts[i]._id === friends[j].friendId) {
            this.validatedContacts.splice(i, 1)
          }
        }
      }
    },
    hideUserFromValidatedContacts(friendId) {
      for (var i = 0; i < this.validatedContacts.length; i++) {
        if (this.validatedContacts[i]._id === friendId) {
          this.validatedContacts.splice(i, 1)
        }
      }
    },
    async addFriend(friendId) {
      let addFriendStatus = await UserService.addFriend(friendId)

      if (addFriendStatus) {
        if (addFriendStatus.data && addFriendStatus.data.hasOwnProperty('status') && addFriendStatus.data.status === 'invitationsent') {
          Notification(this.$t('label.InvitationSent'), 'success')
        } else {
          Notification(this.$t('label.FriendsAdded'), 'success')
          this.$emit('friendadded')
        }
        // hide the user to avoid user add him again as friend
        this.hideUserFromValidatedContacts(friendId)
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    onError(contactError) {
      Notification(this.$t('label.ErrorStandardMessage'), 'error')
    }
  },
  validations: {
    form: {
      email: { email },
      phone: { checkPhone }
    }
  }
}
</script>
