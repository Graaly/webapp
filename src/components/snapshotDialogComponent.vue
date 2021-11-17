<template>
  <q-dialog ref="snapshotDialog" persistent position="bottom" maximized>
    <q-card class="full-width full-height">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Close icon</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="onCancelClick" />
      </q-card-section>

      <q-card-section>
        <q-img
          :src="dataURL"
          spinner-color="white"
          style="max-width: 80%; max-height: 80%; margin: 0 auto; display: block;"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" :label="$t('snapshot.share')" @click="shareWithFriend" />
        <q-btn color="primary" :label="$t('snapshot.save')" @click="saveAndDownload" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import utils from "../includes/utils";

export default {
  name: "snapshotDialogComponent",
  props: ['canvas', 'snapshotFilename', 'blob'],

  computed: {
    dataURL() {
      return this.canvas.toDataURL('image/jpeg')
    }
  },
  methods: {
    async saveAndDownload() {
      utils.downloadDataUrl(this.canvas.toDataURL('image/jpeg'), this.snapshotFilename)
    },
    async shareWithFriend() {
      let file = await new File([this.blob], "capture" + Date.now() + ".jpg", {type: "image/jpeg"})
      let _this = this
      await share(file)
      async function share(file) {
        if (navigator.share) {
          try {
            await navigator.share({
              //text: 'text test partage image',
              files: [file],
              title: _this.$t('snapshot.shareTitle') // Partagez avec vos amis
              //url: 'some_url'
            })
          } catch (e) {
            console.log('share abort')
          }
        } else {
          _this.$q.notify({
            message: _this.$t('snapshot.notSupported'), // Cette fonction n'est pas supportée
            color: "negative"
          })
        }
      }
    },
    show () {
      this.$refs.snapshotDialog.show()
    },
    hide () {
      this.$refs.snapshotDialog.hide()
    },
    // onDialogHide () {
    //   this.$emit('hide')
    // },
    // onOKClick () {
    //   this.$emit('ok')
    //   this.hide()
    // },
    onCancelClick () {
      this.hide()
      this.$emit('hide')
    }
  }
}
</script>

<style scoped>

</style>
