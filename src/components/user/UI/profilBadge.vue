<template>
<div class="badge-self">
  <q-img class="badge-img shadow-5" :src="uploadUrl + '/upload/quest/' + badge.questData.rewardPicture" />
  <div class="text-center badge-text">
    {{ badge.questData.title }}
  </div>
</div>
</template>

<script>
export default {
  name: "profilBadge",
  props: {
    badge: Object
  },
  data() {
    return {
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  }
}
</script>

<style scoped lang="scss">
.badge-self{
  .badge-img{
    max-width: 80px;
    border-radius: 50%;
    border: 2px solid var(--bg-color);
    background: rgba(0,0,0,0.5);
  }
  .badge-text{
    max-width: 80px;
    font-size: 14px;
    white-space: normal;
  }
}
</style>
