<template>
  <q-page class="full-height full-width bg-secondary text-white">
    <div class="fixed-center text-center">
      <p class="text-faded q-mb-md">NOS SERVEURS SONT ACTUELLEMENT EN MAINTENANCE</p>
      <q-img
        class="bg-white q-pa-md q-mb-md"
        :src="url"
        spinner-color="white"
        style="height: 150px; max-width: 150px; border-radius: 50%; border: white 5px solid"
      />
      <p class="text-faded">"Promis ce ne sera pas très long ..."</p>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "maintenance",
  data() {
    return {
      url: "/statics/images/logo/logo_loop.svg"
    }
  }
}
</script>

<style scoped>

</style>
