<template>
  
  <div>
    
    <h1>{{ quest.title }} <!-- TODO button icon pencil => edit current quest settings --></h1>
    
    <ul>
    <li v-for="step in stepList" :key="step._id">
      <!-- TODO handle to drag/drop -->
      {{ step.title }}
      <!-- TODO button icon pencil => edit step -->
    </li>
    </ul>
  </div>
  
  
</template>

<script>
import QuestService from 'services/QuestService'
import StepService from 'services/StepService'
export default {
  data() {
    return {
      title: 'Votre enquête',
      stepList: [],
      quest: { title: '' }
    }
  },
  async mounted() {
    this.$store.dispatch('setTitle', this.title)
    let res = await QuestService.getById(this.$store.state.currentEditedQuest.id)
    this.quest = res.data
    this.stepList = await StepService.get({ questId: this.quest._id })
    // maybe sort using https://rubaxa.github.io/Sortable/
    // and its VueJS wrapper: https://sagalbot.github.io/vue-sortable/
  }
}
</script>

<style scoped>
#main-view { padding: 1rem; overflow-y: scroll; }
</style>