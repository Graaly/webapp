<template>
  <div class="q-pl-md">
    <div v-if="!quests" class="quest-small relative-position">
      <div class="absolute-center">
        <q-spinner-dots
          color="primary"
          size="2em"
        />
      </div>
    </div>
    <div v-if="quests && (quests.length > 0 || add) && format === 'small'" class="horizontal-scroll-wrapper quests-horizontal-scroll-wrapper" :class="{'quest-red': (color === 'red')}">
      <div v-if="add" class="quest-add-button relative-position q-mr-md cursor-pointer" @click="buildQuest()">
        <div>
          <q-icon name="add" style="font-size: 3em;" />
        </div>
      </div>
      <div
        v-for="quest in quests"
        :key="quest._id"
        class="quest-small relative-position q-mr-md cursor-pointer"
        :style="'background: url(' + getBackgroundImage(quest.thumb, quest.mainLanguage) + ' ) center center / cover no-repeat '"
        @click="$router.push('/quest/play/' + quest.questId)">
        <div>
          <q-chip :color="'status-' + quest.status" v-if="quest.status && quest.status !== 'published' && !(quest.status === 'draft' && quest.version > 1)">
            {{ $t('status.' + quest.status) }}
          </q-chip>
          <q-chip color="secondary" v-if="quest.access === 'private'" icon="lock">
            {{ $t('label.Private') }}
          </q-chip>
        </div>
        <div v-if="quest.userName">
          <q-chip color="graaly-blue-dark">
            <q-avatar>
              <img :src="getUserBackgroundImage(quest.userPicture)">
            </q-avatar>
            {{ quest.userName }}
          </q-chip>
        </div>
        <div class="info-banner">
          <div v-if="quest.duration && quest.duration !== 999 && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</div>
          <div v-if="quest.duration && quest.duration !== 999 && quest.duration >= 60">{{ quest.duration / 60 }}{{ $t('label.hoursSimplified') }}</div>
          <div v-if="quest.level">{{ $t('label.Difficulty' + quest.level) }}</div>
          <div v-if="quest.premiumPrice && !(quest.premiumPrice.androidId && quest.premiumPrice.active) && !quest.premiumPrice.manual">
            <span class="opacity50">€€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId < 'premiumprice10'">
            €<span class="opacity50">€€</span>
          </div>
          <div v-if="quest.premiumPrice && ((quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId >= 'premiumprice10' && quest.premiumPrice.androidId < 'premiumprice25') || quest.premiumPrice.manual)">
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
            <span v-if="quest.playStatus === 'finished'">{{ $t('label.Succeeded') }}</span>
          </div>
        </div>
        <div class="title-banner q-pl-sm">
          <div>
            <span v-if="quest.location && quest.location.town">{{ quest.location.town }}</span>
            <span v-if="!quest.location || !quest.location.town">&nbsp;</span>
          </div>
          <div class="subtitle4" v-if="quest.title">{{ quest.title }}</div>
        </div>
        <div v-if="quest.availablePoints && quest.availablePoints.maxPts">
          <div class="point-banner"><img src="statics/images/icon/availablepoint.png" /></div>
          <div class="point-banner with-plus"><div>{{ quest.availablePoints.maxPts }}</div></div>
        </div>
        <div v-if="quest.points">
          <div class="point-banner point-won"><img src="statics/images/icon/wonpoint.png" /></div>
          <div class="point-banner point-won"><div>{{ quest.points }}</div></div>
        </div>
      </div>
    </div>
    <div v-if="quests && quests.length > 0 && format === 'big'" :class="{'quest-red': (color === 'red')}">
      <div
        v-for="quest in quests"
        :key="quest._id"
        class="quest-big relative-position q-mr-md cursor-pointer"
        :style="'background: url(' + getBackgroundImage(quest.thumb, quest.mainLanguage) + ' ) center center / cover no-repeat '"
        @click="$router.push('/quest/play/' + quest.questId)">
        <div class="info-banner">
          <div v-if="quest.duration && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</div>
          <div v-if="quest.duration && quest.duration >= 60">{{ quest.duration / 60 }}{{ $t('label.hoursSimplified') }}</div>
          <div v-if="quest.level">{{ $t('label.Difficulty' + quest.level) }}</div>
          <div v-if="quest.premiumPrice && !(quest.premiumPrice.androidId && quest.premiumPrice.active) && !quest.premiumPrice.manual">
            <span class="opacity50">€€€</span>
          </div>
          <div v-if="quest.premiumPrice && quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId < 'premiumprice10'">
            €<span class="opacity50">€€</span>
          </div>
          <div v-if="quest.premiumPrice && ((quest.premiumPrice.androidId && quest.premiumPrice.active && quest.premiumPrice.androidId >= 'premiumprice10' && quest.premiumPrice.androidId < 'premiumprice25') || quest.premiumPrice.manual)">
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
            <span v-if="quest.playStatus === 'finished'">{{ $t('label.Succeeded') }}</span>
          </div>
        </div>
        <div class="title-banner q-pl-sm">
          <div>
            <span v-if="quest.location && quest.location.town">{{ quest.location.town }}</span>
            <span v-if="!quest.location || !quest.location.town">&nbsp;</span>
          </div>
          <div class="subtitle4" v-if="quest.title">{{ quest.title }}</div>
        </div>
        <div v-if="quest.availablePoints && quest.availablePoints.maxPts">
          <div class="point-banner"><img src="statics/images/icon/availablepoint.png" /></div>
          <div class="point-banner with-plus"><div>{{ quest.availablePoints.maxPts }}</div></div>
        </div>
        <div v-if="quest.points">
          <div class="point-banner point-won"><img src="statics/images/icon/wonpoint.png" /></div>
          <div class="point-banner point-won"><div>{{ quest.points }}</div></div>
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
      lang: this.$t('label.shortLang'),
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  methods: {
    /*
     * get background image
     */
    getBackgroundImage (picture, defaultLang) {
      let pictureLang
      if (picture && picture[this.lang]) {
        pictureLang = picture[this.lang]
      } else if (picture && picture[defaultLang]) {
        pictureLang = picture[defaultLang]
      }
      if (pictureLang && pictureLang[0] === '_') {
        return 'statics/images/quest/' + pictureLang
      } else if (pictureLang && pictureLang.indexOf('blob:') !== -1) {
        return pictureLang
      } else if (pictureLang) {
        return this.uploadUrl + '/upload/quest/' + pictureLang
      } else {
        return 'statics/images/quest/default-quest-picture.jpg'
      }
    },
    /*
     * get user background image
     */
    getUserBackgroundImage (picture) {
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
    buildQuest() {
      this.$router.push('/quest/create/welcome')
    }
  }
}
</script>
