<template>
  <q-card class="my-card" :style="cssVars" @click="!info ? $router.push('/quest/play/' + quest.questId) : ''" :class="info ? '' : 'cursor-pointer'">
    <div v-if="!quest" class="flex items-center justify-center full-height">
      <q-spinner-dots
        :color="color"
        size="2em"
      />
    </div>
    <div v-else>
    <q-card-section class="q-pa-none relative-position section-up" :style="'background: url(' + getThumbImage() + ' ) center center /cover no-repeat; height: 250px;'">
      <div class="quest-rating">
        <q-rating
          v-if="ratingValue && ratingValue != 0"
          v-model="ratingValue"
          size="1em"
          :max="5"
          :color="color"
          readonly
          icon="star_border"
          icon-selected="star"
          icon-half="star_half"
        />
        <p class="quest-price"> {{ getPrice() }} </p>
      </div>
      <div class="inter-bar" :class="direction === 'left' ? 'left' : 'right'"></div>
      <creator-badge class="creator-badge" :class="direction === 'left' ? 'left' : 'right'" :color="bgColor" :creator="creator" :custom="customization"/>
      <div class="score-badge flex items-center justify-center"
           :class="direction === 'right' ? 'right' : 'left'"
           v-if="quest.availablePoints && quest.availablePoints.maxPts && (!quest.customization || !quest.customization.removeScoring)"
           @click="$emit('showRewards')">
<!--        <img src="statics/images/icon/point.png" />-->
        <div class="text-white">
          +{{ quest.availablePoints.maxPts }}
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="!info" class="section-down" style="padding-top:30px;">
      <div class="card-title">{{ quest.title }}</div>
      <div class="card-city"> {{ quest.location.town }} {{ quest.location.zipcode}}</div>
      <div class="card-stats flex">
        <div class="card-time q-mr-md" v-if="quest.duration && quest.duration < 999">{{ $t('label.EstimateTime') }} : {{ quest.duration }} min</div>
        <div class="card-difficult">{{ $t('label.Difficulty') }} : {{ getDifficult() }}</div>
      </div>
    </q-card-section>
    <q-card-section v-if="info" class="section-info">
      <div class="q-mt-lg q-mb-md info-title">{{ quest.title === "" ?  $t('label.NoTitle') : quest.title }}</div>
      <div v-html="quest.description" class="info-description"></div>

      <div v-if="isUserTooFar && !quest.allowRemotePlay" class="q-pt-md">
        <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.QuestIsFarFromUser')" />
      </div>
    </q-card-section>
    <!--   INFO QUEST PLAY  -->
    <q-card-section v-if="info" class="section-down">
      <div v-if="quest && quest.status" class="text-white">
        <div class="bg-warning q-pa-sm shadow-5" v-if="warning.lowBattery">
          <q-icon name="battery_alert" /> {{ $t('label.WarningLowBattery') }}
        </div>
        <div class="bg-warning q-pa-sm shadow-5" v-if="warning.tooMuchUsers">
          <q-icon name="warning" /> {{ $t('label.TooMuchUsersCurrently') }}
        </div>
        <div v-if="quest.status !== 'published'" class="info-quest shadow-5 centered q-pa-sm q-mb-md">
          {{ $t('label.' + (quest.type === 'quest' ? 'QuestDraftVersion' : 'PageDraftVersion')) }}
        </div>
        <!-- =========================== LANGUAGES ========================== -->
        <div class="q-pt-md text-subtitle1" v-if="languages.length > 1">
          {{ $t('label.ChooseYourLanguage') }} &nbsp;
          <img v-if="isLanguage('en')" :class="language === 'en' ? '' :'lang-opacity'" src="statics/icons/game/flag-en.png"
               @click="switchLanguage('en')"/> &nbsp;
          <img v-if="isLanguage('fr')" :class="language === 'fr' ? '' :'lang-opacity'" src="statics/icons/game/flag-fr.png"
               @click="switchLanguage('fr')"/> &nbsp;
          <img v-if="isLanguage('es')" :class="language === 'es' ? '' :'lang-opacity'" src="statics/icons/game/flag-es.png"
               @click="switchLanguage('es')"/>
        </div>
        <!-- =========================== PROPERTIES ========================== -->
        <div class="row q-pt-md text-subtitle1 properties-bar">
          <div class="q-mr-lg">
            <img src="statics/images/icon/difficulty.svg" class="medium-icon" />{{ $t('label.Difficulty' + quest.level) }}
          </div>
          <div v-if="quest.duration && quest.duration < 999" class="q-mr-lg">
            <img src="statics/images/icon/duration.svg" class="medium-icon" />
            <span v-if="quest.duration && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</span>
            <span v-if="quest.duration && quest.duration >= 60">{{ Math.floor(quest.duration / 60) }}{{ $t('label.hoursSimplified') }}{{(quest.duration % 60 > 0 ? (quest.duration % 60) : "")}}</span>
          </div>
          <div v-if="quest.type === 'quest'" class="q-mr-lg">
            <span v-if="!quest.premiumPrice.tier && shop.premiumQuest.priceCode === 'free' && quest.type === 'quest'">
              <img src="statics/images/icon/cost.svg" class="medium-icon" />
              <span v-if="!shop.premiumQuest.alreadyPayed">{{ $t('label.Free') }}</span>
              <span v-if="shop.premiumQuest.alreadyPayed">{{ $t('label.AlreadyPaied') }}</span>
            </span>
            <span v-if="shop.premiumQuest.priceCode !== 'free' && quest.type === 'quest'">
              <img src="statics/images/icon/cost.svg" class="medium-icon" />
              <span>{{ shop.premiumQuest.priceValue === '0' ? ((quest.premiumPrice && quest.premiumPrice.prices && quest.premiumPrice.prices.fr) ? quest.premiumPrice.prices.fr : '...') : shop.premiumQuest.priceValue }}</span>
            </span>
          </div>
