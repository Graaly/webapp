<template>
  <div class="scroll row" :class="{'bg-white': !chapters.showNewStepOverview}">
    <!--<div class="col-xs-12 col-sm-6 col-md-8 col-lg-9 col-xl-10 bg-white">-->
    <div class="col bg-white" style="min-width: 260px;" :class="{'desktop-only': chapters.showNewStepOverview}">
      <!------------------ NEW RELEASE BUTTON ---------->
      <div class="settings-bar background-dark" :class="{'desktop-only': chapters.showNewStepOverview}">
        <router-link v-show="!chapters.showNewStepOverview && !chapters.showNewStepPageSettings" :to="{ path: '/profile/me'}" class="float-right no-underline close-btn q-pa-sm"><q-icon name="close" class="subtitle1" /></router-link>

        <div v-if="readOnly && quest.status === 'rejected'" class="centered bg-secondary text-white q-pa-md" @click="createNewVersion()">
          {{ $t('label.YourQuestHasNotBeenPublished') }}
        </div>
        <div v-if="(readOnly || this.isAdmin) && (quest.status === 'published' || quest.status === 'unpublished' || quest.status === 'rejected')" class="centered bg-secondary text-white q-pa-md" @click="createNewVersion()">
          {{ $t('label.ClickHereToCreateANewQuestVersion') }}
        </div>

        <div class="q-pa-md full-width">
          <span v-if="tabs.progress > 0">
            <span v-if="form.fields.title[languages.current]">
              <span v-if="form.fields.title[languages.current].length <= 30">{{ form.fields.title[languages.current] }}</span>
              <span v-if="form.fields.title[languages.current].length > 30" style="font-size: 0.7em">{{ form.fields.title[languages.current] }}</span>
            </span>
            <span v-if="!form.fields.title[languages.current]">
              <span v-if="form.fields.title[quest.mainLanguage].length <= 30">{{ form.fields.title[quest.mainLanguage] }}</span>
              <span v-if="form.fields.title[quest.mainLanguage].length > 30" style="font-size: 0.7em">{{ form.fields.title[quest.mainLanguage] }}</span>
            </span>
          </span>
          <span v-else>{{ $t('label.NewQuest') }}</span>
        </div>
      </div>

      <!------------------ TABS ------------------------>

      <q-tabs v-model="tabs.selected" class="bg-accent text-white hide-img two-lines" :class="{'desktop-only': chapters.showNewStepOverview}">
        <q-tab :disable="isReadOnly()" name="settings" :icon="getTabIcon(1)" :label="quest.type === 'quest' ? $t('label.Intro') + ' (' + languages.current + ')' : $t('label.YourRoom')" default />
        <q-tab :disable="tabs.progress < 1 || isReadOnly()" name="steps" :icon="getTabIcon(2)" :label="$t('label.Steps') + ' (' + languages.current + ')'" v-if="quest.type === 'quest'" />
        <q-tab :disable="tabs.progress < 2" name="publish" :icon="getTabIcon(3)" :label="$t('label.Publish')" />
        <q-tab name="payments" :icon="getTabIcon(5)" @click="listPayments" :label="$t('label.Payments')" v-if="quest && quest.premiumPrice && quest.premiumPrice.tier" />
        <q-tab name="reviews" :icon="getTabIcon(6)" :label="$t('label.ReviewsAndStats')" v-if="isEdition" />
        <q-tab name="results" :icon="getTabIcon(7)" :label="$t('label.Results')" v-if="quest.status !== 'draft' && quest.access === 'private'" />
      </q-tabs>

      <q-separator />

      <!------------------ SETTINGS TAB ------------------------>

      <div v-if="tabs.selected === 'settings'" class="q-pa-md arial" :class="{'desktop-only': chapters.showNewStepOverview}">

        <div v-if="!this.quest.languages || this.quest.languages.length === 0">
          <q-item>
            <q-item-section side top>
              <q-icon name="add_circle" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.SelectedLanguage') }}</q-item-label>
              <div v-for="language in form.languages" :key="language.code">
                <q-btn
                  :disabled="readOnly"
                  class="glossy full-width q-mt-sm"
                  color="primary"
                  @click="selectLanguage(language.value)">{{ language.label }}</q-btn>
              </div>
            </q-item-section>
          </q-item>

          <div class="centered q-mt-md"><strong>{{ $t('label.Or') }}</strong></div>
          <q-item>
            <q-item-section side top>
              <q-icon name="content_copy" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.UseAModel') }}</q-item-label>
              <q-card class=" q-mt-md my-card" v-for="sample in samples.list" :key="sample.questId">
                <q-card-section class="bg-secondary text-white">
                  <div class="text-h6">{{ sample.name }}</div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn flat @click="selectSample(sample.questId)">{{ $t('label.Select') }}</q-btn>
                </q-card-actions>
              </q-card>
            </q-item-section>
          </q-item>

        </div>

        <form @submit.prevent="submitSettings()" v-if="this.quest.languages.length > 0">

          <q-chip v-if="this.quest.access === 'private'" color="primary" text-color="white" icon="lock">
            {{ $t('label.PrivateQuest') }}
          </q-chip>

          <q-chip v-if="this.quest.access === 'public'" color="primary" text-color="white" icon="public">
            {{ $t('label.PublicQuest') }}
          </q-chip>

          <q-chip v-if="this.quest.isPremium" color="secondary" text-color="white" icon="star">
            {{ $t('label.PremiumQuest') }}
          </q-chip>

          <q-select outlined :readonly="readOnly" emit-value map-options v-model="languages.current" :label="$t('label.Language')" :options="form.languages" :dense="true" @input="changeLanguage">
            <template v-slot:prepend>
              <q-icon name="language" />
            </template>
          </q-select>

          <div class="outline q-pa-md q-my-sm">
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
          </div>

          <div class="outline q-pa-md q-my-sm" v-if="quest.type === 'quest'">
            {{ $t('label.QuestType') }}
            <q-icon name="help" @click.native="showHelpPopup('helpQuestType')" />
            <div class="q-gutter-md">
              <q-radio
                :disable="readOnly || editor.initMode === 'advanced'"
                v-model="form.fields.editorMode" val="simple"
                :label="$t('label.basicEditor')"
                @input="changeEditorMode" />
              <q-radio
                :disable="readOnly || editor.initMode === 'advanced'"
                v-model="form.fields.editorMode" val="advanced"
                :label="$t('label.advancedEditor')"
                @input="changeEditorMode" />
            </div>
            <div v-if="this.quest.type === 'quest' && form.fields.editorMode === 'advanced' && this.quest.isPremium">
              <q-select
                :readonly="readOnly"
                :label="$t('label.PlayersNumber')"
                v-model="form.fields.playersNumber"
                :options="form.players"
                emit-value
                map-options
                bottom-slots
                options-cover
                >
                <template v-slot:after>
                  <q-btn round dense flat icon="help" @click="showHelpPopup('helpQuestMultiplayer')" />
                </template>
              </q-select>
            </div>
          </div>

          <div class="outline q-pa-md q-my-sm">
            <q-select
              :readonly="readOnly"
              :label="$t('label.Difficulty')"
              v-model="form.fields.level"
              :options="form.levels"
              emit-value map-options />
          </div>

          <div class="outline q-pa-md q-my-sm">
            <q-select
              :readonly="readOnly"
              :label="$t('label.Duration')"
              v-model="form.fields.duration"
              :options="form.durations"
              emit-value map-options />

            <q-toggle
              :readonly="readOnly"
              :label="$t('label.ShowCountDown')"
              v-model="form.fields.countDownTime.enabled"
              />
            <q-toggle
              :readonly="readOnly"
              :label="$t('label.StopGameAfterCountDown')"
              v-model="form.fields.countDownTime.stopGame"
              />
          </div>

          <div class="outline q-pa-md q-my-sm">
            {{ $t('label.StartingPointOfTheQuest') }}
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
                  <gmap-autocomplete v-if="tabs.selected === 'settings'" id="startingplace" :placeholder="$t('label.StartingPointOfTheQuest')" :value="form.fields.startingPlace" class="col q-input-target text-left" @place_changed="setLocation" @input="value = $event.target.value"></gmap-autocomplete>
                </div>
                <a @click="getCurrentLocation()"><img src="statics/icons/game/location.png" /></a>
              </div>
            </div>
            <div v-if="isIOs">
              <q-input :label="$t('label.StartingPointOfTheQuest')" :disable="readOnly" type="text" v-model="form.fields.startingPlace" class="full-width" />
              <q-input :label="$t('label.ZipCode')" :disable="readOnly" type="text" v-model="form.fields.zipcode" class="full-width" />
              <q-input :label="$t('label.Town')" :disable="readOnly" type="text" v-model="form.fields.town" class="full-width" />
              <q-input :label="$t('label.Country')" :disable="readOnly" type="text" v-model="form.fields.country" class="full-width" />
              <table>
                <tr>
                  <td>
                    <q-input :label="$t('label.Latitude')" :disable="readOnly" type="number" id="latitude" v-model.number="form.fields.location.lat" class="full-width" />
                    <q-input :label="$t('label.Longitude')" :disable="readOnly" type="number" id="longitude" v-model.number="form.fields.location.lng" class="full-width" />
                  </td>
                  <td>
                    <q-btn class="q-ma-md" @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</q-btn>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div class="outline q-pa-md q-my-sm" v-if="this.quest.type === 'room'">
            <q-input
              :disable="readOnly"
              v-model="form.fields.priceForPlayer"
              :label="$t('label.PriceFrom')"
              class="full-width"
            />
            <q-input
              :disable="readOnly"
              v-model="form.fields.readMoreLink"
              :label="$t('label.ReadMoreLink')"
              class="full-width"
            />
          </div>

          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              :label="$t('label.GameAvailability')"
              header-class="bg-secondary text-white"
              expand-icon-class="text-white"
            >
              <div class="q-pa-md">
                <div>
                  <q-input
                      :disable="readOnly"
                      v-model="form.fields.limitNumberOfPlayer"
                      :label="$t('label.LimitNumberOfPlayerInOneHour')"
                      class="full-width"
                    />
                </div>
                <q-btn v-if="form.fields.scheduling && form.fields.scheduling.length === 0" class="full-width" @click="startSchedule">{{ $t('label.ScheduleGame') }}</q-btn>
                <div v-if="form.fields.scheduling && form.fields.scheduling.length > 0">
                  <div class="centered"><strong>{{ $t('label.GameSchedule') }}</strong></div>
                  <div class="centered">{{ $t('label.SchedulingDescription') }}</div>
                  <div class="row" v-for="(schedule, index) in form.fields.scheduling" :key="index">
                    <div class="col">{{ $t('days.day' + index) }}</div>
                    <div class="col">
                      <q-select
                        :readonly="readOnly"
                        :label="$t('label.From')"
                        v-model="schedule[0]"
                        :options="form.times"
                        emit-value
                        map-options
                        bottom-slots
                        options-cover
                        dense
                        />
                    </div>
                    <div class="col">
                      <q-select
                        :readonly="readOnly"
                        :label="$t('label.To')"
                        v-model="schedule[1]"
                        :options="form.times"
                        emit-value
                        map-options
                        bottom-slots
                        options-cover
                        dense
                        />
                    </div>
                  </div>
                  <q-btn flat class="full-width" @click="resetSchedule">{{ $t('label.Reset') }}</q-btn>
                </div>
                <div v-if="form.fields.customization">
                  <q-select
                    v-if="quest.type === 'quest'"
                    :readonly="readOnly"
                    :label="$t('label.UserCanReplayGame')"
                    v-model="form.fields.customization.userReplay"
                    :options="form.userReplays"
                    emit-value
                    map-options
                    bottom-slots
                    options-cover
                    >
                  </q-select>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.UserCanNotQuit')"
                    v-model="form.fields.customization.userCanNotQuit"
                    />
                </div>
              </div>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
              expand-separator
              :label="$t('label.GamePayment')"
              v-if="this.quest.isPremium && this.quest.type === 'quest'"
              header-class="bg-secondary text-white"
              expand-icon-class="text-white"
            >
              <div class="q-pa-md">
                <q-toggle
                  :readonly="readOnly"
                  :label="$t('label.PaymentOnMobile')"
                  v-model="showPaymentBox"
                  /> <q-icon name="help" @click.native="showHelpPopup('PaymentOnMobileHelp')" />
                <q-select
                  v-if="showPaymentBox"
                  :readonly="readOnly"
                  :label="$t('label.PriceForPlayer')"
                  v-model="form.fields.priceForPlayer"
                  :options="form.prices"
                  emit-value
                  map-options
                  bottom-slots
                  options-cover
                  />
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.PaymentOnYourSide')"
                    v-model="showTierPaymentBox"
                    @click.native="displayTierPaymentWarning"
                    /> <q-icon name="help" @click.native="showHelpPopup('PaymentOnYourSideHelp')" />
                </div>
                <div v-if="showTierPaymentBox">
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.tierPriceForPlayer"
                    :label="$t('label.PriceFrom')"
                    class="full-width"
                  />
                  <div>
                    {{ $t('label.qrCodeUsageDescription') }}
                    <q-radio
                      :disable="readOnly"
                      v-model="form.fields.customization.qrCodeValidity" 
                      val="onetime"
                      :label="$t('label.QRCodeValidOneTime')" />
                    <q-radio
                      :disable="readOnly"
                      v-model="form.fields.customization.qrCodeValidity" 
                      val="oneday"
                      :label="$t('label.QRCodeValidOneDay')" />
                  </div>
                </div>
                <div v-if="form.fields.customization">
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.HidePaiement')"
                    v-model="form.fields.customization.hidePaymentBox"
                    /> 
                </div>
              </div>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
              expand-separator
              :label="$t('label.UserData')"
              v-if="this.quest.isPremium && this.quest.type === 'quest'"
              header-class="bg-secondary text-white"
              expand-icon-class="text-white"
            >
              <div class="q-pa-md">
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.ForcePlayerToHaveAccount')"
                    v-model="form.fields.forcePlayerToHaveAccount"
                    /> <q-icon name="help" @click.native="showHelpPopup('ForcePlayerToHaveAccountHelp')" />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.ShareUserDataWithCreator')"
                    v-model="form.fields.shareUserDataWithCreator"
                    /> <q-icon name="help" @click.native="showHelpPopup('ShareUserDataWithCreatorHelp')" />
                </div>
              </div>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
              expand-separator
              :label="$t('label.CustomizeGameIntroduction')"
              header-class="bg-secondary text-white"
              expand-icon-class="text-white"
            >
              <div class="q-pa-md">
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
                <q-select
                  v-if="quest.type === 'quest'"
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
                <div v-if="form.fields.customization">
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.authorName"
                    :label="$t('label.CustomizeYourName')"
                    class="full-width"
                  />
                </div>
                <div v-if="form.fields.picture !== null">
                  <p>{{ $t('label.Picture') }} :</p>
                  <img class="full-width limit-size-desktop" :src="uploadUrl + '/upload/quest/' + form.fields.picture[languages.current]" />
                </div>
                <div v-if="!isIOs">
                  <q-btn class="full-width" v-if="!readOnly" @click="$refs['picturefile'].click()">{{ $t('label.ModifyThePicture') }}</q-btn>
                  <input @change="uploadImage" ref="picturefile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs">
                  {{ $t('label.ModifyThePicture') }}:
                  <input @change="uploadImage" ref="picturefile" type="file" accept="image/*" />
                </div>
                <div v-if="form.fields.thumb !== null">
                  <p>{{ $t('label.SmallPicture') }} :</p>
                  <img class="full-width limit-size-desktop" :src="uploadUrl + '/upload/quest/' + form.fields.thumb[languages.current]" />
                </div>
                <div v-if="!isIOs">
                  <q-btn class="full-width" v-if="!readOnly" @click="$refs['thumbfile'].click()">{{ $t('label.ModifyThePicture') }}</q-btn>
                  <input @change="uploadThumb" ref="thumbfile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs">
                  {{ $t('label.ModifyThePicture') }}:
                  <input @change="uploadThumb" ref="thumbfile" type="file" accept="image/*" />
                </div>
                <div v-if="!form.fields.snapshots || form.fields.snapshots.length < 3">
                  <div v-if="!isIOs">
                    <q-btn class="full-width" v-if="!readOnly" @click="$refs['snapshot'].click()">{{ $t('label.AddAGameSnapshot') }}</q-btn>
                    <input @change="uploadSnapshot" ref="snapshot" type="file" accept="image/*" hidden />
                  </div>
                  <div v-if="isIOs">
                    {{ $t('label.AddAGameSnapshot') }}:
                    <input @change="uploadSnapshot" ref="snapshot" type="file" accept="image/*" />
                  </div>
                </div>
                <div v-if="form.fields.snapshots && form.fields.snapshots.length > 0">
                  <div>{{ $t('label.Snapshots') }}:</div>
                  <div class="row">
                    <div class="col-4 centered" v-if="form.fields.snapshots.length > 0">
                      <img style="width: 100%" :src="uploadUrl + '/upload/quest/' + questId + '/snapshot/' + form.fields.snapshots[0]" />
                      <q-btn @click="removeSnapshot(0)" icon="delete"></q-btn>
                    </div>
                    <div class="col-4 centered" v-if="form.fields.snapshots.length > 1">
                      <img style="width: 100%" :src="uploadUrl + '/upload/quest/' + questId + '/snapshot/' + form.fields.snapshots[1]" />
                      <q-btn @click="removeSnapshot(1)" icon="delete"></q-btn>
                    </div>
                    <div class="col-4 centered" v-if="form.fields.snapshots.length > 2">
                      <img style="width: 100%" :src="uploadUrl + '/upload/quest/' + questId + '/snapshot/' + form.fields.snapshots[2]" />
                      <q-btn @click="removeSnapshot(2)" icon="delete"></q-btn>
                    </div>
                  </div>
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.MyGameIsIndoorRemoveWarningsOnStart')"
                    v-model="form.fields.customization.removeWarning"
                    />
                </div>
              </div>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
              expand-separator
              :label="$t('label.CustomizeGameInterface')"
              header-class="bg-secondary text-white"
              expand-icon-class="text-white"
            >
              <div class="q-pa-md">
                <div v-if="this.quest.isPremium && form.fields.customization && form.fields.customization.audio && form.fields.customization.audio[languages.current] && form.fields.customization.audio[languages.current] !== ''">
                  <div>{{ $t('label.YourAudioFile') }} : {{ form.fields.customization.audio[languages.current] }}</div>
                  <div class="centered"><a class="dark" @click="removeAudio">{{$t('label.Remove')}}</a></div>
                </div>
                <div v-if="this.quest.isPremium && !isIOs && !readOnly">
                  <q-btn-group class="full-width">
                    <q-btn class="full-width" @click="$refs['audiofile'].click()">{{ $t('label.AddAnAudioFile') }}</q-btn>
                  </q-btn-group>
                  <input @change="uploadAudio" ref="audiofile" type="file" accept="audio/mp3" hidden />
                </div>
                <div v-if="this.quest.isPremium && isIOs && !readOnly">
                  {{ $t('label.AddAnAudioFile') }}:
                  <input @change="uploadAudio" ref="audiofile" type="file" accept="audio/mp3" />
                </div>
                <div v-if="form.fields.customization">
                  <q-select
                    v-if="quest.type === 'quest'"
                    :readonly="readOnly"
                    :label="$t('label.FontFamily')"
                    v-model="form.fields.customization.font"
                    :options="form.fonts"
                    emit-value
                    map-options
                    bottom-slots
                    options-cover
                    >
                    <!-- template v-slot:option="{ itemProps, itemEvents, opt, selected }" -->
                    <template v-slot:option="{ itemProps, itemEvents, opt }">
                      <q-item v-bind="itemProps" v-on="itemEvents">
                        <q-item-section>
                          <q-item-label v-html="opt.label" :class="'font-' + opt.value" ></q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div v-if="form.fields.customization">
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.fontColor"
                    :label="$t('label.TextColor')"
                    placeholder="#000000"
                    class="full-width"
                  />
                </div>
                <div v-if="form.fields.customization">
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.color"
                    :label="$t('label.ButtonsColor')"
                    placeholder="#ffaa00"
                    class="full-width"
                  />
                </div>
                <div v-if="this.quest.isPremium && this.quest.type === 'quest'">
                  <div v-if="form.fields.customization && form.fields.customization.logo && form.fields.customization.logo !== ''">
                    <p>{{ $t('label.YourLogo') }} :</p>
                    <img class="limit-size-desktop" :src="uploadUrl + '/upload/quest/' + form.fields.customization.logo" />
                    <div class="centered"><a class="dark" @click="removeLogo">{{$t('label.Remove')}}</a></div>
                  </div>
                  <div v-if="!isIOs && !readOnly">
                    <q-btn-group class="full-width">
                      <q-btn class="full-width" @click="$refs['logofile'].click()">{{ $t('label.AddALogo') }}</q-btn>
                      <q-btn @click="showHelpPopup('helpQuestLogo')" icon="help" />
                    </q-btn-group>
                    <input @change="uploadLogo" ref="logofile" type="file" accept="image/*" hidden />
                  </div>
                  <div v-if="isIOs && !readOnly">
                    {{ $t('label.AddALogo') }}:
                    <input @change="uploadLogo" ref="logofile" type="file" accept="image/*" />
                    <q-icon name="help" @click.native="showHelpPopup('helpQuestLogo')" />
                  </div>
                </div>
                <div v-if="form.fields.customization && form.fields.customization.character && form.fields.customization.character !== ''">
                  <p>{{ $t('label.YourCharacter') }} :</p>
                  <img class="full-width limit-size-desktop" style="max-width: 400px" :src="uploadUrl + '/upload/quest/' + form.fields.customization.character" />
                  <div class="centered"><a class="dark" @click="removeCharacter">{{ $t('label.Remove') }}</a></div>
                </div>
                <div v-if="!isIOs && !readOnly">
                  <q-btn-group class="full-width">
                    <q-btn class="full-width" @click="$refs['characterfile'].click()">{{ $t('label.AddACustomCharacter') }}</q-btn>
                    <q-btn @click="showHelpPopup('helpQuestCharacter')" icon="help" />
                  </q-btn-group>
                  <input @change="uploadCharacter" ref="characterfile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs && !readOnly">
                  {{ $t('label.AddACustomCharacter') }}:
                  <input @change="uploadCharacter" ref="characterfile" type="file" accept="image/*" />
                  <q-icon name="help" @click.native="showHelpPopup('helpQuestCharacter')" />
                </div>
                <div v-if="form.fields.customization && form.fields.customization.characterOnMap && form.fields.customization.characterOnMap !== ''">
                  <p>{{ $t('label.YourCharacterOnMap') }} :</p>
                  <img class="full-width limit-size-desktop" style="max-width: 200px" :src="uploadUrl + '/upload/quest/' + form.fields.customization.characterOnMap" />
                  <div class="centered"><a class="dark" @click="removeCharacterOnMap">{{ $t('label.Remove') }}</a></div>
                </div>
                <div v-if="!isIOs && !readOnly">
                  <q-btn-group class="full-width">
                    <q-btn class="full-width" @click="$refs['characterOnMapfile'].click()">{{ $t('label.AddACustomCharacterOnMap') }}</q-btn>
                    <q-btn @click="showHelpPopup('helpQuestCharacterOnMap')" icon="help" />
                  </q-btn-group>
                  <input @change="uploadCharacterOnMap" ref="characterOnMapfile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs && !readOnly">
                  {{ $t('label.AddACustomCharacterOnMap') }}:
                  <input @change="uploadCharacterOnMap" ref="characterOnMapfile" type="file" accept="image/*" />
                  <q-icon name="help" @click.native="showHelpPopup('helpQuestCharacterOnMap')" />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.HideInventory')"
                    v-model="form.fields.customization.hideInventory"
                    />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.DoNotUserGeolocation')"
                    v-model="form.fields.customization.disableGeolocation"
                    />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.HideObjectCombination')"
                    v-model="form.fields.customization.hideObjectCombination"
                    />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.DoNotPreventUserForHint')"
                    v-model="form.fields.customization.doNotPreventUserForHint"
                    />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.HideFullScreen')"
                    v-model="form.fields.customization.hideFullScreen"
                    />
                </div>
                <div v-if="this.quest.type === 'quest' && form.fields.editorMode === 'advanced'">
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.qrCodeMessage[languages.current]"
                    type="textarea"
                    :label="$t('label.QRCodeMessage') + ' ' + currentLanguageForLabels"
                    :max-height="100"
                    :min-rows="4"
                    class="full-width"
                  />
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.geolocationMessage[languages.current]"
                    type="textarea"
                    :label="$t('label.GeolocationMessage') + ' ' + currentLanguageForLabels"
                    :max-height="100"
                    :min-rows="4"
                    class="full-width"
                  />
                </div>
              </div>
            </q-expansion-item>
            <q-separator />
            <q-expansion-item
              expand-separator
              :label="$t('label.CustomizeEndOfGame')"
              v-if="this.quest.isPremium && this.quest.type === 'quest'"
              header-class="bg-secondary text-white"
              expand-icon-class="text-white"
            >
              <div class="q-pa-md">
                <div v-if="form.fields.rewardPicture && form.fields.rewardPicture !== '' && !form.fields.customization.removeScoring">
                  <p>{{ $t('label.Reward') }} :</p>
                  <img class="full-width limit-size-desktop" :src="uploadUrl + '/upload/quest/' + form.fields.rewardPicture" style="background-color: #f00" />
                  <div>{{ $t('label.RewardPictureWarning')}}</div>
                  <div class="centered"><a class="dark" @click="removeReward">{{ $t('label.Remove') }}</a></div>
                </div>
                <div v-if="isIOs && !readOnly && !form.fields.customization.removeScoring" class="q-mt-md">
                  {{ $t('label.AddAReward') }}:
                  <input @change="uploadReward" ref="rewardfile" type="file" accept="image/*" />
                  <q-icon name="help" @click.native="showHelpPopup('helpQuestReward')" />
                </div>
                <div v-if="!isIOs && !readOnly && !form.fields.customization.removeScoring" class="q-mt-md">
                  <q-btn-group class="full-width">
                    <q-btn class="full-width" @click="$refs['rewardfile'].click()">{{ $t('label.AddAReward') }}</q-btn>
                    <q-btn @click.native="showHelpPopup('helpQuestReward')" icon="help" />
                  </q-btn-group>
                  <input @change="uploadReward" ref="rewardfile" type="file" accept="image/*" hidden />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.RemoveScoringAndRating')"
                    v-model="form.fields.customization.removeScoring"
                    />
                </div>
                <div v-if="form.fields.customization.removeScoring">
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.endMessage[languages.current]"
                    :label="$t('label.TypeEndMessage') + ' ' + currentLanguageForLabels"
                    class="full-width"
                    type="textarea"
                  />
                  <q-input
                    :disable="readOnly"
                    v-model="form.fields.customization.endMessageForPerfectScore[languages.current]"
                    :label="$t('label.TypeEndMessageForPerfectScore') + ' ' + currentLanguageForLabels"
                    class="full-width"
                    type="textarea"
                  />
                </div>
                <div>
                  <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.HideUserProgressionOnEnd')"
                    v-model="form.fields.customization.hideUserProgressionOnEnd"
                    />
                    <q-toggle
                    :readonly="readOnly"
                    :label="$t('label.HideAuthorOnEnd')"
                    v-model="form.fields.customization.hideAuthorOnEnd"
                    />
                </div>
              </div>
            </q-expansion-item>
          </q-list>
          <div>
            {{ $t('label.Version') }}: {{ quest.version }}
          </div>

          <!--<div v-if="!this.quest.isPremium">
            <q-btn-group class="full-width q-mt-lg">
              <q-btn color="secondary" @click="openPremiumBox()" :label="$t('label.MovePremium')" />
              <q-btn color="secondary" @click="openPremiumBox()" icon="help" split />
            </q-btn-group>
          </div>-->
          <div class="centered">
            <q-btn
              v-if="!readOnly"
              @click="submitSettings"
              color="primary"
              class="glossy large-button q-mt-lg"
              test-id="btn-save-settings">{{ $t('label.Save') }}</q-btn>
          </div>
        </form>

        <p class="centered q-pa-md" v-if="quest.status !== 'published'">
          <q-btn flat color="negative" size="md" icon="delete" @click="removeQuest()" :label="$t('label.RemoveThisQuest')" />
        </p>
      </div>

      <!------------------ STEPS TAB ------------------------>
        
      <div v-if="tabs.selected === 'steps'" class="q-pa-md arial scroll-on-desktop-80" :class="{'desktop-only': chapters.showNewStepOverview}">
        <div class="centered bg-warning q-pa-sm" v-if="warnings.stepsMissing" @click="refreshStepsList">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
        <div v-if="quest.size.limit < quest.size.current" class="text-primary q-pa-md">
          {{ $t('label.OverQuotaMessage') }}
          <q-btn color="primary" class="glossy large-btn" @click="showMedia()">{{ $t('label.RemoveFiles') }}</q-btn>
        </div>

        <div v-if="form.fields.editorMode === 'simple' && chapters.items && chapters.items.length > 0">
          <p v-if="!readOnly && (!chapters.items || chapters.items.length < 1 || !chapters.items[0].steps || chapters.items[0].steps.length < 1)">{{ $t('label.AddYourSteps') }}</p>
          <ul class="list-group" v-sortable="{ onUpdate: onStepListUpdate, handle: '.handle' }">
            <li class="list-group-item step-hover" v-for="step in chapters.items[0].steps" :key="step._id">
              <q-icon v-if="!readOnly" class="handle" name="reorder" />
              <div style="line-height: 3rem; padding: 4px">
                <q-icon color="grey" class="q-mr-sm" :name="getIconFromStepType(step.type)" />
                <span style="margin-top: 4px" @click="playStep(step)">{{ step.title[languages.current] || step.title[quest.mainLanguage] }}</span>
                <q-btn v-if="!readOnly" class="float-right" @click="removeStep(step.stepId)"><q-icon name="delete" /></q-btn>
                <q-btn v-if="!readOnly" class="float-right" @click="modifyStep(step)"><q-icon name="mode_edit" /></q-btn>
              </div>
            </li>
          </ul>
          <p v-if="!readOnly" class="centered q-mt-md">
            <q-btn color="primary" class="glossy large-button" @click="addStep()" test-id="btn-add-step">{{ $t('label.AddAStep') }}</q-btn>
          </p>
          <p class="centered q-pa-md" v-if="!readOnly && chapters.items && chapters.items[0] && chapters.items[0].steps && chapters.items[0].steps.length > 1">
            <q-btn color="primary" class="glossy large-button" icon="play_arrow" @click="testQuest()">{{ $t('label.TestYourQuest') }}</q-btn>
          </p>
          <div class="smaller" v-if="quest && quest.size && quest.size.limit && quest.size.current">
            <div @click="showMedia()">{{ storage }}</div>
            <q-linear-progress rounded style="height: 15px" :value="getPercentStorageUsage()" color="secondary" class="q-mt-sm" />
          </div>
        </div>

        <div v-if="form.fields.editorMode === 'advanced'">
          <p v-if="!readOnly && (!chapters.items || chapters.items.length < 2)">{{ $t('label.AddYourChapters') }}</p>
          <!--<p class="centered" v-show="chapters.items && chapters.items.length > 6">
            <q-btn color="primary" icon="fas fa-plus-circle" @click="addStep()" :label="$t('label.AddAStep')" />
          </p>-->
          <!-- using https://github.com/timruffles/ios-html5-drag-drop-shim to allow drag & drop on mobile -->
          <ul class="list-group" v-sortable="{ onUpdate: onChapterListUpdate, handle: '.handle' }">
            <li class="step-list list-group-item align-top" v-for="(chapter, index) in chapters.items" :key="chapter._id">
              <q-icon v-if="!readOnly" class="handle" style="font-size: 1.3rem;" name="reorder" />
              <div>
                <p class="bigger" style="margin-bottom: 8px;">
                  {{ chapter.title[languages.current] || chapter.title[quest.mainLanguage] }}
                  <q-icon v-if="!readOnly" name="add_box" class="float-right q-mt-sm q-ml-md size-1" @click.native="addStep(chapter.chapterId)" />
                  <q-icon v-if="!readOnly" name="delete" class="float-right q-mt-sm q-ml-md a-bit-bigger" @click.native="removeChapter(chapter.chapterId)" />
                  <q-icon v-if="!readOnly && index > 0" name="schedule" :color="(chapter.countDownTime && chapter.countDownTime != 0) ? 'secondary' : 'black'" class="float-right q-mt-sm q-ml-md a-bit-bigger" @click.native="modifyChapterTimer(chapter.chapterId)" />
                  <q-icon v-if="!readOnly" name="mode_edit" class="float-right q-mt-sm q-ml-md a-bit-bigger" @click.native="modifyChapter(chapter.chapterId)" />
                  <q-icon name="warning" color="primary" class="float-right q-mt-sm a-bit-bigger" v-if="chapter.warnings && chapter.warnings.length > 0" @click.native="showChapterWarnings(chapter.warnings)" />
                </p>
                <div v-if="!chapter.steps || chapter.steps.length === 0">
                  {{ $t('label.ClickOnButtonToAddStep') }}
                </div>
                <div v-for="step in chapter.steps" :key="step._id" style="height: 34px; overflow: hidden;display: flex;width: 100%;" class="step-hover">
                  <div class="step-text">
                    <q-icon color="grey" class="q-mr-sm" :class="{'q-ml-md': (step.level === 2)}" :name="getIconFromStepType(step.type)">
                    </q-icon>
                    <span v-if="!readOnly && !step.error" @click="playStep(step)"><q-badge v-if="step.player !== 'All'" color="primary" align="top">{{ step.player }}</q-badge> {{ step.title[languages.current] || step.title[quest.mainLanguage] }}</span>
                    <span v-if="!readOnly && step.error" @click="showStepWarnings(step.error)" class="text-primary">
                      <q-icon name="warning" color="primary" />
                      {{ step.title[languages.current] || step.title[quest.mainLanguage] }}
                    </span>
                    <span v-if="readOnly">{{ step.title[languages.current] || step.title[quest.mainLanguage] }}</span>
                  </div>
                  <div class="step-button">
                    <q-btn-dropdown v-if="!readOnly" icon="mode_edit" split dense @click="modifyStep(step)">
                      <q-list>
                        <q-item clickable v-close-popup @click="insertStep(chapter.chapterId, step.stepId)">
                          <q-item-section avatar>
                            <q-avatar icon="subdirectory_arrow_left" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('label.InsertAStepAfter') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="duplicateStep(step.stepId)">
                          <q-item-section avatar>
                            <q-avatar icon="content_copy" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('label.Duplicate') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="removeStep(step.stepId)">
                          <q-item-section avatar>
                            <q-avatar icon="delete" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t('label.Remove') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <p v-if="!readOnly" class="centered">
            <q-btn color="primary" class="glossy large-button" @click="addChapter()">{{ $t('label.AddASChapter') }}</q-btn>
          </p>
          <p class="centered q-pa-md" v-if="!readOnly && chapters.items && chapters.items.length > 1">
            <q-btn color="primary" class="glossy large-button" icon="play_arrow" @click="testQuest()">{{ $t('label.TestYourQuest') }}</q-btn>
          </p>
          <div class="smaller" v-if="quest && quest.size && quest.size.limit && quest.size.current">
            <div @click="showMedia()">{{ storage }}</div>
            <q-linear-progress rounded style="height: 15px" :value="getPercentStorageUsage()" color="secondary" class="q-mt-sm" />
          </div>
        </div>

      </div>

      <!------------------ PUBLISHING TAB ------------------------>

      <div v-if="tabs.selected === 'publish'" class="q-pa-md arial" :class="{'desktop-only': chapters.showNewStepOverview}">
        <div v-if="quest.status === 'old'">
          <q-banner class="q-mb-md bg-warning">
            {{ $t('label.YourQuestIsClosedAndCanNotBePublishedAnymore') }}
          </q-banner>
          <q-item v-if="quest.type !== 'room'">
            <q-item-section side top>
              <q-icon name="file_copy" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.DuplicateThisQuest') }}</q-item-label>
              <q-btn color="primary" class="glossy large-button q-ma-sm" @click="duplicateQuest()">{{ $t('label.DuplicateThisQuest') }}</q-btn>
            </q-item-section>
          </q-item>
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
          <p class="centered q-pa-md" v-if="quest.type === 'quest'">
            <q-btn color="primary" class="glossy large-button" icon="play_arrow" @click="testQuest()">{{ $t('label.TestYourQuest') }}</q-btn>
          </p>
          <p class="centered q-pa-md" v-if="quest.type === 'room'">
            <q-btn color="primary" class="glossy large-button" icon="play_arrow" @click="testQuest()">{{ $t('label.SeeYourQuestPage') }}</q-btn>
          </p>

          <!--<q-item v-if="quest.access === 'private'">
            <q-item-section side top>
              <q-icon name="people" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.Invitees') }} <span v-if="quest.limitations && quest.limitations.nbInvitees">({{ invitee.items.length }}/{{ quest.limitations.nbInvitees }})</span></q-item-label>
              <q-item-label v-if="quest.version < 2">{{ $t('label.WarningInvitees')}}</q-item-label>
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
          </q-item>-->

          <div v-if="quest.status !== 'tovalidate'">
            <q-item>
              <q-item-section side top>
                <q-icon name="visibility" class="left-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="big-label">{{ $t('label.' + (quest.type === 'quest' ? (quest.access === 'public' ? 'LanguagesPublished' : 'LanguagesPublishedForPrivate') : 'PageLanguagesPublished')) }}</q-item-label>
              </q-item-section>
            </q-item>
            <div class="centered" v-show="!selectLanguageForPublishing">
              <q-btn color="primary" class="glossy large-button q-ma-sm" @click="publish()">{{ $t('label.' + (form.fields.languages.length <= 1 ? 'AskToPublish' : 'PublishInAllLanguages')) }}</q-btn>
              <div v-if="form.fields.languages.length > 1" class="centered"><a class="cursor-pointer text-primary" @click="selectLanguageForPublishing = !selectLanguageForPublishing">{{ $t('label.SelectLanguageForPublishing') }}</a></div>
            </div>
            <div v-show="selectLanguageForPublishing" class="q-px-lg">
              <p v-for="lang in form.fields.languages" :key="lang.lang">
                <q-toggle :disable="quest.status === 'tovalidate'" v-model="lang.published" :label="$t('language.' + lang.lang)" @input="publish(lang.lang)" />
              </p>
              <q-item-label caption v-if="quest.access === 'public' && quest.type === 'quest'">{{ $t('label.ActivateTheLanguageVisible') }}</q-item-label>
              <q-item-label caption v-if="quest.access === 'private'">{{ $t('label.ActivateTheLanguageVisiblePrivate') }}</q-item-label>
            </div>
          </div>

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
                :error-message="$t('label.EditorIsNotAGraalyUser')"
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
              <q-icon name="select_all" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.MarkersFile') }}</q-item-label>
              <div v-if="quest.type === 'quest'" class="q-pt-md">
                <div v-html="$t('label.MarkersToStartQuest')" />
                <img :src="uploadUrl + '/upload/quest/' + questId + '_qrcode.png'" />
              </div>
              <div v-if="quest.type === 'room'" class="q-pt-md" v-html="$t('label.SaveQuestResultsMarker', {url1: uploadUrl + '/upload/quest/' + questId + '_score1_qrcode.png', url2: uploadUrl + '/upload/quest/' + questId + '_score2_qrcode.png', url3: uploadUrl + '/upload/quest/' + questId + '_score3_qrcode.png'})" />
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section side top>
              <q-icon name="file_download" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.Downloads') }}</q-item-label>
              <div v-if="quest.type === 'quest'">
                <!-- QR Codes for webapp mode -->
                <div v-if="!isHybrid"><q-btn color="primary" flat type="a" href="statics/markers/all.pdf" download>{{ $t('label.MarkersToPrint') }}</q-btn></div>
                <!-- QR Codes for hybrid mode -->
                <div v-if="isHybrid"><q-btn color="primary" flat @click="downloadMarkers()">{{ $t('label.MarkersToPrint') }}</q-btn></div>
                <!-- Texts for translation webapp mode -->
                <div v-if="!isHybrid"><q-btn color="primary" flat @click="downloadTexts()">{{ $t('label.ExportTexts') }}</q-btn></div>
              </div>

            </q-item-section>
          </q-item>

          <q-item v-if="quest.type !== 'room'">
            <q-item-section side top>
              <q-icon name="file_copy" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.DuplicateThisQuest') }}</q-item-label>
              <q-btn color="primary" class="glossy large-button q-ma-sm" @click="duplicateQuest()">{{ $t('label.DuplicateThisQuest') }}</q-btn>
            </q-item-section>
          </q-item>

          <q-item v-if="quest.status !== 'published'">
            <q-item-section side top>
              <q-icon name="delete" class="left-icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="big-label">{{ $t('label.RemoveThisQuest') }}</q-item-label>
              <q-btn color="negative" class="glossy large-button q-ma-sm" @click="removeQuest()">{{ $t('label.RemoveThisQuest') }}</q-btn>
              {{ $t('label.ThisActionCanNotBeCanceled') }}
            </q-item-section>
          </q-item>
          <q-item v-if="quest.status === 'published'">
            <q-item-section side top>
              <q-icon name="delete" class="left-icon" />
            </q-item-section>
            <q-item-section>
              {{ $t('label.YouNeedToUnpublishYourQuestToRemoveIt') }}
            </q-item-section>
          </q-item>

        </div>

      </div>

      <!------------------ PAYMENTS TAB ------------------------>

      <div v-if="tabs.selected === 'payments' && isEdition" class="q-pa-md arial" :class="{'desktop-only': chapters.showNewStepOverview}">
        <div v-if="this.paymentIsLoading">
          {{ $t('label.creationOfQRCodes') }} ...
        </div>
        <div v-if="!this.paymentIsLoading">
          <q-list class="shadow-2 rounded-borders">
            <q-item v-for="payment in payments" :key="payment._id">
              <q-item-section avatar>
                <q-avatar rounded>
                  <img :src="uploadUrl + '/upload/tiers/' + payment.qrCode + '.png'">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label lines="1">{{ payment.qrCode.replace('tierplay_', '') }}</q-item-label>
                <q-item-label caption>{{ $t('status.' + payment.status) }} - {{payment.dateUpdate | formatDate($store.state.user.language)}}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn-dropdown icon="cloud_upload" split dense @click="downloadQRCode(payment.qrCode)">
                  <q-list>
                    <q-item v-if="payment.status === 'new'" clickable v-close-popup @click="removeCode(payment._id)">
                      <q-item-section avatar>
                        <q-avatar icon="delete" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('label.Remove') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="payment.status === 'new'">
                      <q-item-section avatar>
                        URL :
                      </q-item-section>
                      <q-item-section>
                        <q-item-label><input :value="'https://app.graaly.com/webapp/#/quest/play/' + questId + '/' + payment.qrCode" /></q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-item-section>
            </q-item>
          </q-list>
          <div class="centered">
            <q-btn class="glossy large-button" color="primary" @click="createNewPaymentQRCode"><span>{{ $t('label.CreateNewQRCodeForPlay') }}</span></q-btn>
            <q-btn class="button" flat color="primary" @click="createMultipleNewPaymentQRCode(10)"><span>{{ $t('label.Create10NewQRCodeForPlay') }}</span></q-btn>
            <q-btn class="button" flat color="primary" @click="createMultipleNewPaymentQRCode(50)"><span>{{ $t('label.Create50NewQRCodeForPlay') }}</span></q-btn>
            <q-btn class="glossy large-button" flat color="primary" @click="printQRCode"><span>{{ $t('label.PrintQRCodePages') }}</span></q-btn>
          </div>
        </div>
      </div>

      <!------------------ REVIEWS TAB ------------------------>

      <div v-if="tabs.selected === 'reviews' && isEdition" class="q-pa-md arial" :class="{'desktop-only': chapters.showNewStepOverview}">
        <q-item>
          <q-item-section side top>
            <q-icon name="timeline" class="left-icon" />
          </q-item-section>
          <q-item-section v-if="statistics && statistics.statistics">
            <q-item-label class="big-label">{{ $t('label.Statistics') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-card bordered class="my-card q-mb-md" v-if="statistics && statistics.statistics && statistics.statistics.sellings">
          <q-card-section>
            <div class="subtitle3">{{ $t('label.TotalSellings') }}</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="title1 text-primary centered">{{ parseInt(statistics.statistics.sellings * 85) / 100 }} €</div>
            <!--<div class="centered">{{ $t('label.YourRevenues') }}{{ $t('label.colons') }}{{ parseInt(statistics.statistics.sellings * 40) / 100 }}€ TTC</div>
            <div class="centered">{{ $t('label.RevenuesPayedFloor') }}</div>-->
          </q-card-section>
        </q-card>
        <q-card bordered class="my-card q-mb-md">
          <q-card-section>
            <div class="subtitle3">{{ $t('label.TotalNumberOfPlayers') }}</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="title1 text-primary centered">
              {{ statistics.statistics.nbPlayers + statistics.statistics.notFinished }}<span class="smaller" :class="{'text-red': (quest.limitations && quest.limitations.nbPlays && quest.limitations.nbPlays <= (statistics.statistics.nbPlayers + statistics.statistics.notFinished)), 'text-grey': (quest.limitations && quest.limitations.nbPlays && quest.limitations.nbPlays > (statistics.statistics.nbPlayers + statistics.statistics.notFinished))}" v-if="quest.limitations && quest.limitations.nbPlays && quest.limitations.nbPlays > 0">/{{ quest.limitations.nbPlays }}</span>
            </div>
            <div class="centered">{{ $t('label.NumberOfPlayersYesterday') }}{{ $t('label.colons') }}{{ statistics.statistics.dailyNbPlayers }} </div>
          </q-card-section>
        </q-card>
        <q-card bordered class="my-card q-mb-md">
          <q-card-section>
            <div class="subtitle3">{{ $t('label.NumberOfOngoingPlay') }}</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="title1 text-primary centered">
              {{ statistics.statistics.onGoing }}
            </div>
          </q-card-section>
        </q-card>
        <q-card bordered class="my-card q-mb-md">
          <q-card-section>
            <div class="subtitle3">{{ $t('label.AverageScore') }}</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="title1 text-primary centered">{{ Math.ceil(statistics.statistics.averageScore) }}</div>
            <div class="centered">{{ $t('label.MaxScore') }}{{ $t('label.colons') }}{{ quest.availablePoints.score }} </div>
          </q-card-section>
        </q-card>
        <q-card bordered class="my-card q-mb-md">
          <q-card-section>
            <div class="subtitle3">{{ $t('label.AverageDuration') }}</div>
          </q-card-section>
          <q-separator inset />
          <q-card-section>
            <div class="title1 text-primary centered">{{ Math.ceil(statistics.statistics.averageDuration) }}</div>
          </q-card-section>
        </q-card>
        <q-expansion-item
          v-if="statistics && statistics.statistics && statistics.statistics.ageRepartition && statistics.statistics.ageRepartition.length > 0"
          dense
          dense-toggle
          expand-separator
          :label="$t('label.NumberOfPlayersByAge')"
        >
          <q-list class="shadow-2 rounded-borders">
            <q-item v-for="statistic in statistics.statistics.ageRepartition" :key="statistic._id">
              <q-item-section v-if="statistic && !statistic._id">{{ $t('label.null') }}{{ $t('label.colons') }}{{ statistic.nb }}</q-item-section>
              <q-item-section v-if="statistic && statistic._id">{{ $t('label.Age' + (statistic._id.replace('-', '').replace('+', ''))) }}{{ $t('label.colons') }}{{ statistic.nb }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-expansion-item
          v-if="statistics && statistics.statistics && statistics.statistics.sexRepartition && statistics.statistics.sexRepartition.length > 0"
          dense
          dense-toggle
          expand-separator
          :label="$t('label.NumberOfPlayersBySex')"
        >
          <q-list class="shadow-2 rounded-borders">
            <q-item v-for="statistic in statistics.statistics.sexRepartition" :key="statistic._id">
              <q-item-section>{{ $t('label.' + statistic._id) }}{{ $t('label.colons') }}{{ statistic.nb }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item v-if="reviews.length > 0">
          <q-item-section side top>
            <q-icon name="chat_bubble_outline" class="left-icon" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label class="big-label">{{ $t('label.Reviews') }}</q-item-label>
            <!--<q-infinite-scroll :handler="getReviews">-->
              <q-list highlight>
                <q-item v-for="review in reviews" :key="review._id">

                  <q-item-section avatar>
                    <q-avatar v-if="review.userId && review.userId.picture">
                      <img :src="getAvatar(review.userId.picture)" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label v-if="review.userId">
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

      </div>

    <!------------------ RESULTS TAB ------------------------>

      <div v-if="tabs.selected === 'results' && isEdition && quest.access === 'private'" class="q-pa-md arial" :class="{'desktop-only': chapters.showNewStepOverview}">
        <div v-if="quest.status === 'published'">
          <div v-if="ranking && ranking.items && ranking.items.length > 0">
            <q-list>
              <q-item v-for="(rank, index) in ranking.items" :key="index" >
                <q-item-section top avatar>
                  <q-avatar>
                    <img v-if="rank.userData.picture && rank.userData.picture !== '' && rank.userData.picture.indexOf('http') !== -1" :src="rank.userData.picture" />
                    <img v-if="rank.userData.picture && rank.userData.picture !== '' && rank.userData.picture.indexOf('http') === -1" :src="uploadUrl + '/upload/profile/' + rank.userData.picture" />
                    <img v-if="!rank.userData.picture || rank.userData.picture === ''" src="statics/profiles/noprofile.png" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ rank.userData.name }}</q-item-label>
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
            <q-btn color="primary" class="glossy large-button" @click="closePrivateQuest">{{ $t('label.ClosePrivateQuest') }}</q-btn>
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
                  <q-avatar color="primary" text-color="white">
                    {{ index + 1 }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ rank.userData.name }}</q-item-label>
                  <q-item-label caption>{{ rank.score}} {{ $t('label.points') }}<!--<q-icon name="fas fa-trophy" />--></q-item-label>
                </q-item-section>
                <q-item-section side top avatar>
                  <q-avatar>
                    <img v-if="rank.userData.picture && rank.userData.picture !== '' && rank.userData.picture.indexOf('http') !== -1" :src="rank.userData.picture" />
                    <img v-if="rank.userData.picture && rank.userData.picture !== '' && rank.userData.picture.indexOf('http') === -1" :src="uploadUrl + '/upload/profile/' + rank.userData.picture" />
                    <img v-if="!rank.userData.picture || rank.userData.picture === ''" src="statics/profiles/noprofile.png" />
                  </q-avatar>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="centered" v-if="ranking && ranking.items && ranking.items.length === 0">
            {{ $t('label.NoPlayerForThisQuest') }}
          </div>
        </div>

      </div>

      <!------------------ MEDIA LIST AREA ------------------------>

      <transition name="slideInBottom">
        <div class="bg-white hint panel-bottom q-pa-md" v-show="media.isOpened">
          <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.QuestMedia') }}</div>
          <q-list v-for="(item, index) in media.items" :key="item.id">
            <q-item clickable v-ripple>
              <q-item-section thumbnail @click="zoomMedia(index)">
                <img :src="uploadUrl + '/upload/quest/' + questId + item.type + item.file">
              </q-item-section>
              <q-item-section>{{ item.size }} Ko</q-item-section>
              <q-item-section side><q-btn icon="delete" @click="removeMedia(item._id)"></q-btn></q-item-section>
            </q-item>
          </q-list>
          <div v-if="media.items.length === 0">
            {{ $t('label.YouDoNotUseAnyMediaYetInYourQuest') }}
          </div>
          <q-btn class="q-mb-xl glossy large-button" color="primary" @click="hideMedia()">{{ $t('label.Close') }}</q-btn>
        </div>
      </transition>
      <q-dialog v-model="media.detail.isOpened">
        <img v-if="media.items.length > 0" style="width: 100%" :src="uploadUrl + '/upload/quest/' + questId + media.items[media.detail.index].type + media.items[media.detail.index].file">
        <q-btn class="q-mb-xl glossy large-button" color="primary" @click="unzoomMedia()">{{ $t('label.Close') }}</q-btn>
      </q-dialog>

      <!------------------ PREMIUM POPIN ------------------------>

      <q-dialog v-model="premium.isOpened">
        <div class="q-pa-md">
          <img src="statics/icons/game/premium-header.png" style="width: 100%" />
          <div class="text-h6 text-primary">{{ $t('label.PremiumDefinition1') }}</div>
          <div v-html="$t('label.PremiumDefinition2')" />
          <div v-if="!premium.canMovePremium" class="centered">
            <p>{{ $t('label.PremiumDefinition3') }}</p>
            <q-btn class="q-mb-xl glossy large-button" color="primary" @click="premium.isOpened = false">{{ $t('label.Close') }}</q-btn>
          </div>
          <div v-if="premium.canMovePremium" class="centered">
            <q-btn class="q-mb-sm glossy large-button" color="primary" @click="movePremium()">{{ $t('label.MovePremium') }}</q-btn>
            <q-btn class="q-mb-xl glossy large-button" flat color="primary"  @click="premium.isOpened = false">{{ $t('label.Cancel') }}</q-btn>
          </div>
        </div>
      </q-dialog>

      <!--====================== STORY =================================-->

      <div class="over-map mobile-fit" :class="'font-' + form.fields.customization.font" v-if="story.step !== null && story.step !== 'end'">
        <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
      </div>
    </div>

    <!--<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">-->
    <div class="col-auto">
      <div v-if="!chapters.showNewStepPageSettings && !chapters.showNewStepOverview && !chapters.showNewStepPage" class="desktop-only background-dark arial full-page-div full-height">
        <div class="q-pa-xl" v-html="$t('label.CreationStudioHelp')">
        </div>
      </div>
      <div v-if="chapters.showNewStepPage" class="bg-white arial full-page-div">
      <!--<q-dialog persistent v-model="chapters.showNewStepPage" maximized>-->
        <div class="scroll">

          <!------------------ STEP TYPE SELECTION ------------------------>

          <a class="float-right no-underline close-btn" color="grey" @click="closeStepTypePage"><q-icon name="close" class="medium-icon" /></a>
          <div class="text-h4 q-pa-md">{{ $t('label.ChooseTheStepType') }}</div>

          <div>
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
                  <q-btn color="primary" class="glossy large-button" @click.native="selectStepType(stepType)" :test-id="'btn-select-step-type-' + stepType.code">{{ $t('label.UseThisGame') }}</q-btn>
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
                  <q-btn color="primary" class="glossy large-button" @click.native="selectStepType(stepType)" :test-id="'btn-select-step-type-' + stepType.code">{{ $t('label.UseThisGame') }}</q-btn>
                </div>
              </q-expansion-item>
            </q-list>

            <div class="q-pa-md centered">
              <q-btn color="primary" class="glossy normal-button" @click="closeStepTypePage()">{{ $t('label.Close') }}</q-btn>
            </div>
          </div>
        </div>

      </div>
      <div v-if="chapters.showNewStepPageSettings" class="bg-white arial full-page-div scroll-on-desktop-100">
      <!--Removed by EMA, too much issues with scroll <q-dialog maximized persistent v-model="chapters.showNewStepPageSettings" class="bg-white arial">-->

        <!------------------ STEP SETTINGS SELECTION ------------------------>

        <stepSettings :quest="quest" :stepId="stepId" :lang="languages.current" :options="{type: chapters.newStep.type, chapterId: chapters.newStep.chapterId, previousStepId: chapters.newStep.previousStepId, mode: form.fields.editorMode}" @change="trackStepChanges" @close="closeStepSettingsPage" @openPremiumBox="openPremiumBox"></stepSettings>

      <!--</q-dialog>-->
      </div>

      <div v-if="chapters.showNewStepOverview" style="background: none; background-color: transparent;" class="fullscreen-mobile">

        <!------------------ STEP SIMULATION ------------------------>

        <stepPlay
          :step="chapters.newStep.overviewData"
          runId="0"
          :customization="quest.customization ? quest.customization : {color: 'primary'}"
          :inventory="inventory"
          :itemUsed="selectedItem"
          :reload="chapters.reloadStepPlay"
          :lang="languages.current"
          :quest="quest"
          :offline="false"
          @played="trackStepPlayed"
          @success="trackStepSuccess"
          @fail="trackStepFail"
          @pass="trackStepPass"
          @msg="trackMessage"
          @closeAllPanels="closeAllPanels"
          @forceMoveNext="closeOverview()">
        </stepPlay>
        <div v-show="overview.tabSelected" class="step-menu step-menu-fixed">
          <!--<q-linear-progress :percentage="(this.step.number - 1) * 100 / info.stepsNumber" animate stripe color="primary"></q-linear-progress>-->
          <div class="row white-buttons" :class="{'bg-primary': (!quest.customization || !quest.customization.color || quest.customization.color === '')}" :style="(quest.customization && quest.customization.color && quest.customization.color !== '') ? 'background-color: ' + quest.customization.color : ''">
            <div class="col centered">
              <q-btn
                flat
                size="lg"
                style="padding-top: 0 !important;"
                v-if="quest.customization.logo && quest.customization.logo !== ''" >
                <q-avatar size="60px">
                  <img :src="uploadUrl + '/upload/quest/' + quest.customization.logo">
                </q-avatar>
              </q-btn>
            </div>
            <div class="col centered q-py-sm">
              <q-btn
                flat
                size="lg"
                :style="(quest.customization.color && quest.customization.color !== '') ? 'background-color: ' + quest.customization.color : ''"
                icon="work"
                v-if="!quest.customization || !quest.customization.hideInventory"
                :class="{'flashing': inventory.suggest, 'bg-secondary': (inventory.isOpened && !quest.customization.color), 'bg-primary': (!inventory.isOpened && !quest.customization.color)}"
                @click="openInventory()"
                test-id="btn-inventory"
              />
            </div>
            <div class="col centered q-py-sm">
              <q-btn
                flat
                size="lg"
                :style="(quest.customization.color && quest.customization.color !== '') ? 'background-color: ' + quest.customization.color : ''"
                icon="lightbulb"
                :class="{'flashing': hint.suggest, 'bg-secondary': (hint.isOpened && !quest.customization.color), 'bg-primary': (!hint.isOpened && !quest.customization.color)}"
                @click="askForHint()"
                v-show="isHintAvailable()"
              />
            </div>
            <div v-if="!readOnly" class="col centered q-py-sm">
              <q-btn
                flat
                size="lg"
                :style="quest.customization.color ? 'background-color: ' + quest.customization.color : ''"
                :class="{'bg-primary': !quest.customization.color}"
                icon="arrow_back"
                @click="stepId = -1; modifyStep(chapters.newStep.overviewData)"
              />
            </div>
            <div class="col centered q-py-sm">
              <q-btn
                flat
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
        <!------------------ COMMON COMPONENTS ------------------>
        <div v-if="chapters.newStep.overviewData && chapters.newStep.overviewData.options && (chapters.newStep.overviewData.options.displayTime || chapters.newStep.overviewData.options.displayGoodAnswers)" style="position: absolute; left: 0; bottom: 70px; background-color: #000; color: #fff;" class="subtitle-5">
          <span v-if="chapters.newStep.overviewData.options.displayTime">{{currentDate}}&nbsp;</span>
          <span v-if="chapters.newStep.overviewData.options.displayGoodAnswers">&nbsp;{{ $t('label.Score')}} {{ score.nbGoodAnwers }}/{{ score.nbQuestions }}</span>
        </div>
      </div>

      <!------------------ INVENTORY PAGE AREA ------------------------>

      <q-dialog maximized v-model="inventory.isOpened">
        <div class="bg-graaly-blue-dark text-white inventory panel-bottom">
          <div class="q-pa-md">
            <a class="float-right no-underline" color="grey" @click="inventory.isOpened = false"><q-icon name="close" class="subtitle3" /></a>
            <div class="subtitle3 q-pb-lg">{{ $t('label.Inventory') }}</div>
            <div class="centered bg-warning q-pa-sm" v-if="warnings.inventoryMissing" @click="fillInventory()">
              <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
            </div>
            <p class="subtitle5" v-if="inventory.items && inventory.items.length > 0 && !warnings.inventoryMissing && chapters.newStep.overviewData.type === 'use-item'">{{ $t('label.InventoryUsage') }}</p>
            <p class="subtitle5" v-if="inventory.items && inventory.items.length > 0 && !warnings.inventoryMissing && chapters.newStep.overviewData.type !== 'use-item'">{{ $t('label.InventoryZoom') }}</p>
            <p v-if="!inventory.items || inventory.items.length === 0">{{ $t('label.noItemInInventory') }}</p>
            <div class="inventory-items">
              <div v-for="(item, key) in inventory.items" :key="key" class="inventory-item" @click="selectItem(item)">
                <img :src="((item.picture.indexOf('statics/') > -1 || item.picture.indexOf('blob:') !== -1) ? item.picture : uploadUrl + '/upload/quest/' + questId + '/step/new-item/' + item.picture)" />
                <p v-if="item.titles && item.titles[languages.current] && item.titles[languages.current] !== ''">{{ item.titles[languages.current] }}</p>
                <p v-if="!(item.titles && item.titles[languages.current] && item.titles[languages.current] !== '')">{{ item.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </q-dialog>
      <q-dialog maximized v-model="inventory.detail.isOpened">
        <div class="bg-white centered limit-size-desktop">
          <img v-if="inventory.detail.zoom === 1" style="width: 100%" :src="inventory.detail.url">
          <div v-if="inventory.detail.zoom === 2" style="width: 100%; height: 100vw; overflow-x: scroll; overflow-y: scroll;">
            <img style="width: 200%" :src="inventory.detail.url">
          </div>
          <div v-if="inventory.detail.zoom === 4" style="width: 100%; height: 100vw; overflow-x: scroll; overflow-y: scroll;">
            <img style="width: 400%" :src="inventory.detail.url">
          </div>
          <div class="q-pa-md">{{ inventory.detail.title }}</div>
          <!--<div class="q-pa-md text-grey">{{ $t('label.YouCanNotUseAnItemInThisStep') }}</div>-->
          <q-btn class="glossy normal-button" color="primary" @click="closeInventoryDetail()"><div>{{ $t('label.Close') }}</div></q-btn>
          <div>
            <q-btn-group outline>
              <q-btn flat :label="$t('label.Zoom')"/>
              <q-btn flat :class="{ 'text-primary': (inventory.detail.zoom === 1) }" label="x1" @click="inventoryZoom(1)" />
              <q-btn flat :class="{ 'text-primary': (inventory.detail.zoom === 2) }" label="x2" @click="inventoryZoom(2)" />
              <q-btn flat :class="{ 'text-primary': (inventory.detail.zoom === 4) }" label="x4" @click="inventoryZoom(4)" />
            </q-btn-group>
          </div>
        </div>
      </q-dialog>
    <!--
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
              <img v-if="item.pictures && item.pictures[languages.current] && item.pictures[languages.current] !== ''" :src="((item.picture.indexOf('statics/') > -1 || item.picture.indexOf('blob:') !== -1) ? item.pictures[languages.current] : uploadUrl + '/upload/quest/' + questId + '/step/new-item/' + item.pictures[languages.current])" />
              <img v-if="!(item.pictures && item.pictures[languages.current] && item.pictures[languages.current] !== '')" :src="((item.picture.indexOf('statics/') > -1 || item.picture.indexOf('blob:') !== -1) ? item.picture : uploadUrl + '/upload/quest/' + questId + '/step/new-item/' + item.picture)" />
              <p v-if="item.titles && item.titles[languages.current] && item.titles[languages.current] !== ''">{{ item.titles[languages.current] }}</p>
              <p v-if="!(item.titles && item.titles[languages.current] && item.titles[languages.current] !== '')">{{ item.title }}</p>
            </div>
          </div>
        </div>
      </q-dialog>
    -->

      <!------------------ HINT PAGE AREA ------------------------>

      <q-dialog maximized v-model="hint.isOpened">
        <div class="hint panel-bottom q-pa-md">
          <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.Hint') }}</div>
          <p v-if="hint.label === ''">{{ $t('label.NoHintForThisStep') }}</p>
          <p v-if="hint.label !== ''" v-html="hint.label[hint.number]"></p>
          <div class="centered">
            <q-btn class="q-mb-xl glossy normal-button" color="primary" @click="askForHint()"><div>{{ $t('label.Close') }}</div></q-btn>
          </div>
        </div>
      </q-dialog>
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
import Moment from "moment"

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
      samples: {
        selected: "",
        list: [
          {questId: "61b315e6826fe25856cb573d", name: this.$t('samples.sample1')},
          {questId: "61bcfe7713927b4a5e2cca59", name: this.$t('samples.sample2')},
          {questId: "61b1dba8826fe25856cb56f7", name: this.$t('samples.sample3')}
        ]
      },
      form: {
        fields: {
          title: {},
          category: '',
          priceForPlayer: '',
          tierPriceForPlayer: '',
          premiumPrice: {},
          playersNumber: 1,
          description: {},
          location: { lat: '', lng: '' },
          startingPlace: '',
          languages: [],
          mainLanguage: 'fr',
          level: 2,
          duration: 30,
          picture: null,
          thumb: null,
          snapshots: [],
          town: "",
          country: "",
          zipcode: "",
          editorMode: 'simple',
          customization: { audio: {}, color: '', logo: '', character: '', removeScoring: false, endMessage: {fr: '', en: ''}, endMessageForPerfectScore: {fr: '', en: ''}, font: 'standard', fontColor: '#000000', qrCodeMessage: {fr: '', en: ''}, geolocationMessage: {fr: '', en: ''}, hideInventory: false, disableGeolocation: false, hideFullScreen: false, authorName: '', userReplay: 'yes', qrCodeValidity: 'onetime' },
          rewardPicture: '',
          readMoreLink: '',
          limitNumberOfPlayer: 0,
          scheduling: [],
          forcePlayerToHaveAccount: false,
          shareUserDataWithCreator: false,
          countDownTime: {
            enabled: false,
            stopGame: false
          }
        },
        categories: utils.buildOptionsForSelect(questCategories, { valueField: 'id', labelField: 'name' }, this.$t),
        languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
        levels: utils.buildOptionsForSelect(questLevels, { valueField: 'id', labelField: 'name' }, this.$t),
        prices: [
          //{ label: this.$t('label.Free'), value: 'free' },
          { label: "0,99 €", value: 'premiumprice1' },
          { label: "1,99 €", value: 'premiumprice2' },
          { label: "2,99 €", value: 'premiumprice3' },
          { label: "4,99 €", value: 'premiumprice5' },
          { label: "7,99 €", value: 'premiumprice8' },
          { label: "9,99 €", value: 'premiumprice10' },
          { label: "14,99 €", value: 'premiumprice15' },
          { label: "19,99 €", value: 'premiumprice20' }
        ],
        fonts: [
          { label: 'Standard', value: 'standard', class: 'font-standard' },
          { label: 'Arial', value: 'arial', class: 'font-arial' },
          { label: 'Garamond', value: 'garamond', class: 'font-garamond' },
          { label: 'Courrier New', value: 'courrier', class: 'font-courrier' },
          { label: 'Brush script', value: 'brush', class: 'font-brush' }
        ],
        userReplays: [
          { label: this.$t('label.Yes'), value: 'yes' },
          { label: this.$t('label.No'), value: 'no' },
          { label: this.$t('label.OnceADay'), value: 'onceaday' }
        ],
        players: [
          { label: "1", value: '1' },
          { label: "2", value: '2' },
          { label: "3", value: '3' },
          { label: "4", value: '4' },
          { label: "5", value: '5' },
          { label: "6", value: '6' }
        ],
        times: [
          { label: '00h', value: 0 },
          { label: '01h', value: 1 },
          { label: '02h', value: 2 },
          { label: '03h', value: 3 },
          { label: '04h', value: 4 },
          { label: '05h', value: 5 },
          { label: '06h', value: 6 },
          { label: '07h', value: 7 },
          { label: '08h', value: 8 },
          { label: '09h', value: 9 },
          { label: '10h', value: 10 },
          { label: '11h', value: 11 },
          { label: '12h', value: 12 },
          { label: '13h', value: 13 },
          { label: '14h', value: 14 },
          { label: '15h', value: 15 },
          { label: '16h', value: 16 },
          { label: '17h', value: 17 },
          { label: '18h', value: 18 },
          { label: '19h', value: 19 },
          { label: '20h', value: 20 },
          { label: '21h', value: 21 },
          { label: '22h', value: 22 },
          { label: '23h', value: 23 },
          { label: '24h', value: 24 }
        ],
        durations: [
          { label: '15 ' + this.$t('label.minutes'), value: 15 },
          { label: '30 ' + this.$t('label.minutes'), value: 30 },
          { label: '45 ' + this.$t('label.minutes'), value: 45 },
          { label: '60 ' + this.$t('label.minutes'), value: 60 },
          { label: '90 ' + this.$t('label.minutes'), value: 90 },
          { label: '120 ' + this.$t('label.minutes'), value: 120 },
          { label: '180 ' + this.$t('label.minutes'), value: 180 },
          { label: '240 ' + this.$t('label.minutes'), value: 240 },
          { label: '300 ' + this.$t('label.minutes'), value: 300 },
          { label: '360 ' + this.$t('label.minutes'), value: 360 },
          { label: '420 ' + this.$t('label.minutes'), value: 420 },
          { label: '480 ' + this.$t('label.minutes'), value: 480 },
          { label: this.$t('label.DoNotDisplay'), value: 999 }
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
        suggest: false,
        items: [],
        show: true,
        detail: {
          isOpened: false,
          url: '',
          zoom: 1
        }
      },
      // for step type 'use-item'
      selectedItem: null,
      hint: {
        isOpened: false,
        label: "",
        suggest: false,
        number: 0
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
      payments: [],
      statistics: [],
      canMoveNextStep: false,
      canPass: false,
      showPaymentBox: false,
      showTierPaymentBox: false,
      paymentIsLoading: false,
      selectLanguageForPublishing: false,
      storage: "",
      itemUsed: null,
      isIOs: utils.isIOS(),
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,
      //pictureUploadURL: this.serverUrl + '/quest/picture/upload', // MPA 2022-08-18 seems not used
      titleMaxLength: 50,
      isHybrid: false,
      isAdmin: false,
      warnings: {
        stepsMissing: false,
        editorsMissing: false,
        inviteeMissing: false,
        inventoryMissing: false
      },
      currentDate: null,
      score: {
        nbGoodAnwers: 0,
        nbQuestions: 0
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

    // check user access rights
    if (this.$store.state.user.isAdmin) {
      this.isAdmin = true
    }
    
    this.refreshCurrentDate()
    // start tutorial 
    //this.startStory()
  },
  methods: {
    /*
     * Load quest and steps
     */
    async loadQuestData() {
      this.questId = this.$route.params.questId

      // fill quest settings form
      let quest = await QuestService.getLastById(this.questId, 'all')

      if (quest) {
        this.quest = quest.data

        // if not draft => read only
        if (this.quest.status !== 'draft' && !this.isAdmin) {
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
        // if empty, autofill picture with main language value
        if (!this.quest.picture[this.languages.current] || this.quest.picture[this.languages.current] === '') {
          this.quest.picture[this.languages.current] = this.quest.picture[this.quest.mainLanguage]
        }

        //this.form.fields = this.quest // removed EMA on 15112019 because issue with iOS
        this.form.fields.questId = this.quest.questId
        if (this.quest.title && Object.keys(this.quest.title).length > 0) {
          this.form.fields.title = this.quest.title
        } else {
          this.form.fields.title = {}
          this.form.fields.title[this.languages.current] = "-"
        }
        this.form.fields.description = this.quest.description
        this.form.fields.category = this.quest.category
        this.form.fields.location = this.quest.location
        this.form.fields.languages = this.quest.languages
        this.form.fields.mainLanguage = this.quest.mainLanguage
        this.form.fields.level = this.quest.level
        this.form.fields.duration = this.quest.duration
        this.form.fields.picture = this.quest.picture
        this.form.fields.thumb = this.quest.thumb
        this.form.fields.snapshots = this.quest.snapshots
        this.form.fields.editorMode = this.quest.editorMode
        this.form.fields.customization = Object.assign(this.form.fields.customization, this.quest.customization)
        this.form.fields.rewardPicture = this.quest.rewardPicture
        this.form.fields.readMoreLink = this.quest.readMoreLink
        this.form.fields.limitNumberOfPlayer = this.quest.limitNumberOfPlayer
        this.form.fields.scheduling = this.quest.scheduling
        this.form.fields.forcePlayerToHaveAccount = this.quest.forcePlayerToHaveAccount || false
        this.form.fields.shareUserDataWithCreator = this.quest.shareUserDataWithCreator || false
        this.form.fields.playersNumber = this.quest.playersNumber

        this.form.fields.startingPlace = this.form.fields.location.address || ""
        this.form.fields.zipcode = (this.form.fields.location && this.form.fields.location.zipcode) ? this.form.fields.location.zipcode : ""
        this.form.fields.town = (this.form.fields.location && this.form.fields.location.town) ? this.form.fields.location.town : ""
        this.form.fields.country = (this.form.fields.location && this.form.fields.location.country) ? this.form.fields.location.country : ""

        //countdown
        if (this.quest.countDownTime) {
          // using Object.assign() here to ensure that default properties are always defined
          this.form.fields.countDownTime = Object.assign(this.form.fields.countDownTime, this.quest.countDownTime)
        }

        // prices
        if (this.quest.type === 'room') {
          this.form.fields.priceForPlayer = this.quest.premiumPrice.manual
        } else if (this.quest.type === 'quest') {
          if (!this.quest.premiumPrice) {
            this.form.fields.premiumPrice = {}
          }
          if (this.quest.premiumPrice.androidId) {
            this.form.fields.priceForPlayer = this.quest.premiumPrice.androidId
          }

          if (!this.quest.premiumPrice.active) {
            this.showPaymentBox = false
          } else {
            this.showPaymentBox = true
          }
          if (!this.quest.premiumPrice.tier) {
            this.showTierPaymentBox = false
          } else {
            this.form.fields.tierPriceForPlayer = this.quest.premiumPrice.manual
            this.showTierPaymentBox = true
          }
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

        this.getReadableStorageUsage()
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
    async uploadReward(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadReward(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        if (uploadPictureResult.data.file) {
          this.form.fields.rewardPicture = uploadPictureResult.data.file
          this.$forceUpdate()
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    async removeReward() {
      this.form.fields.rewardPicture = null
    },
    async changeEditorMode() {
      if (this.form.fields.editorMode === 'advanced') {
        this.$q.dialog({
          dark: true,
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
    refreshCurrentDate () {
      let date = new Date()
      this.currentDate = Moment(date).format('DD/MM/YYYY, k:mm')
    },
    /*
     * Refresh / load the step list
     */
    async refreshStepsList() {
      this.warnings.stepsMissing = false
      // list steps
      this.$q.loading.show()
      var response = await StepService.listForAQuest(this.questId, this.quest.version, 'all')
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
          for (let j = 0; j < this.chapters.items.length; j++) {
            this.chapters.items[j].warnings = []
            var hasEndOfChapterStep = false
            var stepsWithNoCondition = []
            var stepsWithNoParent = []
            var stepsOfChapter = []
            var parent = []

            // Get the steps of current chapter & check if chapter has and end step
            for (let i = 0; i < steps.length; i++) {
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
            
            // Check that if chapter has a timer, there is a chapterTimerOver condition
            if (this.chapters.items[j].countDownTime 
              && this.chapters.items[j].countDownTime > 0
              && this.chapters.items[j].order !== 1) {
              let found = false
              for (let i = 0; i < steps.length; i++) {
                if (steps[i].chapterId.toString() === this.chapters.items[j].chapterId.toString()) {
                  for (let k = 0; k < steps[i].conditions.length; k++) {
                    if (steps[i].conditions[k] === 'chapterTimerOver') {
                      found = true
                    }
                  }
                }
              }
              if (!found) {
                this.chapters.items[j].warnings.push({noCountDownTimerCondition: true})
              }
            }

            // create unsorted list of steps
            var unsorted = []
            for (let i = 0; i < stepsOfChapter.length; i++) {
              unsorted.push(stepsOfChapter[i].stepId.toString())
            }

            // create sorted list of steps
            var sorted = []
            //until all the steps are treated
            var iteration = 0
            while (unsorted.length > 0 && iteration < 1000) {
              iteration++
              allSteps:
                for (let i = 0; i < stepsOfChapter.length; i++) {
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
                        if (stepsOfChapter[i].conditions[k].indexOf("counter") === -1 
                          && stepsOfChapter[i].conditions[k].indexOf("combineobject") === -1 
                          && stepsOfChapter[i].conditions[k].indexOf("haveobject") === -1 
                          && stepsOfChapter[i].conditions[k].indexOf("nothaveobject") === -1
                          && stepsOfChapter[i].conditions[k] !== 'chapterTimerOver'
                        ) {
                          let parentStepId = stepsOfChapter[i].conditions[k].replace("stepDone_", "")
                          parentStepId = parentStepId.replace("stepSuccess_", "")
                          parentStepId = parentStepId.replace("stepFail_", "")
                          parentStepId = parentStepId.replace("stepRandom_", "")
                          if (parentStepId.indexOf("stepAnswerNb") !== -1) {
                            let parentStepIdAnswerNbParts = parentStepId.split("_")
                            parentStepId = parentStepIdAnswerNbParts[1]
                          }
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
                      }
                      // treat the position of the new item
                      if (sorted.length >= maxPosition && stepsOfChapter[i].conditions.indexOf('chapterTimerOver') === -1) {
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
            for (let i = 0; i < sorted.length; i++) {
              for (let k = 0; k < stepsOfChapter.length; k++) {
                if (sorted[i] === stepsOfChapter[k].stepId.toString()) {
                  if (stepsWithNoParent.indexOf(stepsOfChapter[k].stepId.toString()) !== -1) {
                    stepsOfChapter[k].error = 'FollowingStepsHaveInvalidCondition'
                  }
                  if (i === 0 || stepsOfChapter[k].conditions.length === 0 
                    || stepsOfChapter[k].conditions.length > 1 
                    || stepsOfChapter[k].type === 'locate-marker' 
                    || stepsOfChapter[k].type === 'geolocation'
                    || stepsOfChapter[k].conditions.indexOf('chapterTimerOver') !== -1
                  ) {
                    stepsOfChapter[k].level = 1
                  } else {
                    stepsOfChapter[k].level = 2
                  }
                  this.chapters.items[j].steps.push(stepsOfChapter[k])
                }
              }
            }
            
            // check if steps are not treated
            var isTreated = false
            for (let k = 0; k < stepsOfChapter.length; k++) {
              isTreated = false
              for (let i = 0; i < sorted.length; i++) {
                if (sorted[i] === stepsOfChapter[k].stepId.toString()) {
                  isTreated = true
                }
              }
              if (!isTreated) {
                stepsOfChapter[k].error = 'FollowingStepsHaveInvalidCondition'
                stepsOfChapter[k].level = 1
                this.chapters.items[j].steps.push(stepsOfChapter[k])
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
        if (warnings[i].hasOwnProperty('noCountDownTimerCondition')) {
          message += this.$t('label.YourChapterHasTimerButNoCountDonwTimerCondition') + ". "
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
      // start location must be defined (only for public quests)
      if (this.quest.access === 'public' && (this.form.fields.location.lat === 0 || this.form.fields.location.lng === 0)) {
        Notification(this.$t('label.YouMustDefineStartLocation'), 'warning')
        return
      }
      this.$v.form.fields.$touch()
      if (!this.$v.form.fields.$error) {
        let commonProperties = {
          'languages': [this.form.fields.mainLanguage],
          'version': this.quest.version,
          'type': this.quest.type,
          'location': {
            type: 'Point',
            coordinates: [this.form.fields.location.lng, this.form.fields.location.lat],
            town: this.form.fields.town,
            country: this.form.fields.country,
            zipcode: this.form.fields.zipcode,
            address: this.form.fields.startingPlace
          }
        }

        if (!this.form.fields.premiumPrice) {
          this.form.fields.premiumPrice = {}
        }
        if (this.showPaymentBox) {
          this.form.fields.premiumPrice.active = true
        }
        if (this.showTierPaymentBox) {
          this.form.fields.premiumPrice.tier = true
        }

        let quest = Object.assign({}, this.form.fields, commonProperties)
        if (!quest.questId) {
          quest.questId = this.questId
        }

        // save to DB (or update, if property '_id' is defined)
        this.$q.loading.show()
        let res = await QuestService.save(quest)
        this.$q.loading.hide()

        if (res && res.data) {
          // apply playernumber changes
          this.quest.playersNumber = this.form.fields.playersNumber
          // update progression in stepper
          if (this.tabs.progress < 1) {
            if (this.quest.type === 'quest') {
              this.tabs.progress = 1
              this.tabs.selected = 'steps'
            } else {
              this.tabs.progress = 2
              this.tabs.selected = 'publish'
            }
            /*/ start configuration story
            if (this.story.active) {
              this.story.step = 19
            }*/
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
          this.form.fields.picture[this.languages.current] = uploadPictureResult.data.file
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      let uploadThumbResult = await QuestService.uploadThumb(data)
      if (uploadThumbResult && uploadThumbResult.hasOwnProperty('data')) {
        if (uploadThumbResult.data.file) {
          this.form.fields.thumb[this.languages.current] = uploadThumbResult.data.file
        } else if (uploadThumbResult.data.message && uploadThumbResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },

    /*
     * Upload a new thumb for the quest
     */
    async uploadThumb(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadThumbResult = await QuestService.uploadThumb(data)
      if (uploadThumbResult && uploadThumbResult.hasOwnProperty('data')) {
        if (uploadThumbResult.data.file) {
          this.form.fields.thumb[this.languages.current] = uploadThumbResult.data.file
        } else if (uploadThumbResult.data.message && uploadThumbResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a new snapshot for the quest
     */
    async uploadSnapshot(e) {
      if (this.form.fields.snapshots && this.form.fields.snapshots.length > 2) {
        return false
      }
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadSnapshotResult = await QuestService.uploadSnapshot(data, this.questId)
      if (uploadSnapshotResult && uploadSnapshotResult.hasOwnProperty('data')) {
        if (uploadSnapshotResult.data.file) {
          this.form.fields.snapshots.push(uploadSnapshotResult.data.file)
        } else if (uploadSnapshotResult.data.message && uploadSnapshotResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    async removeSnapshot(id) {
      this.quest.snapshots.splice(id, 1)
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
          this.$forceUpdate()
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    async removeLogo() {
      this.form.fields.customization.logo = null
    },

    /*
     * Upload a music
     */
    async uploadAudio(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('audio', files[0])
      let uploadAudioResult = await QuestService.uploadAudio(data)
      if (uploadAudioResult && uploadAudioResult.hasOwnProperty('data')) {
        if (uploadAudioResult.data.file) {
          Notification(this.$t('label.UploadSucessful'), 'positive')
          if (!this.form.fields.customization.audio) {
            this.form.fields.customization.audio = {}
          }
          this.$set(this.form.fields.customization.audio, this.languages.current, uploadAudioResult.data.file)
        } else if (uploadAudioResult.data.message && uploadAudioResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    async removeAudio() {
      this.form.fields.customization.audio[this.languages.current] = ''
    },

    /*
     * Upload a custo character for the quest
     */
    async uploadCharacter(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadCharacter(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        if (uploadPictureResult.data.file) {
          this.form.fields.customization.character = uploadPictureResult.data.file
          this.$forceUpdate()
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    async removeCharacter() {
      this.form.fields.customization.character = null
    },
    /*
     * Upload a custo character for the quest
     */
    async uploadCharacterOnMap(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadPictureResult = await QuestService.uploadCharacterOnMap(data)
      if (uploadPictureResult && uploadPictureResult.hasOwnProperty('data')) {
        if (uploadPictureResult.data.file) {
          this.form.fields.customization.characterOnMap = uploadPictureResult.data.file
          this.$forceUpdate()
        } else if (uploadPictureResult.data.message && uploadPictureResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    async removeCharacterOnMap() {
      this.form.fields.customization.characterOnMap = null
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
      navigator.geolocation.getCurrentPosition(this.fillLocation, this.getLocationError, {timeout: 5000, maximumAge: 0})
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
      var geocoder = new google.maps.Geocoder()
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
        if (lang) {
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
            if (this.quest.status === 'unpublished' || this.quest.status === 'draft') {
              if (this.quest.access === 'private' && !this.quest.isPremium) {
                this.$q.loading.show()
                await QuestService.publish(this.questId, lang)
                //TODO: manage if publishing failed
                this.$q.loading.hide()
                this.quest.status = 'published'
              } else {
                var _this = this
                this.$q.dialog({
                  dark: true,
                  message: this.$t('label.AreYouSureYouWantToPublishThisQuest'),
                  ok: true,
                  cancel: true
                }).onOk(async () => {
                  _this.$q.loading.show()
                  await QuestService.publish(_this.questId, lang)
                  //TODO: manage if publishing failed
                  _this.$q.loading.hide()
                  _this.quest.status = 'tovalidate'
                }).onCancel(async () => {
                  for (var i = 0; i < _this.form.fields.languages.length; i++) {
                    _this.form.fields.languages[i].published = false
                  }
                })
              }
              this.readOnly = true
            } else {
              this.$q.loading.show()
              await QuestService.publish(this.questId, lang)
              //TODO: manage if publishing failed
              this.$q.loading.hide()
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
          var _this = this
          this.$q.dialog({
            dark: true,
            message: this.$t('label.AreYouSureYouWantToPublishThisQuest'),
            ok: true,
            cancel: true
          }).onOk(async () => {
            _this.$q.loading.show()
            await QuestService.publish(_this.questId, 'all')
            //TODO: manage if publishing failed
            _this.$q.loading.hide()
            _this.quest.status = 'tovalidate'
          })
        }
      } else {
        Notification(this.$t('label.YourQuestContainsErrorsInSteps'), 'error')
        for (i = 0; i < this.form.fields.languages.length; i++) {
          this.form.fields.languages[i].published = false
        }
      }
    },
    /*
     * check if a quest is read only
     */
    isReadOnly() {
      if (!this.isAdmin && (this.quest.status === 'disabled' || this.quest.status === 'tovalidate')) {
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
        if (this.isHybrid) {
          this.$router.push('/quest/play/' + this.questId)
        } else {
          this.$q.dialog({
            dark: true,
            message: this.$t('label.TestWithSimulatorWarning'),
            ok: true
          }).onOk(async () => {
            this.$router.push('/quest/play/' + this.questId)
          })
        }
      }
    },
    /*
     * Test the quest
     */
    async checkIfTestable() {
      // Check if errors in steps or chapters
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].warnings && this.chapters.items[i].warnings.length > 0) {
          Notification(this.$t('label.YourQuestContainsErrorsInSteps'), 'error')
          return false
        }
      }

      // test if enough players to test
      if (this.editor.items && this.quest.playersNumber && this.editor.items.length >= this.quest.playersNumber) {
        // close potential ongoing run
        await RunService.closeInProgressRuns(this.questId)

        if (this.quest.playersNumber > 1) {
          // create a new multiplayer game
          var results = await RunService.createMultiplayerRunForTesters(this.questId)
          if (results) {
            // Notification
            var testers = []
            for (i = 0; i < this.editor.items.length; i++) {
              testers.push(this.editor.items[i].name)
            }
            Notification(this.$t('label.HereAreTheTesters', {nameList: testers.join(', ')}), 'info')
          }
        }
      } else {
        Notification(this.$t('label.YouNeedAtLeastXEditorsToTest', {nb: this.quest.playersNumber}), 'error')
        return false
      }
      return true
    },
    /*
     * Remove the quest
     */
    async removeQuest() {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        dark: true,
        message: this.$t('label.AreYouSureYouWantToRemoveThisQuest'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await QuestService.remove(_this.questId, _this.quest.version)
        // TODO: manage when remove failed
        this.$router.push('/home')
      })
    },
    /*
     * Duplicate the quest
     */
    async duplicateQuest() {
      const response = await QuestService.clone(this.questId, this.quest.version)

      if (response && response.data && response.data.newId) {
        const questId = response.data.newId
        var _this = this

        this.$q.dialog({
          dark: true,
          message: this.$t('label.DoYouWantToOpenClonedQuest'),
          ok: true,
          cancel: true
        }).onOk(async () => {
          _this.$router.push('/quest/settings/' + questId)
        })
      }
    },
    /*
     * Remove a step
     * @param   {String}    stepId            ID of the step removed
     */
    async removeStep(stepId) {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        dark: true,
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
      var _this = this // workaround for closure scope quirks
      this.quest.status = "waiting"

      this.$q.dialog({
        dark: true,
        message: this.$t('label.CreateNewVersionDescription'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        // avoid to create twice new version
        this.quest.status = 'draft'
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
        dark: true,
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
        dark: true,
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
     * Modify a chapter timer
     * @param   {String}    chapterId            ID of the chapter removed
     */
    async modifyChapterTimer(chapterId) {
      var _this = this; // workaround for closure scope quirks
      var chapterData = {countDownTime: '', position: 0}

      // Get chapter position and title
      for (var i = 0; i < this.chapters.items.length; i++) {
        if (this.chapters.items[i].chapterId.toString() === chapterId) {
          chapterData.countDownTime = this.chapters.items[i].countDownTime
          chapterData.position = i
        }
      }

      this.$q.dialog({
        dark: true,
        message: this.$t('label.ModifyTheChapterTimer'),
        prompt: {
          model: chapterData.countDownTime,
          type: 'number',
          min: 0,
          max: 400,
        },
        cancel: true
      }).onOk(async (data) => {

        await StepService.modifyChapter({questId: _this.questId, version: _this.quest.version, chapterId: chapterId, countDownTime: data})

        _this.chapters.items[chapterData.position].countDownTime = data
      }).onCancel(() => {})
    },
    /*
     * Create a chapter
     */
    async addChapter() {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        dark: true,
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
      this.closeStepTypePage()
      this.chapters.showNewStepOverview = false
      this.chapters.showNewStep = false
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

      // Load step data for selected language
      const response = await StepService.getById(this.stepId, this.quest.version, this.languages.current)
      if (response && response.data) {
        this.chapters.newStep.overviewData = response.data
        this.chapters.showNewStepPageSettings = false
        this.chapters.showNewStepPage = false
        this.chapters.showNewStepOverview = true
        this.hint.number = 0
        // move to top
        this.moveToTop()
        // add timer else the watcher is not working in stepPlay
        var _this = this
        setTimeout(function() { _this.chapters.reloadStepPlay = true }, 300)
        
        // compute stats
        this.computeGoodAnswers()
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
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
      this.hint.number = 0
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
      this.chapters.showNewStepPageSettings = false
      this.chapters.showNewStepOverview = false
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
      this.chapters.showNewStepPageSettings = false
      this.chapters.showNewStepOverview = false
      this.chapters.newStep.chapterId = chapterId
      this.chapters.newStep.previousStepId = stepId
    },
    /*
     * duplication a step
     */
    async duplicateStep(stepId) {
      await StepService.duplicate(this.questId, stepId, this.quest.version)
      await this.refreshStepsList()
    },
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
    async selectLanguage(selLang) {
      this.languages.current = selLang

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
      this.languages.current = language
      
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
          dark: true,
          message: this.$t('label.AreYouSureToAddThisNewLanguage'),
            ok: true,
            cancel: true
          }).onOk(async () => {
            // raises blocking exception if any problem occurs
            await QuestService.addLanguage(_this.questId, language)

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
        this.languages.current = language
      }
    },
    /*
     * Close a private quest
     */
    async closePrivateQuest() {
      var _this = this; // workaround for closure scope quirks

      this.$q.dialog({
        dark: true,
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
      var results = await RunService.listScoresForThisQuest(this.questId)
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
      return stepTypes.filter(stepType => (stepType.category === categoryCode && stepType.enabled && !((stepType.code === 'end-chapter' || stepType.code === 'increment-counter') && this.form.fields.editorMode === 'simple')))
    },
    /*
     * Select a step type
     * @param   {Object}    stepType            Type of the step
     */
    async selectStepType(stepType) {
      this.chapters.newStep.type = stepType
      this.chapters.showNewStepPage = false
      this.chapters.showNewStepOverview = false
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
      this.chapters.showNewStepPage = false
      if (step.type === 'end-chapter' || step.type === 'increment-counter') {
        await this.closeOverview()
        await this.refreshStepsList()
        return false
      }
      this.chapters.showNewStepOverview = true
      this.stepId = step.id

      const response = await StepService.getById(this.stepId, this.quest.version, this.languages.current)
      if (response && response.data) {
        this.chapters.newStep.overviewData = response.data
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

        await this.refreshStepsList()

        // load inventory for steps use-item
        if (this.chapters.newStep.overviewData.type === 'use-item') {
          await this.fillInventory()
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    /*
     * Launched when the step is played
     * @param   {String}    stepId            ID of the step
     */
    async trackStepPlayed(stepId) {
      this.canMoveNextStep = true
    },
    async trackStepSuccess(stepId) {
      this.canMoveNextStep = true
      if (this.chapters.newStep.overviewData.type !== 'image-over-flow' && this.chapters.newStep.overviewData.type !== 'binocular') {
        this.hideHint()
      }
    },
    /*
     * Track step passing
     */
    async trackStepPass () {
      this.canPass = true
    },
    /*
     * Track step fail
     */
    async trackStepFail () {
      this.hideHint()
    },
    /*
     * Track message sent
     */
    async trackMessage (message) {
      if (message === 'suggestInventory') {
        this.inventory.suggest = true
      } else if (message === 'suggestNext') {
        this.canMoveNextStep = true // warning: property 'canMoveNextStep' inconsistent with step.vue
      }
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
      this.inventory.detail.zoom = 1
      if (this.chapters.newStep.overviewData.type !== 'use-item') {
        this.inventory.detail.isOpened = true
        if (item.pictures && item.pictures[this.languages.current] && item.pictures[this.languages.current] !== '') {
          this.inventory.detail.url = ((item.picture.indexOf('statics/') > -1 || item.picture.indexOf('blob:') !== -1) ? item.picture : this.uploadUrl + '/upload/quest/' + this.questId + '/step/new-item/' + item.picture)
        } else {
          this.inventory.detail.url = (item.picture.indexOf('statics/') > -1 ? item.picture : this.uploadUrl + '/upload/quest/' + this.questId + '/step/new-item/' + item.picture)
        }
        if (item.titles && item.titles[this.languages.current] && item.titles[this.languages.current] !== '') {
          this.inventory.detail.title = item.titles[this.languages.current]
        } else {
          this.inventory.detail.title = item.title
        }
      } else {
        this.selectedItem = item
        this.closeAllPanels()
      }
    },
    closeInventoryDetail() {
      this.inventory.detail.isOpened = false
    },
    /*
     * Close all opened panels to go back to main screen
     */
    closeAllPanels() {
      this.inventory.isOpened = false
      this.hint.isOpened = false
      this.overview.tabSelected = 'none'
    },

    displayTierPaymentWarning() {
      if (this.showTierPaymentBox) {
        this.showHelpPopup('PaymentOnYourSideWarning')
      }
    },
    inventoryZoom(zoomLevel) {
      Vue.set(this.inventory.detail, 'zoom', zoomLevel)
      this.$forceUpdate()
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
        this.hint.number++
        if (this.hint.number >= this.hint.label.length) {
          this.hint.number = 0
        }
      } else {
        let hintLabel = await RunService.getHint(0, this.stepId, this.quest.version, this.languages.current)

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
      return ((this.chapters.newStep.overviewData &&
        this.chapters.newStep.overviewData.hasOwnProperty("hint") &&
        this.chapters.newStep.overviewData.hint !== '' &&
        this.chapters.newStep.overviewData.hint.length > 0))
    },
    /*
     * Get the GPS location based on user location
     * @param   {Object}    pos            Position data
     */
    async getMyGPSLocation() {
      this.$q.loading.show()
      var _this = this
      navigator.geolocation.getCurrentPosition(function (position) {
        _this.$q.loading.hide()
        _this.form.fields.location.lat = position.coords.latitude
        _this.form.fields.location.lng = position.coords.longitude
        //_this.$v.form.fields.location.lat.$touch()
        //_this.$v.form.fields.location.lng.$touch()
      },
      this.getLocationError,
      {
        timeout: 5000,
        maximumAge: 10000
      });
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
        this.storage = this.$t('label.UsedOver', {current: usedStorage, limit: limitStorage})
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
     * Start scheduling
     */
    startSchedule() {
      this.form.fields.scheduling = [[0, 24], [0, 24], [0, 24], [0, 24], [0, 24], [0, 24], [0, 24]]
    },
    resetSchedule() {
      this.form.fields.scheduling = []
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
    /*
     * download texts of the game
     */
    async downloadTexts() {
      try {
        const response = await StepService.generateTextsExportFile(this.questId, this.quest.version, this.languages.current)
        
        if (!response.hasOwnProperty('data') || !response.data.hasOwnProperty('result')) {
          throw new Error('Could not retrieve texts from server')
        }
        
        // adapted from https://stackoverflow.com/a/14966131/488666
        let csvContent = "data:text/csv;charset=utf-8," + response.data.result
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "texts_" + this.languages.current + ".csv");
        document.body.appendChild(link); // Required for FF

        link.click(); // This will download the data file
      } catch (err) {
        console.error(err)
        Notification(this.$t('label.TechnicalIssue'), 'error')
      }
    },
    /*
     * Create a new QR Code for a player that paied
     */
    async createNewPaymentQRCode() {
      this.paymentIsLoading = true
      await QuestService.createTierPayment(this.questId, this.quest.premiumPrice.manual)
      await this.listPayments()
      this.paymentIsLoading = false
    },
    /*
     * Create N new QR Code for a player that paied
     */
    async createMultipleNewPaymentQRCode(number) {
      for (let i = 0; i < number; i++) {
        await QuestService.createTierPayment(this.questId, this.quest.premiumPrice.manual)
      }
      await this.listPayments()
    },
    async printQRCode() {
      const file = await QuestService.printQRCodes(this.questId)
      setTimeout(this.openQRCodesPrinted, 2000)
    },
    openQRCodesPrinted() {
      window.open(this.serverUrl + '/upload/tiers/print/' + this.questId + '.pdf', "_self")
    },
    /*
     * List the payments for the game
     */
    async listPayments () {
      if (this.quest && this.quest.premiumPrice && this.quest.premiumPrice.tier) {
        let results = await QuestService.listTierPayments(this.questId)
        this.payments = results.data
      }
    },
    downloadQRCode(qrCode) {
      utils.openExternalLink(this.uploadUrl + '/upload/tiers/' + qrCode + '.png')
    },
    async removeCode(code) {
      this.$q.dialog({
        dark: true,
        message: this.$t('label.AreYouSureYouWantToRemoveThisTierCode'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await QuestService.removeTierPayment(this.questId, code)
        await this.listPayments()
      })
    },
    /*
     * List a quest reviews
     */
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
          return this.uploadUrl + '/upload/profile/' + filename
        }
      } else {
        return 'statics/profiles/noprofile.png'
      }
    },
    /*
     * Returns icon name depending on tab number, progress in creation mode, and edition mode
     * @param    {Number}    number     tab number (starting at 1 for first tab)
     */
    getTabIcon(number) {
      let creationTodoIcon = this.tabs.icons[number - 1] // icons array indexes start at 0
      let creationDoneIcon = 'check_circle'

      if (this.isEdition || this.quest.type !== 'quest') {
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
    },

    async selectSample(sample) {
      try {
        // Remove quest created
        await QuestService.remove(this.questId, this.quest.version)

        // create new quest with sample
        const response = await QuestService.createFromSample(sample, 1, this.quest.access, this.quest.isPremium)

        if (response && response.data && response.data.newId) {
          const questId = response.data.newId
          this.$router.push('/quest/settings/' + questId)
        }
      } catch (err) {
        console.error(err)
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    /*
     * Compute number of good answers
     */
    computeGoodAnswers() {
      if (!this.run || !this.run.conditionsDone) {
        return
      }
      const conditionsDone = this.run.conditionsDone
      let nbQuestions = 0
      let nbGoodAnwers = 0

      for (var i = 0; i < conditionsDone.length; i++) {
        if (conditionsDone[i].indexOf('stepSuccess_') !== -1) {
          nbQuestions++
          nbGoodAnwers++
        } else if (conditionsDone[i].indexOf('stepFail_') !== -1) {
          nbQuestions++
        }
      }
      this.score.nbQuestions = nbQuestions
      this.score.nbGoodAnwers = nbGoodAnwers
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
.step-hover{
  padding: 0;
  transition: 500ms;
  border-bottom: 1px solid transparent;
}
.step-hover:hover{
  border-bottom: 1px solid #d60b52;
}
</style>
