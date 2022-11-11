<template>
  <q-table
    class="container"
    :title="$t('label.StatisticGames')"
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
        <q-td auto-width key="weekNb" class="text-center">{{ props.row.weekNb }}</q-td>
        <q-td auto-width key="monthNb" class="text-center">{{ props.row.monthNb }}</q-td>
        <q-td auto-width key="rating" class="text-center">
          <q-rating
            v-if="props.row.rating"
            v-model="props.row.rating"
            size="1em"
            color="accent"
            readonly
          />
          <q-rating
            v-else
            :value="0"
            size="1em"
            color="accent"
            readonly
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import AdminService from "../../services/AdminService";

export default {
  name: "statisticQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'weekNb', 'monthNb', 'rating'],
      columns: [
        {name: 'name', required: true, label: this.$t('label.AdminName'), align: 'left', sortable: true, field: row => row._id.questData.fr},
        {name: 'weekNb', label: this.$t('label.AdminPlayedWeekly'), sortable: true, align: 'center', field: 'weekNb'},
        {name: 'monthNb', label: this.$t('label.AdminPlayedMonthly'), align: 'center', sortable: true, field: 'monthNb'},
        {name: 'rating', label: this.$t('label.AdminRating'), align: 'center', sortable: true, field: 'rating'}
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
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      let response = await AdminService.ListBestGames();
      this.items = response.data.games;
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
