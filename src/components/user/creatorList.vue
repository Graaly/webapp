<template>
  <div class="q-pb-lg">
    <div class="title flex justify-between items-center q-mb-md">
      <div style="text-transform:uppercase;" class="flex items-center">
        <q-icon name="extension" class="q-mr-sm"/>
        <span>{{ $t('label.Designers') }}</span>
      </div>
      <div style="font-size: 12px; text-decoration: underline;" @click="readMoreBtn()">{{ $t('label.SeeMore') }}</div>
    </div>
    <div v-if="!creators" class="flex items-center justify-center full-width">
      <q-spinner-dots
        :color="color"
        size="2em"
      />
    </div>
    <div class="creator-list horizontal-scroll-wrapper users-horizontal-scroll-wrapper q-pl-sm">
      <creator-badge v-for="(creator, index) in creators" :key="index" :creator="creator" list :color="color"/>
    </div>

  </div>
</template>

<script>
import creatorBadge from "./UI/creatorBadge";
export default {
  name: "creatorList",
  components: {
    creatorBadge
  },
  props: {
    creators: Array,
    color: {
      type: String,
      default: 'primary'
    }
  },
  data() {
    return {

    }
  },
  methods: {
    readMoreBtn() {
      this.$emit('readMore')
    },
    openProfile(id) {
      this.$router.push('/profile/' + id)
    }
  }
}
</script>

<style scoped lang="scss">
.title{
  color: white;
}
</style>
