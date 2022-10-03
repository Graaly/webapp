<template>
  <div class="badge" :style="cssVars" @click="openProfile(creator._id)">
<!--    <div v-if="creator && creator.statistics.nbQuestsCreated > 0" class="info-games flex justify-center items-center">{{creator.statistics.nbQuestsCreated}}</div>-->
    <!--<div class="info-follows flex justify-center items-center">100</div>-->
    <div v-if="list" class="title">{{ creator.name }}</div>
  </div>
</template>

<script>
import {colors} from "quasar";
// Todo: Supprimer la bulle creator statistics quand c'est 0
export default {
  name: "creatorBadge",
  props: {
    creator: Object,
    list: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'accent'
    }
  },
  data() {
    return {
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
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
        "--bg-darken": colors.lighten(this.bgColor, -20),
        "--bg-image": 'url(' + this.getBackgroundImage(this.creator ? this.creator.picture : null) + ' )',
        "border": this.list ? '2px solid '+ this.bgColor : '4px solid '+ this.bgColor
      }
    }
  },
  methods: {
    getBackgroundImage (picture) {
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
    openProfile(id) {
      this.$router.push('/profile/' + id)
    }
  }
}
</script>

<style scoped lang="scss">
 .badge{
   overflow: visible;
   position: relative;
   height: 80px;
   width: 80px;
   border-radius: 50px;
   background: var(--bg-image), var(--bg-color);
   background-size: cover;
   background-position: center center;
   background-repeat: no-repeat;
   margin-right: 16px;

   .info-games, .info-follows{
     position: absolute;
     border-radius: 50%;
     height: 25px;
     width: 25px;
     bottom: 0px;
     background: var(--bg-darken);
     border: 2px solid var(--bg-color);
     color:  white;
     font-size: 12px;
   }
   .info-games{
     left: -5px;
   }
   .info-follows{
     right: -5px;
   }
  .title{
    position: absolute;
    top: 80px;
    width: 100%;
    text-align: center;
    color: white;
    font-size: 10px;
  }
 }
</style>
