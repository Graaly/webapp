<template>
  <div id="scrollpage" :class="{'bg-white': !chapters.showNewStepOverview}">
    <!------------------ NEW RELEASE BUTTON ---------->
    <div v-if="!chapters.showNewStepOverview">
      <div v-if="readOnly && (quest.status === 'published' || quest.status === 'unpublished')" class="centered bg-secondary text-white q-pa-md" @click="createNewVersion()">
        {{ $t('label.ClickHereToCreateANewQuestVersion') }}
      </div>
      
      <router-link v-show="!chapters.showNewStepOverview && !chapters.showNewStepPageSettings" :to="{ path: '/map'}" class="float-right no-underline close-btn" color="grey"><q-icon name="close" class="medium-icon" /></router-link>
      
      <h1 class="size-4 q-pl-md">
        <span v-if="tabs.progress > 0">{{ form.fields.title[languages.current] || form.fields.title[quest.mainLanguage] }}</span>
        <span v-else>{{ $t('label.NewQuest') }}</span>
      </h1>
    </div>
    
    <!------------------ TABS ------------------------>
    
    <q-tabs v-model="tabs.selected" class="bg-accent text-white hide-img two-lines" v-if="!chapters.showNewStepOverview">
      <q-tab :disable="isReadOnly()" name="settings" :icon="getTabIcon(1)" :label="$t('label.Intro') + ' (' + languages.current + ')'" default />
      <q-tab :disable="tabs.progress < 1 || isReadOnly()" name="steps" :icon="getTabIcon(2)" :label="$t('label.Steps') + ' (' + languages.current + ')'" />
      <q-tab :disable="tabs.progress < 2" name="publish" :icon="getTabIcon(3)" :label="$t('label.Publish')" />
      <q-tab name="reviews" :icon="getTabIcon(4)" :label="$t('label.ReviewsAndStats')" v-if="isEdition && quest.access === 'public'" />
      <q-tab name="results" :icon="getTabIcon(5)" :label="$t('label.Results')" v-if="quest.status !== 'draft' && quest.access === 'private'" />
    </q-tabs>

    <q-separator />
    
    <q-tab-panels v-model="tabs.selected" animated v-if="!chapters.showNewStepOverview">
      
      <!------------------ SETTINGS TAB ------------------------>
        
      <q-tab-panel name="settings">
        
        <div v-if="!this.quest.languages || this.quest.languages.length === 0">
          <q-item>
            <q-item-section side top>
              <q-icon name="language" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.SelectedLanguage') }}</q-item-label>
              <q-option-group
                type="radio"
                color="primary"
                v-model="languages.current"
                :options="form.languages"
                :disable="readOnly"
              />
              <q-item-label caption>{{ $t('label.SelectTheLanguageAndClickOnNextButton') }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-btn big :disabled="readOnly" class="full-width" color="primary" @click="selectLanguage()" :label="$t('label.Save')" test-id="btn-save-language" />
        </div>
      
        <form @submit.prevent="submitSettings()" v-if="this.quest.languages.length > 0">
          
          <div v-if="this.quest.access === 'private'">
            <q-chip color="primary" text-color="white" icon="lock">
              {{ $t('label.PrivateQuest') }}
            </q-chip>
          </div>
          
          <div v-if="this.quest.access === 'public'">
            <q-chip color="primary" text-color="white" icon="public">
              {{ $t('label.PublicQuest') }}
            </q-chip>
          </div>
          
          <div v-if="this.quest.isPremium">
            <q-chip color="secondary" text-color="white" icon="star">
              {{ $t('label.PremiumQuest') }}
            </q-chip>
          </div>
          
          <q-select outlined :readonly="readOnly" emit-value map-options v-model="languages.current" :label="$t('label.Language')" :options="form.languages" :dense="true" @input="changeLanguage">
            <template v-slot:prepend>
              <q-icon name="language" />
            </template>
          </q-select>
          
          <q-input
            :readonly="readOnly"
            type="text"
            :label="$t('label.Title') + ' ' + currentLanguageForLabels"
            v-model="form.fields.title[languages.current]"
            @blur="$v.form.fields.title.$touch"
            bottom-slots
            counter
            :maxlength="titleMaxLength"
            :error="$v.form.fields.title.$error"
            :error-message="$t('label.PleaseEnterATitle')"
            />
          
          <q-select
            :readonly="readOnly"
            :label="$t('label.Category')"
            v-model="form.fields.category"
            @blur="$v.form.fields.category.$touch"
            :options="form.categories"
            emit-value
            map-options
            bottom-slots
            options-cover
            :error="$v.form.fields.category.$error"
            :error-message="$t('label.PleaseSelectACategory')"
            />
          
          <div>
            {{ $t('label.QuestType') }} 
            <q-icon name="help" @click.native="showHelpPopup('helpQuestType')" />
            <div class="q-gutter-sm">
              <q-radio :disable="readOnly || editor.initMode === 'advanced'" v-model="form.fields.editorMode" val="simple" :label="$t('label.basicEditor')" @input="changeEditorMode" />
              <q-radio :disable="readOnly || editor.initMode === 'advanced'" v-model="form.fields.editorMode" val="advanced" :label="$t('label.advancedEditor')" @input="changeEditorMode" />
            </div>
          </div>
          
          <q-select
            :readonly="readOnly" :label="$t('label.Difficulty')" v-model="form.fields.level" :options="form.levels" emit-value map-options />
            
          <q-select
            :readonly="readOnly" :label="$t('label.Duration')" v-model="form.fields.duration" :options="form.durations" emit-value map-options />
          
          <div class="description">
            <q-input
              :disable="readOnly"
              v-model="form.fields.description[languages.current]"
              type="textarea"
              :label="$t('label.Description') + ' ' + currentLanguageForLabels"
              :max-height="100"
              :min-rows="4"
              class="full-width"
            />
          </div>
          
          <div v-if="!isIOs">
            <div class="location-gps" style="display: none">
              <input :readonly="readOnly" type="number" id="latitude" v-model.number="form.fields.location.lat" step="any" />
              <input :readonly="readOnly" type="number" id="longitude" v-model.number="form.fields.location.lng" step="any" />
              <input :readonly="readOnly" type="text" v-model="form.fields.zipcode" />
              <input :readonly="readOnly" type="text" v-model="form.fields.town" />
              <input :readonly="readOnly" type="text" v-model="form.fields.country" />
            </div>
            
            <div v-if="!readOnly" class="location-address">
              <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
                <gmap-autocomplete v-if="tabs.selected === 'settings'" id="startingplace" :placeholder="$t('label.StartingPointOfTheQuest')" v-model="form.fields.startingPlace" class="col q-input-target text-left" @place_changed="setLocation"></gmap-autocomplete>
              </div>
              <a @click="getCurrentLocation()"><img src="statics/icons/game/location.png" /></a>
            </div>
          </div>
          <div v-if="isIOs">
            <q-input :label="$t('label.StartingPointOfTheQuest')" :disable="readOnly" type="text" v-model="form.fields.startingPlace" class="full-width" />
            <q-input :label="$t('label.Latitude')" :disable="readOnly" type="number" id="latitude" v-model.number="form.fields.location.lat" class="full-width" />
            <q-input :label="$t('label.Longitude')" :disable="readOnly" type="number" id="longitude" v-model.number="form.fields.location.lng" class="full-width" />
            <q-input :label="$t('label.ZipCode')" :disable="readOnly" type="text" v-model="form.fields.zipcode" class="full-width" />
            <q-input :label="$t('label.Town')" :disable="readOnly" type="text" v-model="form.fields.town" class="full-width" />
            <q-input :label="$t('label.Country')" :disable="readOnly" type="text" v-model="form.fields.country" class="full-width" />
          </div>
          
          <div v-if="form.fields.picture !== null">
            <p>{{ $t('label.Picture') }} :</p>
            <img class="full-width" :src="serverUrl + '/upload/quest/' + form.fields.picture" />
          </div>
          <div v-if="!isIOs">
            <q-btn class="full-width" v-if="!readOnly" :label="$t('label.ModifyThePicture')" @click="$refs['picturefile'].click()" />
            <input @change="uploadImage" ref="picturefile" type="file" accept="image/*" hidden />
          </div>
          <div v-if="isIOs">
            {{ $t('label.ModifyThePicture') }}:
            <input @change="uploadImage" ref="picturefile" type="file" accept="image/*" />
          </div>
          
          <div v-if="this.quest.isPremium">
            <q-select
              :readonly="readOnly"
              :label="$t('label.PriceForPlayer')"
              v-model="form.fields.priceForPlayer"
              :options="form.prices"
              emit-value
              map-options
              bottom-slots
              options-cover
              />
            <div v-if="form.fields.customization">
              <q-input
                :disable="readOnly"
                v-model="form.fields.customization.color"
                :label="$t('label.ButtonsColor')"
                placeholder="#ffaa00"
                class="full-width"
              />
            </div>
            <div v-if="form.fields.customization && form.fields.customization.logo && form.fields.customization.logo !== ''">
              <p>{{ $t('label.YourLogo') }} :</p>
              <img class="full-width" :src="serverUrl + '/upload/quest/' + form.fields.customization.logo" />
            </div>
            <div v-if="!isIOs">
              <q-btn class="full-width" v-if="!readOnly" :label="$t('label.AddALogo')" @click="$refs['logofile'].click()" />
              <input @change="uploadLogo" ref="logofile" type="file" accept="image/*" hidden />
            </div>
            <div v-if="isIOs">
              {{ $t('label.AddALogo') }}:
              <input @change="uploadLogo" ref="logofile" type="file" accept="image/*" />
            </div>
          </div>
          
          <div v-if="!this.quest.isPremium">
            <q-btn color="secondary" class="full-width q-mt-lg" @click="openPremiumBox()" icon="star" :label="$t('label.MovePremium')" />
          </div>
          <q-btn v-if="!readOnly" @click="submitSettings" color="primary" class="full-width q-mt-lg" test-id="btn-save-settings">{{ $t('label.Save') }}</q-btn>
            
        </form>
        
        <p class="centered q-pa-md" v-if="quest.status !== 'published'">
          <q-btn flat color="primary" icon="delete" @click="removeQuest()" :label="$t('label.RemoveThisQuest')" />
        </p>
      </q-tab-panel>
      
      <!------------------ STEPS TAB ------------------------>
        
      <q-tab-panel name="steps">
        <div class="centered bg-warning q-pa-sm" v-if="warnings.stepsMissing" @click="refreshStepsList">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
        
        <div v-if="form.fields.editorMode === 'simple' && chapters.items && chapters.items.length > 0">
          <p v-if="!readOnly && (!chapters.items || chapters.items.length < 1 || !chapters.items[0].steps || chapters.items[0].steps.length < 1)">{{ $t('label.AddYourSteps') }}</p>
          <ul class="list-group" v-sortable="{ onUpdate: onStepListUpdate, handle: '.handle' }">
            <li class="list-group-item" v-for="step in chapters.items[0].steps" :key="step._id">
              <q-icon v-if="!readOnly" class="handle" name="reorder" />
              <div>
                  <q-icon color="grey" class="q-mr-sm" :name="getIconFromStepType(step.type)" />
                  <span style="margin-top: 4px" @click="playStep(step)">{{ step.title[languages.current] || step.title[quest.mainLanguage] }}</span>
                  <q-btn v-if="!readOnly" class="float-right" @click="removeStep(step.stepId)"><q-icon name="delete" /></q-btn>
                  <q-btn v-if="!readOnly" class="float-right" @click="modifyStep(step)"><q-icon name="mode_edit" /></q-btn>
              </div>
            </li>
          </ul>
          <p v-if="!readOnly" class="centered">
            <q-btn color="primary" icon="fas fa-plus-circle" @click="addStep()" :label="$t('label.AddAStep')" test-id="btn-add-step" />
          </p>
          <p class="centered q-pa-md" v-if="!readOnly && chapters.items && chapters.items[0] && chapters.items[0].steps && chapters.items[0].steps.length > 1">
            <q-btn color="primary" icon="play_arrow" @click="testQuest()" :label="$t('label.TestYourQuest')" />
          </p>
          <p class="smaller" v-if="quest && quest.size && quest.size.limit && quest.size.current">
            <a @click="showMedia()">{{ getReadableStorageUsage() }}</a>
            <q-linear-progress rounded style="height: 15px" :value="getPercentStorageUsage()" color="secondary" class="q-mt-sm" />
          </p>
        </div>
        
        <div v-if="form.fields.editorMode === 'advanced'">
          <p v-if="!readOnly && (!chapters.items || chapters.items.length < 2)">{{ $t('label.AddYourChapters') }}</p>
          <!--<p class="centered" v-show="chapters.items && chapters.items.length > 6">
            <q-btn color="primary" icon="fas fa-plus-circle" @click="addStep()" :label="$t('label.AddAStep')" />
          </p>-->
          <!-- using https://github.com/timruffles/ios-html5-drag-drop-shim to allow drag & drop on mobile -->
          <ul class="list-group" v-sortable="{ onUpdate: onChapterListUpdate, handle: '.handle' }">
            <li class="step-list list-group-item" v-for="chapter in chapters.items" :key="chapter._id">
              <q-icon v-if="!readOnly" class="handle" name="reorder" />
              <div>
                <p class="bigger">
                  {{ chapter.title[languages.current] || chapter.title[quest.mainLanguage] }}
                  <q-icon v-if="!readOnly" name="add_box" class="float-right q-ml-md size-1" style="margin-top: -8px" @click.native="addStep(chapter.chapterId)" />
                  <q-icon v-if="!readOnly" name="delete" class="float-right q-ml-md a-bit-bigger" @click.native="removeChapter(chapter.chapterId)" />
                  <q-icon v-if="!readOnly" name="mode_edit" class="float-right q-ml-md a-bit-bigger" @click.native="modifyChapter(chapter.chapterId)" />
                  <q-icon name="warning" color="primary" class="float-right a-bit-bigger" v-if="chapter.warnings && chapter.warnings.length > 0" @click.native="showChapterWarnings(chapter.warnings)" />
                </p>
                <div v-if="!chapter.steps || chapter.steps.length === 0">
                  {{ $t('label.ClickOnButtonToAddStep') }}
                </div>
                <div v-for="step in chapter.steps" :key="step._id" style="height: 34px; overflow: hidden;display: flex;width: 100%;">
                  <div class="step-text">
                    <q-icon color="grey" class="q-mr-sm" :class="{'q-ml-md': (step.level === 2)}" :name="getIconFromStepType(step.type)" />
                    <span v-if="!readOnly && !step.error" @click="playStep(step)">{{ step.title[languages.current] || step.title[quest.mainLanguage] }}</span>
                    <span v-if="!readOnly && step.error" @click="showStepWarnings(step.error)" class="text-primary">
                      <q-icon name="warning" color="primary" />
                      {{ step.title[languages.current] || step.title[quest.mainLanguage] }}
                    </span>
                    <span v-if="readOnly">{{ step.title[languages.current] || step.title[quest.mainLanguage] }}</span>
                  </div>
                  <div class="step-button">
                    <q-btn v-if="!readOnly" icon="mode_edit" dense @click="modifyStep(step)" />
                    <q-btn v-if="!readOnly" icon="delete" dense @click="removeStep(step.stepId)" />
                    <q-btn v-if="!readOnly" icon="subdirectory_arrow_left" dense @click="insertStep(chapter.chapterId, step.stepId)" />
                  </div>
                </div>
              </div>
            </li>
          </ul>
        
          <p v-if="!readOnly" class="centered">
            <q-btn color="primary" icon="fas fa-plus-circle" @click="addChapter()" :label="$t('label.AddASChapter')" />
          </p>
          <p class="centered q-pa-md" v-if="!readOnly && chapters.items && chapters.items.length > 1">
            <q-btn color="primary" icon="play_arrow" @click="testQuest()" :label="$t('label.TestYourQuest')" />
          </p>
          <p class="smaller" v-if="quest && quest.size && quest.size.limit && quest.size.current">
            <a @click="showMedia()">{{ getReadableStorageUsage() }}</a>
            <q-linear-progress rounded style="height: 15px" :value="getPercentStorageUsage()" color="secondary" class="q-mt-sm" />
          </p>
        </div>
              
      </q-tab-panel>
      
      <!------------------ PUBLISHING TAB ------------------------>
        
      <q-tab-panel name="publish">
        <div v-if="quest.status === 'old'">
          <q-banner class="q-mb-md bg-warning">
            {{ $t('label.YourQuestIsClosedAndCanNotBePublishedAnymore') }}
          </q-banner>
        </div>
        <div v-if="quest.access === 'public' || (quest.access === 'private' && quest.status !== 'old')">
          <q-banner class="q-mb-md bg-warning" v-if="quest.status === 'tovalidate'">
            {{ $t('label.QuestUnderValidation') }}
          </q-banner>
          <q-banner class="q-mb-md bg-warning" v-if="quest.status === 'rejected'">
            {{ $t('label.QuestPublicationRejected') }}
          </q-banner>
          <!--<q-banner class="q-mb-md bg-warning" v-if="chapters.items.length < 3">
            {{ $t('label.YourQuestMustContainAtLeast6Steps') }}
          </q-banner>-->
          <q-banner class="q-mb-md bg-warning" v-if="chapters.items.length > 100">
            {{ $t('label.YourQuestMustContainLessThan50Steps') }}
          </q-banner>
          <p class="centered q-pa-md">
            <q-btn color="primary" icon="play_arrow" @click="testQuest()" :label="$t('label.TestYourQuest')" />
          </p>
          
          <q-item v-if="quest.access === 'private'">
            <q-item-section side top>
              <q-icon name="people" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.Invitees') }} <span v-if="quest.limitations && quest.limitations.nbInvitees">({{ invitee.items.length }}/{{ quest.limitations.nbInvitees }})</span></q-item-label>
              <p v-for="item in invitee.items" :key="item.id">
                <q-toggle v-model="item.checked" :label="item.name" @input="removeInvitee(item.id)" />
              </p>
              <p v-if="warnings.inviteeMissing">{{ $t('label.TechnicalIssue') }}</p>
              <q-input
                type="text"
                :label="$t('label.InvitePeople')"
                v-model="invitee.new.email"
                bottom-slots
                :error="!invitee.new.isExisting"
                :error-message="$t('label.UserIsNotAGraalyUser')"
                >
                <template v-slot:after>
                  <q-btn icon="add_circle" color="primary" flat round dense @click="addInvitee()" />
                </template>
                <template v-slot:hint>
                  {{ $t('label.InviteInviteesHelp') }}
                </template>
              </q-input>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section side top>
              <q-icon name="visibility" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.LanguagesPublished') }}</q-item-label>
              <p v-for="lang in form.fields.languages" :key="lang.lang">
                <q-toggle :disable="quest.status === 'tovalidate'" v-model="lang.published" :label="$t('language.' + lang.lang)" @input="publish(lang.lang)" />
              </p>
              <q-item-label caption v-if="quest.access === 'public'">{{ $t('label.ActivateTheLanguageVisible') }}</q-item-label>
              <q-item-label caption v-if="quest.access === 'private'">{{ $t('label.ActivateTheLanguageVisiblePrivate') }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section side top>
              <q-icon name="edit" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.Editors') }} <span v-if="quest.limitations && quest.limitations.nbEditors">({{ editor.items.length }}/{{ quest.limitations.nbEditors }})</span></q-item-label>
              <p v-for="item in editor.items" :key="item.id">
                <q-toggle v-model="item.checked" :label="item.name" @input="removeEditor(item.id)" />
              </p>
              <p v-if="warnings.editorsMissing">{{ $t('label.TechnicalIssue') }}</p>
              <q-input
                type="text"
                :label="$t('label.InviteEditors')"
                v-model="editor.new.email"
                bottom-slots
                :error="!editor.new.isExisting"
                :error-message="$t('label.UserIsNotAGraalyUser')"
                >
                <template v-slot:after>
                  <q-btn icon="add_circle" color="primary" flat round dense @click="addEditor()" />
                </template>
                <template v-slot:hint>
                  {{ $t('label.InviteEditorsHelp') }}
                </template>
              </q-input>
            </q-item-section>
          </q-item>
          
          <q-item>
            <q-item-section side top>
              <q-icon name="fa fa-qrcode" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.MarkersFile') }}</q-item-label>
              <!-- for webapp mode -->
              <q-btn v-if="!isHybrid" color="primary" icon="fa fa-download" :label="$t('label.Download')" type="a" href="statics/markers/all.pdf" download />
              <!-- for hybrid mode -->
              <q-btn v-if="isHybrid" color="primary" icon="fa fa-download" :label="$t('label.Download')" @click="downloadMarkers()" />
            </q-item-section>
          </q-item>
          
          <p class="centered q-pa-md" v-if="quest.status !== 'published'">
            <q-btn flat color="primary" icon="delete" @click="removeQuest()" :label="$t('label.RemoveThisQuest')" />
          </p>
          
        </div>
        
      </q-tab-panel>
        
      <!------------------ REVIEWS TAB ------------------------>
        
      <q-tab-panel name="reviews" v-if="isEdition && quest.access === 'public'">
        <q-item>
          <q-item-section side top>
            <q-icon name="timeline" class="left-icon" />
          </q-item-section>
          <q-item-section v-if="statistics && statistics.statistics">
            <q-item-label class="big-label">{{ $t('label.Statistics') }}</q-item-label>
            <p>{{ $t('label.TotalNumberOfPlayers') }}{{ $t('label.colons') }}{{ statistics.statistics.nbPlayers }}</p>
            <p>{{ $t('label.NumberOfPlayersYesterday') }}{{ $t('label.colons') }}{{ statistics.statistics.dailyNbPlayers }}</p>
            <p v-if="statistics && statistics.statistics && statistics.statistics.ageRepartition && statistics.statistics.ageRepartition.length > 0">
              {{ $t('label.NumberOfPlayersByAge') }}
                <q-list class="shadow-2 rounded-borders">
                  <q-item v-for="statistic in statistics.statistics.ageRepartition" :key="statistic._id">
                    <q-item-section v-if="statistic && !statistic._id">{{ $t('label.null') }}{{ $t('label.colons') }}{{ statistic.nb }}</q-item-section>
                    <q-item-section v-if="statistic && statistic._id">{{ $t('label.Age' + (statistic._id.replace('-', '').replace('+', ''))) }}{{ $t('label.colons') }}{{ statistic.nb }}</q-item-section>
                  </q-item>
                </q-list>
            </p>
            <p v-if="statistics && statistics.statistics && statistics.statistics.sexRepartition && statistics.statistics.sexRepartition.length > 0">
              {{ $t('label.NumberOfPlayersBySex') }}
                <q-list class="shadow-2 rounded-borders">
                  <q-item v-for="statistic in statistics.statistics.sexRepartition" :key="statistic._id">
                    <q-item-section>{{ $t('label.' + statistic._id) }}{{ $t('label.colons') }}{{ statistic.nb }}</q-item-section>
                  </q-item>
                </q-list>
            </p>
            <p>{{ $t('label.AverageScore') }}{{ $t('label.colons') }}{{ statistics.statistics.averageScore }}</p>
          </q-item-section>
        </q-item>
        <q-item v-if="reviews.length > 0">
          <q-item-section side top>
            <q-icon name="chat_bubble_outline" class="left-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="big-label">{{ $t('label.Reviews') }}</q-item-label>
            <!--<q-infinite-scroll :handler="getReviews">-->
              <q-list highlight>
                <q-item v-for="review in reviews" :key="review._id">
                  
                  <q-item-section avatar>
                    <q-avatar>
                      <img :src="getAvatar(review.userId.picture)" />
                    </q-avatar>
                  </q-item-section>
                    
                  <q-item-section>
                    <q-item-label>
                      {{ review.userId.name }}
                    </q-item-label>
                    <q-item-label caption>
                      <q-rating readonly v-model="review.rating" /> - {{ $options.filters.formatDate(review.created) }} (v{{ review.version }})
                    </q-item-label>
                    <q-item-label caption class="review-text">{{ review.text }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="reviews.length === 0">
                  <q-item-label>{{ $t('label.QuestNotReviewed') }}</q-item-label>
                </q-item>
              </q-list>
            <!--</q-infinite-scroll>-->
          </q-item-section>
        </q-item>
        
      </q-tab-panel>
    
    <!------------------ RESULTS TAB ------------------------>
        
      <q-tab-panel name="results" v-if="isEdition && quest.access === 'private'">
        <div v-if="quest.status === 'published'">
          <div v-if="ranking && ranking.items && ranking.items.length > 0">
            <q-list>
              <q-item v-for="(rank, index) in ranking.items" :key="index" >
                <q-item-section top avatar>
                  <q-avatar>
                    <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') !== -1" :src="rank.picture" />
                    <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + rank.picture" />
                    <img v-if="!rank.picture || rank.picture === ''" src="/statics/icons/game/profile-small.png" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ rank.name }}</q-item-label>
                  <q-item-label caption v-if="rank.status === 'finished'">{{ $t('label.Succeeded') }}</q-item-label>
                  <q-item-label caption v-if="rank.status !== 'finished'">{{ $t('label.CurrentlyPlaying') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="centered" v-if="ranking && ranking.items && ranking.items.length === 0">
            {{ $t('label.NoPlayersYetForThisQuest') }}
          </div>
          <div class="centered">
            <q-btn color="primary" @click="closePrivateQuest">{{ $t('label.ClosePrivateQuest') }}</q-btn>
            <div>{{ $t('label.ClosePrivateQuestDesc') }}</div>
          </div>
        </div>
        <div v-if="quest.status === 'old'">
          <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.FinalRanking') }}</div>
          <div v-if="ranking && ranking.items && ranking.items.length > 0">
            {{ $t('label.FinalRankingIntro') }}
            <q-list>
              <q-item v-for="(rank, index) in ranking.items" :key="index" >
                <q-item-section avatar>
                  <img v-if="rank.position <= 10" :src="'statics/icons/game/medal-' + rank.position + '.png'">
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ rank.name }}</q-item-label>
                  <q-item-label caption>{{ rank.score}} {{ $t('label.points') }}<!--<q-icon name="fas fa-trophy" />--></q-item-label>
                </q-item-section>
                <q-item-section side top avatar>
                  <q-avatar>
                    <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') !== -1" :src="rank.picture" />
                    <img v-if="rank.picture && rank.picture !== '' && rank.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + rank.picture" />
                    <img v-if="!rank.picture || rank.picture === ''" src="/statics/icons/game/profile-small.png" />
                  </q-avatar>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="centered" v-if="ranking && ranking.items && ranking.items.length === 0">
            {{ $t('label.NoPlayerForThisQuest') }}
          </div>
        </div>
        
      </q-tab-panel>
      
    </q-tab-panels>
    
    <q-dialog v-model="chapters.showNewStepPage" maximized>
      <div>
    
        <!------------------ STEP TYPE SELECTION ------------------------>
        
        <a class="float-right no-underline close-btn" color="grey" @click="closeStepTypePage"><q-icon name="close" class="medium-icon" /></a>
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.ChooseTheStepType') }}</div>
      
        <div class="q-pa-md">
          <div class="text-subtitle1 q-pa-md">{{ $t('label.Transition') }}</div>
          <q-list>
            <q-expansion-item color="primary" popup
              group="steptype"
              v-for="stepType in filteredStepTypes('transition')" :key="stepType.code" 
              :icon="'fas fa-' + stepType.icon"
              :label="$t('stepType.' + stepType.title)"
            >
              <div class="centered q-pa-sm">
                <div>{{ $t('stepType.' + stepType.description) }}</div>
                <q-btn color="primary" :label="$t('label.UseThisGame')" @click.native="selectStepType(stepType)" :test-id="'btn-select-step-type-' + stepType.code" />
              </div>
            </q-expansion-item>
          </q-list> 
          
          <div class="text-subtitle1 q-pa-md">{{ $t('label.Quest') }}</div>
          <q-list>
            <q-expansion-item color="primary" popup
              group="steptype"
              v-for="stepType in filteredStepTypes('enigma')" :key="stepType.code" 
              :icon="'fas fa-' + stepType.icon"
              :label="$t('stepType.' + stepType.title)"
            >
              <div class="centered q-pa-sm">
                <div>{{ $t('stepType.' + stepType.description) }}</div>
                <q-btn color="primary" :label="$t('label.UseThisGame')" @click.native="selectStepType(stepType)" :test-id="'btn-select-step-type-' + stepType.code" />
              </div>
            </q-expansion-item>
          </q-list>
          
          <div class="q-pa-md centered">
            <q-btn color="secondary" @click="closeStepTypePage()">{{ $t('label.Close') }}</q-btn>
          </div>
        </div>
      </div>
      
    </q-dialog>
    
    <q-dialog maximized v-model="chapters.showNewStepPageSettings">
      
      <!------------------ STEP SETTINGS SELECTION ------------------------>
      
      <stepSettings :quest="quest" :stepId="stepId" :lang="languages.current" :options="{type: chapters.newStep.type, chapterId: chapters.newStep.chapterId, previousStepId: chapters.newStep.previousStepId, mode: form.fields.editorMode}" @change="trackStepChanges" @close="closeStepSettingsPage" @openPremiumBox="openPremiumBox"></stepSettings>
      
    </q-dialog>
    
    <div v-if="chapters.showNewStepOverview" class="fullscreen">
    
        <!------------------ STEP SIMULATION ------------------------>

        <stepPlay 
          :step="chapters.newStep.overviewData" 
          runId="0" 
          :color="(quest.customization && quest.customization.color && quest.customization.color !== '') ? quest.customization.color : 'primary'" 
          :itemUsed="selectedItem" 
          :reload="chapters.reloadStepPlay" 
          :lang="languages.current" 
          @played="trackStepPlayed" 
          @success="trackStepSuccess" 
          @fail="trackStepFail" 
          @pass="trackStepPass">
        </stepPlay>
        <div v-show="overview.tabSelected" class="step-menu fixed-bottom">
          <!--<q-linear-progress :percentage="(this.step.number - 1) * 100 / info.stepsNumber" animate stripe color="primary"></q-linear-progress>-->
          <div class="row white-buttons">
            <div class="col centered q-pb-md">
              <q-btn
                round
                size="lg"
                class="bg-white"
                v-if="quest.customization.logo && quest.customization.logo !== ''" >
                <q-avatar size="60px">
                  <img :src="serverUrl + '/upload/quest/' + quest.customization.logo">
                </q-avatar>
              </q-btn>
            </div>
            <div class="col centered q-pb-md">
              <q-btn 
                round 
                size="lg" 
                :style="(quest.customization.color && quest.customization.color !== '') ? 'background-color: ' + quest.customization.color : ''" 
                icon="work" 
                :class="{'bg-secondary': (inventory.isOpened && !quest.customization.color), 'bg-primary': (!inventory.isOpened && !quest.customization.color)}" 
                @click="openInventory()"
                test-id="btn-inventory"
              />
            </div>
            <div class="col centered q-pb-md">
              <q-btn 
                round 
                size="lg" 
                :style="(quest.customization.color && quest.customization.color !== '') ? 'background-color: ' + quest.customization.color : ''" 
                icon="lightbulb" 
                :class="{'flashing': hint.suggest, 'bg-secondary': (hint.isOpened && !quest.customization.color), 'bg-primary': (!hint.isOpened && !quest.customization.color)}" 
                @click="askForHint()" 
                v-show="isHintAvailable()" 
              />
            </div>
            <div v-if="!readOnly" class="col centered q-pb-md">
              <q-btn 
                round 
                size="lg" 
                :style="quest.customization.color ? 'background-color: ' + quest.customization.color : ''" 
                :class="{'bg-primary': !quest.customization.color}" 
                icon="arrow_back" 
                @click="stepId = -1; modifyStep(chapters.newStep.overviewData)" 
              />
            </div>
            <div class="col centered q-pb-md">
              <q-btn 
                round 
                size="lg" 
                :style="quest.customization.color ? 'background-color: ' + quest.customization.color : ''"
                icon="arrow_forward" 
                :class="{'flashing': canMoveNextStep, 'bg-primary': !quest.customization.color}" 
                v-show="canMoveNextStep || canPass" 
                @click="closeOverview" 
                 test-id="btn-next-step"
              />
            </div>
          </div>
        </div>
        
    </div>  
    
    <!------------------ INVENTORY PAGE AREA ------------------------>
    
    <q-dialog maximized v-model="inventory.isOpened">
      <div class="inventory panel-bottom q-pa-md">
        <a class="float-right no-underline close-btn" color="grey" @click="inventory.isOpened = false"><q-icon name="close" class="medium-icon" /></a>
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.Inventory') }}</div>
        <div class="centered bg-warning q-pa-sm" v-if="warnings.inventoryMissing" @click="fillInventory()">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
        <p v-if="inventory.items.length > 0 && !warnings.inventoryMissing">{{ $t('label.InventoryUsage') }}</p>
        <p v-if="inventory.items.length === 0">{{ $t('label.noItemInInventory') }}</p>
        <div class="inventory-items">
          <div v-for="(item, key) in inventory.items" :key="key" @click="selectItem(item)">
            <img :src="(item.picture.indexOf('statics/') > -1 ? item.picture : serverUrl + '/upload/quest/' + questId + '/step/new-item/' + item.picture)" />
            <p>{{ item.title}}</p>
          </div>
        </div>
      </div>
    </q-dialog>
    
    <!------------------ HINT PAGE AREA ------------------------>
    
    <q-dialog maximized v-model="hint.isOpened">
      <div class="hint panel-bottom q-pa-md">
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.Hint') }}</div>
        <p v-if="hint.label === ''">{{ $t('label.NoHintForThisStep') }}</p>
        <p v-if="hint.label !== ''">{{ hint.label[languages.current] }}</p>
        <q-btn class="q-mb-xl" color="primary" @click="askForHint()">{{ $t('label.Close') }}</q-btn>
      </div>
    </q-dialog>
    
    <!------------------ MEDIA LIST AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="hint panel-bottom q-pa-md" v-show="media.isOpened">
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.QuestMedia') }}</div>
        <q-list v-for="(item, index) in media.items" :key="item.id">
          <q-item clickable v-ripple>
            <q-item-section thumbnail @click="zoomMedia(index)">
              <img :src="serverUrl + '/upload/quest/' + questId + item.type + item.file">
            </q-item-section>
            <q-item-section>{{ item.size }} Ko</q-item-section>
            <q-item-section side><q-btn icon="delete" @click="removeMedia(item._id)"></q-btn></q-item-section>
          </q-item>
        </q-list>
        <div v-if="media.items.length === 0">
          {{ $t('label.YouDoNotUseAnyMediaYetInYourQuest') }}
        </div>
        <q-btn class="q-mb-xl" color="primary" @click="hideMedia()">{{ $t('label.Close') }}</q-btn>
      </div>
    </transition>
    <q-dialog v-model="media.detail.isOpened">
      <img v-if="media.items.length > 0" style="width: 100%" :src="serverUrl + '/upload/quest/' + questId + media.items[media.detail.index].type + media.items[media.detail.index].file">
      <q-btn class="q-mb-xl" color="primary" @click="unzoomMedia()">{{ $t('label.Close') }}</q-btn>
    </q-dialog>
    
    <!------------------ PREMIUM POPIN ------------------------>
    
    <q-dialog v-model="premium.isOpened">
      <div class="q-pa-md">
        <img src="statics/icons/game/premium-header.png" style="width: 100%" />
        <div class="text-h6 text-primary">{{ $t('label.PremiumDefinition1') }}</div>
        <div v-html="$t('label.PremiumDefinition2')" />
        <div v-if="!premium.canMovePremium" class="centered">
          <p>{{ $t('label.PremiumDefinition3') }}</p>
          <q-btn class="q-mb-xl" color="primary" @click="premium.isOpened = false">{{ $t('label.Close') }}</q-btn>
        </div>
        <div v-if="premium.canMovePremium" class="centered">
          <q-btn class="q-mb-sm" color="primary" @click="movePremium()">{{ $t('label.MovePremium') }}</q-btn>
          <q-btn class="q-mb-xl" flat color="primary"  @click="premium.isOpened = false">{{ $t('label.Cancel') }}</q-btn>
        </div>
      </div>
    </q-dialog>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom over-map fit" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>
    
  </div>
  
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import QuestService from 'services/QuestService'
import ReviewService from 'services/ReviewService'
import RunService from 'services/RunService'
import StepService from 'services/StepService'
import story from 'components/story'

// required to define v-sortable directive in Vue 2.0, see https://github.com/sagalbot/vue-sortable/issues/10
import Vue from 'vue'
import Sortable from 'sortablejs'
Vue.directive('sortable', {
  inserted: function (el, binding) {
    return new Sortable(el, binding.value || {})
  }
})
import stepSettings from 'components/quest/builder/stepSettings'
import stepPlay from 'components/quest/game/stepPlay'
import questCategories from 'data/questCategories.json'
import questLevels from 'data/questLevels.json'
import languages from 'data/languages.json'
import stepTypes from 'data/stepTypes.json'
import utils from 'src/includes/utils'

export default {
  components: {
    stepSettings,
    stepPlay,
    story
  },
  data() {
    return {
      questId: null,
      stepId: -1,
      readOnly: false,
      tabs: {
        selected: 'settings',
        progress: 0,
        list: ['settings', 'steps', 'publish'],
        icons: ['looks_one', 'looks_two', 'looks_3', 'looks_4']
      },
      overview: {
        tabSelected: 'none'
      },
      languages: {
        current: 'fr', // default
        available: []
      },
      form: {
        fields: {
          title: {},
          category: '',
          priceForPlayer: 'free',
          description: {},
          location: { lat: '', lng: '' },
          startingPlace: '',
          languages: [],
          mainLanguage: 'fr',
          level: 2,
          duration: 30,
          picture: null,
          thumb: null,
          town: "",
          country: "",
          zipcode: "",
          editorMode: 'simple',
          customization: { color: '', logo: '' }
        },
        categories: utils.buildOptionsForSelect(questCategories, { valueField: 'id', labelField: 'name' }, this.$t),
        languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
        levels: utils.buildOptionsForSelect(questLevels, { valueField: 'id', labelField: 'name' }, this.$t),
        prices: [
          { label: this.$t('label.Free'), value: 'free' },
          { label: "0,99 €", value: 'premiumprice1' },
          { label: "1,99 €", value: 'premiumprice2' },
          { label: "2,99 €", value: 'premiumprice3' },
          { label: "4,99 €", value: 'premiumprice5' },
          { label: "9,99 €", value: 'premiumprice10' },
          { label: "19,99 €", value: 'premiumprice20' }
        ],
        durations: [
          { label: '15 ' + this.$t('label.minutes'), value: 15 },
          { label: '30 ' + this.$t('label.minutes'), value: 30 },
          { label: '45 ' + this.$t('label.minutes'), value: 45 },
          { label: '60 ' + this.$t('label.minutes'), value: 60 },
          { label: '90 ' + this.$t('label.minutes'), value: 90 },
          { label: '120 ' + this.$t('label.minutes'), value: 120 }
        ]
      },
      quest: {
        languages: [],
        hasLocateMarkerSteps: false
      },
      chapters: {
        items: [],
        showNewStepPage: false,
        showNewStepPageSettings: false,
        showNewStepOverview: false,
        reloadStepPlay: false,
        newStep: {
          title: 'ImageAndText',
          type: {},
          chapterId: 0,
          previousStepId: 0,
          overviewData: {}
        }
      },
      ranking: [],
      inventory: {
        isOpened: false,
        items: []
      },
      // for step type 'use-item'
      selectedItem: null,
      hint: {
        isOpened: false,
        label: ""
      },
      media: {
        isOpened: false,
        items: [],
        detail: {
          isOpened: false,
          index: 0
        }
      },
      editor: {
        items: [],
        new: {
          email: '',
          isExisting: true
        },
        initMode: 'simple'
      },
      invitee: {
        items: [],
        new: {
          email: '',
          isExisting: true
        }
      },
      story: {
        step: null,
        data: null,
        active: false
      },
      premium: {
        isOpened: false,
        canMovePremium: false
      },
      reviews: [],
      statistics: [],
      canMoveNextStep: false,
      canPass: false,
      itemUsed: null,
      isIOs: (window.cordova && window.cordova.platformId && window.cordova.platformId === 'ios'),
      serverUrl: process.env.SERVER_URL,
      pictureUploadURL: this.serverUrl + '/quest/picture/upload',
      titleMaxLength: 50,
      isHybrid: false,
      warnings: {
        stepsMissing: false,
        editorsMissing: false,
        inviteeMissing: false,
        inventoryMissing: false
      }
    }
  },
  computed: {
    currentLanguageForLabels() {
      return this.quest.languages.length > 1 ? '[' + this.languages.current.toUpperCase() + ']' : ''
    },
    isCreation() {
      return this.tabs.progress < 3
    },
    isEdition() {
      return !this.isCreation
    }
  },
  created () {
    document.addEventListener("backbutton", this.trackCallBackFunction, false)
  },
  async mounted() {
    utils.clearAllRunningProcesses()
    
    if (this.$route.params.questId && this.$route.params.questId !== '') {
      if (typeof window.cordova !== 'undefined') {
        this.isHybrid = true
      }
      
      this.loadQuestData()
    } else {
      // if quest Id is not set, redirect to quest creation page
      this.$router.push('/quest/create/welcome')
    }
    
    // start tutorial 
    this.startStory()
  },
  methods: {
    /*
     * Load quest and steps
     */
    async loadQuestData() {
      this.questId = this.$route.params.questId
      
      // fill quest settings form
      let res = await QuestService.getLastById(this.questId)
      
      if (res && res.data) {
        this.quest = res.data
        
        // if not draft => read only
        if (this.quest.status !== 'draft') {
          this.readOnly = true
        }
        this.editor.initMode = this.quest.editorMode

        // get languages
        if (this.quest.languages && this.quest.languages.length > 0 && this.languages.current === 'fr') {
          this.languages.current = this.quest.languages[0].lang
          for (var i = 0; i < this.quest.languages.length; i++) {
            this.languages.available.push({label: this.$t('language.' + this.quest.languages[i].lang), value: this.quest.languages[i].lang})
          }
        }
        
        // if empty, autofill description with main language value
        if (!this.quest.description[this.languages.current] || this.quest.description[this.languages.current] === '') {
          this.quest.description[this.languages.current] = this.quest.description[this.quest.mainLanguage]
        }
        
        this.form.fields = this.quest
      
        this.form.fields.startingPlace = this.form.fields.location.address || ""
        this.form.fields.zipcode = (this.form.fields.location && this.form.fields.location.zipcode) ? this.form.fields.location.zipcode : ""
        this.form.fields.town = (this.form.fields.location && this.form.fields.location.town) ? this.form.fields.location.town : ""
        this.form.fields.country = (this.form.fields.location && this.form.fields.location.country) ? this.form.fields.location.country : ""
        
        // prices
        if (this.quest.premiumPrice && this.quest.premiumPrice.androidId) {
          this.form.fields.priceForPlayer = this.quest.premiumPrice.androidId
        }
        
        // adapt data from DB to match form data structure
        if (this.form.fields.location.hasOwnProperty('coordinates') && this.form.fields.location.coordinates.length === 2) {
          let coordinates = this.form.fields.location.coordinates
          this.form.fields.location = { lng: coordinates[0], lat: coordinates[1] }
        }
        
        // define tabs status
        this.tabs.progress = this.quest.creationStep
        // creation in progress => get creator back to the tab where he was
        if (this.tabs.progress <= 3) {
          this.tabs.selected = this.tabs.list[Math.min(this.tabs.progress, 2)]
        }

        await this.refreshStepsList()
        
        await this.listEditors()
        
        await this.listInvitees()
        
        await this.listReviews()
        
        await this.getStatistics()
        
        if (this.quest.access && this.quest.access === 'private') {
          this.getPrivateRanking()
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    /*
     * move the quest to Premium
     */
    async movePremium() {
      // if quest is not already premium
      if (!this.quest.isPremium) {
        // if user is in an organization
        if (this.$store.state.user && this.$store.state.user.organizationId) {
          const canThisQuestBePremium = await QuestService.CheckIfCanBeMovedPremium(this.questId)
          
          if (canThisQuestBePremium && canThisQuestBePremium.data && canThisQuestBePremium.data.canBePremium) {
            const movePremiumStatus = await QuestService.MoveToPremium(this.questId)

            if (movePremiumStatus && movePremiumStatus.data && movePremiumStatus.data.status && movePremiumStatus.data.status === 'ok') {
              this.quest.isPremium = true
              this.quest.size.limit = 600000000
            } else {
              Notification(this.$t('label.ErrorStandardMessage'), 'error')
            }
          }
          this.premium.isOpened = false
        }
      }
    },
    async openPremiumBox() {
      // if quest is not already premium
      if (!this.quest.isPremium) {
        // if user is in an organization
        if (this.$store.state.user && this.$store.state.user.organizationId) {
          const canThisQuestBePremium = await QuestService.CheckIfCanBeMovedPremium(this.questId)
          
          if (canThisQuestBePremium && canThisQuestBePremium.data && canThisQuestBePremium.data.canBePremium) {
            this.premium.canMovePremium = true
          }
        }
        this.premium.isOpened = true
      }
    },
    async changeEditorMode() {
      if (this.form.fields.editorMode === 'advanced') {
        this.$q.dialog({
          message: this.$t('label.AreYouSureYouWantToMoveToAdvancedMode'),
          ok: true,
          cancel: true
        }).onOk(async () => {
          await this.refreshStepsList()
        }).onCancel(async () => {
          this.form.fields.editorMode = 'simple'
        })
      } else {
        await this.refreshStepsList()
      }
    },
    /*
     * Refresh / load the step list
     */
    async refreshStepsList() {
      this.warnings.stepsMissing = false
      // list steps
      this.$q.loading.show()
      var response = await StepService.listForAQuest(this.questId, this.quest.version)
      if (response && response.data) {
        this.chapters.items = response.data.chapters
        
        const steps = response.data.steps
        
        if (this.form.fields.editorMode === 'simple') {
          if (this.chapters.items && this.chapters.items.length > 0) {
            // editor simple mode
            this.chapters.items[0].steps = steps
          }
        } else {
          // editor advanced mode
          for (var j = 0; j < this.chapters.items.length; j++) {
            var hasEndOfChapterStep = false
            var stepsWithNoCondition = []
            var stepsWithNoParent = []
            var stepsOfChapter = []
            var parent = []
       
            // Get the steps of current chapter & check if chapter has and end step
            for (var i = 0; i < steps.length; i++) {
              if (steps[i].chapterId.toString() === this.chapters.items[j].chapterId.toString()) {
                // create steps array
                if (!this.chapters.items[j].steps) {
                  this.chapters.items[j].steps = []
                }
                // check if there is an end of chapter step
                if (steps[i].type === 'end-chapter') {
                  hasEndOfChapterStep = true
                }
                stepsOfChapter.push(steps[i])
              }
            }
            
            // create unsorted list of steps
            var unsorted = []
            for (i = 0; i < stepsOfChapter.length; i++) {
              unsorted.push(stepsOfChapter[i].stepId.toString())
            }
            
            // create sorted list of steps
            var sorted = []
            //until all the steps are treated
            var iteration = 0
            while (unsorted.length > 0 || iteration < 1000) {
              iteration++
              allSteps:
                for (i = 0; i < stepsOfChapter.length; i++) {
                  var stepId = stepsOfChapter[i].stepId.toString()
                  // if the step does not already exists in final array
                  if (sorted.indexOf(stepId) === -1) {
                    // if no condition => place in first position in chapter
                    if (stepsOfChapter[i].conditions && stepsOfChapter[i].conditions.length === 0) {
                      sorted.unshift(stepId)
                      unsorted.splice(unsorted.indexOf(stepId), 1)
                      stepsWithNoCondition.push(stepsOfChapter[i].title[this.languages.current])
                    }
                    // if one condition or more
                    if (stepsOfChapter[i].conditions && stepsOfChapter[i].conditions.length > 0) {
                      var maxPosition = 0
                      // find if parents are already sorted and if so add item in sorted after
                      for (var k = 0; k < stepsOfChapter[i].conditions.length; k++) {
                        let parentStepId = stepsOfChapter[i].conditions[k].replace("stepDone_", "")
                        parentStepId = parentStepId.replace("stepSuccess_", "")
                        parentStepId = parentStepId.replace("stepFail_", "")
                        // If parent is not sorted => do not treat the item
                        if (sorted.indexOf(parentStepId) === -1) {
                          // check that the parent exists at least in unsorted => else error
                          if (unsorted.indexOf(parentStepId) === -1) {
                            stepsWithNoParent.push(stepId)
                            unsorted.splice(unsorted.indexOf(stepId), 1)
                            sorted.push(stepId)
                          }
                          continue allSteps
                        } else {
                          let parentPosition = sorted.indexOf(parentStepId)
                          if (parentPosition > maxPosition) {
                            maxPosition = parentPosition
                          }
                        }
                      }
                      // treat the position of the new item
                      if (sorted.length >= maxPosition) {
                        sorted.splice(maxPosition + 1, 0, stepId)
                      } else {                  
                        sorted.push(stepId)
                      }
                      unsorted.splice(unsorted.indexOf(stepId), 1)
                    }
                  }
                }
            }
            
            // apply sort && add extra formating properties
            for (i = 0; i < sorted.length; i++) {
              for (k = 0; k < stepsOfChapter.length; k++) {
                if (sorted[i] === stepsOfChapter[k].stepId.toString()) {
                  if (stepsWithNoParent.indexOf(stepsOfChapter[k].stepId.toString()) !== -1) {
                    stepsOfChapter[k].error = 'FollowingStepsHaveInvalidCondition'
                  }
                  if (i === 0 || stepsOfChapter[k].conditions.length === 0 || stepsOfChapter[k].conditions.length > 1 || stepsOfChapter[k].type === 'locate-marker') {
                    stepsOfChapter[k].level = 1
                  } else {
                    stepsOfChapter[k].level = 2
                  }
                  this.chapters.items[j].steps.push(stepsOfChapter[k])
                }
              }
            }
            
            /*
            // first step : find the lower level steps
            for (i = 0; i < stepsOfChapter.length; i++) {
              // if no parent (stepDone), 
              if ((stepsOfChapter[i].conditions && stepsOfChapter[i].conditions.length > 0) || stepsOfChapter[i].type === 'locate-marker') {
                if (stepsOfChapter[i].type !== 'locate-marker') {
                  for (var k = 0; k < stepsOfChapter[i].conditions.length; k++) {
                    var noStepDone = true
                    if (stepsOfChapter[i].conditions[k].indexOf('stepDone') !== -1) {
                      noStepDone = false
                      parent[stepsOfChapter[i].stepId.toString()] = stepsOfChapter[i].conditions[k].replace("stepDone_", "")
                    }
                    if (stepsOfChapter[i].conditions[k].indexOf('stepSuccess') !== -1) {
                      noStepDone = false
                      parent[stepsOfChapter[i].stepId.toString()] = stepsOfChapter[i].conditions[k].replace("stepSuccess_", "")
                    }
                    if (stepsOfChapter[i].conditions[k].indexOf('stepFail') !== -1) {
                      noStepDone = false
                      parent[stepsOfChapter[i].stepId.toString()] = stepsOfChapter[i].conditions[k].replace("stepFail_", "")
                    }
                  }
                }
                if (noStepDone || stepsOfChapter[i].type === 'locate-marker') {
                  order.push({key: orderIndex.toString(), value: stepsOfChapter[i].stepId}) 
                  orderIndex++
                }
              } else {
                if (order.length === 0) {
                  order.push({key: "0", value: stepsOfChapter[i].stepId})
                } else {
                  order.push({key: orderIndex.toString(), value: stepsOfChapter[i].stepId}) 
                  orderIndex++
                }
                
                stepsWithNoCondition.push(stepsOfChapter[i].title[this.languages.current])
              }
            }

            // get order based on parent/child hierarchy
            var nbToTreat = Object.keys(parent).length
            var inc = 0
            while (Object.keys(parent).length > 0 && inc < nbToTreat) {
              for (var child in parent) {
                for (i = 0; i < order.length; i++) {
                  if (parent[child] === order[i].value) {
                    order.push({key: order[i].key + "." + order[i].value, value: child})
                    delete parent[child]
                  }
                }
              }
              inc++
            }
            
            order.sort(function(a, b) {
              return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
            })
            
            // order steps
            for (i = 0; i < order.length; i++) {
              for (k = 0; k < stepsOfChapter.length; k++) {
                if (order[i].value === stepsOfChapter[k].stepId.toString()) {
                  this.chapters.items[j].steps.push(stepsOfChapter[k])
                }
              }
            }
            */
            
            // Checks
            this.chapters.items[j].warnings = []
            if (!hasEndOfChapterStep) {
              this.chapters.items[j].warnings.push({noEndOfChapter: true})
            }
            if (stepsWithNoCondition.length > 1) {
              this.chapters.items[j].warnings.push({moreThan1StepWithNoCondition: stepsWithNoCondition})
            }
            if (parent.length > 0) {
              this.chapters.items[j].warnings.push({stepsWithMissingParent: parent})
            }
            if (stepsWithNoParent.length > 0) {
              this.chapters.items[j].warnings.push({stepWithNoParent: stepsWithNoParent})
            }
          }
        }
        if (steps && steps.length > 0 && this.tabs.progress < 2) {
          this.tabs.progress = 2
        }
        
        // update property this.quest.hasLocateMarkerSteps
        let found = false
        for (let i = 0; i < steps.length; i++) {
          let item = steps[i]
          if (item.type === 'locate-marker') {
            found = true
            break
          }
        }
        this.quest.hasLocateMarkerSteps = found
      } else {
        this.warnings.stepsMissing = true
      }
      this.$q.loading.hide()
    },
    showHelpPopup (message) {
      this.$q.dialog({
        //title: this.$t('label.IssuesInYouQuest'),
        message: this.$t('label.' + message)
      })
    },
    showChapterWarnings (warnings) {
      var message = ""
      for (var i = 0; i < warnings.length; i++) {
        if (warnings[i].hasOwnProperty('noEndOfChapter')) {
          message += this.$t('label.YourChapterMustHaveAEndOfChapterStep') + ". "
        }
        if (warnings[i].hasOwnProperty('moreThan1StepWithNoCondition')) {
          message += this.$t('label.FollowingStepsHaveNoConditionsOnlyTheFirstStepCanHaveThis') + ": " + warnings[i].moreThan1StepWithNoCondition.join(', ') + ". "
        }
        if (warnings[i].hasOwnProperty('stepWithNoParent')) {
          message += this.$t('label.FollowingStepsHaveInvalidCondition') + "."
        }
        if (warnings[i].hasOwnProperty('stepsWithMissingParent')) {
          message += this.$t('label.FollowingStepsHaveNoValidParent') + ": "
          for (var child in warnings[i].stepsWithMissingParent) {
            for (var j = 0; j < this.chapters.items.length; j++) {
              // Get the steps of current chapter
              for (var k = 0; k < this.chapters.items[j].steps.length; k++) {
                if (this.chapters.items[j].steps[k].stepId.toString() === child) {
                  message += this.chapters.items[j].steps[k].title[this.languages.current]
                }
              }
            }
          }
          message += ". "
        }
      }
      this.$q.dialog({
        title: this.$t('label.IssuesInYouQuest'),
        message: message
      })      
    },
    showStepWarnings (warning) {
      this.$q.dialog({
        title: this.$t('label.IssuesInYourStep'),
        message: this.$t('label.' + warning)
      })      
    },
    /*
     * Submit settings changes
     */
    async submitSettings() {
      // start location must be defined
      if (this.form.fields.location.lat === 0 || this.form.fields.location.lng === 0) {
        Notification(this.$t('label.YouMustDefineStartLocation'), 'warning')
        return
      }
      this.$v.form.fields.$touch()
      if (!this.$v.form.fields.$error) {
        let commonProperties = {
          'languages': [this.form.fields.mainLanguage],
          'version': this.quest.version,
          'location': { 
            type: 'Point', 
            coordinates: [this.form.fields.location.lng, this.form.fields.location.lat],
            town: this.form.fields.town,
            country: this.form.fields.country,
            zipcode: this.form.fields.zipcode,
            address: this.form.fields.startingPlace
          }
        }
        
        let quest = Object.assign({}, this.form.fields, commonProperties)

        // save to DB (or update, if property '_id' is defined)
        this.$q.loading.show()
        let res = await QuestService.save(quest)
        this.$q.loading.hide()
        
        if (res && res.data) {
          // update progression in stepper
          if (this.tabs.progress < 1) {
            this.tabs.progress = 1
            this.tabs.selected = 'steps'
            // start configuration story
            if (this.story.active) {
              this.story.step = 19
            }
          }
          Notification(this.$t('label.QuestSaved'), 'info')
        } else {
          // if changes are not saved
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    /*
     * Upload a new image for the quest
     */
    async uploadImage(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadPicture(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        if (uploadPictureResult.data.file) {
          this.form.fields.picture = uploadPictureResult.data.file
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      let uploadThumbResult = await QuestService.uploadThumb(data)
      if (uploadThumbResult && uploadThumbResult.hasOwnProperty('data')) {
        if (uploadThumbResult.data.file) {
          this.form.fields.thumb = uploadThumbResult.data.file
        } else if (uploadThumbResult.data.message && uploadThumbResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a new logo for the quest
     */
    async uploadLogo(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadLogo(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        if (uploadPictureResult.data.file) {
          this.form.fields.customization.logo = uploadPictureResult.data.file
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Start the tutorial
     */
    async startStory() {
      // count the number of quests built, to start tutorial only for the first quest
      const questCreatedNb = await QuestService.countForUser(this.$store.state.user._id)
      
      if (questCreatedNb.data && questCreatedNb.data < 2) {
        this.story.active = true
        if (this.story.step === null && this.tabs.selected === 'settings') {
          this.story.step = 17
        }
      }
    },
    /*
     * Get current user location
     */
    async getCurrentLocation() {
      this.$q.loading.show()
      // get the current coords
      navigator.geolocation.getCurrentPosition(this.fillLocation, this.getLocationError, {timeout: 5000, maximumAge: 10000})
    },
    getLocationError(err) {
      console.log(err)
      this.$q.dialog({
        title: this.$t('label.GeolocationFailed'),
        message: this.$t('label.GeolocationFailedDesc')
      })
      this.$q.loading.hide()
    },
    /*
     * Get the address based on the position
     * @param   {Object}    pos            Position data
     */
    fillLocation(pos) {
      this.form.fields.location = {lat: pos.coords.latitude, lng: pos.coords.longitude}
      // get the address
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': {lat: pos.coords.latitude, lng: pos.coords.longitude}}, (results, status) => {
        this.$q.loading.hide()
        if (status === 'OK' && results[0].formatted_address) {
          this.form.fields.town = this.getCity(results[0])
          this.form.fields.country = this.getCountry(results[0])
          this.form.fields.zipcode = this.getZipcode(results[0])
          this.form.fields.startingPlace = results[0].formatted_address
          // force field to be refreshed
          document.getElementById("startingplace").value = this.form.fields.startingPlace
        } else {
          this.$q.loading.hide()
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      });
    },
    /*
     * Fill the location in the settings
     * @param   {Object}    place            Position & address data
     */
    async setLocation(place) {
      this.form.fields.location = {lat: place.geometry.location.lat(), lng: place.geometry.location.lng()}
      this.form.fields.town = this.getCity(place)
      this.form.fields.country = this.getCountry(place)
      this.form.fields.zipcode = this.getZipcode(place)
      this.form.fields.startingPlace = (place.formatted_address || '')
    },
    /*
     * Get the zip code in the location data
     * @param   {Object}    address            Location data
     */
    getZipcode(address) {
      if (address && address.address_components && address.address_components.length > 0) {
        for (var i = 0; i < address.address_components.length; i++) {
          if (address.address_components[i].types) {
            for (var j = 0; j < address.address_components[i].types.length; j++) {
              if (address.address_components[i].types[j] === 'postal_code') {
                return address.address_components[i].long_name
              }
            }
          }
        }
      }
      return ""
    },
    /*
     * Get the city from the location data
     * @param   {Object}    address            Location data
     */
    getCity(address) {
      if (address && address.address_components && address.address_components.length > 0) {
        for (var i = 0; i < address.address_components.length; i++) {
          if (address.address_components[i].types) {
            for (var j = 0; j < address.address_components[i].types.length; j++) {
              if (address.address_components[i].types[j] === 'locality') {
                return address.address_components[i].long_name
              }
            }
          }
        }
      }
      return ""
    },
    /*
     * Get the contry code from the location data
     * @param   {Object}    address            Location data
     */
    getCountry(address) {
      if (address && address.address_components && address.address_components.length > 0) {
        for (var i = 0; i < address.address_components.length; i++) {
          if (address.address_components[i].types) {
            for (var j = 0; j < address.address_components[i].types.length; j++) {
              if (address.address_components[i].types[j] === 'country') {
                return address.address_components[i].short_name
              }
            }
          }
        }
      }
      return ""
    },
    /*
     * Reindex elements in the list after drag & drop
     * @param   {Object}    event            touch event
     */
    async onChapterListUpdate(event) {
      let moveStatus = await StepService.moveChapter(this.questId, this.quest.version, event.oldIndex + 1, event.newIndex + 1)
      if (moveStatus) {
        this.chapters.items.splice(event.newIndex, 0, this.chapters.items.splice(event.oldIndex, 1)[0])
      }
    },
    /*
     * Reindex elements in the list after drag & drop
     * @param   {Object}    event            touch event
     */
    async onStepListUpdate(event) {
      let moveStatus = await StepService.move(this.questId, this.quest.version, event.oldIndex + 1, event.newIndex + 1)
      if (moveStatus) {
        this.chapters.items[0].steps.splice(event.newIndex, 0, this.chapters.items[0].steps.splice(event.oldIndex, 1)[0])
      }
    },
    /*
     * Publish a quest
     */
    async publish(lang) {
      let isPublishing = await this.checkIfTestable()
      if (isPublishing) {
        // if quest is already published in a language, accept automatically other language
        var action = 'unpublish'
        // check if at least one language is published
        for (var i = 0; i < this.form.fields.languages.length; i++) {
          if (this.form.fields.languages[i].lang && this.form.fields.languages[i].lang === lang) {
            if (this.form.fields.languages[i].published) {
              action = 'publish'
            }
          }
        }
        if (action === 'publish') {
          this.$q.loading.show()
          await QuestService.publish(this.questId, lang)
          //TODO: manage if publishing failed
          this.$q.loading.hide()
          
          if (this.quest.status === 'unpublished' || this.quest.status === 'draft') {
            if (this.quest.access === 'public') {
              this.quest.status = 'tovalidate'            
            } else {
              this.quest.status = 'published'
            }
            this.readOnly = true
          }
          this.tabs.progress = 3
        } else {
          // no language is published => unpublish the quest
          this.$q.loading.show()
          await QuestService.unpublish(this.questId, lang)
          this.$q.loading.hide()
          
          this.quest.status = 'unpublished'
          this.tabs.progress = 2
        }
      } else {
        Notification(this.$t('label.YourQuestContainsErrorsInSteps'), 'error')
      }
    },
    /*
     * check if a quest is read only
     */
    isReadOnly() {
      if (this.quest.status === 'disabled' || this.quest.status === 'tovalidate') {
        return true
      }
      return false
    },
    /*
     * Unpublish a quest
     */
    async unpublish() {
      this.quest.status = 'unpublished';
      this.$q.loading.show()
      await QuestService.unpublish(this.questId)
      this.$q.loading.hide()
      Notification(this.$t('label.YourQuestIsUnpublished'), 'positive')
    },
    /*
     * Test the quest
     */
    async testQuest() {
      let testable = await this.checkIfTestable()
      if (testable) {
        this.$router.push('/quest/play/' + this.questId)
      } else {
        Notification(this.$t('label.YourQuestContainsErrorsInSteps'), 'error')
      }
    },
    /*
     * Test the quest
     */
    async checkIfTestable() {
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].warnings && this.chapters.items[i].warnings.length > 0) {
          return false
        }
      }
      return true
    },
    /*
     * Remove the quest
     */
    async removeQuest() {
      var _this = this; // workaround for closure scope quirks
      
      this.$q.dialog({
        message: this.$t('label.AreYouSureYouWantToRemoveThisQuest'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await QuestService.remove(_this.questId, _this.quest.version)
        // TODO: manage when remove failed
        this.$router.push('/map')
      })
    },
    /*
     * Remove a step
     * @param   {String}    stepId            ID of the step removed
     */
    async removeStep(stepId) {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        message: this.$t('label.DoYouWantToRemoveThisStep'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await StepService.remove(_this.questId, stepId, _this.quest.version)
        // refresh steps list
        await _this.refreshStepsList()
      }).onCancel((e) => { console.log(e) })
    },
    /*
     * Create a new draft version for this quest
     */
    async createNewVersion() {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        message: this.$t('label.CreateNewVersionDescription'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await QuestService.createNewVersion(_this.questId)
        // reload quest data with new version
        this.$router.push('/quest/builder/' + _this.questId)
      })
    },
    /*
     * Remove a chapter
     * @param   {String}    chapterId            ID of the chapter removed
     */
    async removeChapter(chapterId) {
      var _this = this; // workaround for closure scope quirks
      
      // check that there are no steps in this chapter
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].chapterId.toString() === chapterId) {
          if (this.chapters.items[i].steps && this.chapters.items[i].steps.length > 0) {
            Notification(this.$t('label.YouCanNotRemoveAChapterWithSteps'), 'warning')
            return false
          }
        }
      }
      
      this.$q.dialog({
        message: this.$t('label.DoYouWantToRemoveThisChapter'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await StepService.removeChapter(_this.questId, chapterId, _this.quest.version)
        // TODO: manage when remove failed
        // reassign a number (1, 2, 3, ...) to remaining steps
        let removedChapterIndex = _this.chapters.items.map(function(e) { return e.chapterId; }).indexOf(chapterId)
        _this.chapters.items.splice(removedChapterIndex, 1)
        // refresh steps list
        await this.refreshStepsList()
      }).onCancel((e) => { console.log(e) })
    },
    /*
     * Modify a chapter
     * @param   {String}    chapterId            ID of the chapter removed
     */
    async modifyChapter(chapterId) {
      var _this = this; // workaround for closure scope quirks
      var chapterData = {name: '', position: 0}
      
      // Get chapter position and title
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].chapterId.toString() === chapterId) {
          chapterData.name = this.chapters.items[i].title[this.languages.current] ? this.chapters.items[i].title[this.languages.current] : ''
          chapterData.position = i
        }
      }
      
      this.$q.dialog({
        message: this.$t('label.ModifyTheChapter'),
        prompt: {
          model: chapterData.name,
          type: 'text'
        },
        cancel: true
      }).onOk(async (data) => {
        var title = {}
        title[_this.languages.current] = data
        
        await StepService.modifyChapter({questId: _this.questId, version: _this.quest.version, chapterId: chapterId, title: title})
        
        _this.chapters.items[chapterData.position].title[_this.languages.current] = data
      }).onCancel(() => {})
    },
    /*
     * Create a chapter
     */
    async addChapter() {
      var _this = this; // workaround for closure scope quirks
      
      this.$q.dialog({
        message: this.$t('label.NewChapter'),
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true
      }).onOk(async (data) => {
        var title = {}
        title[_this.languages.current] = data
        
        await StepService.modifyChapter({questId: _this.questId, version: _this.quest.version, chapterId: '0', title: title})
        
        await this.refreshStepsList()
      }).onCancel(() => {})
    },
    /*
     * modify a step
     * @param   {Object}    step            Data of the step to modify
     */
    async modifyStep(step) {
      this.chapters.showNewStepPageSettings = true
      if (step && step.stepId) {
        var _this = this
        // add timer else the watcher does not work every time
        setTimeout(function() { 
          _this.stepId = step.stepId
          _this.chapters.newStep.type = _this.getStepTypeInformations(step.type)
          _this.chapters.newStep.chapterId = step.chapterId
          _this.chapters.newStep.scrollPosition = document.documentElement.scrollTop
        }, 500)
      }
      this.closeAllPanels()
      this.chapters.showNewStepOverview = false
      this.chapters.reloadStepPlay = false
      // move to top
      this.moveToTop()
    },
    /*
     * play a step
     * @param   {Object}    step            Data of the step to play
     */
    async playStep(step) {
      this.chapters.reloadStepPlay = false
      if (step && step.stepId) {
        this.stepId = step.stepId
        step.id = step.stepId
        this.chapters.newStep.type = this.getStepTypeInformations(step.type)
        this.chapters.newStep.chapterId = step.chapterId
        this.chapters.newStep.scrollPosition = document.documentElement.scrollTop
      }
      this.closeAllPanels()
      this.chapters.newStep.overviewData = step
      this.chapters.showNewStepPageSettings = false
      this.chapters.showNewStepOverview = true
      // move to top
      this.moveToTop()
      // add timer else the watcher is not working in stepPlay
      var _this = this
      setTimeout(function() { _this.chapters.reloadStepPlay = true }, 300)
    },
    /*
     * Move screen to current chapter (anchor)
     */
    async moveToPosition(position) {
        window.scrollTo(0, position)
    },
    /*
     * close overview page
     */
    async closeOverview() {
      this.resetStepData()
      this.closeAllPanels()
      await this.refreshStepsList()
      this.moveToPosition(this.chapters.newStep.scrollPosition)
      this.chapters.showNewStepOverview = false
      this.tabs.selected = 'steps'
      utils.clearAllNotifications()
      // start the story only for the 7th step
      if (this.story.active && this.countSteps() === 7) {
        this.story.step = 22
      }
    },
    /*
     * reset step data between 2 steps creation
     */
    resetStepData() {
      this.stepId = -1
      this.chapters.newStep.chaptedId = 0
      this.chapters.newStep.previousStepId = 0
      this.chapters.newStep.overviewData = {}
      this.chapters.reloadStepPlay = false // reset the overview
      this.selectedItem = null
      this.canMoveNextStep = false
      this.canPass = false
    },
    /*
     * Close step settings page
     */
    async closeStepSettingsPage() {
      await this.refreshStepsList()
      this.moveToPosition(this.chapters.newStep.scrollPosition)
      this.chapters.newStep.type = {}
      this.stepId = -1
      this.chapters.showNewStepPageSettings = false
      this.tabs.selected = 'steps'
      // refresh quest size
      await this.refreshMediaSize()
    }, 
    /*
     * add a step
     */
    async addStep(chapterId) {
      if (!chapterId) {
        chapterId = this.chapters.items[0].chapterId
      }
      this.chapters.showNewStepPage = true
      this.chapters.newStep.chapterId = chapterId
      this.chapters.newStep.scrollPosition = document.documentElement.scrollTop
      var previousStepId = 0
      // get last step id of this chapter, to build the default condition
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].chapterId.toString() === chapterId && this.chapters.items[i].steps) {
          let nbStepsInChapter = this.chapters.items[i].steps.length
          if (nbStepsInChapter > 0) {
            previousStepId = this.chapters.items[i].steps[nbStepsInChapter - 1].stepId
          }
          break
        }
      }
      this.chapters.newStep.previousStepId = previousStepId
    },
    /*
     * insert a step
     */
    async insertStep(chapterId, stepId) {
      if (!chapterId) {
        chapterId = this.chapters.items[0].chapterId
      }
      this.chapters.showNewStepPage = true
      this.chapters.newStep.chapterId = chapterId
      this.chapters.newStep.previousStepId = stepId
    },
    /*
     * Save steps order
     */
    // TODO : do the same with only one query
    // MP 2019-05-21 seems not used, remove after a few weeks?
    /*async reindexChapters() {
      for (let i = 0; i < this.chapters.items.length; i++) {
        let chapter = this.chapters.items[i]
        await StepService.modifyChapter({ chapterId: chapter.chapterId, questId: this.questId, order: i + 1 })
      }
    },*/
    /*
     * Update the list of the languages available for the quest
     */
    /*async setOtherLanguage() {
      var selLang = this.languages.current
      // check if quest is already available for this lang
      var questConfiguredForThisLanguage = false
      if (this.quest.languages) {
        for (var i = 0; i < this.quest.languages.length; i++) {
          if (this.quest.languages[i].lang === selLang) {
            questConfiguredForThisLanguage = true
          }
        }
      }
      if (questConfiguredForThisLanguage) {
        this.languages.isNew = false
        // reload steps for the lang
        await this.refreshStepsList()
      } else {
        // display add button
        this.languages.isNew = true
      }
    },*/
    /*
    * Quest author selected the language he wants to use for typing quest & steps texts
    */
    async selectLanguage() {
      let selLang = this.languages.current
      
      // check if quest is already available for this lang
      let questConfiguredForThisLanguage = false
      if (this.quest.languages) {
        for (var i = 0; i < this.quest.languages.length; i++) {
          if (this.quest.languages[i].lang === selLang) {
            questConfiguredForThisLanguage = true
          }
        }
      }
      
      if (!questConfiguredForThisLanguage) {
        // raises blocking exception if any problem occurs
        await QuestService.addLanguage(this.questId, selLang)
      }
      
      // refresh quest data
      await this.loadQuestData()
      
      // if quest title is empty, autofill it with a default value
      if (!this.quest.title[selLang] || this.quest.title[selLang] === '') {
        if (selLang === this.quest.mainLanguage) {
          // if current language is main language, get title default value (label.NewQuest)
          this.quest.title[selLang] = this.$t('label.NewQuest', selLang)
        } else {
          // copy value from main language
          this.quest.title[selLang] = this.quest.title[this.quest.mainLanguage]
        }
      }
      
      if (this.story.active) {
        // start configuration story
        this.story.step = 18
      }
    },
    /*
    * Quest author change the language
    */
    async changeLanguage(language) {
      // check if quest is already available for this lang
      let questConfiguredForThisLanguage = false
      if (this.quest.languages) {
        for (var i = 0; i < this.quest.languages.length; i++) {
          if (this.quest.languages[i].lang === language) {
            questConfiguredForThisLanguage = true
          }
        }
      }
      
      if (!questConfiguredForThisLanguage) {
        // ask the user if he want to create the language
        var _this = this;
      
        this.$q.dialog({
          message: this.$t('label.AreYouSureToAddThisNewLanguage'),
            ok: true,
            cancel: true
          }).onOk(async () => {
            // raises blocking exception if any problem occurs
            await QuestService.addLanguage(_this.questId, language)
            
            // if quest title is empty, autofill it with a default value
            if (!this.quest.title[language] || this.quest.title[language] === '') {
              if (language === this.quest.mainLanguage) {
                // if current language is main language, get title default value (label.NewQuest)
                this.quest.title[language] = this.$t('label.NewQuest', language)
              } else {
                // copy value from main language
                this.quest.title[language] = this.quest.title[this.quest.mainLanguage]
              }
            }            
          }).onCancel(async () => {
            _this.languages.current = _this.quest.languages[0].lang
          })
      } else {
        // refresh quest data
        await this.loadQuestData()
            
        // if quest title is empty, autofill it with a default value
        if (!this.quest.title[language] || this.quest.title[language] === '') {
          if (language === this.quest.mainLanguage) {
            // if current language is main language, get title default value (label.NewQuest)
            this.quest.title[language] = this.$t('label.NewQuest', language)
          } else {
            // copy value from main language
            this.quest.title[language] = this.quest.title[this.quest.mainLanguage]
          }
        }
      }
    },
    /*
     * Close a private quest
     */
    async closePrivateQuest() {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        message: this.$t('label.ClosePrivateQuestAlert'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await QuestService.closePrivate(_this.questId, _this.quest.version)
        _this.quest.status = 'old'
        // refresh steps list
        await _this.getPrivateRanking()
      }).onCancel((e) => { console.log(e) })
    },
    /*
     * list the scores
     */
    async getPrivateRanking () {
      var results = await RunService.listPlayersForThisQuest(this.questId)
      if (results && results.data) {
        this.ranking.items = results.data
        this.ranking.items.sort(this.compareScore)
        // compute position
        this.refreshPosition()
      }
    },
    /*
     * Sort based on the score
     */
    compareScore(a, b) {
      if (a.score > b.score) {
        return -1
      }
      if (a.score < b.score) {
        return 1
      }
      return 0
    },
    /*
     * Update the position in the ranking
     */
    refreshPosition() {
      var position = 0
      for (var i = 0; i < this.ranking.items.length; i++) {
        if (i === 0 || this.ranking.items[i].score !== this.ranking.items[i - 1].score) {
          position = i + 1
          if (!this.ranking.items[i].position || this.ranking.items[i].position !== position) {
            this.ranking.items[i].position = position
            this.$set(this.ranking.items, i, this.ranking.items[i]) // refresh display
          }
        } else {
          position = this.ranking.items[i - 1].position
          if (!this.ranking.items[i].position || this.ranking.items[i].position !== position) {
            this.ranking.items[i].position = position
            this.$set(this.ranking.items, i, this.ranking.items[i]) // refresh display
          }
        }
      }
    },
    /*
     * Close step type selection page
     */
    closeStepTypePage() {
      // to trigger step type change
      this.stepId = -1
      this.chapters.reloadStepPlay = false // reset the overview
      this.chapters.newStep.type = {}
      this.chapters.showNewStepPage = false
    }, 
    /*
     * Filter step types based on main category code
     */
    filteredStepTypes(categoryCode) {
      return stepTypes.filter(stepType => (stepType.category === categoryCode && stepType.enabled && !(stepType.code === 'end-chapter' && this.form.fields.editorMode === 'simple')))
    },
    /*
     * Select a step type
     * @param   {Object}    stepType            Type of the step
     */
    async selectStepType(stepType) {
      this.chapters.newStep.type = stepType
      this.chapters.showNewStepPage = false
      // to trigger step type change
      this.stepId = '0'
      this.chapters.showNewStepPageSettings = true
      // move to top
      this.moveToTop()
      
      if (this.countSteps() === 0 && this.story.active) {
        this.story.step = 20
      }
    },
    countSteps() {
      var count = 0
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].steps && this.chapters.items[i].steps.length > 0) {
          count += this.chapters.items[i].steps.length
        }
      }
      return count
    },
    /*
     * Launched when the step settings are set
     * @param   {Object}    step            New step data
     */
    async trackStepChanges(step) {
      this.chapters.showNewStepPageSettings = false
      if (step.type === 'end-chapter') {
        await this.closeOverview()
        return false
      }
      this.chapters.showNewStepOverview = true
      this.stepId = step.id
      this.chapters.newStep.overviewData = step
      // move to top
      this.moveToTop()
      // add timer else the watcher is not working in stepPlay
      var _this = this
      setTimeout(function() { _this.chapters.reloadStepPlay = true }, 300)
      
      if (this.story.active && this.countSteps() === 0) {
        this.story.step = 21
      }
      
      // refresh quest media size
      await this.refreshMediaSize()
    },
    /*
     * Launched when the step is played
     * @param   {String}    stepId            ID of the step
     */
    async trackStepPlayed(stepId) {
      console.log("played")
      this.canMoveNextStep = true
    },
    async trackStepSuccess(stepId) {
      console.log("success")
      this.canMoveNextStep = true
      this.hideHint()
    },
    /*
     * Track step passing
     */
    async trackStepPass () {
      console.log("pass")
      this.canPass = true
    },
    /*
     * Track step fail
     */
    async trackStepFail () {
      console.log("fail")
      this.hideHint()
    },
    /*
     * add an editor
     */
    async addEditor () {
      this.$q.loading.show()
      let addStatus = await QuestService.addEditor(this.questId, this.quest.version, this.editor.new.email)
      this.$q.loading.hide()

      if (addStatus && addStatus.status !== 403) {
        await this.listEditors()
        this.editor.new.email = ''
        this.editor.new.isExisting = true
      } else {
        this.editor.new.isExisting = false
      }
    },
    /*
     * list the editors
     */
    async listEditors () {
      this.warnings.editorsMissing = false
      var results = await QuestService.listEditors(this.questId, this.quest.version)
      if (results && results.data) {
        this.editor.items = results.data
        for (var i = 0; i < this.editor.items.length; i++) {
          this.editor.items[i].checked = true
        }
      } else {
        this.warnings.editorsMissing = true
      }
    },
    /*
     * Remove an editor
     */
    async removeEditor (id) {
      this.$q.loading.show()
      await QuestService.removeEditor(this.questId, this.quest.version, id)
      // TODO: manage editor removal
      this.$q.loading.hide()
      await this.listEditors()
    },
    /*
     * add an invitee
     */
    async addInvitee () {
      this.$q.loading.show()
      let addStatus = await QuestService.addInvitee(this.questId, this.quest.version, this.invitee.new.email)
      this.$q.loading.hide()

      if (addStatus && addStatus.status !== 403) {
        await this.listInvitees()
        this.invitee.new.email = ''
        this.invitee.new.isExisting = true
      } else {
        this.invitee.new.isExisting = false
      }
    },
    /*
     * list the invitees
     */
    async listInvitees () {
      this.warnings.inviteeMissing = false
      var results = await QuestService.listInvitees(this.questId, this.quest.version)
      if (results && results.data) {
        this.invitee.items = results.data
        for (var i = 0; i < this.invitee.items.length; i++) {
          this.invitee.items[i].checked = true
        }
      } else {
        this.warnings.inviteeMissing = true
      }
    },
    /*
     * Remove an invitee
     */
    async removeInvitee (id) {
      this.$q.loading.show()
      await QuestService.removeInvitee(this.questId, this.quest.version, id)
      // TODO: manage invitee removal
      this.$q.loading.hide()
      await this.listInvitees()
    },
    hideHint() {
      this.chapters.newStep.overviewData.hint = {}
    },
    /*
     * Get the icon of a step type
     */
    getIconFromStepType(stepType) {
      for (var i = 0; i < stepTypes.length; i++) {
        if (stepTypes[i].code === stepType) {
          return 'fas fa-' + stepTypes[i].icon
        }
      }
      return ''
    },
    /*
     * Get the information of a step type
     */
    getStepTypeInformations(stepType) {
      for (var i = 0; i < stepTypes.length; i++) {
        if (stepTypes[i].code === stepType) {
          return stepTypes[i]
        }
      }
      return ''
    },
    /*
     * Fill the inventory with objects won by the user
     */
    async fillInventory() {
      this.warnings.inventoryMissing = false
      // load items won on previous steps
      this.$q.loading.show()
      var response = await StepService.listWonObjects(this.questId, this.stepId, this.quest.version)
      if (response && response.data) {
        this.inventory.items = response.data
      } else {
        this.warnings.inventoryMissing = true
      }
      
      this.$q.loading.hide()
    },
    /*
     * Open the inventory
     */
    async openInventory() {
      // check if the items are already loaded
      if (this.inventory.items.length === 0) {
        await this.fillInventory()
      }
      if (this.inventory.isOpened) {
        this.closeAllPanels()
      } else {
        this.closeAllPanels()
        this.inventory.isOpened = true
        this.overview.tabSelected = 'inventory'
      }
    },
    /*
     * Select an item in the inventory
     * @param   {object}    item            Item selected
     */
    selectItem(item) {
      if (this.chapters.newStep.overviewData.type !== 'use-item') {
        Notification(this.$t('label.YouCanNotUseAnItemInThisStep'), 'warning')
        return
      }
      this.selectedItem = item
      this.closeAllPanels()
    },
    /*
     * Close all opened panels to go back to main screen
     */
    closeAllPanels() {
      this.inventory.isOpened = false
      this.hint.isOpened = false
      this.overview.tabSelected = 'none'
    },
    /*
     * Ask for a hint
     */
    async askForHint() {
      if (!this.isHintAvailable()) {
        return
      }
      if (this.hint.isOpened) {
        this.closeAllPanels()
      } else {
        let hintLabel = await RunService.getHint(0, this.stepId, this.quest.version)

        if (hintLabel && hintLabel.hint) {
          this.hint.label = hintLabel.hint
          this.closeAllPanels()
          this.hint.isOpened = true
          this.overview.tabSelected = 'hint'
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    /*
     * Check if a hint is available for the step
     */
    isHintAvailable() {
      return (this.chapters.newStep.overviewData && this.chapters.newStep.overviewData.hasOwnProperty("hint") && this.chapters.newStep.overviewData.hint[this.languages.current] && this.chapters.newStep.overviewData.hint[this.languages.current] !== '')
    },
    /*
     * Scroll page to the top
     */
    moveToTop() {
      window.scrollTo(0, 0)
    },
    /*
     * Get the storage usage
     */
    getReadableStorageUsage() {
      if (this.quest && this.quest.size) {
        let usedStorage = utils.humanReadableFileSize(this.quest.size.current, true, this.$t)
        let limitStorage = utils.humanReadableFileSize(this.quest.size.limit, true, this.$t)
        return this.$t('label.UsedOver', {current: usedStorage, limit: limitStorage})
      } else {
        return ''
      }
    },
    getPercentStorageUsage() {
      if (this.quest && this.quest.size && this.quest.size.limit && this.quest.size.limit > 0) {
        return this.quest.size.current / this.quest.size.limit
      } else {
        return 0
      }
    },
    /*
     * Show the media panel
     */
    async showMedia() {
      // load quest medias
      await this.loadMedia()
      
      // open the panel
      this.media.isOpened = true
    },
    /*
     * Load the quest media
     */
    async loadMedia() {
      // load quest medias
      let media = await QuestService.listMedia(this.questId, this.quest.version)
      
      if (media && media.data) {
        this.media.items = media.data
      }
    },
    /*
     * refresh media size
     */
    async refreshMediaSize() {
      // load quest media size
      let media = await QuestService.getSize(this.questId, this.quest.version)
      
      if (media && media.data) {
        this.quest.size = media.data.size
      }
    },
    /*
     * Remove a media
     */
    async removeMedia(id) {
      // Remove the media from the server
      let removeStatus = await QuestService.removeMedia(this.questId, this.quest.version, id)
      
      if (!removeStatus) {
        this.$q.dialog({
          message: this.$t("label.TechnicalIssue")
        })   
      } else {
        // refresh media list
        await this.loadMedia()
      }
    },
    /*
     * Zoom on a media
     */
    zoomMedia(index) {
      this.media.detail = {isOpened: true, index: index}
    },
    /*
     * Close zoom
     */
    unzoomMedia() {
      this.media.detail = {isOpened: false, index: 0}
    },
    /*
     * Hide the media panel
     */
    async hideMedia() {
      await this.refreshMediaSize()
      this.media.isOpened = false
    },
    /*
     * download PDF file containing all AR markers
     */
    downloadMarkers() {
      let quasarThis = this
      
      // see https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#create-a-temporary-file
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024 /* reserved size in bytes */, (fs) => {
        let req = new XMLHttpRequest()
        req.open("GET", "statics/markers/all.pdf", true)
        req.responseType = "blob"
        
        req.onload = function(ev) {
          if (this.status !== 200) {
            Notification(quasarThis.$t('label.TechnicalIssue'), 'error')
            console.error('Could not download PDF markers file. Request status HTTP code: ', this.status)
            return
          }
          let blob = new Blob([this.response], { type: 'application/pdf' })
          
          // cordova.file.externalDataDirectory <= maybe for persistent storage
          fs.root.getFile("all.pdf", { create: true, exclusive: false }, function (fileEntry) {
            // Create a FileWriter object for our FileEntry (log.txt).
            fileEntry.createWriter((fileWriter) => {
              fileWriter.onwriteend = (ev) => {
                cordova.plugins.fileOpener2.open(
                  ev.target.localURL, // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
                  'application/pdf', 
                  { 
                    error: (err) => { 
                      console.error('Could not open PDF markers file', err);
                    },
                    success: () => {}
                  }
                )
              }

              fileWriter.onerror = (err) => {
                console.error("Failed file write: ", err);
              }
              
              fileWriter.write(blob)
            });
          }, (err) => {
            Notification(quasarThis.$t('label.TechnicalIssue'), 'error')
            console.error('Could not create PDF markers file on device system', err)
          })
        }
        
        req.send()
      }, (err) => {
        Notification(quasarThis.$t('label.TechnicalIssue'), 'error')
        console.error('Could not access to device filesystem', err)
      })
    },
    async listReviews () {
      let results = await ReviewService.list({ questId: this.questId, version: this.quest.version })
      this.reviews = results.data
    },
    /*
     * Get quest statistics
     */
    async getStatistics () {
      const date = new Date()
      let results = await QuestService.getStatistics(this.questId, this.quest.version, date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
      this.statistics = results.data
    },
    /*
     * Get avatar URL given file name (may be already an URL)
     * TODO: maybe needed at other places => move to utils
     * @param    {String}    filename     
     */
    getAvatar (filename) {
      if (filename) {
        if (filename.indexOf('http') !== -1) {
          return filename
        } else {
          return this.serverUrl + '/upload/profile/' + filename
        }
      } else {
        return '/statics/profiles/noprofile.png'
      }
    },
    /*
     * Returns icon name depending on tab number, progress in creation mode, and edition mode
     * @param    {Number}    number     tab number (starting at 1 for first tab)
     */
    getTabIcon(number) {
      let creationTodoIcon = this.tabs.icons[number - 1] // icons array indexes start at 0
      let creationDoneIcon = 'check_circle'
      
      if (this.isEdition) {
        return 'img:'
      } else {
        return number <= this.tabs.progress ? creationDoneIcon : creationTodoIcon
      }
    },
    /*
     * Prevent mobile player to use back button here
     */
    trackCallBackFunction() {
      return false
    }
  },
  validations: {
    form: {
      fields: {
        title: { required },
        category: { required }
      }
    }
  }
}
</script>

<style>
.review-text { color: black; font-size: 0.8rem; white-space: pre-line; }
</style>
