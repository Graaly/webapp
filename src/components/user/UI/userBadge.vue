<template>
  <div class="user-badge" @click="sendClickEvent(user._id, user.friendId)">
    <div class="user-badge-img" :style="'background: url(' + getBackgroundImage(user.picture) + ' ) center center / cover no-repeat '">
      <div v-if="user.statistics && user.statistics.nbQuestsCreated && user.statistics.nbQuestsCreated > 0" class="badge-creator">
        <img src="statics/images/icon/profile-puzzle.svg" />
      </div>
      <div v-if="user.statistics && user.statistics.nbQuestsSuccessful && user.statistics.nbQuestsSuccessful > 0" class="badge-level">
        <img :src="'statics/images/icon/level' + user.level + '.svg'" />
      </div>
    </div>
    <div class="user-badge-name text-center">
      {{ user.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: "userBadge",
  props: {
    user: Object,
    color: String
  },
  data() {
    return {
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  methods: {
    /*
     * get background image
     */
    getBackgroundImage (picture) {
      if (picture && picture[0] === '_') {
        return 'statics/images/profile/' + picture
      } else if (picture && picture.indexOf('blob:') !== -1) {
        return picture
      } else if (picture) {
        return this.uploadUrl + '/upload/profile/' + picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    },
    /*
     * Emit click event
     */
    sendClickEvent(id, altId) {
      if (altId) {
        this.$emit('click', altId)
      } else {
        this.$emit('click', id)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.user-badge{
  height: 80px;
  margin-right: 35px;
  .user-badge-img{
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto;
    border-radius: 50%;
    .badge-creator, .badge-level{
      position: absolute;
      width: 35px;
      height: 35px;
    }
    .badge-creator{
      top: 0;
      left: -10px;
    }
    .badge-level{
      bottom: -10px;
      right: -10px;
    }
  }
  .user-badge-name{
    color: white
  }
}
</style>
