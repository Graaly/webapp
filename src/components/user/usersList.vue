<template>
  <div class="q-pl-md">
    <div v-if="!users" class="user-card-small relative-position">
      <div class="centered q-pt-lg">
        <q-spinner-dots
          color="primary"
          size="2em"
        />
      </div>
    </div>
    <div v-if="format === 'scroll' && ((users && users.length > 0) || add)" class="horizontal-scroll-wrapper users-horizontal-scroll-wrapper">
      <div v-if="add" class="user-card-small relative-position q-mr-md cursor-pointer" @click="openFriendAddPopup()">
        <div class="user-add-button">
          <q-icon name="add" style="font-size: 3em;" />
        </div>
      </div>
      <div v-for="user in users" :key="user._id" class="cursor-pointer">
        <userCard :user="user" size="small" :showName="true" @click="openProfile"></userCard>
      </div>
    </div>
    <div class="row justify-around q-pt-sm" v-if="format === 'list' && ((users && users.length > 0) || add)">
      <div v-if="add" class="user-card-small relative-position q-mr-md cursor-pointer" @click="openFriendAddPopup()">
        <div class="user-add-button">
          <q-icon name="add" style="font-size: 3em;" />
        </div>
      </div>
      <div v-for="user in users" :key="user._id" class="cursor-pointer">
        <userCard :user="user" size="small" :showName="true" @click="openProfile"></userCard>
      </div>
    </div>
    
    <!------------------ ADD USER POPUP ------------------------>
    
    <q-dialog v-model="addFriend.show">
      <q-card>
        <q-card-section class="popup-header centered">
          {{ $t('label.FollowYourFriends') }}
          <q-btn class="float-right" icon="close" flat round dense @click="closeAddFriends" />
        </q-card-section>

        <q-separator />
        
        <q-card-section class="subtitle5">
          <newfriend @close="closeAddFriends" @friendadded="updateFriendsActivity"></newfriend>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import newfriend from 'components/newfriend'
import userCard from 'components/user/userCard'
export default {
  components: {
    newfriend,
    userCard
  },
  props: ['users', 'add', 'format'],
  data() {
    return {
      addFriend: {
        show: false
      }
    }
  },
  methods: {
    /*
     * Open a user profile
     */
    openProfile(id) {
      this.$router.push('/profile/' + id)
    },
    /*
     * Open add user popup
     */
    openFriendAddPopup() {
      this.addFriend.show = true
    },
    /*
     * Close new friends page
     */
    async closeAddFriends () {
      this.addFriend.show = false
      // reload friend list
      //await this.loadFriends()
    },
    /*
     * Reset the friends' activity list
     */
    async updateFriendsActivity() {
      this.$emit('refresh')
    }
  }
}
</script>
