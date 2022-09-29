<template>
  <q-card class="my-card" :style="cssVars" @click="$router.push('/quest/play/' + quest.questId)">
    <div class="flex items-center">
      <q-card-section class="q-pa-none" style="background:#fff; border-radius: 10px 0 0 10px">
        <div class="relative-position section-left">
          <div class="full-height flex">
            <p v-if="!noPrice" class="quest-price self-end"> {{ getPrice() }} </p>
          </div>
          <div class="inter-bar" :class="direction === 'left' ? 'left' : 'right'"></div>
        </div>
      </q-card-section>
      <q-card-section class="section-right">
        <q-rating
          v-if="!noRating"
          class="quest-rating"
          v-model="ratingValue"
          size="1em"
          :max="5"
          color="white"
          readonly
          icon="star_border"
          icon-selected="star"
          icon-half="star_half"
        />
        <div class="card-title">{{ quest.title }}</div>
        <div class="card-city"> {{ quest.location.town }} {{ quest.location.zipcode}}</div>
        <div class="card-stats">
          <div class="card-time q-mr-md">Temps estimé : {{ quest.duration }}Min</div>
          <div class="card-difficult">Difficulté : {{ getDifficult() }}</div>
<!--          <creator-badge class="creator-badge" :class="direction === 'left' ? 'left' : 'right'"/>-->
        </div>
      </q-card-section>
    </div>
  </q-card>
</template>

<script>
import creatorBadge from "./creatorBadge";
import {colors} from "quasar";

export default {
  name: "miniQuestCard",
  components: {creatorBadge},

  props: {
    quest: Object,
    color: {
      type: String,
      default: 'primary'
    },
    direction: {
      type: String,
      default: 'left'
    },
    noRating: {
      type: Boolean,
      default: false
    },
    noPrice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ratingValue: this.quest.rating ? this.quest.rating.value ? this.quest.rating.value : 0 : 0,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {

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
        "--bg-image": 'url(' + this.getThumbImage() + ')'
      }
    }
  },
  methods: {
    getPrice () {
      if (this.quest.price === 0) {
        return 'GRATUIT'
      } else {
        return this.quest.price + ' €'
      }
    },
    getDifficult() {
      if (this.quest.level === 3) {
        return 'Difficile'
      } else if (this.quest.level === 2) {
        return 'Normal'
      } else {
        return 'Facile'
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
    }
  }
}
</script>

<style scoped lang="scss">
  .my-card{
    width: 100%;
    height: 84px;
    border-radius: 11px;
    border: 2px solid transparent;
    background: transparent;
    transition: 500ms;

    &:hover{
      transform: scale(1.05);
      border: 2px solid white;
      cursor: pointer;
    }
    .section-left{
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 10px 0 0 10px;
      padding: 0 8px;
      background: var(--bg-image), white;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;

      .quest-price{
        margin: 0;
        padding: 0;
        color: white;
        text-align: left;
        text-shadow: 0 0 2px black;
        font-size: 14px;
      }
      .inter-bar{
        position: absolute;
        z-index: 2;
        top: 0;
        left: 70px;
        width: 10px;
        height: 100%;
        background: var(--bg-color);
        box-shadow: 3px 0px 3px rgba(0,0,0,0.75);
        &.left{
          transform: skewX(-6deg) translate(5px, 0);
        }
        &.right{
          transform: skewX(6deg) translate(5px, 0);
        }
      }

    }

    .section-right{
      padding: 8px 16px;
      height: 80px;
      width: calc(100% - 80px);
      background: var(--bg-darken);
      border-radius: 0 10px 10px 0px;
      color: white;
      .quest-rating{
        position: absolute;
        bottom: 8px;
        right: 8px;
      }
      .card-title{
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
      }
      .card-city{
        font-weight: lighter;
        font-size: 10px;
      }
      .card-stats{
        font-size: 10px;
      }
      .creator-badge{
        z-index: 5;
        position: absolute;
        bottom: 8px;
        right: 0;
        box-shadow: 0 0 10px rgba(0,0,0,0.75);
      }
    }
  }
</style>
