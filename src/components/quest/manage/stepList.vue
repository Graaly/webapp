<template>
  
  <div>
    
    <div class="title">
      <h1>{{ quest.title }}</h1>
      <q-btn color="tertiary" @click="$router.push('/quest/edit/settings')"><q-icon name="mode edit" /></q-btn>
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
    
    <q-btn color="primary" icon="fa-plus-circle" @click="$router.push('/quest/create/step/type/' + quest._id)">Ajouter une étape</q-btn>
    
    <hr />
    
    <q-btn big class="full-width" icon="play circle filled" color="primary" @click="$router.push('/quest/play/'+quest._id+'?test=1')">Essayer votre enquête</q-btn>
    
    <q-btn big class="full-width" icon="check circle" color="primary" @click="publish()" v-show="quest.status !== 'published'">Publier votre enquête</q-btn>
    <q-btn big class="full-width" icon="cancel" color="primary" @click="unpublish()" v-show="quest.status === 'published'">Dépublier votre enquête</q-btn>
    
    <router-link to="/user/profile/me">Voir toutes mes enquêtes</router-link>
    
  </div>
  
</template>

<script>
import { Toast, Dialog } from 'quasar'

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
      title: 'Votre enquête',
      stepList: [],
      quest: { title: '' }
    }
  },
  async mounted() {
    if (this.$route.params.hasOwnProperty('questId')) {
      this.$store.dispatch('setCurrentEditedQuest', { _id: this.$route.params.questId })
    }
    
    this.$store.dispatch('setTitle', this.title)

    var questId
    if (this.$route.params.questId) {
      questId = this.$route.params.questId
      this.$store.dispatch('newQuestCreated', questId)
    } else {
      questId = this.$store.state.currentEditedQuest.id
    }
    let res = await QuestService.getById(questId)

    this.quest = res.data
    this.stepList = await StepService.get({ questId: this.quest._id, sort: 'number' })
  },
  methods: {
    async onStepListUpdate(event) {
      this.stepList.splice(event.newIndex, 0, this.stepList.splice(event.oldIndex, 1)[0])
      await this.reindexSteps()
    },
    async publish() {
      this.quest.status = 'published';
      await QuestService.save({ _id: this.quest._id, status: this.quest.status })
      Toast.create.positive("L'enquête est publiée.")
    },
    async unpublish() {
      this.quest.status = 'unpublished';
      await QuestService.save({ _id: this.quest._id, status: this.quest.status })
      Toast.create.positive("L'enquête est dépubliée.")
    },
    async removeStep(stepId) {
      var _this = this; // workaround for closure scope quirks
      
      await Dialog.create({
        title: 'Souhaitez vous vraiment supprimer cette étape ?',
        // 'cancel: true' property did not work (cancel button not shown) => used 'buttons' property
        buttons: [
          {
            label: 'OK',
            preventClose: true,
            async handler (data, closeThis) {
              await StepService.remove(stepId)
              let removedStepIndex = _this.stepList.map(function(e) { return e._id; }).indexOf(stepId)
              _this.stepList.splice(removedStepIndex, 1)
              await this.reindexSteps()
              closeThis()
            }
          },
          {
            label: 'Annuler'
          }
        ]
      })
    },
    // do not break step numbers sequence 1, 2, 3... when some steps are reordered or removed
    async reindexSteps() {
      for (let i = 0; i < this.stepList.length; i++) {
        let step = this.stepList[i]
        await StepService.save({ _id: step._id, number: i + 1 })
      }
    }
  }
}
</script>

<style scoped>
#main-view { padding: 1rem; overflow-y: scroll; }

.title { display: flex; flex-flow: row nowrap; align-items: center; }
.title h1 { flex-grow: 1; margin: 0; padding: 0; }

.list-group { list-style-type: none; padding: 0; margin: 0; }
.list-group-item { display: flex; flex-flow: row nowrap; align-items: center; padding: 0rem 0.2rem 0.4rem 0; }
.list-group-item p { flex-grow: 1; padding: 0; margin: 0; overflow-x: hidden; }
.list-group-item .handle { font-size: 2rem; padding-right: 0.3rem; }
.list-group-item .q-btn { width: 3rem }

#main-view > .q-btn { margin: 0.2rem; }
#main-view > a { display: block; width: 100%; margin: 0.2rem auto; text-decoration: underline; text-align: center; }
</style>
