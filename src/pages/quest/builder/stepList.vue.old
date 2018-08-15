<template>
  
  <div>
    
    <div class="title">
      <h1>{{ quest.title }}</h1>
      <q-btn color="tertiary" @click="$router.push('/quest/edit/settings')" icon="mode edit" />
    </div>
    
    <hr />
    
    <!-- using https://github.com/timruffles/ios-html5-drag-drop-shim to allow drag & drop on mobile -->
    <ul class="list-group" v-sortable="{ onUpdate: onStepListUpdate, handle: '.handle' }">
      <li class="list-group-item" v-for="step in stepList" :key="step._id">
        <q-icon class="handle" name="reorder" />
        <p>{{ step.title }}</p>
        <q-btn @click="$router.push('/quest/edit/step/'+step._id)"><q-icon name="mode edit" /></q-btn>
        <q-btn @click="removeStep(step._id)"><q-icon name="clear" /></q-btn>
      </li>
    </ul>
    
    <q-btn color="primary" icon="fas fa-plus-circle" @click="$router.push('/quest/edit/step/type')" :label="$t('message.AddAStep')" />
    
    <hr />
    
    <q-btn big class="full-width" icon="play circle filled" color="primary" @click="$router.push('/quest/play/'+quest._id+'?test=1')" :label="$t('message.TestYourQuest')" />
    
    <q-btn big class="full-width" icon="check circle" color="primary" @click="publish()" v-show="quest.status !== 'published'" :label="$t('message.PublishYourQuest')" />
    <q-btn big class="full-width" icon="cancel" color="primary" @click="unpublish()" v-show="quest.status === 'published'" :label="$t('message.UnpublishYourQuest')" />
    
    <router-link to="/user/profile/me">{{ $t('message.BackToTheListOfAllMyQuest') }}</router-link>
    
  </div>
  
</template>

<script>
import QuestService from 'services/QuestService'
import StepService from 'services/StepService'

// required to define v-sortable directive in Vue 2.0, see https://github.com/sagalbot/vue-sortable/issues/10
import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    return new Sortable(el, binding.value || {})
  }
})

export default {
  data() {
    return {
      stepList: [],
      quest: { title: '' }
    }
  },
  async mounted() {
    // force clean current modified step in store
    this.$store.dispatch('setCurrentEditedStep', null)
    
    if (this.$route.params.hasOwnProperty('questId')) {
      this.$store.dispatch('setCurrentEditedQuest', { _id: this.$route.params.questId })
    }
    
    this.$store.dispatch('setTitle', this.$t('message.YourQuest'))
    let res = await QuestService.getById(this.$store.state.currentEditedQuest._id)
    this.quest = res.data
    this.stepList = await StepService.listForAQuest(this.quest._id)
  },
  methods: {
    async onStepListUpdate(event) {
      this.stepList.splice(event.newIndex, 0, this.stepList.splice(event.oldIndex, 1)[0])
      await this.reindexSteps()
    },
    async publish() {
      this.quest.status = 'published';
      await QuestService.publish(this.quest._id)
      this.$q.notify({type: 'positive', message: this.$t('message.YourQuestIsPublished')})
    },
    async unpublish() {
      this.quest.status = 'unpublished';
      await QuestService.unpublish(this.quest._id)
      this.$q.notify({type: 'positive', message: this.$t('message.YourQuestIsUnpublished')})
    },
    async removeStep(stepId) {
      var _this = this; // workaround for closure scope quirks
      
      this.$q.dialog({
        message: 'Souhaitez vous vraiment supprimer cette étape ?',
        ok: true,
        cancel: true
      }).then(async () => {
        await StepService.remove(_this.quest._id, stepId)
              
        // reassign a number (1, 2, 3, ...) to remaining steps
        let removedStepIndex = _this.stepList.map(function(e) { return e._id; }).indexOf(stepId)
        _this.stepList.splice(removedStepIndex, 1)
        await _this.reindexSteps()
      })
    },
    // do not break step numbers sequence 1, 2, 3... when some steps are reordered or removed
    async reindexSteps() {
      for (let i = 0; i < this.stepList.length; i++) {
        let step = this.stepList[i]
        await StepService.save({ _id: step._id, questId: this.quest._id, number: i + 1 })
      }
    }
  }
}
</script>

<style scoped>
#main-view { padding: 1rem; overflow-y: scroll; }

.title { display: flex; flex-flow: row nowrap; align-items: center; }
.title h1 { flex-grow: 1; margin: 0; padding: 0; }

#main-view > .q-btn { margin: 0.2rem; }
#main-view > a { display: block; width: 100%; margin: 0.2rem auto; text-decoration: underline; text-align: center; }
</style>
