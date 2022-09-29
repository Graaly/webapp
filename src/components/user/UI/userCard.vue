<template>
  <q-card class="my-card q-mb-md" :style="cssVars" flat>
    <div class="flex items-center">
      <q-card-section class="q-pa-none section-left" style="border-radius: 10px 0 0 10px"
                      :style="'background: url(' + getBackgroundImage(user.picture) + ' ) center center / cover no-repeat '">
        <div v-if="user.statistics && user.statistics.nbQuestsCreated && user.statistics.nbQuestsCreated > 0" class="item-creator">
          <img src="statics/images/icon/profile-puzzle.svg" />
        </div>
      </q-card-section>
      <q-card-section class="section-right">
        <div>{{ user.name }}</div>
        <div class="flex justify-start items-center">
          <div v-if="user.statistics && user.statistics.nbQuestsSuccessful && user.statistics.nbQuestsSuccessful > 0" class="item-level">
            <img :src="'statics/images/icon/level' + user.level + '.svg'" />
          </div>
          <div>Score : {{ user.score }}</div>
        </div>
      </q-card-section>
    </div>
  </q-card>
</template>

<script>
import {colors} from "quasar";

export default {
  name: "userCard",
  props: {
    user: Object,
    color: {
      type: String,
      default: 'primary'
    }
  },
  data() {
    return {
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  methods: {
    getBackgroundImage(picture) {
      if (picture && picture[0] === '_') {
        return 'statics/images/profile/' + picture
      } else if (picture && picture.indexOf('blob:') !== -1) {
        return picture
      } else if (picture) {
        return this.uploadUrl + '/upload/profile/' + picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
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
        "--bg-image": 'url(' + this.getBackgroundImage() + ')'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.my-card {
  width: 100%;
  height: 84px;
  border-radius: 11px;
  transition: 500ms;
  background: transparent;

  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
  .section-left {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 10px 0 0 10px;
    padding: 0 8px;
    .item-creator{
      height: 30px;
      width: 30px;
      position: absolute;
      left: -10px;
      top: -10px
    }
  }
  .section-right {
    padding: 8px 16px;
    height: 80px;
    width: calc(100% - 80px);
    border-radius: 0 10px 10px 0px;
    color: white;
    background: linear-gradient(-90deg, rgb(7,39,90) 65%, rgb(4,20,45) 100%);;
    .item-level{
      height: 40px;
      width: 40px;
      margin-right: 12px;
    }
  }
}
</style>
