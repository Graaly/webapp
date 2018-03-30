<template>
  <div>
    <h1>{{ $t('message.ChooseTheStepType') }}</h1>
    
    <h2>{{ $t('message.Transition') }}</h2>
    
    <stepTypeItem v-for="stepType in filteredStepTypes('transition')" :key="stepType.code" :stepType="stepType" @click.native="selectStepType(stepType)"></stepTypeItem>
    
    <h2>{{ $t('message.Quest') }}</h2>
    
    <stepTypeItem v-for="stepType in filteredStepTypes('enigma')" :key="stepType.code" :stepType="stepType" @click.native="selectStepType(stepType)"></stepTypeItem>
    
    <div class="link-below-button" v-if="$route.params.action === 'edit'">
      <router-link :to="{ path: '/quest/edit/step/list'}">{{ $t('message.BackToTheStepsList') }}</router-link>
    </div>
  </div>
</template>

<script>
import StepService from 'services/StepService'
import stepTypes from 'data/stepTypes.json'
import stepTypeItem from '@/quest/manage/stepTypeItem'
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
      }
    }
  },
  methods: {
    filteredStepTypes(categoryCode) {
      return stepTypes.filter(stepType => stepType.category === categoryCode)
    },
    async selectStepType(stepType) {
      // existing step ? save type change
      if (this.$store.state.currentEditedStep && this.$store.state.currentEditedStep._id) {
        await StepService.save({ _id: this.$store.state.currentEditedStep._id, type: stepType.code, answers: null })
      }
      this.$store.dispatch('setCurrentEditedStep', Object.assign({}, this.$store.state.currentEditedStep, { type: stepType }))
      this.$router.push('/quest/create/step/settings')
    }
  }
}
</script>

<style scoped>
#main-view { padding: 1rem; overflow-y: scroll; }
h2 { font-size: 1.2rem; color: grey; }
</style>
