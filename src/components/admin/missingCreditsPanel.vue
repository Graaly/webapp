<template>
  <q-table
    class="container"
    title="Missing credits"
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
          {{ col.name }}
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width key="name" @click.native="$router.push('/profile/' + props.row._id)">{{ props.row.name }}</q-td>
        <q-td auto-width key="paid">{{ props.row.credits.paid }}</q-td>
        <q-td auto-width key="topay" class="text-center">{{ props.row.credits.toPay }}</q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import AdminService from "../../services/AdminService";

export default {
  name: "needToPayQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'paid', 'topay'],
      columns: [
        {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.name},
        {name: 'paid', required: true, label: "Paid", align: 'left', sortable: true, field: row => row.credits.paid},
        {name: 'topay', label: "To pay", sortable: true, align: 'center', field: row => row.credits.topay}
      ],
      initialPagination: {
        sortBy: 'name',
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
      let response = await AdminService.ListMissingCredits();
      this.items = response.data.users;
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
