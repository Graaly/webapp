<template>
  <div class="q-pb-lg" :style="cssVars">
    <div class="title flex justify-between items-center q-mb-md" v-if="title">
      <div style="text-transform:uppercase;" class="flex items-center">
        <q-icon :name="icon" class="q-mr-sm material-icons-outlined"/>
        <span>{{ title }}</span>
      </div>
    </div>
    <div v-if="!badges" class="full-width">
      <q-card class="q-pa-none" flat style="background: transparent; width: 100px; height: 120px; ">
        <div class="q-pa-sm">
          <q-skeleton size="80px" square style="margin: 0 auto"/>
          <q-skeleton type="text" square />
        </div>
      </q-card>
    </div>
    <div v-else-if="badges && badges.length === 0" class="centered">
      {{ $t('label.YouDoNotHaveBadgesYet') }}
    </div>
    <div v-else class="badge-list horizontal-scroll-wrapper users-horizontal-scroll-wrapper">
      <profil-badge v-for="(badge, index) in badges" :key="index" :badge="badge"/>
    </div>
  </div>
</template>

<script>
import profilBadge from "./UI/profilBadge";
import {colors} from "quasar";
export default {
  name: "badgeList",
  components: {profilBadge},
  props: {
    badges: Array,
    title: String,
    icon: String,
    color: {
      type: String,
      default: 'primary'
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
      }
    }
  }
}
</script>

<style scoped>

</style>
