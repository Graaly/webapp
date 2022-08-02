<template>
  <q-card class="my-card" :style="cssVars">
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
      <creator-badge class="creator-badge" :class="direction === 'left' ? 'left' : 'right'" :color="bgColor"/>
    </q-card-section>
    <q-card-section class="section-down">
      <div class="card-title">{{ quest.title }}</div>
      <div class="card-city"> {{ quest.location.town }} {{ quest.location.zipcode}}</div>
      <div class="card-stats flex">
        <div class="card-time q-mr-md">Temps estimé : {{ quest.duration }}Min</div>
        <div class="card-difficult">Difficulté : {{ getDifficult() }}</div>
      </div>
    </q-card-section>
    </div>
  </q-card>
</template>

<script>
import { colors } from 'quasar'
import creatorBadge from "./creatorBadge";

export default {
  name: "questCard",
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
    }
  },
  data() {
    return {
      ratingValue: 0,
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    console.log(this.quest)
    if (this.quest && this.quest.rating.value) {
      this.ratingValue = this.quest.rating.value
    }
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
        "--bg-darken": colors.lighten(this.bgColor, -20)
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
  height: 350px;
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
  }

  .section-down{
    padding-top: 25px;
    height: 100px;
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
  }
}
</style>
