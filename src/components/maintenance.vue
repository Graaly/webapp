<template>
  <q-page class="full-height full-width bg-secondary text-white">
    <div class="fixed-center text-center">
      <p class="text-faded q-mb-md text-uppercase">{{ $t("maintenance.mainText") }}</p>
      <q-img
        class="bg-white q-pa-md q-mb-md"
        :src="url"
        spinner-color="white"
        style="height: 150px; max-width: 150px; border-radius: 50%; border: white 5px solid"
      />
      <p class="text-faded q-mb-lg">{{ $t("maintenance.secondText") }}</p>
      <p class="text-faded">{{ $t("maintenance.reconnect") }} {{ timer }} {{ $t("maintenance.second") }}</p>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "maintenance",
  data() {
    return {
      timer: 30,
      url: "/statics/images/logo/logo_loop.svg"
    }
  },
  methods: {
    checkMaintenance() {
      if (this.$store.state.maintenanceMode) {
        setTimeout(() => {
          if (this.timer > 0) {
            this.timer--
            this.checkMaintenance()
          } else {
            this.$router.push({name: 'home'})
              .catch(() => {
                this.timer = 30
                this.checkMaintenance()
              })
          }
        }, 1000)
      }
    }
  },
  mounted() {
    this.checkMaintenance()
  }
}
</script>

<style scoped>

</style>
