<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle">
    
      <form @submit.prevent="configureTown()">
        
        <q-field :error="$v.form.fields.name.$error">
          <q-input type="text" float-label="Name" v-model="form.fields.name" @blur="$v.form.fields.name.$touch" />
          <div class="q-field-bottom" v-if="$v.form.fields.name.$error">
            <div class="q-field-error" v-if="!$v.form.fields.name.required">Please enter a name</div>
          </div>
        </q-field>
        
        <q-field :error="$v.form.fields.zipcode.$error">
          <q-input type="text" float-label="Zip Code" v-model="form.fields.zipcode" @blur="$v.form.fields.zipcode.$touch" />
          <div class="q-field-bottom" v-if="$v.form.fields.zipcode.$error">
            <div class="q-field-error" v-if="!$v.form.fields.zipcode.required">Please enter a zip code</div>
          </div>
        </q-field>
        
        <q-field>
          <q-select float-label="Country" v-model="form.fields.country"
            :options="[
              {label: 'France', value: 'fr'}
            ]"
          />
        </q-field>
        
        <q-field icon="explore" label="GPS location bottom left">
          <div class="row">
            <div class="col-6">
              <q-input type="text" float-label="Longitude" v-model="form.fields.location1.lng" />
            </div>
            <div class="col">
              <q-input type="text" float-label="Latitude" v-model="form.fields.location1.lat" />
            </div>
          </div>
        </q-field>
        
        <q-field icon="explore" label="GPS location top right">
          <div class="row">
            <div class="col-6">
              <q-input type="text" float-label="Longitude" v-model="form.fields.location2.lng" />
            </div>
            <div class="col">
              <q-input type="text" float-label="Latitude" v-model="form.fields.location2.lat" />
            </div>
          </div>
        </q-field>
        
        <q-field icon="place" label="Place" v-for="(place, index) in form.fields.places" :key="index">
          <div class="row">
            <div class="col-9">
              <q-input type="text" float-label="Name" v-model="place.name" />
            </div>
            <div class="col">
              <q-btn type="button" v-if="place.picture === ''">
                <label :for="'placepicture' + index"><q-icon name="file upload" /></label>
                <input @change="uploadPlacePicture(index, $event)" :name="'placepicture' + index" :id="'placepicture' + index" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
              </q-btn>
              <div v-if="place.picture !== ''">
                <img :src="serverUrl + '/upload/town/place/' + place.picture" style="width: 50px" />
              </div>
            </div>
          </div>
          <q-select float-label="Select" v-model="place.type"
            :options="[
              {label: 'Remarkable place', value: 'remarkable'},
              {label: 'Cimetery', value: 'cimetary'},
              {label: 'Church', value: 'church'}
            ]"
          />
          <div class="row">
            <div class="col-6">
              <q-input type="text" float-label="Longitude" v-model="place.location.lng" />
            </div>
            <div class="col">
              <q-input type="text" float-label="Latitude" v-model="place.location.lat" />
            </div>
          </div>
        </q-field>
        <q-btn clear @click="addPlace">Add a place</q-btn>
        
        <q-btn type="submit" color="primary" class="full-width">Save</q-btn>
          
      </form>
      
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import AdminService from 'services/AdminService'

export default {
  data () {
    return {
      form: {
        fields: {
          name: '',
          zipcode: '',
          country: 'fr',
          location1: { lat: '', lng: '' },
          location2: { lat: '', lng: '' },
          places: []
        }
      },
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted() {
    this.addPlace()
  },
  methods: {
    /*
     * publish the quest
     */
    async configureTown() {
      await AdminService.CreateTown(this.form.fields)
      this.$router.push('/admin')
    },
    /*
     * Add a new place in the list
     */
    addPlace() {
      this.form.fields.places.push({name: '', type: '', location: {lng: '', lat: ''}, picture: ''})
    },
    /*
     * Upload a picture for a place
     * @param   {Object}    e            Upload data
     */
    async uploadPlacePicture(key, e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await AdminService.uploadPlaceImage(data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.form.fields.places[key].picture = uploadResult.data.file
        this.$q.loading.hide()
      }
    }
  },
  validations: {
    form: {
      fields: {
        name: { required },
        zipcode: { required }
      }
    }
  }
}
</script>