<!--          <div>-->
<!--            <q-rating v-if="quest.rating && quest.rating.rounded" readonly v-model="quest.rating.rounded" color="yellow-8" :max="5" size="0.8em" />-->
<!--          </div>-->
        </div>
        <div v-if="quest.type === 'room' && quest.premiumPrice.manual">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span>{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>
        <div v-if="quest.premiumPrice.tier && quest.type === 'quest' && quest.premiumPrice.manual && shop.premiumQuest.priceCode === 'free'">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span>{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>

        <!-- =========================== LOCATION ========================== -->

        <div v-if="quest.location && quest.location.address" class="text-subtitle1 q-mt-sm quest-location">
           {{ quest.location.address }}
        </div>

        <!-- =========================== WARNING ========================== -->

        <div v-if="quest.warning" class="text-subtitle1 q-mt-sm quest-warning" @click="openWarningLink()">
          <q-icon color="secondary" name="warning" /> <u>{{ getTranslatedData(quest.warning) }}</u>
        </div>
        <div v-if="quest.playersNumber && quest.playersNumber > 1" class="text-subtitle1 q-mt-sm quest-warning">
          <q-icon color="secondary" name="group" /> {{ $t('label.YouNeedToBeXPlayers', {nb: quest.playersNumber}) }}
        </div>

        <!-- =========================== RANKING ========================== -->

        <div class="text-subtitle1 q-mt-sm quest-ranking" style="cursor: pointer">
          <a class="concertone" @click="$router.push('/user/ranking/ranking/' + quest.questId)">{{ $t('label.Ranking') }}</a>
        </div>
      </div>
    </q-card-section>
    </div>
  </q-card>
</template>

<script>
import { colors } from 'quasar'
import creatorBadge from "./creatorBadge";
import UserService from "services/UserService";

export default {
  name: "questCard",
  components: {creatorBadge},

  props: {
    quest: Object,
    warning: Object,
    shop: Object,
    language: null,
    languages: null,
    color: {
      type: String,
      default: 'primary'
    },
    direction: {
      type: String,
      default: 'left'
    },
    info: {
      type: Boolean,
      default: false
    },
    isUserTooFar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ratingValue: 0,
      creator: null,
      customization: false,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    if (this.quest && this.quest.rating.value) {
      this.ratingValue = this.quest.rating.value
    }
    this.getCreator()
  },
  computed: {
    bgColor() {
      if (this.color === 'primary') {
        return 'rgb(238,102,8)'
      } else if (this.color === 'secondary') {
        return 'rgb(243,146,0)'
      } else if (this.color === 'accent') {
        return 'rgb(214,11,81)'
      } else {
        return this.color
      }
    },
    cssVars() {
      return {
        "--bg-color": this.bgColor,
        "--bg-darken": colors.lighten(this.bgColor, -20),
        "--height": this.info ? "inherit" : "350px"
      }
    }
  },
  methods: {
    async getCreator() {
      const res = await UserService.getFriend(this.quest.authorUserId)
      this.creator = res.data
      if (this.quest.customization.logo) {
        this.creator.picture = this.quest.customization.logo
        this.customization = true
      }
    },
    getPrice () {
      if (this.quest.premiumPrice && !(this.quest.premiumPrice.androidId && this.quest.premiumPrice.active) && !this.quest.premiumPrice.manual) {
        return this.$t('label.Free')
      } else {
        return this.$t('label.Paying')
      }
    },
    getDifficult() {
      if (this.quest.level === 3) {
        return this.$t('label.Hard')
      } else if (this.quest.level === 2) {
        return this.$t('label.Normal')
      } else {
        return this.$t('label.Easy')
      }
    },
    getThumbImage () {
      if (!this.quest) {
        return 'statics/images/quest/default-quest-picture.jpg'
      }
      let picture
      if (this.quest.thumb) {
        if (this.quest.thumb[this.lang]) {
          picture = this.quest.thumb[this.lang]
        } else if (this.quest.thumb[this.quest.mainLanguage]) {
          picture = this.quest.thumb[this.quest.mainLanguage]
        }
      }
      if (picture && picture[0] === '_') {
        return 'statics/images/quest/' + picture
      } else if (picture && picture.indexOf('blob:') !== -1) {
        return picture
      } else if (picture) {
        return this.uploadUrl + '/upload/quest/' + picture
      } else {
        return 'statics/images/quest/default-quest-picture.jpg'
      }
    },
    switchLanguage(lang) {
      this.$emit('changeLanguage', lang)
    },
    isLanguage(lang) {
      if (this.languages && this.languages.length > 0) {
        for (let i = 0; i < this.languages.length; i++) {
          if (this.languages[i].lang === lang) {
            return true
          }
        }
      } 
      return false
    }
  }
}
</script>

<style scoped lang="scss">
.my-card{
  width: 100%;
  height: var(--height);
  border-radius: 20px;

  .section-up{
    border-radius: 20px 20px 0 0;
    .quest-rating{
      position: absolute;
      top: 8px;
      left: 16px;
    }
    .quest-price{
      color: white;
      text-align: left;
      text-shadow: 0 0 2px black;
    }
    .inter-bar{
      position: absolute;
      z-index: 2;
      bottom: 0;
      width: 100%;
      height: 20px;
      background: var(--bg-color);
      box-shadow: 0 3px 3px rgba(0,0,0,0.75);
      &.left{
        transform: skewY(-3deg) translate(0 , 10px);
      }
      &.right{
        transform: skewY(3deg) translate(0 , 10px);
      }
    }
    .creator-badge{
      z-index: 5;
      position: absolute;
      bottom: -30px;
      box-shadow: 0 0 10px rgba(0,0,0,0.75);
      &.left{
        right: 20px;
      }
      &.right{
        left: 20px;
      }
    }
    .score-badge{
      z-index: 5;
      width: 60px;
      height: 60px;
      position: absolute;
      bottom: -37px;
      background: url("../../../statics/images/icon/point.png");
      background-size: cover;
      font-size: 24px;
      &.left{
        left: 20px;
      }
      &.right{
        right: 20px;
      }
    }
  }
  .section-info{
    background: var(--bg-darken);
    color: white;
    font-size: 14px;
    padding-top: 25px;
    .info-title{
      font-size: 24px;
    }
    .info-description{
      white-space: pre-line;
    }
  }
  .section-down{
    //height: 100px;
    //padding-top:30px;
    background: var(--bg-darken);
    border-radius: 0 0 20px 20px;
    color: white;
    .card-title{

    }
    .card-city{
      font-weight: lighter;
      font-size: 14px;
    }
    .card-stats{
      font-size: 14px;
    }
    .info-quest{
      background: var(--bg-color);
    }
  }
  .lang-opacity{
    opacity: 0.5;
  }
}
</style>
