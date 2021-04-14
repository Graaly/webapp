<template>
  <div class="geolocation-step-map">
    <gmap-map
      v-if="isMounted"
      :center="map.center"
      :zoom="map.zoom"
      map-type-id="roadmap"
      class="map"
      ref="mapRef"
      :options="{disableDefaultUI:true}"
      @center_changed="updateCenter($event)"
      @dragend="dragEnd($event)"
    >
      <!-- next destination marker -->
      <gmap-marker v-if="position.target !== null" :position="position.target" :icon="getNextDestinationMapIcon()"/>
      <!-- user marker -->
      <gmap-marker v-if="position.player !== null" :position="{ lng: position.player.longitude, lat: position.player.latitude }" :icon="getUserMapIcon()"/>
    </gmap-map>
  </div>
</template>

<script>

import { gmapApi } from 'vue2-google-maps'

import Notification from 'boot/NotifyHelper'

export default {
  props: ['targetPosition', 'playerPosition'],
  watch: { 
    targetPosition: function (newVal, oldVal) {
      if (newVal !== null && newVal !== oldVal) {
        this.position.target = newVal
      }
      this.reloadMap()
    },
    playerPosition: function (newVal, oldVal) {
      if (newVal !== null && newVal !== oldVal) {
        this.position.player = newVal
      }
      this.reloadMap()
    }
  },
  data: function () {
    return {
      map: {
        zoom: 14,
        center: { lat: 0, lng: 0 },
        centerTmp: { lat: 0, lng: 0 },
        loaded: false
      },
      position: {
        player: null,
        target: null
      },
      isMounted: false
    }
  },
  computed: {
    google: gmapApi
  },
  mounted () {
    this.$nextTick(() => {
      this.isMounted = true
      this.reloadMap()
    })
  },
  
  methods: {
    getUserMapIcon() {
      return {
        url: 'statics/icons/game/pointer-me.svg',
        size: {width: 60, height: 60, f: 'px', b: 'px'},
        scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 15, y: 15}
      }
    },
    getNextDestinationMapIcon() {
      return {
        url: 'statics/icons/game/target.png',
        size: {width: 60, height: 60, f: 'px', b: 'px'},
        scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 15, y: 15}
      }
    },
    reloadMap() {
      this.map.loaded = null // to prevent multiple call of reload map if onNewUserPosition is called too often
      
      // adjust zoom / pan to next destination & user position
      if (this.$refs.mapRef && (this.position.target !== null || this.position.target !== null)) {
        this.$refs.mapRef.$mapPromise.then((map) => {
          const bounds = new google.maps.LatLngBounds()
          
          if (this.targetPosition !== null) {
            bounds.extend(this.targetPosition)
          }
          
          if (this.position.player !== null) {
            bounds.extend({ lng: this.position.player.longitude, lat: this.position.player.latitude })
          }
          map.fitBounds(bounds)
        })
      } else {
        // on ios simulators, this.$refs.mapRef does not exists
        this.centerOnUserPosition()
        this.map.loaded = true
      }
    },
    centerOnUserPosition() {
      if (this.position.player !== null) {
        this.$data.map.center = {lat: this.position.player.latitude, lng: this.position.player.longitude}
      }
      this.map.zoom = 14
    },
    updateCenter (ev) {
      let newLat = ev.lat();
      let newLng = ev.lng();
      if (this.map.center.lat !== newLat || this.map.center.lng !== newLng) {
        this.map.centerTmp = { lng: newLng, lat: newLat }
      }
    },
    dragEnd(ev) {
      // mapCenter is not automatically updated by <gmap-map>
      // new center coordinates are not available in event data
      // => use mapCenterTmp values saved by 'update_center' event
      this.map.center = this.map.centerTmp
    }
  }
}
</script>

<style>
</style>