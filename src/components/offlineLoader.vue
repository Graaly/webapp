<template>
  <div>
    <div v-if="offline.progress > 0 && offline.progress < 1" class="bg-secondary centered fixed-bottom q-pa-md q-pb-lg q-pt-lg">
      <div v-if="design === 'prepare'">{{ $t('label.LoadingQuestDataForOfflineMode') }}</div>
      <div v-if="design === 'download'">{{ $t('label.Downloading') }} {{quest.title.fr}}</div>
      <q-linear-progress color="primary" stripe style="height: 10px" :value="offline.progress" />
      <a class="text-white" @click="cancelOfflineLoading()">{{ $t('label.Cancel') }}</a>
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import StepService from 'services/StepService'
import Notification from 'boot/NotifyHelper'
import utils from 'src/includes/utils'

export default {
  props: ['quest', 'design'],
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
      // check if quest is not already loaded
      const isQuestOfflineLoaded = await QuestService.isCached(quest.questId)
      
      if (!isQuestOfflineLoaded) {
        await this.saveQuestData(quest)
        this.offline.progress = 0.1
      } else {
        this.offline.progress = 1
      }
      
      this.$emit('end')
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
      // load data
      var stepsData = await StepService.listForAQuest(quest.questId, quest.version)
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
    
      if (this.offline.progress > 0) {
        // Create quest json file
        const createQuestFileSuccess = await utils.writeInFile(quest.questId, 'quest_' + quest.questId + '.json', JSON.stringify(quest), true)

        if (!createQuestFileSuccess) {
          Notification(this.$t('label.ErrorOfflineSaving'), 'error')
          this.offline.progress = 0
          return false
        }
        
        // add quest in the offline quests
        await this.addQuestInOfflineList(quest.questId)
  
        if (this.offline.progress > 0) {
          // update progress bar
          this.offline.progress = 0.2
         
          // Save quest picture in file
          if (quest.picture && quest.picture !== '') {
            const createQuestPictureSuccess = await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/', quest.picture)

            if (!createQuestPictureSuccess) {
              Notification(this.$t('label.ErrorOfflineSaving'), 'error')
              this.offline.progress = 0
              return false
            }
            this.offline.progress += 0.1
          } else {
            this.offline.progress += 0.1
          }

          // save steps
          if (stepsData && stepsData.data) {
            // compute progression steps for each step loading
            var progressIncrement = Math.ceil(70 / steps.length) / 100
            for (i = 0; i < steps.length; i++) {
              if (this.offline.progress === 0) {
                return false
              }
              var step = steps[i]
              var stepFileSuccess = await utils.writeInFile(quest.questId, 'step_' + step.stepId + '.json', JSON.stringify(step), true)
              if (!stepFileSuccess) {
                Notification(this.$t('label.ErrorOfflineSaving'), 'error')
                this.offline.progress = 0
                return false
              }
              
              // get step medias
              if (step.backgroundImage && step.backgroundImage !== '') {
                await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/background/', step.backgroundImage)
              }
              if (step.videoStream && step.videoStream !== '') {
                await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/video/', step.videoStream)
              }
              if (step.type === 'image-recognition' && step.answers && step.answers !== '') {
                await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/image-recognition/', step.answers)
              }
              if (step.type === 'choose' && step.options) {
                for (var k = 0; k < step.options.length; k++) {
                  if (step.options[k].imagePath) {
                    await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/choose-image/', step.options[k].imagePath)
                  }
                }
              }
              if (step.type === 'memory' && step.options && step.options.items) {
                for (k = 0; k < step.options.items.length; k++) {
                  if (step.options.items[k].imagePath) {
                    await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/memory/', step.options.items[k].imagePath)
                  }
                }
              }
              if (step.type === 'code-image' && step.options && step.options.images) {
                for (k = 0; k < step.options.images.length; k++) {
                  if (step.options.images[k].imagePath) {
                    await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/code-image/', step.options.images[k].imagePath)
                  }
                }
              }
              if (step.type === 'jigsaw-puzzle' && step.options && step.options.picture && step.options.picture !== '') {
                await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/jigsaw-puzzle/', step.options.picture)
              }
              if (step.type === 'new-item' && step.options && step.options.picture && step.options.picture !== '') {
                if (step.options.picture.indexOf('statics') === -1) {
                  await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/new-item/', step.options.picture)
                }
              }
              if (step.type === 'character' && step.options && step.options.character && step.options.character !== '') {
                if (step.options.character.length !== 1) {
                  await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/character/', step.options.character)
                }
              }
              if (step.type === 'locate-item-ar' && step.options) {
                if (step.options.picture && step.options.picture !== '') {
                  await utils.saveBinaryFile(quest.questId, this.serverUrl + '/upload/quest/' + quest.questId + '/step/locate-item-ar/', step.options.picture)
                }
                if (step.options.is3D) {
                  if (step.options.customModel) {
                    await utils.saveBinaryFile(quest.questId + '/' + step.options.customModel, this.serverUrl + '/upload/quest/' + quest.questId + '/step/3dobject/' + step.options.customModel + '/', 'object.glb')
                  } else {
                    await utils.saveBinaryFile(quest.questId + '/' + step.options.customModel, '/statics/3d-models/' + step.options.model + '/', 'object.glb')
                  }
                  /*
                  // get list of files of 3D object from server
                  const listOfObjectFile = await QuestService.listObjectFiles(step.options.customModel ? step.options.customModel : step.options.model, step.options.customModel ? quest.questId : null)
                  
                  if (listOfObjectFile.data && listOfObjectFile.data.files) {
                    for (var j = 0; j < listOfObjectFile.data.files.length; j++) {
                      let filename = listOfObjectFile.data.files[j]
                      let extraPath = ''
                      let serverPath = step.options.customModel ? '/upload/quest/' + quest.questId + '/step/3dobject/' + step.options.customModel + '/' : '/statics/3d-models/' + step.options.model + '/'
                      if (filename.indexOf('/') !== -1) {
                        filename = listOfObjectFile.data.files[j].substring(listOfObjectFile.data.files[j].lastIndexOf('/') + 1)
                        extraPath = '/' + listOfObjectFile.data.files[j].replace(filename, '')
                      }
                      await utils.saveBinaryFile(quest.questId + '/3dobject' + extraPath, this.serverUrl + serverPath, filename)
                    }
                  }
                  */
                }
              } 
              // TODO : download objects from server to avoid publishing a new release to add a new object
              /*if (step.type === 'locate-item-ar' && step.options && step.options.model && step.options.model !== '') {
                await utils.saveBinaryFile(quest.questId, this.serverUrl + '/statics/3d-models/' + step.options.model + '/', 'buffer.bin')
                //await utils.saveFile(quest.questId, this.serverUrl + '/statics/3d-models/' + step.options.model + '/', 'scene.gltf')
              }*/
              
              if (this.offline.progress === 0) {
                return false
              }
              this.offline.progress += progressIncrement
            }
            for (i = 0; i < chapters.length; i++) {
              if (this.offline.progress === 0) {
                return false
              }
              var chapterFileSuccess = await utils.writeInFile(quest.questId, 'chapter_' + chapters[i].chapterId + '.json', JSON.stringify(chapters[i]), true)
              if (!chapterFileSuccess) {
                Notification(this.$t('label.ErrorOfflineSaving'), 'error')
                this.offline.progress = 0
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
    async cancelOfflineLoading() {
      var _this = this
      // remove files
      utils.setTimeout(async () => { await _this.removeOfflineData(_this.quest.questId) }, 7000)
      
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
     * Add the quest in the offline quests list
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
