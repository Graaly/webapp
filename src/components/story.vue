<template>
  <div class="story fit" v-if="currentStep.id !== null" :class="{fadeout: hide}" style="background: rgba(0,0,0,0.3); height: 100%;">
    <div :style="'position: fixed; bottom: ' + steps[currentStep.id].bottom + 'px;'">
      <div class="bubble-top"><img src="statics/icons/story/sticker-top.png" /></div>
      <div class="bubble-middle" style="background: url(statics/icons/story/sticker-middle.png) repeat-y;">
        <p v-html="$t('story.' + steps[currentStep.id].discussions[currentStep.discussionId].text, data)"></p>
        <div class="right">
          <a v-if="steps[currentStep.id].discussions[currentStep.discussionId].link" @click="linkAction">
            {{ $t('label.' + steps[currentStep.id].discussions[currentStep.discussionId].link.label) }}
          </a> &nbsp;
          <q-btn color="primary" @click="next">
            {{ steps[currentStep.id].discussions[currentStep.discussionId].hasOwnProperty("button") ? $t('label.' + steps[currentStep.id].discussions[currentStep.discussionId].button.label) : $t('label.Next') + '>>' }}
          </q-btn>
        </div>
      </div>
      <div class="bubble-bottom"><img src="statics/icons/story/sticker-bottom.png" /></div>
      <div class="character">
        <img :src="'statics/icons/story/character' + steps[currentStep.id].discussions[currentStep.discussionId].character + '_attitude1.png'" />
      </div>
    </div>
  </div>
</template>

<script>
import UserService from 'services/UserService'

