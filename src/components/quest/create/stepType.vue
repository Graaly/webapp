<template>
  <div>
    <h1>Choisissez le type d'étape</h1>
    
    <h2>Transition</h2>
    
    <stepTypeItem v-for="stepType in filteredStepTypes('transition')" key="stepType.code" :stepType="stepType" @click.native="selectStepType(stepType)"></stepTypeItem>
    
    <h2>Enigme</h2>
    
    <stepTypeItem v-for="stepType in filteredStepTypes('enigma')" key="stepType.code" :stepType="stepType" @click.native="selectStepType(stepType)"></stepTypeItem>
    
    <div class="link-below-button" v-if="questId != 0">
      <router-link :to="{ path: '/quest/create/step/list/' + questId }">Retour à la liste des étapes</router-link>
    </div>
  </div>
</template>

<script>
import stepTypes from 'data/stepTypes.json'
import stepTypeItem from '@/quest/create/stepTypeItem'
export default {
  components: {
    stepTypeItem
  },
  data() {
    return {
      stepTypes,
      stepTypeCategories: {
        transition: 'Transition',
        enigma: 'Enigme'
      },
      questId: 0
    }
  },
  mounted() {
    this.questId = this.$route.params.questId
  },
  methods: {
    filteredStepTypes(categoryCode) {
      return stepTypes.filter(stepType => stepType.category === categoryCode)
    },
    selectStepType(stepType) {
      this.$store.dispatch('saveQuestStepType', stepType)
      this.$router.push('/quest/create/step/settings')
    }
  }
}
</script>

<style scoped>
#main-view { padding: 1rem; overflow-y: scroll; }
h2 { font-size: 1.2rem; color: grey; }
</style>
