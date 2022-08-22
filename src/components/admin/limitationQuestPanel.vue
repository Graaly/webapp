<template>
  <q-table
    class="container"
    title="Statistics of games"
    :data="items"
    :columns="columns"
    :visible-columns="visible"
    row-key="id"
    :loading="loading"
    :pagination="initialPagination"
    no-data-label="I didn't find anything for you"
  />
</template>

<script>
import AdminService from "../../services/AdminService";

export default {
  name: "limitationQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'stats', 'remaining'],
      columns: [
        {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
        {name: 'stats', label: 'Played/Limit', sortable: true, align: 'right', field: row => row.nbPlayers + '/' + row.limitations.nbPlays},
        {name: 'remaining', label: 'Remaining credit', sortable: true, align: 'right', field: row => row.limitations.nbPlays - row.nbPlayers},
      ],
      initialPagination: {
        sortBy: 'monthNb',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    this.loadLimitations()
  },
  methods: {
    async loadLimitations() {
      let response = await AdminService.ListLimitations();
      this.items = response.data.limitations;
      this.loading = false;
    },
  }
}
</script>

<style scoped>

</style>
