<template>
  <div class="q-pb-lg">
    <div class="title flex justify-between items-center q-mb-md" v-if="title">
      <div style="text-transform:uppercase;" class="flex items-center">
        <q-icon :name="icon" class="q-mr-sm material-icons-outlined"/>
        <span>{{ title }}</span>
      </div>
    </div>
    <div v-if="!users" class="full-width">
      <div v-if="search" class="text-center text-white" style="margin: 0 auto;">
        {{ $t('label.SearchForStart') }}
      </div>
      <q-card v-else-if="!search && !horizontal" class="full-width q-pa-none" flat style="background: transparent;border-radius: 10px">
        <div class="row items-start no-wrap q-pa-sm">
          <q-skeleton size="56px" type="QAvatar"/>
          <div class="col q-pl-sm">
            <q-skeleton type="text" square width="30%" />
            <q-skeleton type="text" square height="12px" />
            <q-skeleton type="text" square height="12px" width="75%"/>
          </div>
        </div>
      </q-card>
      <q-card v-else class="q-pa-none" flat style="background: transparent; width: 100px; height: 120px; ">
        <div class="q-pa-sm">
          <q-skeleton size="80px" type="QAvatar" style="margin: 0 auto"/>
          <q-skeleton type="text" square />
        </div>
      </q-card>
    </div>
    <div v-else-if="users && users.length === 0 && canAddFriend">
        <q-btn round :color="color" icon="add" size="xl" @click="openFriendAddPopup()" />
    </div>
    <div v-else class="users-list" :class="horizontal ? 'horizontal-scroll-wrapper users-horizontal-scroll-wrapper' : ''">
      <div v-if="horizontal">
        <user-badge v-for="(user, index) in users" :key="index" :user="user" :color="color" @click.native="openProfile(user._id)"/>
      </div>
      <div v-else>
        <user-card v-for="(user, index) in users" :key="index" :user="user" :color="color" @click.native="openProfile(user._id)"/>
      </div>
    </div>

    <!------------------ ADD USER POPUP ------------------------>
    <q-dialog v-model="addFriendPopup" style="max-width: 400px">
      <q-card class="friend-dialog-card">
        <q-card-section class="row items-center">
          {{ $t('label.FollowYourFriends') }}
          <q-space/>
          <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>
        </q-card-section>

        <q-card-section>
          <newfriend @close="addFriendPopup = false" @friendadded="updateFriendsActivity"/>
        </q-card-section>
      </q-card>
    </q-dialog>

<!--    <q-dialog v-model="addFriendPopup">
      <q-card>
        <q-card-section class="popup-header centered">
          {{ $t('label.FollowYourFriends') }}
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="subtitle5">

        </q-card-section>
      </q-card>
    </q-dialog>-->
  </div>
</template>

<script>
import userCard from "./UI/userCard";
import userBadge from "./UI/userBadge";
import iconBtnSquare from "./UI/iconBtnSquare";
import newfriend from "../newfriend";
export default {
  name: "userList",
  components: {userCard, userBadge, iconBtnSquare, newfriend},
  props: {
    users: Array,
    title: String,
    icon: String,
    horizontal: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    },
    canAddFriend: Boolean,
    search: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      addFriendPopup: false
    }
  },
  methods: {
    openProfile(id) {
      this.$router.push('/profile/' + id)
    },
    openFriendAddPopup() {
      this.addFriendPopup = true
    },
    async updateFriendsActivity() {
      this.$emit('refresh')
    }
  }
}
</script>

<style scoped lang="scss">
.friend-dialog-card{
  width: 90vw;
  max-width: 400px;
  background: linear-gradient(180deg, rgb(7,39,90), rgb(4,20,45));
}
</style>
