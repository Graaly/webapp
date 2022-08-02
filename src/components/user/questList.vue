<template>
  <div class="q-pb-lg">
    <div class="title flex justify-between items-center q-mb-md">
      <div style="text-transform:uppercase;" class="flex items-center">
      <q-icon :name="icon" class="q-mr-sm material-icons-outlined"/>
      <span>{{ title }}</span>
    </div>
      <div v-if="readMore" style="font-size: 12px; text-decoration: underline;" @click="readMoreBtn()">{{ $t('label.SeeMore') }}</div></div>
    <div class="quest-list">
      <mini-quest-card
        v-if="index < maxShow"
        v-for="(quest, index) in quests"
        :key="quest._id" :quest="quest"
        :direction="index % 2 === 0 ? 'left' : 'right'"
        :color="color"
        class="q-mb-md"/>
      <div v-if="!quests" class="flex items-center justify-center full-height">
        <q-spinner-dots
          :color="color"
          size="2em"
        />
      </div>
    </div>

    <div v-if="quests && quests.length === 0">
      <div class="centered q-pa-md">
        {{ $t('label.NoQuestAroundYou') }}
        <div>
          <a class="small" @click="suggestQuest.show = true">{{ $t('label.SuggestANewQuest') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import miniQuestCard from "./UI/miniQuestCard";
export default {
  name: "questList",
  components: {
    miniQuestCard
  },
  props: {
    quests: Array,
    maxShow: {
      type: Number,
      default: 5
    },
    title: String,
    icon: String,
    readMore: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    readMoreBtn() {
      this.$emit('readMore')
    }
  }
}
</script>

<style scoped lang="scss">
.title{
  color: white;
}
.quest-list{

}
</style>
