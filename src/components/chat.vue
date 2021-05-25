<template>
  <div class="chat">
    <div class="subtitle3 q-pb-lg" @click="scrollBottom">Demande d'aide</div>
    <q-scroll-area
      class="q-pb-md row messages"
      v-if="arrayOfMessages.length > 0"
      ref="scroll"
    >
      <q-intersection
        v-for="message of arrayOfMessages"
        :key="message.id"
        transition="scale"
        once
      >
        <q-chat-message
          :name="message.admin ? 'Admin' : 'Vous'"
          :text="[message.content]"
          :stamp="timeMessage(message)"
          :sent="!message.admin"
          :bg-color="message.admin ? 'secondary' : 'accent'"
          text-color="white"
        />
      </q-intersection>
    </q-scroll-area>
    <q-input
      rounded
      outlined
      dense
      v-model="messageToSend"
      label="Ecrire un message"
      style="width: calc(100% - 20px); max-width: 550px"
      class="q-mb-sm input-message"
      @keyup.enter="SendChatMessage"
    >
      <template v-slot:after>
        <q-btn
          round
          dense
          flat
          :color="writeMessage ? 'primary' : 'grey'"
          :disabled="!writeMessage"
          icon="send"
          @click="SendChatMessage"
        />
      </template>
    </q-input>
  </div>
</template>

<script>
import GMMS from "../services/GameMasterMonitoringService_mqtt"
import chat from '../services/ChatService'
import { format, register } from 'timeago.js'
import { QChatMessage, QIntersection, QScrollArea } from 'quasar'

export default {
  name: "chat",
  components: {
    QChatMessage,
    QIntersection,
    QScrollArea
  },
  props: {
    questId: String,
    isOpened: Boolean
  },
  data () {
    return {
      messageToSend: '',
      writeMessage: false
    }
  },
  computed: {
    player () {
     return this.$store.state.user.name
    },
    arrayOfMessages () {
      return this.$store.state.chatMessages
    }
  },
  watch: {
    isOpened () {
      this.scrollBottom()
    },
    messageToSend (val) {
      if (val.length >= 3) {
        this.writeMessage = true
      } else {
        this.writeMessage = false
      }
    },
    arrayOfMessages () {
      this.scrollBottom()
    }
  },
  methods: {
    SendChatMessage () {
      const data = {
        ts: new Date(),
        questId: this.questId,
        userId: this.$store.state.user.id,
        name: this.player,
        admin: false,
        content: this.messageToSend
      }
      GMMS.SendChat(this.questId, data)
      this.messageToSend = ''
      this.scrollBottom()
    },
    timeMessage (message) {
      return format(message.ts, 'FR-fr')
    },
    scrollBottom () {
      setTimeout(() => {
        const scrollArea = this.$refs.scroll;
        const scrollTarget = scrollArea.getScrollTarget();
        const duration = 300; // ms - use 0 to instant scroll
        scrollArea.setScrollPosition(scrollTarget.scrollHeight, duration);
      }, 200)
    }
  },
  mounted() {
    GMMS.Connect(this.questId)
    chat.getUserMessages(this.$store.state.user.id).then(response  => {
      this.$store.commit('setChatMessage', response)
    })

  }
}
// TimeAgo FR Translate
const localeFunc = (number, index, totalSec) => {
  return [
    ["à l'instant", 'dans un instant'],
    ['il y a %s secondes', 'dans %s secondes'],
    ['il y a 1 minute', 'dans 1 minute'],
    ['il y a %s minutes', 'dans %s minutes'],
    ['il y a 1 heure', 'dans 1 heure'],
    ['il y a %s heures', 'dans %s heures'],
    ['il y a 1 jour', 'dans 1 jour'],
    ['il y a %s jours', 'dans %s jours'],
    ['il y a 1 semaine', 'dans 1 semaine'],
    ['il y a %s semaines', 'dans %s semaines'],
    ['il y a 1 mois', 'dans 1 mois'],
    ['il y a %s mois', 'dans %s mois'],
    ['il y a 1 an', 'dans 1 an'],
    ['il y a %s ans', 'dans %s ans']
  ][index]
}
// register your locale with timeago
register('FR-fr', localeFunc)
</script>

<style scoped>
.chat {
  height: calc(100vh - 170px);
  width: 100%;
  max-width: 550px;
  margin: 0 auto
}
.messages{
  height: calc(100vh - 200px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
}
.input-message{
   position: fixed;
   bottom: 90px;
}
</style>
