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
      <gmap-marker v-if="position.target && position.target.length > 0" v-for="(data, index) in position.target" :key="index" :position="data.coords" :icon="getNextDestinationMapIcon(data.marker)"/>
      <gmap-marker v-if="position.target && position.target.coords && !position.target.length" :position="{lng: position.target.coords.lng, lat: position.target.coords.lat}" :icon="getNextDestinationMapIcon(position.target.marker)"/>
      <!-- user marker -->
      <gmap-marker v-if="position.player && position.player.coords" :position="{ lng: position.player.coords.longitude, lat: position.player.coords.latitude }" :icon="getUserMapIcon(position.player.marker)"/>
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
        loaded: false,
        positionned: false
      },
      position: {
        player: { coords: { longitude: 0, latitude: 0 }, marker: '' },
        target: { coords: { lng: 0, lat: 0 } }
      },
      isMounted: false
    }
  },
  computed: {
    google: gmapApi
  },
  mounted () {
    this.$nextTick(() => {
      this.position.target = this.targetPosition
      this.isMounted = true
      this.reloadMap()
      // init position (sometimes watcher does not work)
      this.position.player = this.playerPosition
    })
  },
  
  methods: {
    getUserMapIcon(marker) {
      if (marker && marker !== '') {
        return {
          url: marker,
          size: {width: 150, height: 150, f: 'px', b: 'px'},
          scaledSize: {width: 50, height: 50, f: 'px', b: 'px'},
          origin: {x: 0, y: 0},
          anchor: {x: 25, y: 25}
        }
      } else {
        return {
          url: 'statics/icons/game/pointer-me.svg',
          size: {width: 60, height: 60, f: 'px', b: 'px'},
          scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
          origin: {x: 0, y: 0},
          anchor: {x: 15, y: 15}
        }
      }
    },
    getNextDestinationMapIcon(marker) {
      if (marker && marker !== '') {
        return {
          url: marker,
          size: {width: 150, height: 150, f: 'px', b: 'px'},
          scaledSize: {width: 50, height: 50, f: 'px', b: 'px'},
          origin: {x: 0, y: 0},
          anchor: {x: 25, y: 25}
        }
      } else {
        return {
          url: 'statics/icons/game/target.png',
          size: {width: 60, height: 60, f: 'px', b: 'px'},
          scaledSize: {width: 30, height: 30, f: 'px', b: 'px'},
          origin: {x: 0, y: 0},
          anchor: {x: 15, y: 15}
        }
      }
    },
    reloadMap() {
      this.map.loaded = null // to prevent multiple call of reload map if onNewUserPosition is called too often
      
      // adjust zoom / pan to next destination & user position
      if (this.$refs.mapRef) {
        this.$refs.mapRef.$mapPromise.then((map) => {
          const bounds = new google.maps.LatLngBounds()
          
          if (this.targetPosition) {
            if (this.targetPosition.length > 0) {
              for (var i = 0; i < this.targetPosition.length; i++){
                bounds.extend(this.targetPosition[i].coords)
              }
            } else {
              bounds.extend(this.targetPosition.coords)
            }
          }
          if (this.position.player && this.position.player.coords) {
            bounds.extend({ lng: this.position.player.coords.longitude, lat: this.position.player.coords.latitude })
          }
          map.fitBounds(bounds)
          
          this.map.positionned = true
        })
      } else {
        // on ios simulators, this.$refs.mapRef does not exists
        this.centerOnUserPosition()
        this.map.loaded = true
      }
      if (!this.map.positionned) {
        // reload map if no position found
        setTimeout(this.reloadMap, 2000)
      }
    },
    centerOnUserPosition() {
      if (this.position.player && this.position.player.coords) {
        this.$data.map.center = {lat: this.position.player.coords.latitude, lng: this.position.player.coords.longitude}
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