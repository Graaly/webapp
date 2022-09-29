<template>
  <q-table
    class="container"
    title="Games awaiting validation"
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
        <q-th auto-width />
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        >
          {{ col.label }}
        </q-th>
        <q-th auto-width>Play</q-th>
        <q-th auto-width>Validate</q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-avatar square>
            <img v-if="props.row.thumb.fr" :src="uploadUrl + '/upload/quest/' + props.row.thumb.fr">
            <img v-else-if="props.row.picture.fr" :src="uploadUrl + '/upload/quest/' + props.row.picture.fr">
            <img v-if="!props.row.picture" src="statics/profiles/noprofile.png">
          </q-avatar>
        </q-td>
        <q-td auto-width key="name">{{ props.row.title.fr }}</q-td>
        <q-td auto-width key="author">{{ props.row.author }}<br><span style="font-size: 10px;" class="text-secondary">{{ props.row.authorUserId }}</span></q-td>
        <q-td auto-width key="mail"><q-btn v-if="props.row.userMail" size="8px" flat round color="accent" icon="content_copy" class="q-mr-sm" @click="copy(props.row.userMail)">
          <q-tooltip>
            {{ props.row.userMail.length > 0 ? props.row.userMail : '-- Pas de mail --' }}
          </q-tooltip>
        </q-btn></q-td>
        <q-td auto-width key="access">{{ props.row.access }}</q-td>
        <q-td auto-width key="premium">{{ props.row.isPremium ? 'Premium' : 'Individual' }}</q-td>
        <q-td auto-width class="text-center">
          <q-btn size="md" color="accent" glossy icon="play_arrow"  @click.native="$router.push('/quest/play/' + props.row.questId)"/>
        </q-td>
        <q-td auto-width class="text-center">
          <q-btn size="md" color="primary" glossy icon="done" @click="validate(props.row.questId, props.row.version)"/>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import AdminService from "../../services/AdminService";
export default {
  name: "validateQuestPanel",
  data() {
    return {
      loading: true,
      items: [],
      visible: ['name', 'author', 'mail', 'access', 'premium'],
      columns: [
        {name: 'id', label: 'ID', field: 'questId'},
        {name: 'name', required: true, label: 'Name', align: 'left', sortable: true, field: row => row.title.fr},
        {name: 'author', required: true, label: 'Author', align: 'left', sortable: true, field: 'author'},
        {name: 'mail', label: 'Mail', sortable: true, align: 'left', field: 'userMail'},
        {name: 'access', label: 'Access', align: 'left', sortable: true, field: 'access'},
        {name: 'premium', label: 'Premium', align: 'left', sortable: true, field: row => row.isPremium ? 'Premium' : 'Individual'}
      ],
      initialPagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10
      },
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL
    }
  },
  mounted() {
    this.loadQuestsToValidate()
  },
  methods: {
    async loadQuestsToValidate() {
      // get quests to validate
      let response = await AdminService.ListQuestsToValidate();
      this.items = response.data.quests;
      // console.log(this.questsToValidate.items)
      // get mail for Main Author
      this.items.forEach(item => {
        AdminService.getUserMail(item.authorUserId).then(rep => {
          if (rep.status === 200) {
            item.userMail = rep.data.email
          } else {
            item.userMail = 'No User'
          }
        })
      })
      this.loading = false
    },
    async validate(questId, version) {
      this.$router.push("/admin/validate/" + questId + "/version/" + version);
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
