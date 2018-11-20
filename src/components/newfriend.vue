<template>
  <div>
    <form @submit.prevent="formSubmit()">
          
      <div class="row">
        <div class="col-2 centered">
          {{ $t('label.Or') }}
        </div>
        <div class="col-6">
          <q-input type="email" :float-label="$t('label.Email')" v-model="form.email" @blur="$v.form.email.$touch()" />
          <div class="q-field-bottom" v-if="$v.form.email.$error">
            <div class="q-field-error" v-if="!$v.form.email.email">{{ $t('label.EmailIsNotValid') }}</div>
          </div>
          <q-input :float-label="$t('label.PhoneNumber')" v-model="form.phone" @blur="$v.form.phone.$touch()" />
          <div class="q-field-bottom" v-if="$v.form.phone.$error">
            <div class="q-field-error" v-if="!$v.form.phone.checkPhone">{{ $t('label.InvalidPhoneNumber') }}</div>
          </div>
        </div>
        <div class="col-4 centered">
          <q-btn :label="$t('label.Add')" type="submit" />
        </div>
      </div>
    </form>
    
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
            <q-btn icon="close" @click="addFriend(contact._id)" />
          </q-item-side>
        </q-item>
      </q-list>
    </div>
    
    <div>
      {{ console }}
    </div>
  </div>
</template>

<script>
import UserService from 'services/UserService'
import { email } from 'vuelidate/lib/validators'
import Notification from 'plugins/NotifyHelper'
import checkPhone from 'plugins/CheckPhone'

export default {
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
    if (navigator.contacts) {
      await this.getContacts()
    }
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
    async getContacts(id) {
      // find all contacts
      var options = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      var filter = ["displayName", "emails", "phoneNumbers"];
      navigator.contacts.find(filter, this.checkContacts, this.onError, options);
    },
    async checkContacts(contacts) {
      // get contacts with phone number or email address
      // TODO : remove doubloons
      // TODO : remove current user
      for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].emails && contacts[i].emails.length > 0) {
          this.contacts.push({name: contacts[i].displayName, email: contacts[i].emails[0]})
        } else if (contacts[i].phoneNumbers && contacts[i].phoneNumbers.length > 0) {
          this.contacts.push({name: contacts[i].displayName, phone: contacts[i].phoneNumbers[0]})
        }
      }
this.console = this.contacts
      // get list of contact that have a graaly account
      this.validatedContacts = await UserService.checkContacts(this.contacts)
this.console = this.validatedContacts
    },
    async addFriend(friendId) {
      let addFriendStatus = await UserService.addFriend(friendId)

      if (addFriendStatus) {
        if (addFriendStatus.data && addFriendStatus.data.hasOwnProperty('status') && addFriendStatus.data.status === 'invitationsent') {
          Notification(this.$t('label.InvitationSent'), 'success')
        } else {
          Notification(this.$t('label.FriendsAdded'), 'success')
        }
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
