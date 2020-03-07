<template>
  <div class="q-pl-md">
    <div v-if="!badges || badges.length === 0" class="badge relative-position">
      <div class="centered q-pt-lg">
        <q-spinner-dots
          color="primary"
          size="2em"
        />
      </div>
    </div>
    <div v-if="badges && badges.length > 0" class="horizontal-scroll-wrapper badges-horizontal-scroll-wrapper">
      <div v-for="badge in badges" :key="badge._id" class="badge relative-position q-mr-md">
        <img :src="serverUrl + '/upload/quest/' + badge.questData.rewardPicture" />
        <div class="centered subtitle6">
          {{ badge.questData.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['badges'],
  data() {
    return {
      serverUrl: process.env.SERVER_URL
    }
  }
}
</script>
