<template>
    <q-table
      class="container"
      title="Not Published Games"
      :data="items"
      :columns="columns"
      :visible-columns="visible"
      row-key="id"
      :loading="loading"
      :pagination.sync="pagination"
      @request="onRequest"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th auto-width>Delete</q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-avatar square>
              <img v-if="props.row.picture" :src="uploadUrl + '/upload/quest/' + props.row.thumb">
              <img v-if="!props.row.picture" src="statics/profiles/noprofile.png">
            </q-avatar>
          </q-td>
          <q-td auto-width key="name">{{ props.row.title.fr }}<br><span class="text-primary">{{ props.row.questId }}</span></q-td>
          <q-td auto-width key="mail">{{ props.row.userMail !== false ? props.row.userMail : '-- Pas de mail --' }} <q-btn v-if="props.row.userMail" size="8px" flat round color="accent" icon="content_copy" class="q-mr-sm" @click="copy(props.row.userMail)"/></q-td>
          <q-td auto-width key="status">{{ props.row.status }}</q-td>
          <q-td auto-width key="nbStep"> à définir </q-td>
          <q-td auto-width key="version">{{ props.row.version }}</q-td>
          <q-td auto-width key="size">{{ goodSize(props.row.size.current) }}</q-td>
          <q-td auto-width key="dateUpdated">{{ props.row.dateUpdated}}</q-td>
          <q-td auto-width>
            <q-btn size="md" color="accent" glossy icon="delete" @click="openDeleteDialog(props.row.questId, props.row.version, props.row.title.fr ? props.row.title.fr : props.row.title.en)"/>
            <q-dialog ref="adminDeleteDialog">
              <q-card class="q-dialog-plugin">
                <q-card-section class="bg-primary">
                  ATTENTION !!!
                </q-card-section>
                <q-card-section>
                  <p class="q-ma-none q-py-md">Vous allez supprimer définitement la quête <br>
                    <span class="text-primary">{{ deleteQ.title }}</span> en version : <span class="text-primary">{{ deleteQ.version }}</span><br>
                    Etes vous réellement sûr de vouloir executer cette commande ?</p>
                  <p class="q-ma-none">ID : {{ deleteQ.questId }}</p>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn color="accent" label="DELETE" @click="confirmDeleteQuest()" />
                  <q-btn color="primary"  label="Cancel" @click="cancelDeleteDialog()" />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-td>
        </q-tr>
      </template>
    </q-table>
</template>

<script>
import AdminService from "services/AdminService";

export default {
  name: "disabledQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'mail', 'status', 'nbStep', 'version', 'lastUpdate'],
      columns: [
        {name: 'id', label: 'ID', field: 'questId'},
        {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
        {name: 'mail', label: 'Mail', sortable: true, align: 'left', field: 'userMail'},
        {name: 'status', required: true, label: 'Status', align: 'left', sortable: true, field: 'status'},
        {name: 'nbRun', required: true, label: 'Run Count', align: 'left', sortable: true, field: 'creationStep'},
        {name: 'version', required: true, label: 'Version', align: 'left', sortable: true, field: 'version'},
        {name: 'size', required: true, label: 'Size', align: 'left', sortable: true, field: row => row.size.current},
        {name: 'lastUpdate', required: true, label: 'Last Update', align: 'left', sortable: true, field: 'dateUpdated'}
        // {name: 'access', label: 'Access', align: 'left', sortable: true, field: 'access'},
        // {name: 'premium', label: 'Premium', align: 'left', sortable: true, field: row => row.isPremium ? 'Premium' : 'Individual'}
      ],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 50
      },
      deleteQ: {
        questId: null,
        version: null,
        title: null
      },
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    this.onRequest({
      pagination: this.pagination
    })
  },
  methods: {
    /*
     * Copy to ClipBoard with notify message
     */
    copy(text) {
      this.$q.notify({
        message: 'copied : ' + text + ''
      })
      navigator.clipboard.writeText(text)
    },
    /*
     * Minimize Size in Mo or Ko
     */
    goodSize(text) {
      if (text) {
        let toText = text.toLocaleString()
        if (toText.length > 8) {
          return toText.slice(-toText.length, -8) + ' Mo'
        } else if (toText.length > 4) {
          return toText.slice(-toText.length, -4) + ' Ko'
        } else if (toText.length < 4) {
          return '- de 1 Ko'
        }
      } else {
        return 'No data'
      }
    },
    /*
     * List quests rejected
     */
    async loadDisabledQuest(page, limit) {
      let response = await AdminService.ListQuestDisabled(page, limit);
      return response.data.disabledQuest;
      /* this.questDisabled.items.forEach(item => {
         AdminService.getUserMail(item.authorUserId).then(rep => {
           if (rep.status === 200) {
             item.userMail = rep.data.email
           } else {
             item.userMail = 'No User'
           }
           this.questDisabled.loading = false
         })
       })*/
    },
    async getDisabledQuestNumber() {
      const nbQuests = await AdminService.countQuestDisabled()
      return nbQuests.data.questCount
    },
    async onRequest(props) {
      const {page, rowsPerPage} = props.pagination
      this.loading = true
      console.log(page, rowsPerPage)

      const rowsNumber = await this.getDisabledQuestNumber()
      this.pagination.rowsNumber = rowsNumber

      const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage
      const startRow = page

      console.log(startRow, fetchCount)

      const returnedData = await this.loadDisabledQuest(startRow, fetchCount)
      console.log(returnedData)

      this.items.splice(0, this.items.length, ...returnedData)

      this.pagination.page = page
      this.pagination.rowsPerPage = rowsPerPage

      this.loading = false
      console.log(this.pagination)
    },
    /*
     * Open Delete Dialog Quest
     * @params {number}   _id   quest id
     * @params {number}   version   quest version
     */
    openDeleteDialog(questId, version, title = "pas de titre") {
      this.deleteQ.questId = questId
      this.deleteQ.version = version
      this.deleteQ.title = title
      this.$refs.adminDeleteDialog.show()
    },
    /*
     * Cancel Delete Dialog Quest
     */
    cancelDeleteDialog() {
      this.$refs.adminDeleteDialog.hide()
      this.deleteQ.questId = null
      this.deleteQ.version = null
      this.deleteQ.title = null
    },
    /*
     * Confirm Delete Quest
     */
    async confirmDeleteQuest() {
      console.log('delete quest : ' + this.deleteQ.questId + ' - version : ' + this.deleteQ.version)
      this.$refs.adminDeleteDialog.hide()
      this.deleteQ.questId = null
      this.deleteQ.version = null
      this.deleteQ.title = null
    }
  }
}
</script>

<style scoped>

</style>
