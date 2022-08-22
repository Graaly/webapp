<template>
  <q-table
    class="container"
    title="Earnings of games"
    :data="items"
    :columns="columns"
    :visible-columns="visible"
    row-key="id"
    :loading="loading"
    :pagination="initialPagination"
    no-data-label="I didn't find anything for you"
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width key="name" v-if="props.row.title.fr">{{ props.row.title.fr }}</q-td>
        <q-td auto-width key="price" class="text-center" v-if="props.row.premiumPrice.prices">{{ props.row.premiumPrice.prices.fr ? props.row.premiumPrice.prices.fr : props.row.premiumPrice.prices.en}}<br>{{ props.row.premiumPrice.manual && props.row.premiumPrice.manual !== "" ?  "manual : " + props.row.premiumPrice.manual : "" }}</q-td>
        <q-td auto-width key="price" class="text-center" v-else> Pas de prix</q-td>
        <q-td auto-width key="qrcode" class="text-center">{{ props.row.premiumPrice.tier ? props.row.tierEarnings : "--" }}</q-td>
        <q-td auto-width key="earnings" class="text-right">{{ props.row.earnings.toFixed(2) }} €</q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import AdminService from "../../services/AdminService";

export default {
  name: "earningQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'price', 'mail', 'qrcode', 'earnings'],
      columns: [
        {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
        {name: 'price', label: 'Price', sortable: false, align: 'center', field: row => row.premiumPrice.prices.fr},
        {name: 'qrcode', label: 'QR-Code used', align: 'center', sortable: true, field: 'tierEarnings'},
        {name: 'earnings', label: 'Earnings', align: 'right', sortable: true, field: 'earnings'}
      ],
      initialPagination: {
        sortBy: 'earnings',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    this.loadEarnings()
  },
  methods: {
    async loadEarnings() {
      let response = await AdminService.ListEarnings();
      this.items = response.data.earnings;
      this.loading = false;
    },
    /*
     * Copy to ClipBoard with notify message
     */
    copy(text) {
      this.$q.notify({
        message: 'copied : ' + text + ''
      })
      navigator.clipboard.writeText(text)
    }
  }
}
</script>

<style scoped>

</style>