export default {
  props: ['step', 'data'],
  data() {
    return {
      steps: [
        // step 0 - Graaly introduction
        {
          discussions: [
            {character: "1", text: "Welcome", condition: null},
            {character: "1", text: "FirstStep", condition: null},
            {character: "1", text: "PresentTeam", condition: null},
            {character: "2", text: "PresentSecretary1", condition: null},
            {character: "2", text: "PresentSecretary2", condition: null},
            {character: "3", text: "PresentIndicator1", condition: null},
            {character: "3", text: "PresentIndicator2", condition: null},
            {character: "1", text: "StartPlaying", condition: null, nextStep: 3}
          ],
          bottom: 0
        },
        // step 1 - Secretary introduce a quest
        {
          discussions: [
            {character: "2", text: "WelcomeToQuest1", link: {label: "BackToTheMap", action: "/map"}, condition: null},
            {character: "2", text: "WelcomeToQuest2", link: {label: "BackToTheMap", action: "/map"}, condition: (this.data && this.data.hasOwnProperty("startingPlace") && (typeof this.data.startingPlace !== 'undefined') && this.data.startingPlace.length > 1)},
            {character: "2", text: "YouAlreadyDidThisQuest", condition: (this.data && this.data.isRunFinished)},
            {character: "2", text: "YouAreQuestOwnerDesc", condition: (this.data && this.data.isOwner)},
            {character: "2", text: "QuestIsFarFromUser", condition: (this.data && this.data.isFar && this.data.hasOwnProperty("startingPlace") && (typeof this.data.startingPlace !== 'undefined') && this.data.startingPlace.length > 1)},
            {character: "2", text: "QuestParams", condition: (this.data && this.data.hasOwnProperty("score") && this.data.score > 0)},
            {character: "2", text: "description", condition: (this.data && this.data.hasOwnProperty("description") && this.data.description.length > 1)},
            {character: "2", text: "GeneralWarning", condition: null}
          ],
          bottom: 0
        },
        // step 2 - Hint
        {
          discussions: [
            {character: "3", text: "hint", button: {label: "OkThanks"}, condition: null}
          ],
          bottom: 50
        },
        // step 3 - Discovery quest
        {
          discussions: [
            {character: "1", text: "DiscoveryQuest1", button: {label: "letsGo", action: "/quest/play/5b7303ec4efbcd1f8cb101c6"}, condition: null, nextStep: 4}
          ],
          bottom: 0
        },
        // step 4 - Discovery quest
        {
          discussions: [
            {character: "1", text: "DiscoveryQuest2", condition: null},
            {character: "1", text: "DiscoveryQuest3", condition: null},
            {character: "1", text: "DiscoveryQuest4", condition: null},
            {character: "1", text: "DiscoveryQuest5", condition: null},
            {character: "1", text: "DiscoveryQuest6", condition: null},
            {character: "1", text: "DiscoveryQuest7", condition: null, nextStep: 5}
          ],
          bottom: 50
        },
        // step 5 - Discovery quest
        {
          discussions: [
            {character: "1", text: "DiscoveryQuest8", condition: null},
            {character: "1", text: "DiscoveryQuest9", condition: null},
            {character: "1", text: "DiscoveryQuest10", condition: null, nextStep: 6}
          ],
          bottom: 50
        },
        // step 6 - Discovery quest
        {
          discussions: [
            {character: "1", text: "DiscoveryQuest11", condition: null},
            {character: "1", text: "DiscoveryQuest12", condition: null, nextStep: 7}
          ],
          bottom: 50
        },
        // step 7 - Discovery quest
        {
          discussions: [
            {character: "1", text: "DiscoveryQuest13", condition: null, nextStep: 8}
          ],
          bottom: 50
        },
        // step 8 - Discovery quest
        {
          discussions: [
            {character: "1", text: "DiscoveryQuest14", condition: null},
            {character: "1", text: "DiscoveryQuest15", condition: null},
            {character: "1", text: "DiscoveryQuest16", condition: null, nextStep: 10}
          ],
          bottom: 50
        },
        // step 9 - End of first quest
        {
          discussions: [
            {character: "1", text: "EndQuest1", condition: null},
            {character: "1", text: "EndQuest2", condition: (this.data && this.data.discovery)},
            {character: "1", text: "EndQuest3", condition: (this.data && this.data.hasOwnProperty("progress") && this.data.progress > 80)},
            {character: "1", text: "EndQuest4", condition: (this.data && this.data.discovery)},
            {character: "1", text: "EndQuest5", condition: (this.data && this.data.discovery)},
            {character: "1", text: "EndQuest6", condition: null}
          ],
          bottom: 0
        },
        // step 10 - Return to map
        {
          discussions: [
            {character: "1", text: "MapReturn", condition: null, nextStep: 11}
          ],
          bottom: 0
        },
        // step 11 - Score
        {
          discussions: [
            {character: "1", text: "RankingDescription1", condition: null},
            {character: "1", text: "RankingDescription2", condition: null},
            {character: "1", text: "RankingDescription3"},
            {character: "1", text: "RankingDescription4", condition: null, nextStep: 12}
          ],
          bottom: 0
        },
        // step 12 - Complete profile
        {
          discussions: [
            {character: "2", text: "CompleteProfile1", condition: null},
            {character: "2", text: "CompleteProfile2", condition: null, nextStep: 13}
          ],
          bottom: 0
        },
        // step 13 - Detail of the map
        {
          discussions: [
            {character: "2", text: "MapDetail1", condition: null, nextStep: 14}
          ],
          bottom: 0
        },
        // step 14 - Add friends
        {
          discussions: [
            {character: "2", text: "AddFriends", condition: null, nextStep: 15}
          ],
          bottom: 0
        },
        // step 15 - Create quest
        {
          discussions: [
            {character: "1", text: "CreateQuest1", condition: null},
            {character: "1", text: "CreateQuest2", condition: null},
            {character: "1", text: "CreateQuest3", condition: null, button: {label: "CreateAQuest", action: "/quest/create/welcome"}, link: {label: "NoThanks"}, nextStep: 16}
          ],
          bottom: 0
        },
        // step 16 - Start a new quest
        {
          discussions: [
            {character: "1", text: "StartNewQuest1", condition: null},
            {character: "1", text: "StartNewQuest2", condition: (this.data !== null && this.data.hasOwnProperty("questId")), button: {label: "letsGo", action: "/quest/play/" + ((this.data && this.data.hasOwnProperty("questId")) ? this.data.hasOwnProperty("questId") : '0')}, link: {label: "NoThanks"}},
            {character: "1", text: "StartNewQuest3", condition: null}
          ],
          bottom: 0
        }
      ],
      currentStep: {
        id: null,
        discussionId: 0
      },
      nextStep: 0,
      hide: false
    }
  },
  async mounted() {
    this.currentStep.id = this.step
    this.currentStep.discussionId = 0
    this.nextStep = this.step
    this.hide = false
  },
  methods: {
    /*
     * User select an offer in the shop
     */
    async next() {
      if (this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].hasOwnProperty("button") && this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].button.hasOwnProperty("action")) {
        this.$router.push(this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].button.action)
      } else {
        await this.closeStory()
      }
    },
    async closeStory() {
      if (this.steps[this.currentStep.id].discussions.length - 1 > this.currentStep.discussionId) {
        this.currentStep.discussionId++
        while (this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].condition === false) {
          this.currentStep.discussionId++
        }
      } else {
        if (this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].hasOwnProperty("nextStep")) {
          this.nextStep = this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].nextStep
          await UserService.nextStoryStep(this.nextStep)
        }
        // TODO : transition
        this.hide = true
        setTimeout(this.emitNext, 2000)
      }
    },
    emitNext() {
      this.$emit('next', this.nextStep)
    },
    async linkAction() {
      if (this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].link.hasOwnProperty("action")) {
        this.$router.push(this.steps[this.currentStep.id].discussions[this.currentStep.discussionId].link.action)
      } else {
        await this.closeStory()
      }
    }
  }
}
</script>
