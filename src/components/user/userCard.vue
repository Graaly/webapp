<template>
  <div class="relative-position q-mr-md user-card" :class="'user-card-' + size + (showName ? ' user-' + size + '-with-title' : '')" @click="sendClickEvent(user._id, user.friendId)">
    <div :style="'background: url(' + getBackgroundImage(user.picture) + ' ) center center / cover no-repeat '">
    </div>
    <div v-if="showName" class="centered subtitle6 user-card-name">
      {{ user.name }}
    </div>
    <div v-if="user.statistics && user.statistics.nbQuestsCreated && user.statistics.nbQuestsCreated > 0" class="profile-item-creator">
      <img src="statics/images/icon/profile-puzzle.svg" />
    </div>
    <div v-if="user.statistics && user.statistics.nbQuestsSuccessful && user.statistics.nbQuestsSuccessful > 0" class="profile-item-level">
      <img :src="'statics/images/icon/level' + user.level + '.svg'" />
    </div>
  </div>
</template>

<script>
export default {
  props: ['user', 'size', 'showName'],
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
