<template>
  <div>
    <qr-code-stream
      v-on:QrCodeResult="checkCode"
      :color="'accent'"
    />
    <div style="max-width: 350px; margin: 0 auto;">
      <back-bar color="accent" v-if="fromLogin"/>
    </div>
  </div>
</template>

<script>
import qrCodeStream from "../../components/qrCodeStream"
import QuestService from '../../services/QuestService'
import Notification from '../../boot/NotifyHelper'
import utils from "../../includes/utils";
import axios from "axios";
import backBar from "../../components/user/UI/backBar";

export default {
  name: "scanCode",
  components: {
    qrCodeStream,
    backBar
  },
  data() {
    return {
      fromLogin: true
    }
  },
  mounted() {
    if (this.$route.params.login === 'false') {
      this.fromLogin = false
    }
    console.log('from login', this.fromLogin)
  },
  methods: {
    /*
     * Check if the quest code is valid
     * @param   {String}  code            QR Code value
     */
    async checkCode(code) {
      code = utils.removeUnusedUrl(code)
      // From login page
      if (this.fromLogin) {
        let checkStatus = await QuestService.checkLoginQRCode(code, this.$t('label.shortLang'))
        if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
          if (checkStatus.data.user) {
            window.localStorage.setItem('jwt', checkStatus.data.user.jwt)
            axios.defaults.headers.common['Authorization'] = `Bearer ${checkStatus.data.user.jwt}`
            if (code.indexOf('_score') === -1) {
              if (code.indexOf('-slash-') === -1 && code.indexOf('tierplay_') === -1) {
                if (checkStatus.data.questId) {
                  this.$router.push('/quest/play/' + checkStatus.data.questId)
                } else {
                  this.$router.push('/quest/play/' + code)
                }
              } else {
                this.$q.dialog({
                  message: this.$t('label.UniqueUsageQRCodeWarning'),
                  ok: this.$t('label.Ok')
                }).onOk(data => {
                  if (checkStatus.data.questId) {
                    this.$router.push('/quest/play/' + checkStatus.data.questId)
                  } else {
                    this.$router.push('/quest/play/' + code)
                  }
                })
              }
            } else {
              this.$router.push('/quest/' + (code.substring(0, 24)) + '/end')
            }
          } else {
            Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
          }
        } else {
          Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
        }
      }
      // From Other page
      else {
        let checkStatus = await QuestService.checkQRCode(code, this.$t('label.shortLang'))
        if (checkStatus && checkStatus.data && checkStatus.data.status === 'ok') {
          if (code.indexOf('_score') === -1) {
            if (checkStatus.data.questId) {
              this.playQuest(checkStatus.data.questId)
            } else {
              this.playQuest(code)
            }
          } else {
            this.$router.push('/quest/' + (code.substring(0, 24)) + '/end')
          }
        } else {
          Notification(this.$t('label.QRCodeIsNotWorking'), 'error')
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
