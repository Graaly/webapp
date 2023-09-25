<template>
  <q-dialog ref="snapshotDialog" persistent maximized position="bottom">
    <q-card class="full-height">

      <q-card-section class="row items-center q-pb-none q-mt-lg">
        <div class="text-h6"></div>
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
        <q-btn
          :color="(!color || color === 'primary' || color === '') ? 'primary' : ''"
          :style="(!color || color === 'primary' || color === '') ? '' : 'background-color: ' + color"
          :label="$t('snapshot.share')"
          @click="shareWithFriend" />
        <q-btn
          :color="(!color || color === 'primary' || color === '') ? 'primary' : ''"
          :style="(!color || color === 'primary' || color === '') ? '' : 'background-color: ' + color"
          :label="$t('snapshot.save')"
          @click="saveAndDownload" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import Notification from 'src/boot/NotifyHelper'
import utils from "src/includes/utils";
import StepService from 'src/services/StepService'

export default {
  name: "snapshotDialogComponent",
  props: ['snapshotFilename', 'blob', 'quest', 'step', 'isHybrid', 'color', 'runId'],

  data() {
    return {
      dataURL: null,
      fileEntry: null,
      isIOs: utils.isIOS(),
      isSafari: utils.isSafari(),
      fileName: this.snapshotFilename
    }
  },
  async mounted() {
    this.dataURL = await this.blobToBase64(this.blob)
    if (this.isHybrid) {
      this.createFileEntry()
    }
  },
  methods: {
    async saveAndDownload() {
      if (this.isHybrid) {
        this.saveToGallery(this.blob)
      } else {
        await utils.downloadDataUrl(this.dataURL, this.snapshotFilename)
        this.$q.notify({
          message: this.$t('snapshot.fileDownload'), // Cette fonction n'est pas supportée
          color: "positive"
        })
      }
      await this.saveSnapshotOnServer(this.blob, this.snapshotFilename)
    },
    async shareWithFriend() {
      let filesArray = []
      const file = await new File([this.blob], "capture" + Date.now() + ".jpg", {type: "image/jpeg"})
      filesArray.push(file)
      if (this.isHybrid) {
        window.plugins.socialsharing.share(null, null, this.fileEntry.nativeURL, null, () => { console.log('SUCCESS SHARE') }, () => { console.log("ERROR SHARE") });
      } else {
        if (navigator.share && navigator.canShare({ files: filesArray })) {
          navigator.share({
            files: [file]
          })
        } else {
          this.$q.notify({
            message: this.$t('snapshot.notSupported'), // Cette fonction n'est pas supportée
            color: "negative"
          })
        }
      }
    },
    /* HYBRID - SAVE THE IMAGE TO GALLERY WITH IMAGESAVER PLUGIN */
    saveToGallery() {
      const saveSuccess = () => {
        // Message To Users when is saved
        this.$q.notify({
          message: this.$t('snapshot.imageSavedToGallery'),
          color: "positive"
        })
        // Save on the server
        this.saveSnapshotOnServer(this.blob, this.snapshotFilename)
      }

      const saveFailed = (error) => {
        console.log(error)
        this.$q.notify({
          message: this.$t('snapshot.imageSavedFailed'),
          color: "negative"
        })
      }
      cordova.plugins.imagesaver.saveImageToGallery(this.fileEntry.nativeURL, saveSuccess, saveFailed)
    },
    /* HYBRID - CREATE THE FILE TO SAVE OR SHARE*/
    createFileEntry() {
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, dirEntry => {
        const fileName = this.fileName.replace(/[-:]/g, '')
        createFile(dirEntry, fileName, this.blob)
      })
      const createFile = (dirEntry, fileName, data) => {
        dirEntry.getFile(fileName, {create: true, exclusive: false}, fileEntry => {
          writeFile(fileEntry, data)
        }, error => { console.log(error) })
      }
      const writeFile = (fileEntry, dataObj) => {
        fileEntry.createWriter(fileWriter => {
          fileWriter.onerror = (error) => {
            console.log("Error on Write file")
            console.log(error)
          }
          fileWriter.write(dataObj)
          this.fileEntry = fileEntry
        })
      }
    },
    /* Old Function ... */
    async saveSnapshotOnServer(blob, filename) {
      console.log(this.quest.customization.saveSelfieOnServer)
      if (this.quest.customization && this.quest.customization.saveSelfieOnServer) {
        console.log("save to server")
        try {
          let formData = new FormData()
          formData.append("image", blob, filename)
          await StepService.uploadSnapshot(this.step.questId, this.runId, this.step.stepId, formData)
          Notification(this.$t('label.SnapshotTaken'), 'info')
        } catch (err) {
          console.error(err)
          Notification(this.$t('label.ErrorTakingSnapshot'), 'error')
        }
      }
    },
    // CREATE DATA-URL FROM BLOB FOR WEBAPP
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },

    /* OPEN - CLOSE DIALOG */
    show () {
      this.$refs.snapshotDialog.show()
    },
    hide () {
      this.$refs.snapshotDialog.hide()
    },
    onCancelClick () {
      this.hide()
      this.$emit('hide')
    }
  },
  beforeDestroy() {
    // Delete the temporary file
    this.fileEntry = null
    this.dataURL = null
  }
}
</script>

<style scoped>

</style>
