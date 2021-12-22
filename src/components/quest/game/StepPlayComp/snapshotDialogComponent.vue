<template>
  <q-dialog ref="snapshotDialog" persistent maximized position="bottom">
    <q-card class="full-height">
      <q-card-section class="row items-center q-pb-none">
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
        <q-btn color="primary" :label="$t('snapshot.share')" @click="shareWithFriend" />
        <q-btn color="primary" :label="$t('snapshot.save')" @click="saveAndDownload" />
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
  props: ['snapshotFilename', 'blob', 'quest', 'step', 'isHybrid'],

  data() {
    return {
      dataURL: null,
      fileEntry: null
    }
  },
  async mounted() {
    this.dataURL = await this.blobToBase64(this.blob)
    this.createFileEntry()
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
    createFileEntry() {
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, (fs) => {
        const fileName = this.snapshotFilename
        const createFile = (dirEntry, fileName, data) => {
          dirEntry.getFile(fileName, {create: true, exclusive: false}, fileEntry => {
            writeFile(fileEntry, data)
          })
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
        createFile(fs.root, fileName, this.blob)
      })
    },
    async saveSnapshotOnServer(blob, filename) {
      if (this.quest.customization && this.quest.customization.saveSelfieOnServer) {
        try {
          let formData = new FormData()
          formData.append("image", blob, filename)
          await StepService.uploadSnapshot(this.step.questId, formData)
          Notification(this.$t('label.SnapshotTaken'), 'info')
        } catch (err) {
          console.error(err)
          Notification(this.$t('label.ErrorTakingSnapshot'), 'error')
        }
      }
    },
    // CREATE DATAURL FROM BLOB
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    },

    // Dialog Method
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
  },
  beforeDestroy() {
    // Delete the temporary file
    this.fileEntry.remove()
    this.fileEntry = null
    this.dataURL = null
  }
}
</script>

<style scoped>

</style>
