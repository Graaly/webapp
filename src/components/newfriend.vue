<template>
  <div>
    <q-tabs>
      <q-tab default slot="title" name="suggestions" :label="$t('label.Suggestions')" />
      <q-tab slot="title" name="addfriends" :label="$t('label.Add')" />
      
      <!-- ========================================== FRIENDS SUGGESTIONS ====================================== -->
      
      <q-tab-pane name="suggestions">
        <div v-if="validatedContacts && validatedContacts.length > 0">
          <q-list highlight>
            <q-item v-for="contact in validatedContacts" :key="contact._id">
              <q-item-side>
                <q-item-tile avatar>
                  <img v-if="contact.picture && contact.picture !== '' && contact.picture.indexOf('http') !== -1" :src="contact.picture" />
                  <img v-if="contact.picture && contact.picture !== '' && contact.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + contact.picture" />
                  <img v-if="!contact.picture || contact.picture === ''" src="statics/icons/game/profile-small.png" />
                </q-item-tile>
              </q-item-side>
              <q-item-main>
                <q-item-tile>{{ contact.name }}</q-item-tile>
              </q-item-main>
              <q-item-side right>
                <q-btn :label="$t('label.Add')" @click="addFriend(contact._id)" />
              </q-item-side>
            </q-item>
          </q-list>
        </div>
      </q-tab-pane>
      
      <!-- ========================================== ADD FRIEND MANUALLY ====================================== -->
      
      <q-tab-pane name="addfriends">
        <form @submit.prevent="formSubmit()" class="q-pt-md">
        
          {{ $t('label.FindWithEmail') }}
          <div class="row q-pb-md">
            <div class="col-8">
              <q-input color="secondary" type="email" :float-label="$t('label.Email')" v-model="form.email" @blur="$v.form.email.$touch()" />
              <div class="q-field-bottom" v-if="$v.form.email.$error">
                <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('label.EmailIsNotValid') }}</div>
              </div>
            </div>
            <div class="col-4 centered">
              <q-btn :label="$t('label.Add')" type="submit" />
            </div>
          </div>
          {{ $t('label.FindWithPhone') }}
          <div class="row">
            <div class="col-8">
              <q-input color="secondary" :float-label="$t('label.PhoneNumber')" v-model="form.phone" @blur="$v.form.phone.$touch()" />
              <div class="q-field-bottom" v-if="$v.form.phone.$error">
                <div class="q-field-error" v-if="!$v.form.phone.checkPhone">{{ $t('label.InvalidPhoneNumber') }}</div>
              </div>
            </div>
            <div class="col-4 centered">
              <q-btn :label="$t('label.Add')" type="submit" />
            </div>
          </div>
        </form>
      </q-tab-pane>
    </q-tabs>

  </div>
</template>

<script>
import UserService from 'services/UserService'
import { email } from 'vuelidate/lib/validators'
import Notification from 'plugins/NotifyHelper'
import checkPhone from 'plugins/CheckPhone'

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
      serverUrl: process.env.SERVER_URL,
      submitting: false,
      console: ''
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
          if (addFriendStatus.data && addFriendStatus.data.hasOwnProperty('status') && addFriendStatus.data.status === 'invitationsent') {
            Notification(this.$t('label.InvitationSent'), 'success')
          } else {
            Notification(this.$t('label.FriendsAdded'), 'success')
            this.$emit('friendadded')
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
      if (uploadPicture) {
        this.$store.state.user.picture = uploadPicture.data.file
      }
    },
    async getContacts() {
      // find all contacts
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      var filter = ["displayName", "emails", "phoneNumbers"];
      navigator.contacts.find(filter, this.checkContacts, this.onError, options);
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
