<template>
  <div>
  </div>
</template>

<script>

//import utils from 'src/includes/utils'

export default {
  props: {},
  data () {
    return {
      sensor: {
        start: () => {},
        stop: () => {},
        onreading: () => {},
        onerror: () => {}
      }
    }
  },
  watch: {
    disabled: function (newVal, oldVal) {
      if (newVal === true) {
        //this.stopTracking()
      } else {
        //this.startTracking()
      }
    }
  },
  mounted() {
    //this.startTracking()
    this.sensor = new AbsoluteOrientationSensor({ frequency: 30 })
    this.sensor.onerror = this.orientationError
    this.sensor.onreading = this.orientationSuccess
    this.sensor.start()
  },
  beforeDestroy() {
    //this.stopTracking()
    this.sensor.stop()
  },
  methods: {
    /*startTracking() {
      if (this.disabled) {
        return
      }
    },*/
    /**
     * Handle location error
     * @param   {string}    err            Error string
     */
    orientationError(event) {
      console.error('Could not get orientation', event.error)
      // avoids to run this method asynchronously (can happen even after component is set to disabled !)
      /*if (this.disabled) {
        return
      }*/
      
      this.$emit('error', event.error)
    },
    /**
     * Handle new orientation event
     * @param   {object}    orientation        Current device position
     */
    // this.onAbsoluteOrientationSensorReading
    orientationSuccess() {
      // avoids to run this method asynchronously (can happen even after component is set to disabled !)
      /*if (this.disabled) {
        return
      }*/
      
      this.$emit('success', this.sensor)
    }
  }
}
</script>
