<template>
  <div class="q-pl-md">
    <div v-if="!users || users.length === 0" class="user-small relative-position">
      <div class="absolute-center">
        <q-spinner-dots
          color="accent"
          size="2em"
        />
      </div>
    </div>
    <div v-if="users && users.length > 0" class="horizontal-scroll-wrapper users-horizontal-scroll-wrapper">
      <div v-for="user in users" :key="user._id" class="user-small relative-position q-mr-md">
        <div :style="'background: url(' + getBackgroundImage(user.picture) + ' ) center center / cover no-repeat '">
        </div>
        <div class="centered subtitle5">
          {{ user.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['users'],
  data() {
    return {
      serverUrl: process.env.SERVER_URL
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
        return this.serverUrl + '/upload/profile/' + picture
      } else {
        return 'statics/profiles/noprofile.png'
      }
    }
  }
}
</script>
