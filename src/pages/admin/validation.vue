<template>
  <div class="wrapper">
    <div class="page-content top-padding-middle" v-if="quest.title">
      <!------------------ MAIN INFORMATION AREA ------------------------>
      <p>
        Validation of the quest <strong>{{ quest.title }}</strong>
      </p>
      <p>
        <q-btn
          big
          class="full-width"
          color="positive"
          @click="publish()"
          label="Validate"
        />
      </p>
      <p>
        <q-btn
          big
          class="full-width"
          color="negative"
          @click="reject()"
          label="Reject"
        />
      </p>
      <p>
        if you reject, do not forget to contact the owner to explain why the
        quest is rejected
      </p>
    </div>
  </div>
</template>

<script>
import AdminService from "services/AdminService";
import QuestService from "services/QuestService";

export default {
  data() {
    return {
      quest: {},
      serverUrl: process.env.SERVER_URL
    };
  },
  async mounted() {
    // get quest information
    await this.getQuest(this.$route.params.questId, this.$route.params.version);
  },
  methods: {
    /*
     * Get a quest information
     * @param   {string}    id             Quest ID
     * @param   {number}    version        Quest version
     */
    async getQuest(id, version) {
      let response = await QuestService.getById(id, version);
      this.quest = response.data;
    },
    /*
     * publish the quest
     */
    async publish() {
      await AdminService.publish(this.$route.params.questId);
      this.$router.push("/admin");
    },
    /*
     * Reject the quest
     */
    async reject() {
      await AdminService.reject(this.$route.params.questId);
      this.$router.push("/admin");
    }
  }
};
</script>
