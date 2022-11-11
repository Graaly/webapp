<template>
  <div class="scroll background-admin">
    <div>

      <!------------------ TABS AREA ------------------------>

      <q-tabs v-model="adminTab" class="bg-primary text-white" indicator-color="accent" active-bg-color="accent">
        <q-tab name="validation" icon="check_box" label="Validation" default/>
        <q-tab name="rejected" icon="sentiment_very_dissatisfied" label="Rejected"/>
        <q-tab name="earnings" icon="euro" label="Earnings"/>
        <q-tab name="statistics" icon="bar_chart" label="Statistics"/>
        <q-tab name="limitations" icon="pan_tool" label="Limitations"/>
        <q-tab name="disabled" icon="pan_tool" label="Désactivées"/>
      </q-tabs>

      <q-tab-panels v-model="adminTab" animated>
        <!------------------ LIST OF QUESTS TO VALIDATE TAB ------------------------>

        <q-tab-panel name="validation">
            <validate-quest-panel/>
        </q-tab-panel>

        <!------------------ LIST OF QUESTS REJECTED TAB ------------------------>

        <q-tab-panel name="rejected">
          <rejected-quest-panel/>
        </q-tab-panel>

        <!------------------ EARNINGS TAB ------------------------>

        <q-tab-panel name="earnings">
          <earning-quest-panel/>
        </q-tab-panel>

        <!------------------ MINI GAMES TAB ------------------------>

        <q-tab-panel name="statistics">
          <statistic-quest-panel/>
        </q-tab-panel>

        <!------------------ LIMITATIONS TAB ------------------------>

        <q-tab-panel name="limitations">
          <limitation-quest-panel/>
        </q-tab-panel>

        <!------------------ DISABLED QUEST TAB ------------------------>
        <q-tab-panel name="disabled">
          <disabled-quest-panel/>
        </q-tab-panel>

      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import validateQuestPanel from "../../components/admin/validateQuestPanel";
import rejectedQuestPanel from "../../components/admin/rejectedQuestPanel";
import earningQuestPanel from "../../components/admin/earningQuestPanel";
import statisticQuestPanel from "../../components/admin/statisticQuestPanel";
import limitationQuestPanel from "../../components/admin/limitationQuestPanel";
import disabledQuestPanel from "../../components/admin/disabledQuestPanel";

export default {
  components: {
    validateQuestPanel,
    rejectedQuestPanel,
    earningQuestPanel,
    statisticQuestPanel,
    limitationQuestPanel,
    disabledQuestPanel
  },
  data() {
    return {
      adminTab: "validation"
    };
  }
};
</script>

<style>
.background-admin {
  background-image: url('../../statics/new/h-center-background-logo.jpg');
  background-position: center 0px;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 16px 16px 32px;
}
</style>
