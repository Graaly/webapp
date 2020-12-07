<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle">
      <form @submit.prevent="configureTown()">
        <q-input
          type="text"
          label="Name"
          v-model="form.fields.name"
          @blur="$v.form.fields.name.$touch"
          bottom-slots
          :error="$v.form.fields.name.$error"
          error-message="Please enter a name"
        />

        <q-input
          type="text"
          label="Zip Code"
          v-model="form.fields.zipcode"
          @blur="$v.form.fields.zipcode.$touch"
          bottom-slots
          :error="$v.form.fields.zipcode.$error"
          error-message="Please enter a zip code"
        />

        <q-select
          label="Country"
          v-model="form.fields.country"
          :options="[{ label: 'France', value: 'fr' }]"
          emit-value
          map-options
        />

        <div>
          <q-icon name="explore" />
          <p>GPS location bottom left</p>
          <div class="row">
            <div class="col-6">
              <q-input
                type="text"
                label="Longitude"
                v-model="form.fields.location1.lng"
              />
            </div>
            <div class="col">
              <q-input
                type="text"
                label="Latitude"
                v-model="form.fields.location1.lat"
              />
            </div>
          </div>
        </div>

        <div>
          <q-icon name="explore" />
          <p>GPS location top right</p>
          <div class="row">
            <div class="col-6">
              <q-input
                type="text"
                label="Longitude"
                v-model="form.fields.location2.lng"
              />
            </div>
            <div class="col">
              <q-input
                type="text"
                label="Latitude"
                v-model="form.fields.location2.lat"
              />
            </div>
          </div>
        </div>

        <div v-for="(place, index) in form.fields.places" :key="index">
          <q-icon name="place" />
          <p>Place</p>
          <div class="row">
            <div class="col-9">
              <q-input type="text" label="Name" v-model="place.name" />
            </div>
            <div class="col">
              <div v-if="!isIOs">
                <q-btn
                  v-if="place.picture === ''"
                  icon="cloud_upload"
                  @click="$refs['placepicture' + index].click()"
                />
                <input
                  @change="uploadPlacePicture(index, $event)"
                  :ref="'placepicture' + index"
                  type="file"
                  accept="image/*"
                  hidden
                />
              </div>
              <div v-if="isIOs">
                <q-icon name="cloud_upload" />
                <input
                  @change="uploadPlacePicture(index, $event)"
                  :ref="'placepicture' + index"
                  type="file"
                  accept="image/*"
                />
              </div>
              <div v-if="place.picture !== ''">
                <img
                  :src="serverUrl + '/upload/town/place/' + place.picture"
                  style="width: 50px"
                />
              </div>
            </div>
          </div>
          <q-select
            label="Select"
            v-model="place.type"
            :options="[
              { label: 'Remarkable place', value: 'remarkable' },
              { label: 'Cimetery', value: 'cimetary' },
              { label: 'Shop', value: 'shop' },
            ]"
            emit-value
            map-options
          />
          <div class="row">
            <div class="col-6">
              <q-input
                type="text"
                label="Longitude"
                v-model="place.location.lng"
              />
            </div>
            <div class="col">
              <q-input
                type="text"
                label="Latitude"
                v-model="place.location.lat"
              />
            </div>
          </div>
        </div>

        <q-btn clear @click="addPlace">Add a place</q-btn>

        <q-btn @click="configureTown" color="primary" class="full-width"
          >Save</q-btn
        >
      </form>
    </div>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import AdminService from "services/AdminService";

import utils from "src/includes/utils";

export default {
  data() {
    return {
      form: {
        fields: {
          name: "",
          zipcode: "",
          country: "fr",
          location1: { lat: "", lng: "" },
          location2: { lat: "", lng: "" },
          places: []
        }
      },
      isIOs: utils.isIOS(),
      serverUrl: process.env.SERVER_URL
    };
  },
  async mounted() {
    this.addPlace();
  },
  methods: {
    /*
     * publish the quest
     */
    async configureTown() {
      await AdminService.CreateTown(this.form.fields);
      this.$router.push("/admin");
    },
    /*
     * Add a new place in the list
     */
    addPlace() {
      this.form.fields.places.push({
        name: "",
        type: "",
        location: { lng: "", lat: "" },
        picture: ""
      });
    },
    /*
     * Upload a picture for a place
     * @param   {Object}    e            Upload data
     */
    async uploadPlacePicture(key, e) {
      this.$q.loading.show();
      var files = e.target.files;
      if (!files[0]) {
        return;
      }
      var data = new FormData();
      data.append("image", files[0]);
      let uploadResult = await AdminService.uploadPlaceImage(data);
      if (uploadResult && uploadResult.hasOwnProperty("data")) {
        this.form.fields.places[key].picture = uploadResult.data.file;
        this.$q.loading.hide();
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
};
</script>
