<template>
  <div class="q-pl-md">
    <div v-if="!quests || quests.length === 0" class="quest-small relative-position">
      <div class="absolute-center">
        <q-spinner-dots
          color="accent"
          size="2em"
        />
      </div>
    </div>
    <div v-if="quests && quests.length > 0" class="horizontal-scroll-wrapper quests-horizontal-scroll-wrapper">
      <div v-for="quest in quests" :key="quest._id" class="quest-small relative-position q-mr-md" :style="'background: url(' + getBackgroundImage(quest.picture) + ' ) center center / cover no-repeat '">
        <div class="info-banner">
          <div v-if="quest.duration < 60">{{ quest.duration }}M</div²>
          <div v-if="quest.duration >= 60">{{ quest.duration / 60 }}H</div>
          <div>{{ $t('label.Difficulty' + quest.level) }}</div>
          <div v-if="!(quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active)">
            <span class="opacity50">€€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.androidId < 'premiumprice10'">
            €<span class="opacity50">€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.androidId < 'premiumprice25'">
            €€<span class="opacity50">€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.androidId >= 'premiumprice25'">
            €€€
          </div>
          <div v-if="quest.rating && quest.rating.nbVoters">
            <q-icon name="star" :class="{'opacity50': (quest.rating.value === 0)}" />
            <q-icon name="star" :class="{'opacity50': (quest.rating.value < 2)}" />
            <q-icon name="star" :class="{'opacity50': (quest.rating.value < 4)}"/>
          </div>
        </div>
        <div class="title-banner q-pl-sm">
          <div>{{ quest.location.town }}</div>
          <div class="subtitle4">{{ quest.title }}</div>
        </div>
        <div class="point-banner"><img src="statics/images/icon/point3.png" /></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['quests'],
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
        return 'statics/images/quest/' + picture
      } else if (picture && picture.indexOf('blob:') !== -1) {
        return picture
      } else if (picture) {
        return this.serverUrl + '/upload/quest/' + picture
      } else {
        return 'statics/images/quest/default-quest-picture.png'
      }
    }
  }
}
</script>
