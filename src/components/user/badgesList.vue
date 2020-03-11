<template>
  <div class="q-pl-md">
    <div v-if="!badges" class="badge relative-position">
      <div class="centered q-pt-lg">
        <q-spinner-dots
          color="primary"
          size="2em"
        />
      </div>
    </div>
    <div v-if="badges && badges.length === 0" class="centered">
      {{ $t('label.YouDoNotHaveBadgesYet') }}
    </div>
    <div v-if="format === 'scroll' && badges && badges.length > 0" class="horizontal-scroll-wrapper badges-horizontal-scroll-wrapper">
      <div v-for="badge in badges" :key="badge._id" class="badge relative-position q-mr-md">
        <img :src="serverUrl + '/upload/quest/' + badge.questData.rewardPicture" />
        <div class="centered subtitle6">
          {{ badge.questData.title }}
        </div>
      </div>
    </div>
    <div class="row justify-around" v-if="format === 'list' && badges && badges.length > 0">
      <div v-for="badge in badges" :key="badge._id" class="badge relative-position q-mr-md">
        <img :src="serverUrl + '/upload/quest/' + badge.questData.rewardPicture" />
        <div class="centered subtitle6">
          {{ badge.questData.title }}
        </div>
      </div>
    </div>
    <div v-if="format === 'bytown' && badges && badges.length > 0">
      <div v-for="(item, index) in badges" :key="index">
        <div class="subtitle4 q-pb-md">{{ item.city }}</div>
        <div class="row justify-around">
          <div class="badge badge-without-title relative-position q-mr-md">
            <img v-for="(reward, index2) in item.rewards" :class="{'reward': true, 'disabled': !reward.won}" :key="index2" :src="serverUrl + '/upload/quest/' + reward.image" />
          </div>
        </div>
      </div>
      {{ $t("label.PlayAllQuestsInACityToWin") }}
    </div>
  </div>
</template>

<script>
export default {
  props: ['badges', 'format'],
  data() {
    return {
      serverUrl: process.env.SERVER_URL
    }
  }
}
</script>
