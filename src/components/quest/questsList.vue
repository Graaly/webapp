<template>
  <div class="q-pl-md">
    <div v-if="!quests || quests.length === 0" class="quest-small relative-position">
      <div class="absolute-center">
        <q-spinner-dots
          color="primary"
          size="2em"
        />
      </div>
    </div>
    <div v-if="(quests && quests.length > 0 || add) && format === 'small'" class="horizontal-scroll-wrapper quests-horizontal-scroll-wrapper" :class="{'quest-red': (color === 'red')}">
      <div v-if="add" class="quest-add-button relative-position q-mr-md" @click="buildQuest()">
        <div>
          <q-icon name="add" style="font-size: 3em;" />
        </div>
      </div>
      <div 
        v-for="quest in quests" 
        :key="quest._id" 
        class="quest-small relative-position q-mr-md" 
        :style="'background: url(' + getBackgroundImage(quest.picture) + ' ) center center / cover no-repeat '"
        @click="$router.push('/quest/play/' + quest.questId)">
        <div class="info-banner">
          <div v-if="quest.duration && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</div²>
          <div v-if="quest.duration && quest.duration >= 60">{{ quest.duration / 60 }}{{ $t('label.hoursSimplified') }}</div>
          <div v-if="quest.level">{{ $t('label.Difficulty' + quest.level) }}</div>
          <div v-if="quest.premiumPrice && !(quest.premiumPrice.androidId && quest.premiumPrice.active)">
            <span class="opacity50">€€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId < 'premiumprice10'">
            €<span class="opacity50">€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId >= 'premiumprice10' && quest.premiumPrice.androidId < 'premiumprice25'">
            €€<span class="opacity50">€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId >= 'premiumprice25'">
            €€€
          </div>
          <div v-if="quest.rating && quest.rating.nbVoters">
            <q-icon name="star" :class="{'opacity50': (quest.rating.value === 0)}" />
            <q-icon name="star" :class="{'opacity50': (quest.rating.value < 2)}" />
            <q-icon name="star" :class="{'opacity50': (quest.rating.value < 4)}"/>
          </div>
          <div v-if="quest.playStatus">
            <span v-if="quest.playStatus === 'in-progress'">{{ $t('label.CurrentlyPlaying') }}</span>
            <span v-if="quest.playStatus === 'succeeded'">{{ $t('label.Succeeded') }}</span>
          </div>
        </div>
        <div class="title-banner q-pl-sm">
          <div><span v-if="quest.location && quest.location.town">{{ quest.location.town }}</span></div>
          <div class="subtitle4" v-if="quest.title">{{ quest.title }}</div>
        </div>
        <div v-if="quest.availablePoints && quest.availablePoints.maxPts">
          <div class="point-banner"><img src="statics/images/icon/availablepoint.png" /></div>
          <div class="point-banner with-plus"><div>{{ quest.availablePoints.maxPts }}</div></div>
        </div>
        <div v-if="quest.points">
          <div class="point-banner"><img src="statics/images/icon/wonpoint.png" /></div>
          <div class="point-banner"><div>{{ quest.points }}</div></div>
        </div>
      </div>
    </div>
    <div v-if="quests && quests.length > 0 && format === 'big'" :class="{'quest-red': (color === 'red')}">
      <div 
        v-for="quest in quests" 
        :key="quest._id" 
        class="quest-big relative-position q-mr-md" 
        :style="'background: url(' + getBackgroundImage(quest.picture) + ' ) center center / cover no-repeat '"
        @click="$router.push('/quest/play/' + quest.questId)">
        <div class="info-banner">
          <div v-if="quest.duration && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</div²>
          <div v-if="quest.duration && quest.duration >= 60">{{ quest.duration / 60 }}{{ $t('label.hoursSimplified') }}</div>
          <div v-if="quest.level">{{ $t('label.Difficulty' + quest.level) }}</div>
          <div v-if="quest.premiumPrice && !(quest.premiumPrice.androidId && quest.premiumPrice.active)">
            <span class="opacity50">€€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId < 'premiumprice10'">
            €<span class="opacity50">€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId >= 'premiumprice10' && quest.premiumPrice.androidId < 'premiumprice25'">
            €€<span class="opacity50">€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId >= 'premiumprice25'">
            €€€
          </div>
          <div v-if="quest.distance">
            {{ quest.distance }} {{ $t('label.km') }}
          </div>
          <div v-if="quest.rating && quest.rating.nbVoters">
            <q-icon name="star" :class="{'opacity50': (quest.rating.value === 0)}" />
            <q-icon name="star" :class="{'opacity50': (quest.rating.value < 2)}" />
            <q-icon name="star" :class="{'opacity50': (quest.rating.value < 4)}"/>
          </div>
          <div v-if="quest.playStatus">
            <span v-if="quest.playStatus === 'in-progress'">{{ $t('label.CurrentlyPlaying') }}</span>
            <span v-if="quest.playStatus === 'succeeded'">{{ $t('label.Succeeded') }}</span>
          </div>
        </div>
        <div class="title-banner q-pl-sm">
          <div><span v-if="quest.location && quest.location.town">{{ quest.location.town }}</span></div>
          <div class="subtitle4" v-if="quest.title">{{ quest.title }}</div>
        </div>
        <div v-if="quest.availablePoints && quest.availablePoints.maxPts">
          <div class="point-banner"><img src="statics/images/icon/availablepoint.png" /></div>
          <div class="point-banner with-plus"><div>{{ quest.availablePoints.maxPts }}</div></div>
        </div>
        <div v-if="quest.points">
          <div class="point-banner"><img src="statics/images/icon/point.png" /></div>
          <div class="point-banner"><div>{{ quest.points }}</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['quests', 'format', 'color', 'add'],
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
    },
    buildQuest() {
      this.$router.push('/quest/create/welcome')
    }
  }
}
</script>
