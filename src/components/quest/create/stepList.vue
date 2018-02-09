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
      </li>
    </ul>
    
    <q-btn color="primary" icon="fa-plus-circle" @click="$router.push('/quest/create/step/type')">Ajouter une étape</q-btn>
    
    <hr />
    
    <q-btn big class="full-width" icon="play circle filled" color="primary" @click="$router.push('/quest/play/'+quest._id+'?test=1')">Essayer votre enquête</q-btn>
    
    <q-btn big class="full-width" icon="check circle" color="primary" @click="publish()" v-show="quest.status !== 'published'">Publier votre enquête</q-btn>
    <q-btn big class="full-width" icon="cancel" color="primary" @click="unpublish()" v-show="quest.status === 'published'">Dépublier votre enquête</q-btn>
    
  </div>
  
</template>

<script>
import { Toast } from 'quasar'

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
    this.$store.dispatch('setTitle', this.title)
    let res = await QuestService.getById(this.$store.state.currentEditedQuest.id)
    this.quest = res.data
    this.stepList = await StepService.get({ questId: this.quest._id })
  },
  methods: {
    async onStepListUpdate(event) {
      this.stepList.splice(event.newIndex, 0, this.stepList.splice(event.oldIndex, 1)[0])
      
      for (let i = 0; i < this.stepList.length; i++) {
        let step = this.stepList[i]
        await StepService.save({ _id: step._id, number: i + 1 })
      }
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

#main-view > .q-btn { margin: 0.2rem; }
</style>
