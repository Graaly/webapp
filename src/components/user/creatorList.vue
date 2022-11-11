<template>
  <div class="q-pb-lg">
    <div class="title flex justify-between items-center q-mb-md" v-if="title">
      <div style="text-transform:uppercase;" class="flex items-center">
        <q-icon name="extension" class="q-mr-sm"/>
        <span>{{ $t('label.Designers') }}</span>
      </div>
      <div style="font-size: 12px; text-decoration: underline;" @click="readMoreBtn()">{{ $t('label.SeeMore') }}</div>
    </div>
    <div v-if="!creators" class="full-width">
      <div v-if="search" class="text-center text-white" style="margin: 0 auto;">
        {{ $t('label.SearchForStart') }}
      </div>
      <q-card v-else class="q-pa-none" flat style="background: transparent; width: 100px; height: 120px;">
        <div class="q-pa-sm">
          <q-skeleton size="80px" type="QAvatar" style="margin: 0 auto"/>
          <q-skeleton type="text" square />
        </div>
      </q-card>
    </div>
    <div v-if="horizontal" class="creator-list horizontal-scroll-wrapper users-horizontal-scroll-wrapper q-pl-sm">
      <creator-badge v-for="(creator, index) in creators" :key="index" :creator="creator" list :color="color"/>
    </div>
    <div v-else class="creator-list q-pl-sm flex justify-center">
      <creator-badge v-for="(creator, index) in creators" :key="index" :creator="creator" list :color="color" class="q-px-none q-mb-xl"/>
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
    },
    title: Boolean,
    search: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: Boolean,
      default: false
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
