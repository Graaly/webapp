<template>
  <q-table
    class="container"
    title="Best games of the year"
    :data="items"
    :columns="columns"
    :visible-columns="visible"
    row-key="id"
    :loading="loading"
    :pagination="initialPagination"
    :no-data-label="$t('label.FindNothing')"
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
        <q-td auto-width key="name">{{ props.row._id.questData.fr }}</q-td>
        <q-td auto-width key="yearNb" class="text-center">{{ props.row.yearNb }}</q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import AdminService from "../../services/AdminService";

export default {
  name: "statisticYearQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'yearNb'],
      columns: [
        {name: 'name', required: true, label: this.$t('label.AdminName'), align: 'left', sortable: true, field: row => row._id.questData.fr},
        {name: 'yearNb', label: "Parties cette année", sortable: true, align: 'center', field: 'yearNb'}
      ],
      initialPagination: {
        sortBy: 'yearNb',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      let response = await AdminService.ListBestGamesForYear();
      this.items = response.data.games;
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
