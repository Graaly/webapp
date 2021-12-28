<template>
  <div>
    <div v-if="offline.progress > 0 && offline.progress < 1" class="centered q-pa-md q-pb-lg q-pt-lg">
      <div v-if="design === 'prepare' && !error.raised" class="subtitle5 text-grey-6">{{ $t('label.LoadingQuestDataForOfflineMode') }}</div>
      <div v-if="design === 'download' && !error.raised" class="subtitle5 text-grey-6">{{ $t('label.Downloading') }}</div>
      <div v-if="!error.raised" class="q-pa-md">
        <q-linear-progress color="primary" track-color="grey-1" style="height: 5px" :value="offline.progress" />
        <div v-if="isIOs" class="centered">
          {{ parseInt(offline.progress * 100, 10)}} %
        </div>
        <!--<a class="text-white" @click="cancelOfflineLoading()">{{ $t('label.Cancel') }}</a>-->
      </div>
      <div v-if="error.raised && error.nb < 2" @click="saveOfflineQuest(quest)">
        <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }} 
      </div>
      <div v-if="error.raised && error.nb >= 2" @click="offline.progress = 1">
        {{ $t('label.TooMuchOfflineLoadingErrors') }} 
      </div>
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import StepService from 'services/StepService'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'

export default {
  props: ['quest', 'design', 'lang'],
  watch: { 
    // refresh component if questId change
    quest: async function(newVal, oldVal) {
      if (newVal) {
        await this.saveOfflineQuest(newVal)
      }
    }
  },
  data() {
    return {
      offline: {
        progress: 0.1
      },
      error: {
        nb: 0,
        raised: false
      },
      isIOs: (window.cordova && window.cordova.platformId && window.cordova.platformId === 'ios'),
      serverUrl: process.env.SERVER_URL
    }
  },
  async mounted() {
    if (!window.cordova) { return }
    await this.saveOfflineQuest(this.quest)
  },
  methods: {
    /*
     * Save the offline content in files
     */
    async saveOfflineQuest(quest) {
      this.error.raised = false
      
      // check if quest is not already loaded
      const isQuestOfflineLoaded = await QuestService.isCached(quest.questId)
      this.offline.progress = 0.1

      if (!isQuestOfflineLoaded) {  
        const isSaved = await this.saveQuestData(quest)
        if (!isSaved) {
          return
        }
      }
      this.offline.progress = 1;
      let _this = this;
      setTimeout(function() {
        _this.$emit('end')
      }, 3000);
    },
    /*
     * Add the quest in the offline quests list
     */
    async addQuestInOfflineList(questId) {
      // check if quests file exists
      const isQuestOfflineListExisting = await utils.checkIfFileExists('', 'quests.json')
      var quests

      if (isQuestOfflineListExisting) {
        const questFileContent = await utils.readFile('', 'quests.json')

        quests = JSON.parse(questFileContent)
      } else {
        quests = {list: []}
      }
      // check if quest is already existing in file
      var exists = false
      for (var i = 0; i < quests.list.length; i++) {
        if (quests.list[i].questId === questId) {
          exists = true
        }
      }
      if (!exists) {
        // add new quest in the list
        quests.list.push(this.quest)
      }
      
      // save quests list
      await utils.writeInFile('', 'quests.json', JSON.stringify(quests), true)
    },
    /*
     * save data in files
     */
    async saveQuestData(quest) {
      var _this = this
      // cancel save if the duration is too long
      utils.setTimeout(async () => { await _this.cancelSavingTooLong(_this.quest.questId) }, 420000)
      
      // load data
      var stepsData = await StepService.listForAQuest(quest.questId, quest.version, this.lang)
      var steps = stepsData.data.steps
      var chapters = stepsData.data.chapters
      
      // assign steps & chapters to quest
      this.quest.steps = []
      for (var i = 0; i < steps.length; i++) {
        this.quest.steps.push(steps[i].stepId)
      }
      this.quest.chapters = []
      for (i = 0; i < chapters.length; i++) {
        this.quest.chapters.push(chapters[i].chapterId)
      }
    
      if (!this.error.raised) {
        // Create quest json file
        const createQuestFileSuccess = await utils.writeInFile(quest.questId, 'quest_' + quest.questId + '.json', JSON.stringify(quest), true)

        if (!createQuestFileSuccess) {
          this.throwSaveError('Could not create quest file for quest ' + quest.questId)
          return false
        }
        
        // add quest in the offline quests
        await this.addQuestInOfflineList(quest.questId)
  
        if (!this.error.raised) {
          // update progress bar
          this.offline.progress = 0.2
         
          // Save quest picture in file
          if (quest.picture && quest.picture[this.lang] && quest.picture[this.lang] !== '') {
            const createQuestPictureSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/', quest.picture[this.lang])

            if (!createQuestPictureSuccess) {
              this.throwSaveError('Could not create quest picture for quest ' + quest.questId)
              return false
            }
          }
          this.offline.progress += 0.1
     
          // save customized hint character
          if (quest.customization && quest.customization.character && quest.customization.character !== '') {
            await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/', quest.customization.character)
          }
          
          // Save customized logo
          if (quest.customization && quest.customization.logo && quest.customization.logo !== '') {
            await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/', quest.customization.logo)
          }
          
          // Save customized sound
          if (quest.customization && quest.customization.audio && quest.customization.audio[this.lang] && quest.customization.audio[this.lang] !== '') {
            await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/', quest.customization.audio[this.lang])
          }

          // save steps
          if (stepsData && stepsData.data) {
            // compute progression steps for each step loading
            var progressIncrement = Math.ceil(70 / steps.length) / 100
            for (i = 0; i < steps.length; i++) {
              if (this.error.raised) {
                return false
              }
              var step = steps[i]
              var stepFileSuccess = await utils.writeInFile(quest.questId, 'step_' + step.stepId + '.json', JSON.stringify(step), true)
              if (!stepFileSuccess) {
                this.throwSaveError('Could not save step file for quest ' + quest.questId + ' and step ' + step.stepId)
                return false
              }
              
              // get step medias
              if (step.backgroundImage && step.backgroundImage[this.lang] && step.backgroundImage[this.lang] !== '') {
                const backgroundImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/background/', step.backgroundImage[this.lang])
                if (!backgroundImageSuccess) {
                  this.throwSaveError('Could not save background image for quest ' + quest.questId + ' and step ' + step.stepId)
                  return false
                }
              }
              if (step.videoStream && step.videoStream[this.lang] && step.videoStream[this.lang] !== '') {
                const videoStreamSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/video/', step.videoStream[this.lang])
                if (!videoStreamSuccess) {
                  this.throwSaveError('Could not save video for quest ' + quest.questId + ' and step ' + step.stepId)
                  return false
                }
              }
              if (step.audioStream && step.audioStream[this.lang] && step.audioStream[this.lang] !== '') {
                const audioStreamSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/audio/', step.audioStream[this.lang])
                if (!audioStreamSuccess) {
                  this.throwSaveError('Could not save audio for quest ' + quest.questId + ' and step ' + step.stepId)
                  return false
                }
              }
              if (step.type === 'choose' && step.options && step.options.items) {
                var chooseImageSuccess = true
                for (var k = 0; k < step.options.items.length; k++) {
                  if (step.options.items[k].imagePath) {
                    chooseImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/choose-image/', step.options.items[k].imagePath)
                    if (!chooseImageSuccess) {
                      this.throwSaveError('Could not save image for quest ' + quest.questId + ' and step "choose-image" ' + step.stepId)
                      return false
                    }
                  }
                }
              }
              if (step.type === 'memory' && step.options && step.options.items) {
                var memoryImageSuccess = true
                for (k = 0; k < step.options.items.length; k++) {
                  if (step.options.items[k].imagePath) {
                    memoryImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/memory/', step.options.items[k].imagePath)
                    if (!memoryImageSuccess) {
                      this.throwSaveError('Could not save image for quest ' + quest.questId + ' and step "memory" ' + step.stepId)
                      return false
                    }
                  }
                }
              }
              if (step.type === 'code-image' && step.options && step.options.images) {
                var codeImageSuccess = true
                for (k = 0; k < step.options.images.length; k++) {
                  if (step.options.images[k].imagePath) {
                    codeImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/code-image/', step.options.images[k].imagePath)
                    if (!codeImageSuccess) {
                      this.throwSaveError('Could not save image for quest ' + quest.questId + ' and step "code-image" ' + step.stepId)
                      return false
                    }
                  }
                }
              }
              if (step.type === 'jigsaw-puzzle' && step.options && step.options.picture && step.options.picture[this.lang] && step.options.picture[this.lang] !== '') {
                const jigsawImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/jigsaw-puzzle/', step.options.picture[this.lang])
                if (!jigsawImageSuccess) {
                  this.throwSaveError('Could not save image for quest ' + quest.questId + ' and step "jigsaw-puzzle" ' + step.stepId)
                  return false
                }
              }
              if (step.type === 'new-item' && step.options && step.options.picture && step.options.picture !== '') {
                if (step.options.picture.indexOf('statics') === -1) {
                  var newItemImageSuccess
                  if (step.options.pictures && step.options.pictures[this.lang] && step.options.pictures[this.lang] !== '') {
                    newItemImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/new-item/', step.options.pictures[this.lang])
                  } else {
                    newItemImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/new-item/', step.options.picture)
                  }
                  //if (!newItemImageSuccess) {
                  //  this.throwSaveError('Could not save image for quest ' + quest.questId + ' and step "new-item" ' + step.stepId)
                  //  return false
                  //}
                }
              }
              if (step.type === 'character' && step.options && step.options.character && step.options.character !== ''  && step.options.character !== 'usequestcharacter') {
                if (step.options.character.length > 3) {
                  const characterImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/character/', step.options.character)
                  if (!characterImageSuccess) {
                    this.throwSaveError('Could not save image for quest ' + quest.questId + ' and step "character" ' + step.stepId)
                    return false
                  }
                }
              }
              if ((step.type === 'find-item' || step.type === 'use-item') && step.options && step.options.altFile && step.options.altFile !== '') {
                if (step.options.altFile.length > 3) {
                  const altImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/background/', step.options.altFile)
                  if (!altImageSuccess) {
                    this.throwSaveError('Could not save background image for quest ' + quest.questId + ' and step ' + step.stepId)
                    return false
                  }
                }
              }
              if (step.type === 'locate-item-ar' && step.options) {
                if (step.options.picture && step.options.picture !== '') {
                  const locateItemImageSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/locate-item-ar/', step.options.picture)
                  if (!locateItemImageSuccess) {
                    this.throwSaveError('Could not save 2D image for quest ' + quest.questId + ' and step "locate-item-ar" ' + step.stepId)
                    return false
                  }
                }
                if (step.options.is3D) {
                  if (step.options.customModel) {
                    const customModelObjectSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/3dobject/', step.options.customModel + '.glb')
                    if (!customModelObjectSuccess) {
                      this.throwSaveError('Could not save custom 3D model for quest ' + quest.questId + ' and step "locate-item-ar" ' + step.stepId)
                      return false
                    }
                  } else {
                    const standardModelObjectSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/statics/3d-models/', step.options.model + '.glb')
                    if (!standardModelObjectSuccess) {
                      this.throwSaveError('Could not save standard 3D model for quest ' + quest.questId + ' and step "locate-item-ar" ' + step.stepId)
                      return false
                    }
                  }
                }
              }
              
              if (this.error.raised) {
                return false
              }
              this.offline.progress += progressIncrement
            }
            for (i = 0; i < chapters.length; i++) {
              if (this.error.raised) {
                return false
              }
              var chapterFileSuccess = await utils.writeInFile(quest.questId, 'chapter_' + chapters[i].chapterId + '.json', JSON.stringify(chapters[i]), true)
              if (!chapterFileSuccess) {
                this.throwSaveError('Could not save chapter ' + chapters[i].chapterId + ' for quest ' + quest.questId)
                return false
              }
            }
          }
          return true
        } else {
          return false
        }
      } else {
        return false
      }     
    },
    /**
     * In case there is an error on download
     */
    async throwSaveError(message) {
      console.error('OfflineLoader error: ' + message)
      Notification(this.$t('label.ErrorOfflineSaving'), 'error')
      this.error.raised = true
      this.error.nb++
      let _this = this;
      this.$q.dialog({
          dark: true,
          message: _this.$t('label.ErrorDownloadNeedsToRestart'),
          ok: true,
          cancel: true
      }).onCancel(async () => {
        _this.$router.push('/home')
      }).onOk(async () => {
        //stop the loading
        _this.cancelOfflineLoading();
        //if there is an error, remove all offline data
        _this.removeOfflineData();
        //relaunch the download
        _this.saveOfflineQuest(quest);
        //reload the loading page
        //location.reload(); 
      })
    },

    async cancelSavingTooLong() {
      if (this.offline.progress !== 0 && this.offline.progress !== 1 && !this.error.raised) {
        Notification(this.$t('label.ErrorOfflineSaving'), 'error')
        this.error.raised = true
        this.error.nb++
      }
    },
    async cancelOfflineLoading() {
      var _this = this
      // remove files
      utils.setTimeout(async () => { await _this.removeOfflineData(_this.quest.questId) }, 7000)
      
      Notification(this.$t('label.CancelOfflineWarning'), 'warning')
      this.offline.progress = 0
      this.$emit('end')
    },
    /*
     * Remove offline data
     */
    async removeOfflineData(questId) {
      const success = await utils.removeDirectory(questId)
      
      await this.removeQuestFromOfflineList(questId)

      return success
    },
    /*
     * remove the quest in the offline quests list
     */
    async removeQuestFromOfflineList(questId) {
      // check if quests file exists
      const isQuestOfflineListExisting = await utils.checkIfFileExists('', 'quests.json')
      var quests

      if (isQuestOfflineListExisting) {
        const questFileContent = await utils.readFile('', 'quests.json')

        quests = JSON.parse(questFileContent)
        
        // check if quest is already existing in file
        var questPosition = -1
        for (var i = 0; i < quests.list.length; i++) {
          if (quests.list[i].questId === questId) {
            questPosition = i
          }
        }
        
        if (questPosition !== -1) {
          quests.list.splice(questPosition, 1)
        }
        
        // save quests list
        await utils.writeInFile('', 'quests.json', JSON.stringify(quests), true)
      }
    }
  }
}
</script>
