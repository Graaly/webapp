<template>
  
  <div>
    <h1>Paramètres de votre enquête</h1>
    
    <form @submit.prevent="submit()">
    
      <q-field :error="$v.form.title.$error">
        <q-input type="text" float-label="Titre" v-model="form.title" @blur="$v.form.title.$touch" />
        <div class="q-field-bottom" v-if="$v.form.title.$error">
          <div class="q-field-error" v-if="!$v.form.title.required">Veuillez saisir un titre.</div>
        </div>
      </q-field>
      
      <q-field :error="$v.form.category.$error">
        <q-select float-label="Catégorie" v-model="form.category" @blur="$v.form.category.$touch" :options="categories" />
        <div class="q-field-bottom" v-if="$v.form.category.$error">
          <div class="q-field-error" v-if="!$v.form.category.required">Veuillez sélectionner une catégorie.</div>
        </div>
      </q-field>
      
      <div class="description">
        <a href="#" @click="console.log('TODO: exemples')">Exemples</a>
        <q-input
          v-model="form.description"
          type="textarea"
          float-label="Description"
          :max-height="100"
          :min-rows="4"
          class="full-width"
        />
      </div>
      
      <div class="location-gps">
        <p>Coordonnées GPS</p>
        <p class="location-gps-inputs">
          <q-input type="text" stack-label="Latitude" v-model="form.location.lat" />
          <q-input type="text" stack-label="Longitude" v-model="form.location.lng" />
        </p>
      </div>
      
      <div class="location-address">
        <q-input type="text" float-label="Adresse de départ de l'enquête" v-model="form.startingPlace" />
        <img src="/statics/icons/game/location.png" />
      </div>
      
      <q-field>
        <q-select float-label="Langue principale" v-model="form.mainLanguage" :options="languages" />
      </q-field>
      
      <q-field>
        [Upload d'image: TODO]
      <!--
        <q-uploader
          url="https://localhost:3000/upload"
          extensions=".gif,.jpg,.jpeg,.png"
          name="mainPicture"
          stack-label="Image"
        />
      -->
      </q-field>
      
      <q-field>
        <q-select float-label="Difficulté" v-model="form.level" :options="levels" />
      </q-field>
      
      <q-btn color="primary" class="full-width">Enregistrer</q-btn>
        
    </form>
    
  </div>
  
</template>


<script>
import { QUploader, Toast } from 'quasar'
import { required } from 'vuelidate/lib/validators'
import QuestService from 'services/QuestService'
import questCategories from 'data/questCategories.json'
import questLevels from 'data/questLevels.json'
import languages from 'data/languages.json'
import utils from 'src/includes/utils'
export default {
  components: {
    QUploader
  },
  data() {
    return {
      form: {
        title: '',
        category: '',
        description: '',
        location: { lat: 0, lng: 0 },
        startingPlace: '',
        languages: [],
        mainLanguage: 'fr',
        level: 2
      },
      categories: utils.buildOptionsForSelect(questCategories, { valueField: 'id', labelField: 'name' }),
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }),
      levels: utils.buildOptionsForSelect(questLevels, { valueField: 'id', labelField: 'name' })
    }
  },
  methods: {
    async submit() {
      this.$v.form.$touch()
      if (!this.$v.form.$error) {
        let newQuest = Object.assign(this.form, {
          'rating': 3, // tmp
          'availablePoints': 120, // tmp
          'dateCreated': new Date(),
          'authorUserId': this.$store.state.user._id,
          'status': 'published',
          'languages': [this.form.mainLanguage],
          'dateUpdated': null
        })
        // save to DB
        let res = await QuestService.save(newQuest)
        // retrieve new quest ID and save it into store
        this.$store.dispatch('newQuestCreated', res.data._id)
        Toast.create('Nouvelle enquête créée')
        this.$router.push('/quest/create/step/type')
      }
    }
  },
  validations: {
    form: {
      title: { required },
      category: { required }
    }
  }
}
</script>


<style scoped>

#main-view { overflow-y: scroll; padding: 1rem; }

.description { position: relative; }
.description a { position: absolute; top: 0; right: 0; text-decoration: underline; }

.location-address { display: flex; flex-flow: row nowrap; justify-content: center; align-items: center; }
.location-address .q-input { flex-grow: 1 }
.location-address img { width: 2.5rem; height: 2.5rem; }

.location-gps p { color: rgba(0,0,0,0.46); }
.location-gps-inputs { display: flex; flex-flow: row nowrap; }
.location-gps-inputs .q-input { margin: 0 0.5rem; }

</style>
