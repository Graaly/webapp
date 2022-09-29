<template>
  <div class="q-pb-lg">
    <div class="title flex justify-between items-center q-mb-md" v-if="title">
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
        :color="color === 'allColors' ? allColors(index+1) : color"
        :no-rating="noRating"
        :no-price="noPrice"
        class="q-mb-sm"/>
      <div v-if="!quests" class="flex items-center justify-center full-height">

        <q-card class="full-width q-pa-none" flat style="background: transparent;border-radius: 10px">
          <div class="row items-start no-wrap q-pa-sm">
            <q-skeleton size="56px" square/>
            <div class="col q-pl-sm">
              <q-skeleton type="text" square width="30%" />
              <q-skeleton type="text" square height="12px" />
              <q-skeleton type="text" square height="12px" width="75%"/>
            </div>

          </div>
        </q-card>
<!--        <q-spinner-dots
          :color="color"
          size="2em"
        />-->
      </div>
    </div>

    <div v-if="title && quests && quests.length === 0">
      <div class="centered q-pa-md text-white">
        <span v-if="around">{{ $t('label.NoQuestAroundYou') }}</span>
        <span>{{ $t('label.NoQuestCreated') }}</span>
        <div>
          <a v-if="around" class="small" @click="suggestQuest.show = true">{{ $t('label.SuggestANewQuest') }}</a>
          <a class="small" @click="$router.push('/quest/create/welcome')">{{ $t('label.CreateYourQuest') }}</a>
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
    },
    noRating: {
      type: Boolean,
      default: false
    },
    noPrice: {
      type: Boolean,
      default: false
    },
    around: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    readMoreBtn() {
      this.$emit('readMore')
    },
    allColors(index) {
      if (index%3 === 0) {
        return 'accent'
      }
      else if (index%2 === 0) {
        return 'secondary'
      }
      else {
        return 'primary'
      }
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
