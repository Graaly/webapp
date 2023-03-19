<template>
  <div class="bg-white arial step-setting">

    <!------------------ HEADER ------------------------>

    <div class="q-pa-md background-dark">
      <a class="float-right no-underline clickable" color="grey" @click="close"><q-icon name="close" class="subtitle4" /></a>

      <div class="subtitle3" v-if="selectedStep.type !== null">{{ $t('stepType.' + selectedStep.type.title) }}</div>
    </div>

    <!------------------ COMMON FOR ALL STEPS ------------------------>

    <div class="q-pa-md q-pt-md q-mt-lg bottom-margin-for-keypad">
      <q-input
        type="text"
        :label="$t('label.Title') + ' ' + currentLanguageForLabels"
        v-model="selectedStep.form.title[lang]"
        @blur="$v.selectedStep.form.title[lang].$touch"
        bottom-slots
        counter
        :maxlength="titleMaxLength"
        :error="$v.selectedStep.form.title[lang].$error"
        :error-message="$t('label.PleaseEnterATitle')"
        test-id="step-title"
        />

      <q-input
        v-if="options.type.code !== 'end-chapter' && options.type.code !== 'increment-counter' && options.type.code !== 'character'"
        :label="$t('label.' + mainTextFieldLabel) + ' ' + currentLanguageForLabels"
        v-model="selectedStep.form.text[lang]"
        type="textarea"
        :max-height="100"
        :min-rows="4"
        class="full-width"
        bottom-slots
        counter
        test-id="step-text"
      />

      <div class="background-upload" v-show="options.type.hasBackgroundImage && options.type.hasBackgroundImage === 'main'">
        <q-btn class="full-width" type="button" @click="showMedia">
          {{ $t('label.AddABackgroundImage') + ' ' + currentLanguageForLabels}}
        </q-btn>
        <div v-if="selectedStep.form.backgroundImage && selectedStep.form.backgroundImage[lang] && selectedStep.form.backgroundImage[lang] !== '' && options.type.code !== 'find-item' && options.type.code !== 'use-item'">
          <p>{{ $t('label.YourPicture') }} :</p>
          <img
            v-if="questId !== null"
            class="full-width"
            :src="uploadUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage[lang]" 
            /> <br />
          <a class="dark" @click="resetBackgroundImage">{{ $t('label.remove') }}</a>
        </div>
      </div>

      <!------------------ STEP : VIDEO ------------------------>
   
      <div v-if="options.type.code == 'info-video'">
        <div v-if="!isIOs">
          <q-btn class="full-width" type="button" icon="cloud_upload" :label="$t('label.UploadAVideo')" @click="$refs['videofile'].click()" />
          <input @change="uploadVideo" ref="videofile" type="file" accept="video/mp4,video/x-m4v,video/*" hidden test-id="video-upload" />
        </div>
        <div v-if="isIOs">
          {{ $t('label.UploadAVideo') }}:
          <input @change="uploadVideo" ref="videofile" type="file" accept="video/mp4,video/x-m4v,video/*" test-id="video-upload" />
        </div>
        <div>

          <p v-show="$v.selectedStep.form.videoStream.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p v-show="!selectedStep.form.videoStream || !selectedStep.form.videoStream[lang] || selectedStep.form.videoStream[lang] === ''">{{ $t('label.NoVideoUploaded') }}</p>
          <video v-if="selectedStep.form.videoStream && selectedStep.form.videoStream[lang] && selectedStep.form.videoStream[lang] !== ''" class="full-width" controls controlsList="nodownload" test-id="uploaded-video">
            <source :src="uploadUrl + '/upload/quest/' + questId + '/step/video/' + selectedStep.form.videoStream[lang]" type="video/mp4" />
          </video>
        </div>
        <div>
          <q-toggle v-model="selectedStep.form.options.rotateVideo" :label="$t('label.RotateVideo')" />
        </div>
      </div>

      <!------------------ STEP : WIN NEW ITEM ------------------------>

      <div class="inventory" v-if="options.type.code == 'new-item'">
        <q-radio v-model="imageSource" v-if="selectedStep.form.options === null || !selectedStep.form.options.picture || selectedStep.form.options.picture === null" val="list" :label="$t('label.SelectPictureInTheList')" test-id="radio-select-new-item-in-list" />
        <div class="row objects-list" v-show="imageSource === 'list'">
          <div class="col-2 q-pa-sm" v-for="(item, key) in objectsList" :key="key" @click="selectObject(key)">
            <img style="width: 100%" :class="{'selected': (selectedStep.form.options.picture && selectedStep.form.options.picture === 'statics/images/object/' + objectsList[key].file)}" :src="'statics/images/object/' + item.thumb" />
          </div>
        </div>
        <q-radio v-model="imageSource" v-if="selectedStep.form.options === null || !selectedStep.form.options.picture || selectedStep.form.options.picture === null" val="upload" :label="$t('label.UploadTheItemPicture')" />
        <div v-show="imageSource === 'upload'">
          <div v-if="!isIOs">
            <q-btn class="full-width" type="button" :label="$t('label.UploadTheItemPicture')" @click="$refs['itemfile'].click()" />
            <input @change="uploadItemImage" ref="itemfile" type="file" accept="image/*" hidden />
          </div>
          <div v-if="isIOs">
            {{ $t('label.UploadTheItemPicture') + ' ' + currentLanguageForLabels }}:
            <input @change="uploadItemImage" ref="itemfile" type="file" accept="image/*" />
          </div>
          <p v-show="$v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p>{{ $t('label.WarningImageSizeSquare') }}</p>
        </div>
        <div v-if="selectedStep.form.options !== null && selectedStep.form.options.picture && selectedStep.form.options.picture !== null">
          <p>{{ $t('label.YourItemPicture') }} :</p>
          <div class="centered">
            <img style="width:100%" :src="(selectedStep.form.options.picture.indexOf('statics/') !== -1 ? selectedStep.form.options.picture : uploadUrl + '/upload/quest/' + questId + '/step/new-item/' + selectedStep.form.options.picture)" test-id="img-new-item" />
            <a class="dark" @click="selectedStep.form.options.picture = null">{{ $t('label.SelectANewObject') }}</a>
          </div>
        </div>
        <!--<p>{{ $t('message.Or') }}</p>
        <q-select emit-value map-options :label="$t('message.ObjectToUse')" :options="questItemsAsOptions" v-model="form.answerItem" />
        <div v-show="form.answerItem !== null">
          {{ $t('message.SelectedObject') }} :
          <q-icon :name="getItemIcon(form.answerItem)" />
        </div>-->
          <q-input
            v-model="selectedStep.form.options.title"
            :label="$t('label.ObjectName')"
            bottom-slots
            :error="$v.selectedStep.form.options.title.$error"
            :error-message="$t('label.RequiredField')"
            />
      </div>

      <!------------------ STEP : CHARACTER ------------------------>

      <div v-if="options.type.code == 'character'">
        <div>{{ $t('label.SplitMessageWithPipe') }}</div>
        
        <div v-if="config.character && config.character.multiple.length > 0">
          <div class="row centered" v-for="(character, index) in config.character.multiple">
            <div class="col-3" v-if="character.position === 'left'">
              <div class="clickable" @click="config.character.showUploadBox = true">
                <img v-if="character.picture.length > 2 && character.picture != 'usequestcharacter'" style="width:100%" :src="uploadUrl + '/upload/quest/' + questId + '/step/character/' + character.picture" />
                <img v-if="character.picture.length <= 2 && character.picture != 'usequestcharacter'" style="width:100%" :src="'statics/icons/story/character' + character.picture + '_attitude1.png'" />
                <img v-if="character.picture === 'usequestcharacter'" style="width:100%" :src="uploadUrl + '/upload/quest/' + quest.customization.character" />
              </div>
              <q-btn-group>
                <q-btn size="md" padding="sm" icon="delete" @click="removeCharacter(index)">
                  <q-tooltip>
                    {{ $t('label.Remove') }}
                  </q-tooltip>
                </q-btn>
                <q-btn size="md" padding="sm" icon="face" @click="config.character.currentScene = index; config.character.showUploadBox = true">
                  <q-tooltip>
                    {{ $t('label.ChangeCharacter') }}
                  </q-tooltip>
                </q-btn>
                <q-btn size="md" padding="sm" icon="arrow_right" @click="moveCharacter(index, 'right')">
                  <q-tooltip>
                    {{ $t('label.MoveRight') }}
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </div>
            <div class="col-9 selected q-pa-md">
              <q-input
                v-model="config.character.multiple[index].text[lang]"
                type="textarea"
                :max-height="100"
                :min-rows="4"
                class="full-width"
                bottom-slots
                counter
              />
            </div>
            <div v-if="character.position === 'right'" class="col-3 centered">
              <div class="clickable" @click="config.character.showUploadBox = true">
                <img v-if="character.picture.length > 2 && character.picture != 'usequestcharacter'" style="width:100%" :src="uploadUrl + '/upload/quest/' + questId + '/step/character/' + character.picture" />
                <img v-if="character.picture.length <= 2 && character.picture != 'usequestcharacter'" style="width:100%" :src="'statics/icons/story/character' + character.picture + '_attitude1.png'" />
                <img v-if="character.picture === 'usequestcharacter'" style="width:100%" :src="uploadUrl + '/upload/quest/' + quest.customization.character" />
              </div>
              <q-btn-group>
                <q-btn size="md" padding="sm" icon="arrow_left" @click="moveCharacter(index, 'left')">
                  <q-tooltip>
                    {{ $t('label.MoveLeft') }}
                  </q-tooltip>
                </q-btn>
                <q-btn size="md" padding="sm" icon="face" @click="config.character.currentScene = index; config.character.showUploadBox = true">
                  <q-tooltip>
                    {{ $t('label.ChangeCharacter') }}
                  </q-tooltip>
                </q-btn>
                <q-btn size="md" padding="sm" icon="delete" @click="removeCharacter(index)">
                  <q-tooltip>
                    {{ $t('label.Remove') }}
                  </q-tooltip>
                </q-btn>
              </q-btn-group>
            </div>
          </div>
        </div>
        
        <div>
          <q-btn class="full-width" type="button" :label="$t('label.AddAnotherCharacter')" @click="addAnotherCharacter" />
        </div>
        
        <!-- CHARACTER SELECTION BOX -->
        <q-dialog id="choose-character-modal" v-model="config.character.showUploadBox">
          <q-card>
            <q-card-section>
              <a class="q-mt-sm float-right no-underline clickable" color="grey" @click="config.character.showUploadBox = false"><q-icon name="close" class="subtitle3" /></a>
              <div class="text-h6">{{ $t('label.OrSelectACharacter') }}</div>
            </q-card-section>
            <q-card-section>
              <div class="row" v-if="quest.customization.character && quest.customization.character !== ''">
                <div class="col-3 clickable" :class="{'selected': ((config.character.multiple.length > config.character.currentScene) && 'usequestcharacter' == config.character.multiple[config.character.currentScene].picture)}" @click="selectCharacter('usequestcharacter')">
                  <img class="full-width" :src="uploadUrl + '/upload/quest/' + quest.customization.character" />
                </div>
              </div>
              <div class="row">
                <div class="answer col-3 clickable" v-for="n in 6" :key="n" @click="selectCharacter(n)">
                  <img :class="{'selected': ((config.character.multiple.length > config.character.currentScene) && n.toString() == config.character.multiple[config.character.currentScene].picture)}" style="width: 100%" :src="'statics/icons/story/character' + n + '_attitude1.png'" />
                </div>
              </div>
              <q-list bordered>
                <q-expansion-item :label="$t('label.OtherCharacters')">
                  <div class="row">
                    <div class="answer col-2 clickable" v-for="n in 34" :key="n" @click="selectCharacter(n + 6)">
                      <img :class="{'selected': ((config.character.multiple.length > config.character.currentScene) && (n + 6) == config.character.multiple[config.character.currentScene].picture)}" style="width: 100%" :src="'statics/icons/story/character' + (n + 6) + '_attitude1.png'" />
                    </div>
                  </div>
                </q-expansion-item>
              </q-list>
              <div class="q-mb-sm" style="margin: auto;">
                <div v-if="!isIOs">
                  <q-btn class="full-width" color="primary" type="button" :label="$t('label.UploadACharacter')" @click="$refs['characterfile'].click()" />
                  <input @change="uploadCharacterImage" ref="characterfile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs" class="centered">
                  {{ $t('label.UploadACharacter') }}:
                  <input @change="uploadCharacterImage" ref="characterfile" type="file" accept="image/*" />
                </div>
                <!--<p v-show="$v.selectedStep.form.options.character.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>-->
                <div class="row centered" v-if="config.character.multiple[config.character.currentScene].picture && config.character.multiple[config.character.currentScene].picture.length > 2 && config.character.multiple[config.character.currentScene].picture !== 'usequestcharacter'">
                  <div class="col-3 selected">
                    <img style="width:100%" :src="uploadUrl + '/upload/quest/' + questId + '/step/character/' + config.character.multiple[config.character.currentScene].picture" />
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-card-actions>
              <div class="centered">
                <q-btn color="primary" @click="config.character.showUploadBox = false">{{ $t('label.Close') }}</q-btn>
              </div>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>

      <!------------------ STEP : GEOLOCATION ------------------------>

      <div v-if="options.type.code === 'geolocation'" class="location-gps">

        <h2>{{ $t('label.DefaultMode') }}</h2>
        <div class="fields-group">
          <q-list>
            <q-item>
              <q-item-section>
                <q-radio v-model="selectedStep.form.options.mode" val="compass" :label="$t('label.CompassMode')" />
              </q-item-section>
              <q-item-section>
                <q-icon round size="md" class="text-primary" name="help" @click="showGeolocationModeHelp('CompassMode')" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-radio v-model="selectedStep.form.options.mode" val="map" :label="$t('label.MapMode')" />
              </q-item-section>
              <q-item-section>
                <q-icon round size="md" class="text-primary" name="help" @click="showGeolocationModeHelp('MapMode')" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <h2>{{ $t('label.LocationToFind') }}</h2>
        <div
          v-for="(location, index) in selectedStep.form.options.locations"
          :key="index"
          class="fields-group">
          <div>
            {{  $t('label.DefineGPSLocation') }}
            <div class="location-gps-inputs">
              <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
              <div>
                <label for="answer-latitude">{{ $t('label.Latitude') }}</label>
                <input type="number" id="answer-latitude" v-model.number="location.lat" placeholder="ex. 45,49812" step="any" />
              </div>
              <div>
                <label for="answer-longitude">{{ $t('label.Longitude') }}</label>
                <input type="number" id="answer-longitude" v-model.number="location.lng" placeholder="ex. 5,65487" step="any" />
              </div>
            </div>
            <div>
              <a class="dark clickable" @click="openGeolocationPopin(index)">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
              <span v-if="selectedStep.form.options.locations.length > 1"> - <a class="dark clickable" @click="removeGPSLocation(index)">{{ $t('label.RemoveGPSLocation') }}</a></span>
            </div>
          </div>
        </div>
        <q-btn class="full-width" :label="$t('label.AddAnGPSLocation')" @click="addGPSLocation()" />
      </div>

      <!------------------ STEP : MULTIPLE CHOICE ------------------------>

      <div v-if="options.type.code == 'choose'">

        <h2>{{ $t('label.ResponseTypes') }}</h2>
        <q-radio v-model="config.choose.answerType" val="text" :label="$t('label.Texts')" @click="$v.selectedStep.form.options.items.$touch" />
        <q-radio v-model="config.choose.answerType" val="image" :label="$t('label.Pictures')" @click="$v.selectedStep.form.options.items.$touch" test-id="radio-choose-images" />

        <h2>{{ $t('label.PossibleAnswers') }}</h2>
        <div class="answer" v-for="(option, key) in selectedStep.form.options.items" :key="key">
          <q-checkbox v-model="config.choose.answers" :val="key" :test-id="'radio-answer-' + key" />
          
          <q-input v-show="config.choose.answerType === 'text'" v-model="option.text" @input="$v.selectedStep.form.options.items ? $v.selectedStep.form.options.items.$each[key].text.$touch : null" input-class="native-input-class" :test-id="'text-answer-' + key" />
          <p class="error-label" v-if="config.choose.answerType === 'text' && $v.selectedStep.form.options && $v.selectedStep.form.options.items && !$v.selectedStep.form.options.items.$each[key].text.required">{{ $t('label.RequiredField') }}</p>

          <p v-show="config.choose.answerType === 'image' && option.imagePath === null" :class="{'error-label': $v.selectedStep.form.options && $v.selectedStep.form.options.items && !$v.selectedStep.form.options.items.$each[key].imagePath.required}">{{ $t('label.NoPictureUploaded') }}</p>
          <p><img v-if="config.choose.answerType === 'image' && option.imagePath !== null" :src="uploadUrl + '/upload/quest/' + questId + '/step/choose-image/' + option.imagePath" /></p>
          <span v-if="!isIOs">
            <q-btn v-show="config.choose.answerType === 'image'" icon="cloud_upload" @click="$refs['answerImage'][key].click()" />
            <input @change="uploadAnswerImage(key, $event)" ref="answerImage" type="file" accept="image/*" hidden :test-id="'image-answer-' + key" />
          </span>
          <span v-if="isIOs">
            <input @change="uploadAnswerImage(key, $event)" ref="answerImage" type="file" accept="image/*" hidden :test-id="'image-answer-' + key" />
          </span>
          <q-btn @click="deleteAnswer(key)" :test-id="'delete-answer-' + key">
            <q-icon name="clear" />
          </q-btn>
        </div>
        <q-btn @click="addAnswer()" class="full-width add-answer" color="secondary" test-id="add-answer">
          {{ $t('label.AddAnAnswer') }}
        </q-btn>
      </div>

      <!------------------ STEP : SIMPLE TEXT ------------------------>

      <div v-if="options.type.code == 'write-text'">
        <div v-for="(answer, index) in selectedStep.form.answers" :key="index">
          <q-input
            v-model="selectedStep.form.answers[index]"
            :label="$t('label.ExpectedAnswer')"
            bottom-slots
            :error="$v.selectedStep.form.answers.$error"
            :error-message="$t('label.RequiredField')"
            />
        </div>
        <q-btn class="full-width" @click="addWriteTextAnswer()">{{ $t('label.AddAnAnswer') }}</q-btn>
        <div>{{ $t('label.WriteTextWarning')}}</div>
      </div>

      <!------------------ STEP : CODE KEYPAD ------------------------>

      <div v-if="options.type.code == 'code-keypad'">
        <q-input
          v-model="selectedStep.form.answers"
          :label="$t('label.Code')"
          min-length="2"
          max-length="10"
          @blur="$v.selectedStep.form.answers.$touch"
          @input="$v.selectedStep.form.answers.$touch"
          bottom-slots
          :error="$v.selectedStep.form.answers.$error"
          :error-message="$t('label.CodeKeypadFormatError')"
          test-id="input-code"
        />
      </div>

      <!------------------ STEP : COLOR CODE ------------------------>

      <div v-if="options.type.code == 'code-color'" class="code-color">
        <h2>{{ $t('label.AvailableColors') }}</h2>
        <q-list>
          <q-item v-for="(option, key) in config.colorCode.colorsForCode" :key="key" :style="'background-color: ' + option.value">
            <q-item-section>
              <q-item-label lines="1">{{ option.label }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn class="bg-white" @click="deleteColor(key)">
                <q-icon name="clear" />
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
        <q-list bordered class="rounded-borders">
          <q-expansion-item dense icon="playlist_add" :label="$t('label.AddNewColor')" class="q-pa-md">
            <q-input bottom-slots v-model="config.colorCode.newColor.label" :label="$t('label.TypeColorCodeName')" maxlength="15" />
            <q-input bottom-slots v-model="config.colorCode.newColor.value" :label="$t('label.TypeColorCode')" maxlength="7">
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-color v-model="config.colorCode.newColor.value" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div class="centered">
              <q-btn class="glossy normal-button" color="secondary" @click="addColor()">
                {{ $t('label.Add') }}
              </q-btn>
            </div>
          </q-expansion-item>
        </q-list>
        <q-select emit-value map-options :label="$t('label.NumberOfColorsInTheCode')" :options="config.colorCode.numberOfDigitsOptions" v-model="selectedStep.form.options.codeLength" @input="changeDigitsNumberInCode" test-id="select-nb-colors" />
        <h2>{{ $t('label.ExpectedColorCodeAnswer') }}</h2>
        <table>
          <tr>
            <td v-for="(color, index) in unformatedAnswer" :key="index">
              <q-select emit-value map-options :ref="'colorSelect' + index" v-model="unformatedAnswer[index]" :options="config.colorCode.colorsForCode" :test-id="'select-color-' + index" />
            </td>
          </tr>
          <tr>
            <td v-for="(color, index) in unformatedAnswer" :key="index">
              <div @click="triggerClickOnColorSelect(index)" class="color-bubble" :style="'background-color: ' + unformatedAnswer[index]">&nbsp;</div>
            </td>
          </tr>
        </table>
        <div v-if="selectedStep.form.options" class="q-pb-md">
          <q-toggle v-model="selectedStep.form.options.orderHaveNotToBeRespected" :label="$t('label.OrderHaveNotToBeRespected')" />
        </div>
      </div>

      <!------------------ STEP : IMAGE CODE ------------------------>

      <div v-if="options.type.code == 'code-image'" class="code-image">
        <h2>{{ $t('label.ImagesUsedForCode') }}</h2>
        <div class="answer" v-for="(image, key) in selectedStep.form.options.images" :key="key">

          <p v-show="image.imagePath === null" :class="{'error-label': $v.selectedStep.form.options && !$v.selectedStep.form.options.$each[key].imagePath.required}">{{ $t('label.NoPictureUploaded') }}</p>
          <p><img v-if="image.imagePath !== null" :src="uploadUrl + '/upload/quest/' + questId + '/step/code-image/' + image.imagePath" /></p>
          <span v-if="!isIOs">
            <q-btn icon="cloud_upload" @click="$refs['answerImage'][key].click()" />
            <input @change="uploadCodeAnswerImage(key, $event)" ref="answerImage" type="file" accept="image/*" hidden :test-id="'image-code-' + key" />
          </span>
          <span v-if="isIOs">
            <input @change="uploadCodeAnswerImage(key, $event)" ref="answerImage" type="file" accept="image/*" :test-id="'image-code-' + key" />
          </span>
          <q-btn @click="deleteCodeAnswer(key)">
            <q-icon name="clear" />
          </q-btn>
        </div>
        <q-btn @click="addCodeAnswer()" class="full-width add-answer" color="secondary">
          {{ $t('label.AddAnImage') }}
        </q-btn>
        <div v-if="selectedStep.form.options.images && selectedStep.form.options.images.length > 0 && selectedStep.form.options.images[0].imagePath">
          <h2>{{ $t('label.ExpectedCode') }}</h2>
          <q-select emit-value map-options :label="$t('label.NumberOfImagesInTheCode')" :options="config.imageCode.numberOfDigitsOptions" v-model="selectedStep.form.options.codeLength" @input="changeDigitsNumberInCode" test-id="select-nb-images-in-code" />
          <table>
            <tr>
              <td v-for="(code, index) in unformatedAnswer" :key="index" class="text-center" @click="previousCodeAnswer(index)" :test-id="'previous-image-' + index">
                <q-icon name="keyboard_arrow_up" />
              </td>
            </tr>
            <tr>
              <td v-for="(code, index) in unformatedAnswer" :key="index">
                <img :id="'image-code-setting-' + index" :src="uploadUrl + '/upload/quest/' + questId + '/step/code-image/' + selectedStep.form.options.images[code].imagePath" />
              </td>
            </tr>
            <tr>
              <td v-for="(code, index) in unformatedAnswer" :key="index" class="text-center" @click="nextCodeAnswer(index)" :test-id="'next-image-' + index">
                <q-icon name="keyboard_arrow_down" />
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!------------------ STEP : JIGSAW PUZZLE ------------------------>

      <div v-if="options.type.code === 'jigsaw-puzzle'">
        <div class="background-upload">
          <div v-if="!isIOs">
            <q-btn class="full-width" :label="$t('label.UploadThePuzzlePicture')" @click="$refs['puzzlefile'].click()" />
            <input @change="uploadPuzzleImage" ref="puzzlefile" type="file" accept="image/*" hidden test-id="upload-puzzle-image" />
          </div>
          <div v-if="isIOs">
            {{ $t('label.UploadThePuzzlePicture') + ' ' + currentLanguageForLabels }}:
            <input @change="uploadPuzzleImage" ref="puzzlefile" type="file" accept="image/*" test-id="upload-puzzle-image" />
          </div>
          <p v-show="$v.selectedStep.form.options.picture && $v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p v-if="!selectedStep.form.options.picture || !selectedStep.form.options.picture[lang]">{{ $t('label.WarningImageSizeSquare') }}</p>
          <div v-if="selectedStep.form.options.picture && selectedStep.form.options.picture[lang]">
            <p>{{ $t('label.YourPuzzlePicture') }} :</p>
            <img class="full-width" :src="uploadUrl + '/upload/quest/' + questId + '/step/jigsaw-puzzle/' + selectedStep.form.options.picture[lang]" />
          </div>
        </div>
        <div>
          <q-select emit-value map-options :label="$t('label.Difficulty')" :options="config.jigsaw.levels" v-model="selectedStep.form.options.level" />
        </div>
      </div>

      <!------------------ STEP : MEMORY PUZZLE ------------------------>

      <div v-if="options.type.code === 'memory'">
        <h2>{{ $t('label.ImagesUsedForCards') }}</h2>
        <div class="answer" v-for="(option, key) in selectedStep.form.options.items" :key="key">
          <p v-show="option.imagePath === null" class="error-label">{{ $t('label.NoPictureUploaded') }}</p>
          <p><img v-if="option.imagePath !== null" :src="uploadUrl + '/upload/quest/' + questId + '/step/memory/' + option.imagePath" /></p>
          <span v-if="!isIOs">
            <q-btn icon="cloud_upload" @click="$refs['answerImage'][key].click()" />
            <input @change="uploadMemoryImage(key, $event)" ref="answerImage" type="file" accept="image/*" hidden :test-id="'memory-image-' + key" />
          </span>
          <span v-if="isIOs">
            <input @change="uploadMemoryImage(key, $event)" ref="answerImage" type="file" accept="image/*" :test-id="'memory-image-' + key" />
          </span>
          <q-btn @click="deleteMemoryAnswer(key)">
            <q-icon name="clear" />
          </q-btn>
        </div>
        <q-btn @click="addMemoryAnswer()" class="full-width add-answer" color="secondary">
          {{ $t('label.AddACardPair') }}
        </q-btn>
      </div>

      <!------------------ STEP : CODE KEYPAD ------------------------>

      <div v-if="options.type.code == 'phone-call'">
        <q-input
          v-model="selectedStep.form.options.number"
          :label="$t('label.PhoneNumber')"
          min-length="2"
          max-length="10"
          bottom-slots
        />
      </div>

      <!------------------ STEP : USE INVENTORY ITEM ------------------------>

      <div class="find-item" v-if="options.type.code == 'use-item' && selectedStep.form.backgroundImage && selectedStep.form.backgroundImage[lang]">
        <p><q-toggle v-model="selectedStep.form.options.touchLocation" :label="$t('label.ObjectNeedToBeAppliedOnPicture')" /></p>
        <div>
          <p>{{ $t('label.ClickOnTheLocationTheItemMustBeUsed') }} :</p>
          <div @click="getClickCoordinates($event)" id="useItemPicture" ref="useItemPicture" :style="'overflow: hidden; background-image: url(' + uploadUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage[lang] + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100%; height: ' + config.useItem.imageHeight + 'px; margin: auto;'">
            <img 
              v-if="selectedStep.form.options.touchLocation"
              id="cross"
              :style="'position: relative; z-index: 500; top: 52vw; left: 37vw; width: ' + config.useItem.crossSize + 'px; height: ' + config.useItem.crossSize + 'px;'"
              src="statics/icons/game/find-item-locator.png" />
          </div>
        </div>
      </div>
      <div class="inventory" v-if="options.type.code == 'use-item'">
        <q-select emit-value map-options
          :label="$t('label.ObjectToUse')"
          :options="config.useItem.questItemsAsOptions"
          v-model="selectedStep.form.answerItem"
          @change="$v.selectedStep.form.answerItem.$touch;"
          bottom-slots
          :error="$v.selectedStep.form.answerItem && $v.selectedStep.form.answerItem.$error"
          :error-message="$t('label.RequiredField')"/>
        <div v-if="selectedStep.form.answerItem">
          {{ $t('label.SelectedObject') }} :
          <img style="width: 100%" :src="(selectedStep.form.answerItem.indexOf('statics/') !== -1 ? selectedStep.form.answerItem : uploadUrl + '/upload/quest/' + questId + '/step/new-item/' + selectedStep.form.answerItem)" />
        </div>
        <div v-if="selectedStep.form.answerItem">
          <q-toggle v-model="selectedStep.form.options.removeObjectAfterUse" :label="$t('label.RemoveObjectFromInventoryAfterUse')" />
        </div>
        <div>
          <div v-if="!isIOs">
            <q-btn class="full-width" type="button" :label="$t('label.ChangeTheBackgroundImageOnceClicked')" @click="$refs['altfile'].click()" />
            <input @change="uploadAlternativeImage" ref="altfile" type="file" accept="image/*" hidden />
          </div>
          <div v-if="isIOs">
            {{ $t('label.ChangeTheBackgroundImageOnceClicked') }}:
            <input @change="uploadAlternativeImage" ref="altfile" type="file" accept="image/*" />
          </div>
          <div class="centered" v-if="selectedStep.form.options.altFile && selectedStep.form.options.altFile.length > 2">
            <img style="width:100%" :src="uploadUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.options.altFile" />
          </div>
        </div>
      </div>

      <!------------------ STEP : FIND ITEM ------------------------>

      <div class="find-item" v-if="options.type.code === 'find-item' && (selectedStep.form.backgroundImage && selectedStep.form.backgroundImage[lang] && selectedStep.form.backgroundImage[lang] !== '')">
        <q-select
          :label="$t('label.AreasNumber')"
          v-model="selectedStep.form.options.nbAreas"
          :options="config.findItem.numberOfAreas"
          emit-value
          map-options
          bottom-slots
          options-cover
          @input="changeNbAreas"
          />
        <p>{{ $t('label.ClickOnTheItemThatIsToFind') }} :</p>
        <div
          v-if="selectedStep && selectedStep.form && selectedStep.form.answers"
          @click="getClickCoordinatesFindItem($event)" 
          id="findItemPicture" ref="findItemPicture" 
          :style="'position: relative; overflow: hidden;background-image: url(' + uploadUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage[lang] + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100%; height: ' + config.findItem.imageHeight + 'px; margin: auto;'">
          <img 
            id="cross0" 
            :style="'position: absolute; z-index: 500; top: 100px; left: 100px; width: ' + config.findItem.crossSize + 'px; height: ' + config.findItem.crossSize + 'px; opacity: 0.5'" 
            @click="selectFindItemArea(0)" src="statics/icons/game/find-item-locator.png" />
          <img
            id="cross1"
            :style="'display: none; position: absolute; z-index: 500; top: 200px; left: 100px; width: ' + config.findItem.crossSize + 'px; height: ' + config.findItem.crossSize + 'px; opacity: 0.5'"
            @click="selectFindItemArea(1)" src="statics/icons/game/find-item-locator.png" />
          <img
            id="cross2"
            :style="'display: none; position: absolute; z-index: 500; top: 200px; left: 100px; width: ' + config.findItem.crossSize + 'px; height: ' + config.findItem.crossSize + 'px; opacity: 0.5'"
            @click="selectFindItemArea(2)" src="statics/icons/game/find-item-locator.png" />
          <img
            id="cross3"
            :style="'display: none; position: absolute; z-index: 500; top: 200px; left: 200px; width: ' + config.findItem.crossSize + 'px; height: ' + config.findItem.crossSize + 'px; opacity: 0.5'"
            @click="selectFindItemArea(3)" src="statics/icons/game/find-item-locator.png" />
          <img
            id="cross4"
            :style="'display: none; position: absolute; z-index: 500; top: 300px; left: 100px; width: ' + config.findItem.crossSize + 'px; height: ' + config.findItem.crossSize + 'px; opacity: 0.5'"
            @click="selectFindItemArea(4)" src="statics/icons/game/find-item-locator.png" />
        </div>
        <div>
          <div v-if="!isIOs">
            <q-btn class="full-width" type="button" :label="$t('label.ChangeTheBackgroundImageOnceClicked')" @click="$refs['altfile'].click()" />
            <input @change="uploadAlternativeImage" ref="altfile" type="file" accept="image/*" hidden />
          </div>
          <div v-if="isIOs">
            {{ $t('label.ChangeTheBackgroundImageOnceClicked') }}:
            <input @change="uploadAlternativeImage" ref="altfile" type="file" accept="image/*" />
          </div>
          <div class="centered" v-if="selectedStep.form.options.altFile && selectedStep.form.options.altFile.length > 2">
            <img style="width:100%" :src="uploadUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.options.altFile" />
          </div>
        </div>
      </div>
 
      <!------------------ STEP : LOCATE ITEM USING AR ------------------------>

      <div class="locate-item-ar" v-if="options.type.code === 'locate-item-ar'">
        <h2>{{ $t('label.ObjectFormat') }}</h2>
        <div class="fields-group">
          <q-radio v-model="selectedStep.form.options.is3D" :val="false" :label="$t('label.2DPicture')" />
          <q-radio v-model="selectedStep.form.options.is3D" :val="true" :label="$t('label.3DObject')" test-id="radio-locate-item-3d" @input="change2D3DObject" />

          <div v-if="!selectedStep.form.options.is3D">
            <div v-if="!isIOs">
              <q-btn class="full-width" type="button" @click="$refs['item-to-find'].click()" :label="$t('label.UploadThePictureOfTheObjectToFind')" />
              <input @change="uploadItemImage" ref="item-to-find" type="file" accept="image/png" hidden />
            </div>
            <div v-if="isIOs">
              {{ $t('label.UploadThePictureOfTheObjectToFind') }}:
              <input @change="uploadItemImage" ref="item-to-find" type="file" accept="image/png" />
            </div>
            <p v-show="!selectedStep.form.options.picture">{{ $t('label.PleaseUploadAFileInPNGFormat') }}</p>
            <p v-show="$v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
            <div v-if="selectedStep.form.options.picture">
              <p>{{ $t('label.UploadedPicture') }} :</p>
              <img :src="uploadUrl + '/upload/quest/' + questId + '/step/locate-item-ar/' + selectedStep.form.options.picture" />
            </div>
            <div>
              <p>{{ $t('label.ObjectSize') }}</p>
              <q-slider v-if="selectedStep.form.options.hasOwnProperty('objectSize')" v-model="selectedStep.form.options.objectSize" :min="0.5" :max="10" :step="0.1" label-always :label-value="(selectedStep.form.options.objectSize || 0.5) + 'm'" />
            </div>
          </div>
          <div v-if="selectedStep.form.options.is3D">
            <q-select emit-value map-options v-model="selectedStep.form.options.model" :label="$t('label.Choose3DModel')" :options="config.locateItem.selectModel3DOptions" test-id="select-3d-model" @input="changeObjectInList" />
            <p class="error-label" v-show="$v.selectedStep.form.options.model.$error">{{ $t('label.RequiredField') }}</p>
            <div class="centered">{{ $t('label.Or') }}</div>
            <div v-if="quest.isPremium">
              <div v-if="!isIOs">
                <q-btn class="full-width" type="button" @click="$refs['object-to-find'].click()" :label="$t('label.UploadTheObjectToFind')" />
                <input @change="uploadItemObject" ref="object-to-find" type="file" accept=".glb" hidden />
                <!-- fix if upload button does not react to click/push: use accept="model/gltf-binary" instead of accept=".glb" -->
              </div>
              <div v-if="isIOs">
                {{ $t('label.UploadTheObjectToFind') }}:
                <input @change="uploadItemObject" ref="object-to-find" type="file" accept=".glb" />
              </div>
            </div>
            <!--<div v-if="!quest.isPremium">
              <q-btn class="full-width" type="button" color="grey" :label="$t('label.UploadTheObjectToFind')" @click="$emit('openPremiumBox')" />
            </div>-->
            <div id="target-canvas"></div>
            <div class="q-mb-md">
              {{ $t('label.TouchAndDragObject') }}
            </div>
          </div>
          <div v-if="selectedStep.form.options.hasOwnProperty('touchDistance')">
            <p>{{ $t('label.TouchDistance') }}</p>
            <q-slider v-model="selectedStep.form.options.touchDistance" :min="5" :max="100" :step="1" label-always :label-value="(selectedStep.form.options.touchDistance || 10) + 'm'" />
          </div>
        </div>

        <h2>{{ $t('label.LocationToFind') }}</h2>
        <div class="fields-group">
          <div>
            {{ $t('label.DefineGPSLocation') }}
            <div class="location-gps-inputs">
              <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
              <div>
                <label for="answer-latitude">{{ $t('label.Latitude') }}</label>
                <input type="number" id="answer-latitude" v-model.number="selectedStep.form.options.lat" step="any" @input="$v.selectedStep.form.options.lat.$touch" @blur="$v.selectedStep.form.options.lat.$touch" />
                <p class="error-label" v-show="$v.selectedStep.form.options.lat.$error">{{ $t('label.RequiredField') }}</p>
              </div>
              <div>
                <label for="answer-longitude">{{ $t('label.Longitude') }}</label>
                <input type="number" id="answer-longitude" v-model.number="selectedStep.form.options.lng" step="any" @input="$v.selectedStep.form.options.lng.$touch" @blur="$v.selectedStep.form.options.lng.$touch" />
                <p class="error-label" v-show="$v.selectedStep.form.options.lng.$error">{{ $t('label.RequiredField') }}</p>
              </div>
            </div>
            <div>
              <a class="dark" @click="openGeolocationPopin(-1)">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
            </div>
          </div>
        </div>
      </div>

      <!------------------ STEP : FIND AR MARKER ------------------------>

      <div class="locate-marker" v-if="options.type.code === 'locate-marker' && typeof selectedStep.form.answers === 'string'">
        <h2>{{ $t('label.Marker') }}</h2>

        <p>
          <img :src="'statics/markers/' + selectedStep.form.answers + '/marker.png'" />
          <span>{{ selectedStep.form.answers }}</span>
          <q-btn class="glossy normal-button" color="primary" @click="openChooseMarkerModal()" test-id="btn-open-choose-marker-modal">
            {{ $t('label.Choose') }}
          </q-btn>
        </p>

        <q-dialog id="choose-marker-modal" v-model="config.locateMarker.markerModalOpened">
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ $t('label.ChooseTheMarker') }}</div>
            </q-card-section>

            <q-card-section>
              <q-btn v-for="(option, key) in markersList" :key="key" color="white" class="full-width" @click="selectMarker(option)" :test-id="'btn-select-marker-' + option">
                <img :src="'statics/markers/' + option + '/marker.png'" />
                <span>{{ option }}</span>
              </q-btn>
            </q-card-section>

            <q-card-actions>
              <q-btn
                color="primary"
                class="full-width"
                @click="closeChooseMarkerModal()"
                :label="$t('label.Cancel')"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>

      <!------------------ STEP : PORTRAIT ROBOT ------------------------>

      <div class="portrait-robot" v-if="options.type.code === 'portrait-robot' && selectedStep.form.answers && selectedStep.form.answers.items">
        <h2>{{ $t('label.BuildThePortraitRobot') }}</h2>

        <div class="relative-position">
          <div>
            <img :src="'statics/portrait-robot/face-' + selectedStep.form.answers.items.face + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/eye-' + selectedStep.form.answers.items.eye + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/mouth-' + selectedStep.form.answers.items.mouth + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/nose-' + selectedStep.form.answers.items.nose + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/hair-' + selectedStep.form.answers.items.hair + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/beard-' + selectedStep.form.answers.items.beard + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/glass-' + selectedStep.form.answers.items.glass + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/hat-' + selectedStep.form.answers.items.hat + '.png'" />
          </div>
        </div>
        <table class="portrait-parts">
          <tr>
            <td><img @click="changePortraitPart('face')" src="statics/portrait-robot/face-1.png" /></td>
            <td><img @click="changePortraitPart('eye')" src="statics/portrait-robot/eye-1.png" /></td>
            <td><img @click="changePortraitPart('nose')" src="statics/portrait-robot/nose-1.png" /></td>
            <td><img @click="changePortraitPart('hair')" src="statics/portrait-robot/hair-1.png" /></td>
            <td><img @click="changePortraitPart('beard')" src="statics/portrait-robot/beard-2.png" /></td>
            <td><img @click="changePortraitPart('glass')" src="statics/portrait-robot/glass-2.png" /></td>
            <td><img @click="changePortraitPart('hat')" src="statics/portrait-robot/hat-4.png" /></td>
          </tr>
        </table>
      </div>
      
      <!---------- STEP END OF CHAPTER  ------------>
      
      <q-list bordered v-if="options.type.code === 'end-chapter'">
        <div class="q-pa-md">
          <q-toggle v-model="config.endChapter.moveToNextStep" :label="$t('label.RedirectToNextChapter')" />
          <div v-if="!config.endChapter.moveToNextStep">
            <q-select 
              emit-value map-options 
              :label="$t('label.RedirectToChapter')" 
              v-model="selectedStep.form.options.chapterId" 
              :options="selectedStep.chapters" 
               />
          </div>
        </div>
      </q-list>
      
      <!---------- STEPS IOT : WAIT FOR EVENT / TRIGGER EVENT  ------------>

      <div v-if="options.type.code === 'wait-for-event' || options.type.code === 'trigger-event'">

        <q-select
          emit-value
          map-options
          :label="$t('label.Protocol')"
          v-model="selectedStep.form.options.protocol"
          :options="config.iot.protocols"
        />

       <!-- example mac : 24:62:AB:CA:51:20-->
        <q-input
          emit-value
          map-options
          v-model="selectedStep.form.options.deviceid"
          :label="'DeviceID (plug the device in)'"
          :options="config.iot.triggerEvent.modes"
          mask="NN:NN:NN:NN:NN:NN"
          fill-mask=""
          value="00:00:00:00:00:00"
        />

        <q-select
          v-if="options.type.code === 'wait-for-event'"
          emit-value
          map-options
          :label="$t('label.IotObject')"
          v-model="selectedStep.form.options.object"
          :options="config.iot.waitForEvent.iotObjectsAsOptions"
          @input="updateIotStepOptions()"
        />

        <q-select
          v-if="options.type.code === 'trigger-event'"
          emit-value
          map-options
          :label="$t('label.IotObject')"
          v-model="selectedStep.form.options.object"
          :options="config.iot.triggerEvent.iotObjectsAsOptions"
          @input="updateIotStepOptions()"
        />

        <q-select
          v-if="options.type.code === 'trigger-event'"
          emit-value
          map-options
          v-model="selectedStep.form.options.triggerMode"
          :label="$t('label.TriggerMode')"
          :options="config.iot.triggerEvent.modes"
        />

        <!-- distance mode -->
        <div v-if="selectedStep.form.options.object === 'distance'">
          <h2>{{ $t('label.SuccessRange') }}</h2>
          <q-range v-model="selectedStep.form.options.range"
            :min="0"
            :max="200"
            :left-label-value="selectedStep.form.options.range ? selectedStep.form.options.range.min + 'cm' : ''"
            :right-label-value="selectedStep.form.options.range ? selectedStep.form.options.range.max + 'cm' : ''"
            label-always />
        </div>

        <!-- potentiometers mode -->
        <div v-if="selectedStep.form.options.object === 'pot'">
          <h2>{{ $t('label.SuccessRanges') }}</h2>

          <q-range v-for="index of [1, 2, 3]" v-bind:key="index" class="q-my-md" v-model="selectedStep.form.options['range' + index]"
            :min="0"
            :max="255"
            :left-label-value="selectedStep.form.options['range' + index] ? selectedStep.form.options['range' + index].min : ''"
            :right-label-value="selectedStep.form.options['range' + index] ? selectedStep.form.options['range' + index].max : ''"
            label-always />
        </div>

        <!-- keypad mode -->
        <div v-if="selectedStep.form.options.object === 'keypad'">
          <q-input
            v-model="selectedStep.form.options.answer"
            :label="$t('label.Code')"
          />
        </div>

        <!-- joystick mode -->
        <div v-if="selectedStep.form.options.object === 'joystick'">
          <h2 style="line-height: 1.5rem">{{ $t('label.SuccessRanges') }}</h2>
          <p style="font-size: 0.8rem">{{ $t('label.Horizontal') }}</p>
          <q-range v-model="selectedStep.form.options.rangeX"
            :min="0"
            :max="255"
            :left-label-value="selectedStep.form.options.rangeX ? selectedStep.form.options.rangeX.min : ''"
            :right-label-value="selectedStep.form.options.rangeX ? selectedStep.form.options.rangeX.max : ''"
            label-always />
          <p style="font-size: 0.8rem">{{ $t('label.Vertical') }}</p>
          <q-range v-model="selectedStep.form.options.rangeY"
            :min="0"
            :max="255"
            :left-label-value="selectedStep.form.options.rangeY ? selectedStep.form.options.rangeY.min + '' : ''"
            :right-label-value="selectedStep.form.options.rangeY ? selectedStep.form.options.rangeY.max + '' : ''"
            label-always />
        </div>

        <!-- button mode -->
        <div v-if="selectedStep.form.options.object === 'button'">
          <q-input
            type="textarea"
            v-model="selectedStep.form.options.message"
            :label="$t('label.Message')"
            counter
            bottom-slots
            :maxlength="300"
          />
        </div>

        <!-- lcd mode -->
        <div v-if="selectedStep.form.options.object === 'lcd'">
          <q-input
            v-model="selectedStep.form.options.message"
            :label="$t('label.Message')"
            counter
            bottom-slots
            :maxlength="16"
          />
        </div>

        <!-- buzzer mode -->
        <div v-if="selectedStep.form.options.object === 'buzzer'">
          <h2>{{ $t('label.Duration') }}</h2>
          <q-slider v-model="selectedStep.form.options.duration"
            :min="0"
            :max="3000"
            :label-value="selectedStep.form.options.duration ? selectedStep.form.options.duration + 'ms' : ''"
            label-always />

          <h2>{{ $t('label.Frequency') }}</h2>
          <q-slider v-model="selectedStep.form.options.frequency"
            :min="100"
            :max="10000"
            :label-value="selectedStep.form.options.frequency ? selectedStep.form.options.frequency + 'Hz' : ''"
            label-always />
        </div>

        <!--
          Original code for MQTT only => TODO adapt
        <q-input
          v-model="selectedStep.form.options.code"
          :label="$t('label.EventCode')"
        />
        <q-input
          v-model="selectedStep.form.options.boardMacAddress"
          :label="$t('label.BoardMacAddress')"
        />
        <q-input v-if="options.type.code === 'wait-for-event'"
          v-model="selectedStep.form.options.successMessage"
          :label="$t('label.SuccessMessage')"
        />
        -->
      </div>

      <!------------------ PLAYERS ------------------------>

      <div v-if="quest.playersNumber > 1">
        <q-select
          emit-value
          map-options
          :label="$t('label.Player')"
          v-model="selectedStep.form.player"
          :options="players">
          <template v-slot:after>
            <q-btn round dense flat icon="help" @click="showHelpPopup('helpPlayer')" />
          </template>
        </q-select>
      </div>

      <!------------------ CONDITIONS ------------------------>

      <q-list bordered v-if="options && options.mode && options.mode === 'advanced'">
        <q-expansion-item icon="add_box" :label="$t('label.Conditions')">
          <div class="q-pa-sm">
            <q-list highlight v-if="selectedStep.formatedConditions.length > 0">
              <q-item-label header>{{ $t('label.ThisStepIsTriggeredWhen') }}</q-item-label>
              <q-item v-for="(condition, index) in selectedStep.formatedConditions" :key="index">
                <q-item-section>
                  <q-item-label v-html="condition" />
                </q-item-section>
                <q-item-section side>
                  <q-icon name="delete" @click.native="deleteCondition(index)" />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-if="selectedStep.formatedConditions.length === 0">
              {{ $t("label.NoCondition") }}
            </div>
            <q-btn color="primary" class="full-width" v-if="!selectedStep.newConditionForm" @click="selectedStep.newConditionForm = true" :label="$t('label.AddACondition')" />
            <div v-if="selectedStep.newConditionForm">
              <q-select emit-value map-options :label="$t('label.ConditionType')" v-model="selectedStep.newCondition.selectedType" :options="selectedStep.newCondition.types" @input="changeNewConditionType" />
              <q-select 
                v-if="selectedStep.newCondition.selectedType !== 'counter' && selectedStep.newCondition.selectedType !== 'countergreater' && selectedStep.newCondition.selectedType !== 'counterlower' && selectedStep.newCondition.selectedType !== 'combineobject' && selectedStep.newCondition.selectedType !== 'haveobject' && selectedStep.newCondition.selectedType !== 'nothaveobject' && selectedStep.newCondition.selectedType !== 'chapterTimerOver'" 
                emit-value map-options 
                :label="$t('label.ConditionValue')" 
                v-model="selectedStep.newCondition.selectedValue" 
                :options="selectedStep.newCondition.values" 
              />
              <q-select v-if="selectedStep.newCondition.selectedType === 'combineobject' && options.type.code === 'new-item'" emit-value map-options :label="$t('label.ObjectCombined')" v-model="selectedStep.newCondition.selectedObject" :options="config.useItem.questItemsAsOptions" />
              <div v-if="selectedStep.newCondition.selectedType === 'combineobject' && options.type.code !== 'new-item'">{{ $t('label.YouCanOnlyUseThisFeatureInNewItemStep') }}</div>
              <q-select v-if="selectedStep.newCondition.selectedType === 'haveobject'" emit-value map-options :label="$t('label.ObjectInInventory')" v-model="selectedStep.newCondition.selectedObject" :options="config.useItem.questItemsAsOptions" />
              <q-select v-if="selectedStep.newCondition.selectedType === 'nothaveobject'" emit-value map-options :label="$t('label.ObjectNotInInventory')" v-model="selectedStep.newCondition.selectedObject" :options="config.useItem.questItemsAsOptions" />
              <q-input v-if="selectedStep.newCondition.selectedType === 'counter' || selectedStep.newCondition.selectedType === 'countergreater' || selectedStep.newCondition.selectedType === 'counterlower'" v-model="selectedStep.newCondition.selectedValue" :label="$t('label.CounterValue')" />
              <q-input v-if="selectedStep.newCondition.selectedType === 'stepAnswerNb'" v-model="selectedStep.newCondition.answerNumber" :label="$t('label.AnswerNumber')" />
              <div class="centered">
                <q-btn class="glossy normal-button" color="primary" @click="saveNewCondition()" :label="$t('label.Save')" />
                <q-btn class="q-mx-md" color="primary" flat @click="selectedStep.newConditionForm = false" :label="$t('label.Cancel')" />
              </div>
            </div>
          </div>
        </q-expansion-item>
      </q-list>

      <!------------------ CHAPTERS ------------------------>

      <q-list bordered v-if="options && options.mode && options.mode === 'advanced'">
        <q-expansion-item icon="add_box" :label="$t('label.Chapters')">
          <div class="q-pa-md">
            <div>
              {{ $t("label.ChapterChangeWarning") }}
            </div>
            <q-select
              emit-value map-options
              :label="$t('label.Chapter')"
              v-model="selectedStep.form.chapterId"
              :options="selectedStep.chapters"
              @input="changeChapter" />
          </div>
        </q-expansion-item>
      </q-list>

      <!------------------ OTHER OPTIONS ------------------------>

      <q-list v-show="options.type.hasOptions" bordered>
        <q-expansion-item icon="add_box" :label="$t('label.OtherOptions')">
          <div class="q-pa-sm">
            <div class="background-upload" v-show="options.type.code !== 'end-chapter' && options.type.code !== 'increment-counter' && options.type.hasBackgroundImage && options.type.hasBackgroundImage === 'option'">
              <q-btn class="full-width" type="button" @click="showMedia">
                {{ $t('label.AddABackgroundImage') }}
              </q-btn>
              <!--<div v-if="!isIOs">
                <q-btn class="full-width" type="button" @click="$refs['backgroundfile2'].click()">
                  <q-icon name="cloud_upload" /> <label for="picturefile2">{{ $t('label.UploadABackgroundImage') }}</label>
                </q-btn>
                <input @change="uploadBackgroundImage" ref="backgroundfile2" name="picturefile2" id="picturefile2" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
              </div>
              <div v-if="isIOs">
                <q-icon name="cloud_upload" /> {{ $t('label.UploadABackgroundImage') }}
                <input @change="uploadBackgroundImage" ref="backgroundfile2" name="picturefile2" id="picturefile2" type="file" accept="image/*" />
              </div>
              <p v-show="$v.selectedStep.form.backgroundImage && $v.selectedStep.form.backgroundImage.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
              <p v-if="!selectedStep.form.backgroundImage">{{ $t('label.WarningImageResize') }}</p>-->
              <div v-if="selectedStep.form.backgroundImage && selectedStep.form.backgroundImage[lang] && selectedStep.form.backgroundImage[lang] !== '' && options.type.code !== 'find-item' && options.type.code !== 'use-item'">
                <p>{{ $t('label.YourPicture') }} :</p>
                <img 
                  v-if="questId !== null" 
                  class="full-width"
                  :src="uploadUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage[lang]" 
                  /> <br />
                <a class="dark" @click="resetBackgroundImage">{{ $t('label.remove') }}</a>
              </div>
            </div>
            <div class="background-upload" v-show="options.type.code === 'write-text' || options.type.code === 'code-image'">
              <div>
                <div v-if="!isIOs">
                  <q-btn class="full-width" type="button" :label="$t('label.UploadImageBelowButton')" @click="$refs['imageBelowfile'].click()" />
                  <input @change="uploadImageBelowButton" ref="imageBelowfile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs">
                  {{ $t('label.UploadImageBelowButton') }}:
                  <input @change="uploadImageBelowButton" ref="imageBelowfile" type="file" accept="image/*" />
                </div>
              </div>
              <div v-if="selectedStep.form.options !== null && selectedStep.form.options.imageBelow && selectedStep.form.options.imageBelow !== null">
                <p>{{ $t('label.YourItemPicture') }} :</p>
                <div class="centered">
                  <img style="width:100%" :src="(selectedStep.form.options.imageBelow.indexOf('statics/') !== -1 ? selectedStep.form.options.imageBelow : uploadUrl + '/upload/quest/' + questId + '/step/' + options.type.code + '/' + selectedStep.form.options.imageBelow)" />
                </div>
              </div>
            </div>
            <div class="background-upload" v-if="options.type.code === 'geolocation'">
              <div>
                <div v-if="!isIOs">
                  <q-btn class="full-width" type="button" :label="$t('label.UploadTheLocatorPicture')" @click="$refs['itemfile'].click()" />
                  <input @change="uploadLocatorImage" ref="itemfile" type="file" accept="image/*" hidden />
                </div>
                <div v-if="isIOs">
                  {{ $t('label.UploadTheLocatorPicture') }}:
                  <input @change="uploadLocatorImage" ref="itemfile" type="file" accept="image/*" />
                </div>
                <p>{{ $t('label.WarningImageSizeSquare') }}</p>
              </div>
              <div v-if="selectedStep.form.options !== null && selectedStep.form.options.locator && selectedStep.form.options.locator !== null">
                <p>{{ $t('label.YourItemPicture') }} :</p>
                <div class="centered">
                  <img style="width:100%" :src="(selectedStep.form.options.locator.indexOf('statics/') !== -1 ? selectedStep.form.options.locator : uploadUrl + '/upload/quest/' + questId + '/step/geolocation/' + selectedStep.form.options.locator)" />
                </div>
              </div>
            </div>
            <div v-if="options.type.nbTrials > 0">
              <q-input v-model="selectedStep.form.nbTrial" :label="$t('label.NbTrials')" />
            </div>
            <div v-if="options.type.passOption > 0">
              <q-toggle v-model="selectedStep.form.canPass" :label="$t('label.UserCanPass')" />
            </div>
            <div v-if="options.type.code == 'memory' || options.type.code == 'locate-item-ar' || options.type.code == 'jigsaw-puzzle' || options.type.code == 'use-item' || options.type.code == 'find-item' || options.type.code == 'code-image' || options.type.code == 'code-color' || options.type.code == 'code-keypad' || options.type.code == 'choose' || options.type.code == 'write-text' || options.type.code == 'portrait-robot'" class="q-pb-md">
              <q-toggle v-if="options && options.mode && options.mode === 'advanced'" v-model="selectedStep.form.displayRightAnswer" :label="$t('label.DisplayRightAnswer')" />
              <q-input v-if="selectedStep.form.options.rightAnswerMessage" v-model="selectedStep.form.options.rightAnswerMessage[lang]" :label="$t('label.CustomizeRightAnswerMessage') + ' ' + currentLanguageForLabels" />
              <q-input v-if="selectedStep.form.options.wrongAnswerMessage" v-model="selectedStep.form.options.wrongAnswerMessage[lang]" :label="$t('label.CustomizeWrongAnswerMessage') + ' ' + currentLanguageForLabels" />
              <q-input v-model="selectedStep.form.options.rightAnswerColor" :label="$t('label.CustomizeRightAnswerColor')" placeholder="yellow-4">
                <template v-slot:append>
                  <q-icon name="help" @click="colors.showPopin = true" class="cursor-pointer" />
                </template>
              </q-input>
              <q-input v-model="selectedStep.form.options.wrongAnswerColor" :label="$t('label.CustomizeWrongAnswerColor')" placeholder="Red-6">
                <template v-slot:append>
                  <q-icon name="help" @click="colors.showPopin = true" class="cursor-pointer" />
                </template>
              </q-input>
              <q-select 
                :label="$t('label.IconForSuccess')" 
                v-model="selectedStep.form.options.successIcon" 
                :options="successIcon.options">
                <template v-slot:selected>
                  <q-icon :name="selectedStep.form.options.successIcon" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label v-if="scope.opt !== 'block'">{{ $t('label.SelectThisIcon') }}</q-item-label>
                      <q-item-label v-if="scope.opt === 'block'">{{ $t('label.NoIcon') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <q-toggle v-model="selectedStep.form.options.moveToNextStepAutomatically" :label="$t('label.MoveToNextStepAutomatically')" />
            <div v-if="selectedStep.form.options.moveToNextStepAutomatically">
              <q-input v-model="selectedStep.form.options.moveToNextStepAutomaticallyDuration" :label="$t('label.MoveToNextStepAutomaticallyDuration')" />
            </div>
            <div v-if="options && (options.type.code == 'info-text' || options.type.code == 'code-image' || options.type.code == 'code-color' || options.type.code == 'code-keypad' || options.type.code == 'choose' || options.type.code == 'write-text')" class="q-pb-md">
              <q-toggle v-model="selectedStep.form.options.hideHideButton" :label="$t('label.HideHideButton')" />
            </div>
            <div v-if="options.type.code == 'geolocation' || options.type.code == 'locate-item-ar'" class="location-gps">
              <q-toggle v-model="selectedStep.form.showDistanceToTarget" :label="$t('label.DisplayDistanceBetweenUserAndLocation')" />
              <q-toggle v-model="selectedStep.form.showDirectionToTarget" :label="$t('label.DisplayDirectionArrow')" />
              <q-toggle v-model="selectedStep.form.options.hideAnimation" :label="$t('label.HideMake8Animation')" />
            </div>
            <div v-if="options.type.code == 'geolocation'">
              <q-toggle v-model="selectedStep.form.options.switchmode" :label="$t('label.AllowToSwitchGeolocationMode')" />
              <q-input v-model="selectedStep.form.options.distance" :label="$t('label.DistanceToWin')" />
            </div>
            <div v-if="options.type.code == 'character'">
              <q-input v-model="selectedStep.form.options.characterSize" :label="$t('label.CharacterSize')" />
              <q-input v-model="selectedStep.form.options.characterBarColor" :label="$t('label.CharacterBarColor')" />
            </div>
            <div v-if="options.type.code == 'new-item'">
              <q-toggle v-model="selectedStep.form.options.addInventoryAndPass" :label="$t('label.AddToInventoryAndPass')" />
            </div>
            <div v-if="options.type.code === 'memory'">
              <q-toggle v-model="selectedStep.form.options.lastIsSingle" :label="$t('label.LastItemIsUniq')" />
              <q-input v-model="selectedStep.form.options.memoryCardColor" :label="$t('label.CustomizedMemoryCardColor')" />
            </div>
            <div v-if="options.type.code === 'jigsaw-puzzle'">
              <q-toggle v-model="selectedStep.form.options.hidePuzzleNotWorkingMessage" :label="$t('label.HidePuzzleNotWorkingMessage')" />
            </div>
            <div v-if="options.type.code === 'code-image'">
              <q-toggle v-model="selectedStep.form.options.hideEnlargeMessage" :label="$t('label.HideEnlargeMessage')" />
              <q-toggle v-model="selectedStep.form.options.orderIsNotImportant" :label="$t('label.OrderIsNotImportant')" />
            </div>
            <div v-if="options.type.code === 'help'">
              <q-toggle v-model="selectedStep.form.options.helpInventory" :label="$t('label.HelpStepMessageInventory')" />
              <q-toggle v-model="selectedStep.form.options.helpHint" :label="$t('label.HelpStepMessageHint')" />
              <q-toggle v-model="selectedStep.form.options.helpPrevious" :label="$t('label.HelpStepMessagePrevious')" />
              <q-toggle v-model="selectedStep.form.options.helpNext" :label="$t('label.HelpStepMessageNext')" />
              <q-toggle v-model="selectedStep.form.options.helpCombinate" :label="$t('label.HelpStepMessageCombinate')" />
            </div>
            <div v-if="options.type.code === 'image-over-flow'">
              <q-toggle v-model="selectedStep.form.options.fullWidthPicture" :label="$t('label.EnlargePictureToFullWidth')" />
              <q-toggle v-model="selectedStep.form.options.fullHeightPicture" :label="$t('label.EnlargePictureToFullHeight')" />
              <q-toggle v-model="selectedStep.form.options.snapshotAllowed" :label="$t('label.PlayerCanTakeSnapshot')" />
              <q-toggle v-model="selectedStep.form.options.redFilter" :label="$t('label.ReplacePictureByRedFilter')" />
              <q-select 
                emit-value map-options 
                :label="$t('label.CameraUsed')" 
                v-model="selectedStep.form.options.cameraUsed" 
                :options="config.imageOverFlow.cameraOptions" />
            </div>
            <div v-if="options.type.code === 'info-text' || options.type.code === 'character' || options.type.code === 'choose' || options.type.code === 'write-text' || options.type.code === 'code-keypad'">
              <q-input v-model="selectedStep.form.options.initDuration" :label="$t('label.DurationBeforeTextAppearAbovePicture')" />
            </div>
            <div v-if="options.type.code === 'find-item'">
              <q-input v-if="selectedStep.form.options.wrongLocationMessage" v-model="selectedStep.form.options.wrongLocationMessage[lang]" :label="$t('label.WrongLocationMessage') + ' ' + currentLanguageForLabels" />
            </div>
            <div v-if="options.type.code === 'binocular'">
              <q-select 
                emit-value map-options 
                :label="$t('label.Shape')" 
                v-model="selectedStep.form.options.shape" 
                :options="config.binocular.options" />
            </div>
            <div v-if="options.type.code === 'end-chapter'">
              <q-toggle v-model="selectedStep.form.options.resetHistory" :label="$t('label.ResetHistoryAfter')" />
              <q-toggle v-model="selectedStep.form.options.resetChapterProgression" :label="$t('label.RestartChapterAfterStep')" />
              <q-toggle v-model="selectedStep.form.options.resetChapterProgressionAndMoveNext" :label="$t('label.ResetChapterProgression')" />
            </div>
            <div v-show="options.type.code !== 'end-chapter' && options.type.code !== 'increment-counter'">
              <div v-if="selectedStep.form.audioStream[lang] && selectedStep.form.audioStream[lang] !== ''">
                <div>{{ $t('label.YourAudioFile') + ' ' + currentLanguageForLabels }} : {{ selectedStep.form.audioStream[lang] }}</div>
                <div class="centered"><a class="dark" @click="removeAudio">{{$t('label.Remove')}}</a></div>
              </div>
              <div v-if="!selectedStep.form.audioStream[lang] || selectedStep.form.audioStream[lang] === ''">
                {{ $t('label.AddAnAudioFile') + ' ' + currentLanguageForLabels }}:
                <input @change="uploadAudio" ref="audiofile" type="file" accept="audio/mp3" />
              </div>
            </div>
            <div v-if="options.type.code === 'info-text' || options.type.code === 'character' || options.type.code === 'choose' || options.type.code === 'write-text' || options.type.code === 'code-keypad'">
              <q-toggle v-model="selectedStep.form.options.kenBurnsEffect" :label="$t('label.KenBurnsEffect')" /><br />
              <q-toggle v-model="selectedStep.form.options.blurEffect" :label="$t('label.BlurEffect')" />
              <q-toggle v-model="selectedStep.form.options.shakingEffect" :label="$t('label.ShakingEffect')" />
            </div>
            <div v-if="options.type.code !== 'help' && options.type.code !== 'end-chapter' && options.type.code !== 'increment-counter'">
              <q-toggle v-model="selectedStep.form.options.html" :label="$t('label.UseHtmlInDescription')" />
            </div>
            <div v-show="options.type.code !== 'end-chapter' && options.type.code !== 'increment-counter'">
              <q-input
                :label="$t('label.ExtraTextFieldLabel') + ' ' + currentLanguageForLabels"
                v-model="selectedStep.form.extraText[lang]"
                type="textarea"
                :max-height="100"
                :min-rows="4"
                class="full-width"
              />
              <q-toggle v-model="selectedStep.form.options.displayTime" :label="$t('label.DisplayTime')" />
              <q-toggle v-model="selectedStep.form.options.displayGoodAnswers" :label="$t('label.DisplayGoodAnswers')" />
            </div>
          </div>
        </q-expansion-item>
      </q-list>

      <!------------------ HINT ------------------------>

      <q-list v-show="options.type.showTrick == 'yes'" bordered>
        <q-expansion-item icon="lightbulb" :label="$t('label.Hints')">
          <div class="q-pa-sm">
            <div v-if="selectedStep.form.hint && selectedStep.form.hint[lang] && selectedStep.form.hint[lang].length > 0">
              <div v-for="(item, key) in selectedStep.form.hint[lang]" :key="key">
                <q-btn class="float-right" @click="removeHint(key)"><q-icon name="delete" /></q-btn>
                <q-btn class="float-right q-mr-sm" @click="updateHint(key)"><q-icon name="mode_edit" /></q-btn>
                <div class="text-subtitle1">{{ $t('label.Hint') + " " + (key + 1) + ' ' + currentLanguageForLabels }}</div>
                {{ item }}
              </div>
            </div>
            <div>
              <q-input v-model="newHint" :label="$t('label.NewHint')">
                <template v-slot:after>
                  <q-btn round dense flat icon="check" @click="addHint()" />
                </template>
              </q-input>
            </div>
          </div>
        </q-expansion-item>
      </q-list>

      <!------------------ START DATE ------------------------>

      <q-list bordered>
        <q-expansion-item icon="access_time" :label="$t('label.StartOnDate')">
          <div class="q-pa-sm">
            <q-toggle v-model="selectedStep.form.startDate.enabled" :label="$t('label.StepIsOnlyVisibleOnThisDate')" />
            <q-date v-model="selectedStep.form.startDate.date" minimal />
          </div>
        </q-expansion-item>
      </q-list>

      <!------------------ TIMER ------------------------>

      <q-list bordered v-show="options.type.category === 'enigma' && options.type.code !== 'image-over-flow' && !['image-over-flow', 'trigger-event'].includes(options.type.code)">
        <q-expansion-item icon="access_time" :label="$t('label.CountDownLabel')">
          <div class="q-pa-sm">
            <q-toggle
            v-model="selectedStep.form.countDownTime.enabled"
            :label="$t('label.CountDownLabel')"
            @input="activateCountDown"
            />
            <q-input
              filled
              v-model="selectedStep.form.countDownTime.time"
              :label="$t('label.CountDownIsActive')"
              mask="##h##m##s"
              fill-mask=""
              value="00h00m00s"
            /><!--##h##m##s-->
          </div>
        </q-expansion-item>
      </q-list>

    <!------------------ SAVE BUTTONS ------------------------>

      <div>
        <q-toggle v-model="updateClones" :label="$t('label.UpdateClones')" />
      </div>
      
      <div class="centered q-pa-md q-pt-lg q-pb-sm">
        <q-btn class="glossy large-button" color="primary" @click="checkAndSubmit(true)" test-id="btn-save-step">{{ $t('label.SaveAndTestThisStep') }}</q-btn>
      </div>
      <div class="centered q-px-md q-pb-xl">
        <q-btn flat color="primary" @click="checkAndSubmit(false)">{{ $t('label.SaveThisStep') }}</q-btn>
      </div>
    </div>

    <q-dialog id="save-changes-modal" class="full-width" v-model="saveChangesModalOpened">
      <q-card>
        <div class="q-pa-md">
          {{ $t('label.ConfirmSaveChanges') }}
        </div>
        <q-card-actions>
          <q-btn 
            color="primary" 
            @click="checkAndSubmit(false)" 
            :label="$t('label.Yes')" />
          <q-btn
            color="primary"
            @click="$emit('close')"
            :label="$t('label.No')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!------------------ PREMIUM POPIN ------------------------>
    
    <q-dialog maximized v-model="premium.show">
      <div class="q-pa-md">
        <div v-html="$t('label.PremiumWarning')" />
        <q-btn class="q-mt-md" color="primary" @click="premium.show = false">{{ $t('label.Close') }}</q-btn>
      </div>
    </q-dialog>
    
    <!------------------ COLORS POPIN ------------------------>
    <transition name="slideInBottom">
    <div class="bg-white panel-bottom q-pa-md" v-show="colors.showPopin">
      <div class="q-pa-md centered">
        <div class="row">
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors1.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors2.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors3.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors4.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors5.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors6.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors7.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors8.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors9.png" /></div>
          <div class="col-4 col-12-sm"><img style="width: 100%" src="statics/colors/colors10.png" /></div>
        </div>
        <q-btn class="q-mt-md" color="primary" @click="colors.showPopin = false">{{ $t('label.Close') }}</q-btn>
      </div>
    </div>
    </transition>
    
    <!------------------ GEOLOCATION COMPONENT ---------------------->

    <!-- used to retrieve author position -->
    <geolocation v-if="options.type.code === 'geolocation' || options.type.code === 'locate-item-ar'" ref="geolocation-component" @success="onNewUserPosition($event)" @error="onUserPositionError($event)" />

    <!------------------ MY LOCATION POPIN ---------------------->
    <q-dialog v-model="config.geolocation.showPopin">
      <q-card>
        <q-card-section>
          <h1>{{ $t('label.CurrentLocation') }}</h1>
          <p>{{ $t('label.Latitude') }} : {{ config.geolocation.position.latitude }}</p>
          <p>{{ $t('label.Longitude') }} : {{ config.geolocation.position.longitude }}</p>
          <p :class="{ warning: config.geolocation.position.accuracy > 10 }">{{ $t('label.Accuracy') }} : {{ Math.round(config.geolocation.position.accuracy * 10) / 10 }} {{ $t('label.Meters') }}</p>
        </q-card-section>
        <q-card-section class="warning" :style="{ visibility: config.geolocation.position.accuracy > 10 ? 'visible' : 'hidden' }" v-html="$t('label.MyLocationWarning')" />
        <q-card-actions align="right">
          <q-btn class="q-ma-sm q-px-md" color="primary" @click="saveMyGPSLocation()" :disable="config.geolocation.position.accuracy > 10">{{ $t('label.Save') }}</q-btn>
          <q-btn class="q-ma-sm q-px-md" color="primary" @click="config.geolocation.showPopin = false">{{ $t('label.Cancel') }}</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!------------------ MEDIA LIST AREA ------------------------>

    <transition name="slideInBottom">
      <div class="bg-white panel-bottom q-pa-md" v-show="media.isOpened">
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.AddABackgroundImage') }}</div>
        <div v-if="!isIOs">
          <q-btn class="full-width" type="button" @click.stop.prevent="$refs['backgroundfile'].click()">
            <q-icon name="cloud_upload" /> <label for="picturefile1">{{ $t('label.UploadABackgroundImage') }}</label>
          </q-btn>
          <input @change="uploadBackgroundImage" ref="backgroundfile" name="picturefile1" id="picturefile1" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" test-id="background-upload" />
        </div>
        <div v-if="isIOs">
          {{ $t('label.UploadABackgroundImage') }}:
          <input @change="uploadBackgroundImage" ref="backgroundfile" name="picturefile1" id="picturefile1" type="file" accept="image/*" test-id="background-upload" />
        </div>
        <div class="centered" v-if="media.isSimulated">
          <div :style="'width: 105px; height: 180px; background: url(' + media.simulationPicture + ') center center / cover no-repeat; display: inline-block; margin-right: 6px;'" />
          <div :style="'width: 84px; height: 180px; background: url(' + media.simulationPicture + ') center center / cover no-repeat; display: inline-block; margin-right: 6px;'" />
          <div :style="'width: 135px; height: 180px; background: url(' + media.simulationPicture + ') center center / cover no-repeat; display: inline-block;'" />
        </div>
        <div v-if="media.isSimulated">
          <div class="centered">{{ $t('label.MyBackgroundPictureImageDisplaysOnMobiles') }}</div>
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              :label="$t('label.MyPictureIsNotDisplayedWell')"
            >
              <q-card>
                <q-card-section>
                  <span v-html="$t('label.MyPictureIsNotDisplayedWellDesc')"></span>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
        <p v-show="$v.selectedStep.form.backgroundImage && $v.selectedStep.form.backgroundImage.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
        <div class="centered" v-if="(!selectedStep.form.backgroundImage || !!selectedStep.form.backgroundImage[lang]) && !media.isSimulated">{{ $t('label.WarningImageResize') }}</div>
        
        <div v-if="media && media.items && media.items.length > 0 && !media.isSimulated">
          <div class="centered q-pa-md">{{ $t('label.OrSelectAnImageInTheList') }}</div>
          <img v-for="(item, index) in media.items" :key="item.id" :src="uploadUrl + '/upload/quest/' + questId + item.type + item.file" style="width: 30vw; max-width: 300px; height: 40vw; max-height: 400px;" @click="selectMedia(index)">
        </div>
        <div class="centered q-ma-md">
          <q-btn class="q-mb-xl glossy large-button" color="primary" @click="hideMedia()">{{ $t('label.Close') }}</q-btn>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Notification from 'boot/NotifyHelper'
import hash from 'object-hash'
import utils from 'src/includes/utils'

import geolocation from 'components/geolocation'

import Vue from 'vue'

import colorsForCode from 'data/colorsForCode.json'
import stepTypes from 'data/stepTypes.json'
import modelsList from 'data/3DModels.json'
import objectsList from 'data/2Dobjects.json'
import markersList from 'data/markers.json'
import iotObjectsList from 'data/iotObjects.json'

import StepService from 'services/StepService'
import QuestService from 'services/QuestService'

import * as THREE from 'three'
//import * as TWEEN from '@tweenjs/tween.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import OrbitControls from 'three-orbitcontrols'

const DEMO_OBJECT_NAME = 'demoObject'

export default {
  /*
   * Properties used on component call
   * quest : quest object (mandatory)
   * stepId : Id of the step (0= new step)
   * lang : language of the step (fr, en, ...)
   * options : configuration
   */
  props: ['quest', 'stepId', 'lang', 'options'],
  components: {
    geolocation
  },
  watch: {
    // refresh component if stepId change
    stepId: async function (newVal, oldVal) {
      if (newVal !== -1) {
        await this.initData()
      }
    }
  },
  data() {
    return {
      questId: null,
      updateClones: false,
      selectedStep: {
        isNew: true,
        newConditionForm: false,
        id: 0,
        code: null,
        type: null,
        form: {
          title: {},
          text: {},
          backgroundImage: {},
          extraText: {},
          player: 'All',
          options: {},
          hint: {},
          nbTrial: 0,
          canPass: true,
          chapterId: "0",
          conditions: [],
          startDate: {
            enabled: false
          },
          countDownTime: {
            enabled: false
          },
          audioStream: {}
        },
        formatedConditions: [],
        newCondition: {
          selectedType: 'stepDone',
          types: [
            {label: this.$t('label.FollowStep'), value: 'stepDone'},
            {label: this.$t('label.StepSuccess'), value: 'stepSuccess'},
            {label: this.$t('label.StepFail'), value: 'stepFail'},
            {label: this.$t('label.StepAnswerNb'), value: 'stepAnswerNb'},
            {label: this.$t('label.StepRandom'), value: 'stepRandom'},
            {label: this.$t('label.StepCounter'), value: 'counter'},
            {label: this.$t('label.StepCounterGreater'), value: 'countergreater'},
            {label: this.$t('label.StepCounterLower'), value: 'counterlower'},
            {label: this.$t('label.StepCombineObject'), value: 'combineobject'},
            {label: this.$t('label.StepHaveObject'), value: 'haveobject'},
            {label: this.$t('label.StepNotHaveObject'), value: 'nothaveobject'},
            {label: this.$t('label.StepChapterTimerOver'), value: 'chapterTimerOver'}
          ],
          selectedValue: '',
          selectedObject: '',
          answerNumber: 0, 
          values: []
        },
        chapters: []
      },
      media: {
        isOpened: false,
        isSimulated: false,
        simulationPicture: "",
        items: [],
        detail: {
          isOpened: false,
          index: 0
        }
      },
      players: [],
      stepTypes,
      objectsList,
      markersList,
      titleMaxLength: 50,
      imageSource: '',
      originalStepData: {}, // helps to detect if step has been modified
      saveChangesModalOpened: false,

      config: {
        jigsaw: {
          levels: [
            { value: 1, label: this.$t('label.Easy') },
            { value: 2, label: this.$t('label.Medium') },
            { value: 4, label: this.$t('label.Hard') },
            { value: 3, label: this.$t('label.VeryHard') }
          ],
          nbPiecesByLevel: [0, 3, 4, 6, 5]
        },
        choose: {
          answerType: 'text',
          defaultNbAnswers: 4,
          minNbAnswers: 2,
          maxNbAnswers: 10,
          answers: []
        },
        character: {
          multiple: [],
          showUploadBox: false,
          currentScene: 0
        },
        colorCode: {
          numberOfDigitsOptions: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 6, label: "6" }
          ],
          colorsForCode: this.getColorsForCodeOptions(),
          newColor: {
            label: "",
            value: ""
          }
        },
        geolocation: {
          currentIndex: 0,
          showPopin: false,
          position: {
            latitude: null,
            longitude: null,
            accuracy: null
          }
        },
        imageCode: {
          numberOfDigitsOptions: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" },
            { value: 6, label: "6" }
          ],
          defaultNbAnswers: 4,
          imagesForCode: this.getImagesForCodeOptions(),
          maxNbAnswers: 10
        },
        memory: {
          minNbAnswers: 3,
          maxNbAnswers: 10
        },
        useItem: {
          questItemsAsOptions: [],
          crossSize: 40,
          imageHeight: 1200,
          imageWidth: 900,
          stepsOfItems: []
        },
        findItem: {
          numberOfAreas: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" },
            { value: 5, label: "5" }
          ],
          currentArea: 0,
          crossSize: 40,
          imageHeight: 1200,
          imageWidth: 900
        },
        locateItem: {
          selectModel3DOptions: [],
          zoom: 60,
          rotation: {},
          object: null
        },
        locateMarker: {
          markerModalOpened: false
        },
        imageOverFlow: {
          cameraOptions: [
            {label: this.$t('label.FaceCamera'), value: "user"},
            {label: this.$t('label.BackCamera'), value: "environment"}
          ]
        },
        binocular: {
          shape: "binocular",
          options: [
            {label: this.$t('label.Binoculars'), value: "binocular"},
            {label: this.$t('label.FlashLight'), value: "flashlight"}
          ]
        },
        portrait: {
          face: { number: 4 },
          eye: { number: 16 },
          mouth: { number: 1 },
          nose: { number: 5 },
          hair: { number: 26 },
          beard: { number: 31 },
          glass: { number: 5 },
          hat: { number: 4 }
        },
        endChapter: {
          moveToNextStep: true
        },
        iot: {
          triggerEvent: {
            iotObjectsAsOptions: this.getIotObjectsAsOptions('trigger-event'),
            modes: [
              { label: this.$t('label.TriggerModeAuto'), value: 'auto' },
              { label: this.$t('label.TriggerModeManual'), value: 'manual' }
            ]
          },
          waitForEvent: {
            iotObjectsAsOptions: this.getIotObjectsAsOptions('wait-for-event')
          },
          DeviceID: '0000000000',
          protocols: [
            { label: 'MQTT', value: 'mqtt' },
            { label: 'Bluetooth', value: 'bluetooth' }
          ]
        }
      },
      newHint: "",
      successIcon: {
        options: ['thumb_up', 'block', 'favorite', 'star', 'check_circle', 'emoji_emotions', 'auto_awesome', 'local_fire_department', 'light_mode', 'local_police']
      },
      questItems: [],
      colors: {
        showPopin: false
      },
      isIOs: (window.cordova && window.cordova.platformId && window.cordova.platformId === 'ios'),
      serverUrl: process.env.SERVER_URL,
      uploadUrl: process.env.UPLOAD_URL,

      unformatedAnswer: null,

      premium: {
        show: false
      }
    }
  },
  computed: {
    mainTextFieldLabel() {
      return this.options.type.category === 'enigma' ? 'Question' : 'Text'
    },
    /*
     * Define text field length
     */
    mainTextMaxLength() {
      let maxNbChars = 500 // default

      if (this.options.type.textRules && this.options.type.textRules.maxNbChars) {
        //if (this.$store.state.user.isAdmin) {
          // give admin the possibility to extend size
        //  maxNbChars = this.options.type.textRules.maxNbChars * 2
        //} else {
          maxNbChars = this.options.type.textRules.maxNbChars
        //}
      }

      return maxNbChars
    },
    currentLanguageForLabels() {
      return this.quest.languages.length > 1 ? '[' + this.lang.toUpperCase() + ']' : ''
    }
  },
  async mounted() {
    // MP 2019-09-30 run initData() only for step creation, otherwise it is called twice when modifying an existing step
    // In the condition below, "0" means new step creation
    if (this.stepId === "0") {
      await this.initData()
    }
  },
  methods: {
    /*
     * Get step ID and step type
     */
    async getStepId() {
      // Get stepId
      if (!this.stepId || this.stepId === '0') {
        this.selectedStep.id = 0
        this.selectedStep.isNew = true
      } else {
        this.selectedStep.id = this.stepId
        this.selectedStep.isNew = false
      }
    },
    /*
     * Get step ID and step type
     */
    async resetStep() {
      this.updateClones = false
      this.selectedStep.form = {
        title: {}, // {fr: 'mon titre', en: 'my title', ...}
        text: {}, // {fr: 'ma description', en: 'my description', ...}
        extraText: {}, // {fr: 'ma description', en: 'my description', ...}
        answers: {}, // using null triggers lots of "undefined property" errors complex to handle, due to nested objects + using them like v-model="form.answers.level" + template rendering executed before "mounted()"
        options: {},
        conditions: [],
        backgroundImage: {},
        // info-video step specific
        videoStream: {},
        audioStream: {},
        // geoloc step specific
        answerPointerCoordinates: {top: 50, left: 50},
        answerItem: null,
        player: 'All',
        nbTrial: 0,
        canPass: true,
        showDistanceToTarget: true,
        showDirectionToTarget: true,
        displayRightAnswer: true,
        trigger: {
          type: 'none'
        },
        wrongAnswerAnimation: {
          type: 'none'
        },
        hint: {}, // {fr: 'un indice', en: 'a hint', ...}
        startDate: {
          enabled: false
        },
        countDownTime: {
          enabled: false
        },
        number: null
      }
      if (this.config.character) {
        this.config.character.multiple.length = 0
      }
      // reset upload item (after document fully loaded)
      this.$nextTick(function () {
        if (document.getElementById("picturefile1")) {
          document.getElementById("picturefile1").value = ""
        }
        /*if (document.getElementById("picturefile2")) {
          document.getElementById("picturefile2").value = ""
        }*/
      })
    },
    /*
     * Init data of the component
     */
    async initData() {
      this.questId = this.quest.questId
      // reset step data
      this.resetStep()
      // if step is not defined and step type is not choosen
      if (this.stepId && this.stepId === -1) {
        return
      }
      await this.getStepId()
      // initialize step form data when edited
      if (!this.selectedStep.isNew) {
        // get step data
        var response = await StepService.getById(this.stepId, this.quest.version, 'all')
        if (response && response.data) {
          Object.assign(this.selectedStep.form, response.data)
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
        //get chapter Id
        this.options.chapterId = (response.data && response.data.chapterId) ? response.data.chapterId : 0

        // get conditions
        this.getUnderstandableConditions()
      } else {
        this.selectedStep.form.type = this.options.type.code
        this.selectedStep.form.chapterId = this.options.chapterId
        // build default condition if step is not the first of the chapter
        if (this.options.previousStepId !== 0) {
          this.selectedStep.form.conditions.push('stepDone_' + this.options.previousStepId)
          this.getUnderstandableConditions()
        }
      }

      // retrieve step type properties
      this.selectedStep.type = this.getStepType(this.selectedStep.form.type)
      if (!this.selectedStep.form.nbTrial || this.selectedStep.form.nbTrial === 0) {
        this.selectedStep.form.nbTrial = this.selectedStep.type.nbTrials
      }

      // compute number of steps
      if (this.selectedStep.form.number === null) {
        var numberOfSteps = await StepService.countForAQuest(this.questId, this.quest.version)
        this.selectedStep.form.number = (numberOfSteps && numberOfSteps.data && numberOfSteps.data.count) ? numberOfSteps.data.count + 1 : 1
      }

      // define the default title for the step
      if (!this.selectedStep.form.title[this.lang] || this.selectedStep.form.title[this.lang] === '') {
        let defaultTitle
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.title[this.quest.mainLanguage] !== '') {
          defaultTitle = this.selectedStep.form.title[this.quest.mainLanguage]
        } else {
          defaultTitle = this.$t('label.Step') + ' ' + this.selectedStep.form.number
        }
        this.$set(this.selectedStep.form.title, this.lang, defaultTitle)
      }

      // define the default text/question for the step
      if (!this.selectedStep.form.text[this.lang] || this.selectedStep.form.text[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.text[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.text, this.lang, this.selectedStep.form.text[this.quest.mainLanguage])
        }
      }
      // define the default text/question for the step
      if (!this.selectedStep.form.extraText[this.lang] || this.selectedStep.form.extraText[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.extraText[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.extraText, this.lang, this.selectedStep.form.extraText[this.quest.mainLanguage])
        }
      }
      // define the default image for the step
      if (!this.selectedStep.form.backgroundImage[this.lang] || this.selectedStep.form.backgroundImage[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.backgroundImage[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.backgroundImage, this.lang, this.selectedStep.form.backgroundImage[this.quest.mainLanguage])
        }
      }
      // define the default video for the step
      if (!this.selectedStep.form.videoStream[this.lang] || this.selectedStep.form.videoStream[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.videoStream[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.videoStream, this.lang, this.selectedStep.form.videoStream[this.quest.mainLanguage])
        }
      }
      // define the default hint for the step
      if (!this.selectedStep.form.hint[this.lang] || this.selectedStep.form.hint[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.hint[this.quest.mainLanguage] && this.selectedStep.form.hint[this.quest.mainLanguage].length > 0) {
          this.selectedStep.form.hint[this.lang] = []
          for (var q = 0; q < this.selectedStep.form.hint[this.quest.mainLanguage].length; q++) {
            this.selectedStep.form.hint[this.lang].push(this.selectedStep.form.hint[this.quest.mainLanguage][q])
          }
        }
      }
      
      // define default value for the options
      if (!this.selectedStep.form.options.rightAnswerMessage) {
        this.selectedStep.form.options.rightAnswerMessage = {}
      } else if (!this.selectedStep.form.options.rightAnswerMessage[this.lang] || this.selectedStep.form.options.rightAnswerMessage[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.options.rightAnswerMessage[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.options.rightAnswerMessage, this.lang, this.selectedStep.form.options.rightAnswerMessage[this.quest.mainLanguage])
        }
      }
      if (!this.selectedStep.form.options.successIcon) {
        this.selectedStep.form.options.successIcon = "thumb_up"
      }
      if (!this.selectedStep.form.options.wrongAnswerMessage) {
        this.selectedStep.form.options.wrongAnswerMessage = {}
      } else if (!this.selectedStep.form.options.wrongAnswerMessage[this.lang] || this.selectedStep.form.options.wrongAnswerMessage[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.options.wrongAnswerMessage[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.options.wrongAnswerMessage, this.lang, this.selectedStep.form.options.wrongAnswerMessage[this.quest.mainLanguage])
        }
      }
      if (!this.selectedStep.form.options.wrongLocationMessage) {
        this.selectedStep.form.options.wrongLocationMessage = {}
      } else if (!this.selectedStep.form.options.wrongLocationMessage[this.lang] || this.selectedStep.form.options.wrongLocationMessage[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.options.wrongLocationMessage[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.options.wrongLocationMessage, this.lang, this.selectedStep.form.options.wrongLocationMessage[this.quest.mainLanguage])
        }
      }
      
      // define players select list
      if (this.options.type.code === 'info-text' || this.options.type.code === 'info-video' || this.options.type.code === 'new-item' || this.options.type.code === 'character' || this.options.type.code === 'help' || this.options.type.code === 'end-chapter' || this.options.type.code === 'increment-counter') {
        this.players.push({ label: this.$t('label.All'), value: 'All' })
      }
      for (var p = 0; p < this.quest.playersNumber; p++) {
        this.players.push({ label: this.$t('label.Player') + " " + (p + 1), value: 'P' + (p + 1) })
      }

      // initialize option for Ken Burns (zoom out) effect on background
      if (!this.selectedStep.form.options.hasOwnProperty('kenBurnsEffect')) {
        this.selectedStep.form.options.kenBurnsEffect = false
      }
      if (!this.selectedStep.form.options.hasOwnProperty('blurEffect')) {
        this.selectedStep.form.options.blurEffect = false
      }

      // initialize option "use HTML in description"
      if (!this.selectedStep.form.options.hasOwnProperty('html')) {
        this.selectedStep.form.options.html = false
      }
      
      this.getQuestItemsAsOptions()
      
      // initialize specific steps
      if (this.options.type.code === 'choose') {
        if (!this.selectedStep.form.options || !this.selectedStep.form.options.items || !Array.isArray(this.selectedStep.form.options.items)) {
          this.config.choose.answerType = 'text'
          this.selectedStep.form.options = {items: [], hideHideButton: true}
          this.config.choose.answers = [0]
          for (let i = 0; i < this.config.choose.defaultNbAnswers; i++) {
            this.selectedStep.form.options.items.push({ text: this.$t('label.AnswerNb', { nb: (i + 1) }), imagePath: null })
          }
        } else {
          this.config.choose.answers = (this.selectedStep.form.answers + "").split("|").map(function(item) {
            return parseInt(item, 10);
          });
          this.config.choose.answerType = this.selectedStep.form.options.items[0].hasOwnProperty('imagePath') && this.selectedStep.form.options.items[0].imagePath !== null ? 'image' : 'text'
          if (this.config.choose.answerType === 'text') {
            for (var i = 0; i < this.selectedStep.form.options.items.length; i++) {
              if (this.selectedStep.form.options.items[i].textLanguage && this.selectedStep.form.options.items[i].textLanguage[this.lang]) {
                this.selectedStep.form.options.items[i].text = this.selectedStep.form.options.items[i].textLanguage[this.lang]
              }
            }
          }
        }
      } else if (this.options.type.code === 'help') {
        if (!this.selectedStep.form.options || !this.selectedStep.form.options.hasOwnProperty("helpInventory")) {
          this.selectedStep.form.options.helpHint = true
          this.selectedStep.form.options.helpInventory = true
          this.selectedStep.form.options.helpNext = true
          this.selectedStep.form.options.helpPrevious = true
          this.selectedStep.form.options.helpCombinate = false
        }
      } else if (this.options.type.code === 'code-color') {
        if (!this.selectedStep.form.options.hasOwnProperty('hideHideButton')) {
          this.selectedStep.form.options.hideHideButton = true
        }
        if (this.selectedStep.form.answers && typeof this.selectedStep.form.answers === 'string' && this.selectedStep.form.answers.indexOf('|') !== -1) {
          this.unformatedAnswer = this.selectedStep.form.answers.split("|")
        } else {
          this.unformatedAnswer = Array(4).fill('#FF0000')
        }
        if (this.selectedStep.form.options.colors) {
          this.config.colorCode.colorsForCode = this.selectedStep.form.options.colors
        }
        if (!this.selectedStep.form.options.codeLength) {
          this.selectedStep.form.options.codeLength = 4
        }
      } else if (this.options.type.code === 'code-image') {
        // init images list
        if (!this.selectedStep.form.options || !this.selectedStep.form.options.images) {
          this.selectedStep.form.options = {images: [], hideHideButton: true}
          for (let i = 0; i < this.config.imageCode.defaultNbAnswers; i++) {
            this.selectedStep.form.options.images.push({ imagePath: null })
          }
        }
        if (!this.selectedStep.form.options.codeLength) {
          this.selectedStep.form.options.codeLength = 4
        }
        // init answers
        if (this.selectedStep.form.answers && typeof this.selectedStep.form.answers === 'string' && this.selectedStep.form.answers.indexOf('|') !== -1) {
          this.unformatedAnswer = this.selectedStep.form.answers.split("|")
        } else {
          this.unformatedAnswer = [0, 0, 0, 0]
        }
      } else if (this.options.type.code === 'code-keypad') {
        if (!this.selectedStep.form.options.hasOwnProperty('hideHideButton')) {
          this.selectedStep.form.options.hideHideButton = true
        }
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.selectedStep.form.answers = ""
        }
      } else if (this.options.type.code === 'write-text') {
        if (!this.selectedStep.form.options.hasOwnProperty('hideHideButton')) {
          this.selectedStep.form.options.hideHideButton = true
        }
        if (typeof this.selectedStep.form.answers !== 'object' || !this.selectedStep.form.answers.length) {
          this.selectedStep.form.answers = []
          this.selectedStep.form.answers.push("")
        }
      } else if (this.options.type.code === 'info-text' || this.options.type.code === 'character' || this.options.type.code === 'choose' || this.options.type.code === 'write-text' || this.options.type.code === 'code-keypad') {
        if (!this.selectedStep.form.options.hasOwnProperty('hideHideButton')) {
          this.selectedStep.form.options.hideHideButton = true
        }
        if (!this.selectedStep.form.options.hasOwnProperty('initDuration')) {
          this.selectedStep.form.options.initDuration = 1
        }
        if (this.options.type.code === 'character') {
          if (this.selectedStep.form.options.multiple && this.selectedStep.form.options.multiple.length > 0) {
            this.config.character.multiple = this.selectedStep.form.options.multiple
          }
          // for new steps or legacy
          else {
            // for legacy character step
            if (this.selectedStep.form.options.character) {
              this.config.character.multiple.push({
                picture: this.selectedStep.form.options.character,
                text: {},
                position: 'right'
              })
              this.config.character.multiple[this.config.character.multiple.length - 1].text = this.selectedStep.form.text
            } else {
              this.config.character.multiple.push({
                picture: "1",
                text: {},
                position: 'right'
              })
              this.config.character.multiple[this.config.character.multiple.length - 1].text[this.lang] = ""
            }
          }
        }
      } else if (this.options.type.code === 'find-item') {
        if (this.selectedStep.form.options.hasOwnProperty('nbAreas')) {
          //this.selectedStep.form.answerPointerCoordinates = this.selectedStep.form.answers
          this.$nextTick(function () {
            // Code that will run only after the entire view has been rendered
            this.initFindItemElements()
            this.positionFindItemPointer()
          })
        } else {
          this.selectedStep.form.options.nbAreas = 1
          this.selectedStep.form.options.coordinates = [{top: 50, left: 50}]
          //this.initFindItemElements()
          //this.positionFindItemPointer()
        }
        if (!this.selectedStep.form.options) {
          this.selectedStep.form.options = {}
        }
      } else if (this.options.type.code === 'use-item') {
        if (this.selectedStep.form.answers.hasOwnProperty('coordinates')) {
          this.selectedStep.form.answerPointerCoordinates = this.selectedStep.form.answers.coordinates
          this.$nextTick(function () {
            // Code that will run only after the entire view has been rendered
            this.initUseItemElements()
            this.positionUseItemPointer()
          })
        }
        if (this.selectedStep.form.answers && this.selectedStep.form.answers.item) {
          this.selectedStep.form.answerItem = this.selectedStep.form.answers.item
        }
        if (!this.selectedStep.form.options || !this.selectedStep.form.options.hasOwnProperty("touchLocation")) {
          this.selectedStep.form.options = { touchLocation: true }
        }
      } else if (this.options.type.code === 'new-item') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.selectedStep.form.options = { picture: null, title: "", pictures: {'fr': '', 'en': ''}, titles: {'fr': '', 'en': ''} }
        } else {
          if (this.selectedStep.form.options.hasOwnProperty('pictures') && this.selectedStep.form.options.pictures[this.lang]) {
            this.selectedStep.form.options.picture = this.selectedStep.form.options.pictures[this.lang]
          }
          if (this.selectedStep.form.options.hasOwnProperty('titles') && this.selectedStep.form.options.titles[this.lang]) {
            this.selectedStep.form.options.title = this.selectedStep.form.options.titles[this.lang]
          }
        }
      } else if (this.options.type.code === 'jigsaw-puzzle') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.selectedStep.form.options = { picture: null, level: 2 }
        }
      } else if (this.options.type.code === 'binocular') {
        if (!this.selectedStep.form.options.shape) {
          this.selectedStep.form.options.shape = "binocular"
        }
      } else if (this.options.type.code === 'memory') {
        if (!this.selectedStep.form.options.hasOwnProperty('items')) {
          let defaultItems = []
          for (let i = 0; i < 8; i++) {
            defaultItems.push({ imagePath: null, single: false })
          }
          this.$set(this.selectedStep.form.options, 'items', defaultItems)
        }
      } else if (this.options.type.code === 'portrait-robot') {
        if (!this.selectedStep.form.answers.hasOwnProperty('items')) {
          this.$set(this.selectedStep.form.answers, 'items', {type: 1, face: 1, eye: 1, mouth: 1, nose: 1, hair: 1, beard: 1, glass: 1, hat: 1})
        }
      } else if (this.options.type.code === 'end-chapter') {
        if (!this.selectedStep.form.options.hasOwnProperty('chapterId') || this.selectedStep.form.options.chapterId == "") {
          this.config.endChapter.moveToNextStep = true
        } else {
          this.config.endChapter.moveToNextStep = false
        }
      } else if (this.options.type.code === 'phone-call') {
        if (!this.selectedStep.form.options.hasOwnProperty('number')) {
          this.$set(this.selectedStep.form.options, 'number', '000000000')
        }
      } else if (this.options.type.code === 'geolocation') {
        if (!this.selectedStep.form.options.hasOwnProperty('distance')) {
          this.$set(this.selectedStep.form.options, 'distance', '20')
        }
        if (!this.selectedStep.form.options.hasOwnProperty('showHelp')) {
          this.$set(this.selectedStep.form.options, 'showHelp', true)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('mode')) {
          this.$set(this.selectedStep.form.options, 'mode', 'compass')
        }
        if (!this.selectedStep.form.options.hasOwnProperty('locations')) {
          this.$set(this.selectedStep.form.options, 'locations', [{lat: '', lng: '', destination: ''}])
        }
      } else if (this.options.type.code === 'locate-item-ar') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.$set(this.selectedStep.form.options, 'picture', null)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('objectSize')) {
          this.$set(this.selectedStep.form.options, 'objectSize', 1)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('touchDistance')) {
          this.$set(this.selectedStep.form.options, 'touchDistance', 10)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('is3D')) {
          this.$set(this.selectedStep.form.options, 'is3D', false)
        }
        // create options for 3D Model selection
        for (let key in modelsList) {
          this.config.locateItem.selectModel3DOptions.push({ label: modelsList[key].name[this.$store.state.user.language], value: key })
        }
        // sort options in alphabetical order
        this.config.locateItem.selectModel3DOptions = this.config.locateItem.selectModel3DOptions.sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
        if (!this.selectedStep.form.options.hasOwnProperty('model')) {
          this.$set(this.selectedStep.form.options, 'model', this.config.locateItem.selectModel3DOptions[0].value)
        }
        // display 3D model selected by default
        if (this.selectedStep.form.options.is3D) {
          if (this.selectedStep.form.options.customModel) {
            await this.displayARObject(this.selectedStep.form.options.customModel, this.questId)
          } else {
            await this.displayARObject(this.selectedStep.form.options.model)
          }
        }
      } else if (this.options.type.code === 'locate-marker') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.$set(this.selectedStep.form, 'answers', markersList[0])
        }

        // create options for 3D Model selection
        for (let key in modelsList) {
          this.config.locateItem.selectModel3DOptions.push({ label: modelsList[key].name[this.$store.state.user.language], value: key })
        }
        // sort options in alphabetical order
        this.config.locateItem.selectModel3DOptions = this.config.locateItem.selectModel3DOptions.sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
        if (!this.selectedStep.form.options.hasOwnProperty('model')) {
          this.$set(this.selectedStep.form.options, 'model', this.config.locateItem.selectModel3DOptions[0].value)
        }
        // default mode: scan code
        if (!this.selectedStep.form.options.hasOwnProperty('mode')) {
          this.$set(this.selectedStep.form.options, 'mode', 'scan')
        }
      } else if (this.options.type.code === 'wait-for-event' || this.options.type.code === 'trigger-event') {
        if (!this.selectedStep.form.options.hasOwnProperty('protocol')) {
          this.$set(this.selectedStep.form.options, 'protocol', 'bluetooth')
        }
        if (!this.selectedStep.form.options.hasOwnProperty('object')) {
          if (this.options.type.code === 'wait-for-event') {
            this.$set(this.selectedStep.form.options, 'object', 'distance')
          } else {
            this.$set(this.selectedStep.form.options, 'object', 'lcd')
          }
          this.updateIotStepOptions()
        }
        if (this.options.type.code === 'trigger-event' && !this.selectedStep.form.options.hasOwnProperty('triggerMode')) {
          this.$set(this.selectedStep.form.options, 'triggerMode', 'auto')
        }
      } else if (this.options.type.code === 'image-over-flow') {
        let defaultValues = {
          fullWidthPicture: false,
          fullHeightPicture: false,
          snapshotAllowed: false,
          redFilter: false
        }
        this.selectedStep.form.options = Object.assign(defaultValues, this.selectedStep.form.options)
      }

      this.originalStepData = utils.clone(this.selectedStep.form)

      // init the conditions form
      await this.changeNewConditionType()

      // init the chapters list
      await this.listChapters(this.questId, this.quest.version, this.lang)
    },
    async checkAndSubmit(test) {
      // check text length
      if (this.checkMainTextLength(this.selectedStep.form.text[this.lang])) {
        await this.submitStep(test)
      } else {
        this.$q.dialog({
          dark: true,
          message: this.$t('label.TextTooLongForStep', {nb: this.mainTextMaxLength}),
          cancel: true
        }).onOk(async (data) => {
          await this.submitStep(test)
        }).onCancel(() => {
          return false
        })
      }
    },
    /*
     * Submit step data
     */
    async submitStep(test) {
      this.$v.selectedStep.form.$touch()

      // treat form errors (based on validation rules)
      if (this.$v.selectedStep.form.$error) {
        Notification(this.$t('label.StepSettingsFormError'), 'error')
        return
      }

      // format answer based on the type of step
      if (this.options.type.code === 'choose') {
        if (this.config.choose.answerType === 'text') {
          for (let i = 0; i < this.selectedStep.form.options.items.length; i++) {
            if (this.selectedStep.form.options && this.selectedStep.form.options.items && this.selectedStep.form.options.items[i] && this.selectedStep.form.options.items[i].textLanguage) {
              this.selectedStep.form.options.items[i].textLanguage[this.lang] = this.selectedStep.form.options.items[i].text
            } else {
              let text = {}
              text[this.lang] = this.selectedStep.form.options.items[i].text
              this.selectedStep.form.options.items[i].textLanguage = text
            }
          }
          // clear all images => playStep.vue will consider that player should choose between text options
          this.selectedStep.form.options.items = this.selectedStep.form.options.items.map((option) => { option.imagePath = null; return option })
        }
        this.selectedStep.form.answers = this.config.choose.answers.sort().join("|")
        if (this.config.choose.answers.length < 1) {
          Notification(this.$t('label.StepSettingsFormError'), 'error')
          return
        } else if (this.config.choose.answers.length > 1) {
          this.selectedStep.form.options.multipleAnswers = true
        } else {
          this.selectedStep.form.options.multipleAnswers = false
        }
      }
      if (this.options.type.code === 'character') {
        /*if (!this.selectedStep.form.options.character) {
          this.selectedStep.form.options.character = "1"
        }*/
        this.selectedStep.form.options.multiple = this.config.character.multiple
      }
      if (this.options.type.code === 'code-keypad') {
        this.selectedStep.form.options.codeLength = this.selectedStep.form.answers.length
      }
      if (this.options.type.code === 'code-color') {
        this.selectedStep.form.answers = this.unformatedAnswer.join('|')
        this.selectedStep.form.options.colors = this.config.colorCode.colorsForCode
      }
      if (this.options.type.code === 'code-image') {
        this.selectedStep.form.answers = this.unformatedAnswer.join('|')
      }
      if (this.options.type.code === 'write-text') {
        // trim all answers
        for (let i = 0; i < this.selectedStep.form.answers.length; i++) {
          this.selectedStep.form.answers[i] = utils.removeAccents(this.selectedStep.form.answers[i].trim())
        }
      }
      if (this.options.type.code === 'jigsaw-puzzle') {
        // build random order for jigsaw puzzle pieces.
        var level = parseInt(this.selectedStep.form.options.level, 10)
        var nbPieceByRow = this.config.jigsaw.nbPiecesByLevel[level]
        let piecePositionArray = utils.buildIncrementalArray(Math.pow(nbPieceByRow, 2))
        piecePositionArray = utils.shuffle(piecePositionArray)
        this.selectedStep.form.answers = piecePositionArray.join('|')
      }
      if (this.options.type.code === 'memory') {
        if (Array.isArray(this.selectedStep.form.options.items) && this.selectedStep.form.options.items.length > 0) {
          // force "reset" of .single property for all items
          // (new items may have been added after the original "latest")
          this.selectedStep.form.options.items.map((item) => { item.single = false; return item })
          if (this.selectedStep.form.options.lastIsSingle) {
            this.selectedStep.form.options.items[this.selectedStep.form.options.items.length - 1].single = true
          }
        }
      }
      if (this.options.type.code === 'portrait-robot') {
        //no specific action
      }
      if (this.options.type.code === 'end-chapter') {
        if (this.config.endChapter.moveToNextStep) {
          this.selectedStep.form.options.chapterId = ""
        }
      }
      if (this.options.type.code === 'find-item') {
        //Coordinates are already set
      }
      if (this.options.type.code === 'use-item') {
        this.selectedStep.form.answers = {coordinates: this.selectedStep.form.answerPointerCoordinates, item: this.selectedStep.form.answerItem}
        if (this.selectedStep.form.options.removeObjectAfterUse) {
          this.selectedStep.form.options.stepOfObjectToRemove = this.config.useItem.stepsOfItems[this.selectedStep.form.answerItem]
        }
      }
      if (this.options.type.code === 'new-item') {
        if (!this.selectedStep.form.options.titles) {
          this.selectedStep.form.options.titles = {}
        }
        this.selectedStep.form.options.titles[this.lang] = this.selectedStep.form.options.title
        if (!this.selectedStep.form.options.pictures) {
          this.selectedStep.form.options.pictures = {}
        }
        if (!this.selectedStep.form.options.pictures[this.lang]) {
          this.selectedStep.form.options.pictures[this.lang] = this.selectedStep.form.options.picture
        }
        //this.selectedStep.form.answers = this.selectedStep.form.answerItem
      }
      // save step data
      let newStepData = Object.assign(this.selectedStep.form, {
        questId: this.questId,
        updateClones: this.updateClones,
        version: this.quest.version,
        chapterId: this.options.chapterId,
        type: this.options.type.code
      })
      this.$q.loading.show()
      let stepData = await StepService.save(newStepData)
      this.$q.loading.hide()

      if (test === true) {
        if (stepData && stepData.data && stepData.data.stepId) {
          // send change event to parent, with stepId information
          newStepData.id = stepData.data.stepId
          newStepData.stepId = stepData.data.stepId
          this.$emit('change', newStepData)
        } else {
          Notification(this.$t('label.TechnicalIssue'), 'error')
        }
      }
      else if (test === false) {
        Notification(this.$t('label.StepSaved'), 'success')
        this.$emit('close');
      }
    },

    /*
     * Add an answer in the multiple choice step
     */
    addAnswer: function () {
      if (this.selectedStep.form.options.items.length >= this.config.choose.maxNbAnswers) {
        Notification(this.$t('label.YouCantAddMoreThanNbAnswers', { nb: this.config.choose.maxNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.items.push({
          isRightAnswer: false,
          text: this.$t('label.AnswerNb', { nb: (this.selectedStep.form.options.items.length + 1) }), // text default data
          imagePath: null // image default data
        })
      }
    },
    /*
     * Add an answer in the memory step
     */
    addMemoryAnswer: function () {
      if (this.selectedStep.form.options.items.length >= this.config.memory.maxNbAnswers) {
        Notification(this.$t('label.YouCantAddMoreThanNbAnswers', { nb: this.config.memory.maxNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.items.push({
          imagePath: null, // image default data
          single: false
        })
      }
    },
    /*
     * Add a picture answer in the multiple choice step
     */
    addCodeAnswer: function () {
      if (this.selectedStep.form.options.images.length >= this.config.imageCode.maxNbAnswers) {
        Notification(this.$t('label.YouCantAddMoreThanNbAnswers', { nb: this.config.imageCode.maxNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.images.push({
          imagePath: null // image default data
        })
      }
    },

    /*
     * Delete an answer in the multiple choice step
     */
    deleteAnswer: function (key) {
      if (this.selectedStep.form.options.items.length <= this.config.choose.minNbAnswers) {
        Notification(this.$t('label.YouMustDefineAtLeastNbAnswers', { nb: this.config.choose.minNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.items.splice(key, 1)
        // remove answer from selected answers
        if (this.config.choose.answers.indexOf(key) !== -1) {
          this.config.choose.answers.splice(this.config.choose.answers.indexOf(key), 1)
        }
      }
    },
    /*
     * Add a picture answer in the multiple choice step
     */
    deleteCodeAnswer: function (key) {
      if (this.selectedStep.form.options.images.length <= this.config.choose.minNbAnswers) {
        Notification(this.$t('label.YouMustDefineAtLeastNbAnswers', { nb: this.config.choose.minNbAnswers }), 'error')
      } else {
        // change code if the code answer is used in the code
        for (var i  = 0; i < this.unformatedAnswer.length; i++) {
          if (this.unformatedAnswer[i].toString() === key.toString()) {
            if (key.toString() === '0') {
              this.unformatedAnswer[i] = 1
            } else {
              this.unformatedAnswer[i] = 0
            }
          } else if (this.unformatedAnswer[i].toString() > key.toString()) {
            this.unformatedAnswer[i]--
          }
        }
        this.selectedStep.form.options.images.splice(key, 1)
      }
    },
    /*
     * Change the number of digits in code
     */
    changeDigitsNumberInCode: function() {
      if (this.options.type.code === 'code-color') {
        this.unformatedAnswer.length = 0
        const codeLength = parseInt(this.selectedStep.form.options.codeLength, 10)
        while (codeLength > this.unformatedAnswer.length) {
          this.unformatedAnswer.push('#FF0000')
        }
      } else if (this.options.type.code === 'code-image') {
        this.unformatedAnswer.length = 0
        const codeLength = parseInt(this.selectedStep.form.options.codeLength, 10)
        while (codeLength > this.unformatedAnswer.length) {
          this.unformatedAnswer.push(0)
        }
      }
    },
    /*
     * Display next image in the image code step
     * @param   {String}    key            index of the current image in the array
     */
    nextCodeAnswer: function(key) {
      this.unformatedAnswer[key]++
      var nbImagesUploaded = this.getNbImageUploadedForCode()
      if (this.unformatedAnswer[key] >= nbImagesUploaded) {
        this.unformatedAnswer[key] = 0
      }
      // force src refresh
      document.getElementById('image-code-setting-' + key).src = this.uploadUrl + '/upload/quest/' + this.questId + '/step/code-image/' + this.selectedStep.form.options.images[this.unformatedAnswer[key]].imagePath
    },
    /*
     * Display previous image in the image code step
     * @param   {String}    key            index of the current image in the array
     */
    previousCodeAnswer: function(key) {
      this.unformatedAnswer[key]--
      var nbImagesUploaded = this.getNbImageUploadedForCode()
      if (this.unformatedAnswer[key] < 0) {
        this.unformatedAnswer[key] = nbImagesUploaded - 1
      }
      // force src refresh
      document.getElementById('image-code-setting-' + key).src = this.uploadUrl + '/upload/quest/' + this.questId + '/step/code-image/' + this.selectedStep.form.options.images[this.unformatedAnswer[key]].imagePath
    },
    /*
     * change item in portrait robot
     * @param   {String}    type    type of item to change
     */
    changePortraitPart: function(type) {
      if (this.selectedStep.form.answers.items) {
        Vue.set(this.selectedStep.form.answers.items, type, this.selectedStep.form.answers.items[type] + 1)
        if (this.selectedStep.form.answers.items[type] > this.config.portrait[type].number) {
          Vue.set(this.selectedStep.form.answers.items, type, 1)
        }
      }
    },
    /*
     * Get number of images in the image code step
     */
    getNbImageUploadedForCode() {
      var nbImagesUploaded = 0
      for (var i = 0; i < this.selectedStep.form.options.images.length; i++) {
        if (this.selectedStep.form.options.images[i] && this.selectedStep.form.options.images[i].imagePath) {
          nbImagesUploaded++
        }
      }
      return nbImagesUploaded
    },
    /*
     * Format the conditions to by understandable
     */
    async getUnderstandableConditions() {
      this.selectedStep.formatedConditions.length = 0

      for (var i = 0; i < this.selectedStep.form.conditions.length; i++) {
        var condition = this.selectedStep.form.conditions[i]
        var conditionParts = condition.split("_")
        if (conditionParts[0] === 'stepDone' || conditionParts[0] === 'stepSuccess' || conditionParts[0] === 'stepFail' || conditionParts[0] === 'stepAnswerNb' || conditionParts[0] === 'stepRandom') {
          const stepData = await StepService.getById(conditionParts[1], this.quest.version, 'all')
          if (stepData && stepData.data && stepData.data.hasOwnProperty("title")) {
            let condStepTitle = stepData.data.title[this.lang] ? stepData.data.title[this.lang] : stepData.data.title[Object.keys(stepData.data.title)[0]]
            if (conditionParts[0] === 'stepDone') {
              this.selectedStep.formatedConditions.push(this.$t("label.FollowStep") + " <i>" + condStepTitle + "</i>")
            }
            if (conditionParts[0] === 'stepSuccess') {
              this.selectedStep.formatedConditions.push(this.$t("label.StepSuccess") + " <i>" + condStepTitle + "</i>")
            }
            if (conditionParts[0] === 'stepFail') {
              this.selectedStep.formatedConditions.push(this.$t("label.StepFail") + " <i>" + condStepTitle + "</i>")
            }
            if (conditionParts[0] === 'stepAnswerNb') {
              this.selectedStep.formatedConditions.push(this.$t("label.AnswerNumber") + " " + conditionParts[2] + " " + this.$t("label.To") + " <i>" + condStepTitle + "</i>")
            }
            if (conditionParts[0] === 'stepRandom') {
              this.selectedStep.formatedConditions.push(this.$t("label.StepRandom") + " <i>" + condStepTitle + "</i>")
            }
          } else {
            this.selectedStep.formatedConditions.push(this.$t("label.InvalidCondition"))
          }
        }
        if (conditionParts[0] === 'counter') {
          this.selectedStep.formatedConditions.push(this.$t("label.StepCounter") + " <i>" + conditionParts[1] + "</i>")
        }
        if (conditionParts[0] === 'countergreater') {
          this.selectedStep.formatedConditions.push(this.$t("label.StepCounterGreater") + " <i>" + conditionParts[1] + "</i>")
        }
        if (conditionParts[0] === 'counterlower') {
          this.selectedStep.formatedConditions.push(this.$t("label.StepCounterLower") + " <i>" + conditionParts[1] + "</i>")
        }
        if (conditionParts[0] === 'combineobject') {
          this.selectedStep.formatedConditions.push(this.$t("label.StepCombineObject") + " <i><img src='" + (conditionParts[1].indexOf('statics/') !== -1 ? conditionParts[1] : this.uploadUrl + '/upload/quest/' + this.questId + '/step/new-item/' + conditionParts[1]) + "' style='width: 40px' /></i>")
        }

        if (conditionParts[0] === 'chapterTimerOver') {
          this.selectedStep.formatedConditions.push(this.$t("label.StepChapterTimerOver"))
        }
        if (conditionParts[0] === 'haveobject') {
          for (let pictureUrl in this.config.useItem.stepsOfItems) {
            if (this.config.useItem.stepsOfItems[pictureUrl] === conditionParts[1]) {
              this.selectedStep.formatedConditions.push(this.$t("label.StepHaveObject") + " <i><img src='" + (pictureUrl.indexOf('statics/') !== -1 ? pictureUrl : this.uploadUrl + '/upload/quest/' + this.questId + '/step/new-item/' + pictureUrl) + "' style='width: 40px' /></i>")
            }
          }  
        }
        if (conditionParts[0] === 'nothaveobject') {
          for (let pictureUrl in this.config.useItem.stepsOfItems) {
            if (this.config.useItem.stepsOfItems[pictureUrl] === conditionParts[1]) {
              this.selectedStep.formatedConditions.push(this.$t("label.StepNotHaveObject") + " <i><img src='" + (pictureUrl.indexOf('statics/') !== -1 ? pictureUrl : this.uploadUrl + '/upload/quest/' + this.questId + '/step/new-item/' + pictureUrl) + "' style='width: 40px' /></i>")
            }
          }  
        }
      }
    },
    /*
     * Remove a condition
     */
    async deleteCondition(index) {
      this.selectedStep.form.conditions.splice(index, 1)
      this.selectedStep.formatedConditions.splice(index, 1)
    },
    /*
     * update the conditions values
     */
    async changeNewConditionType() {
      this.selectedStep.newCondition.values.length = 0
      const stepsTypesWithSuccessOrFail = ['geolocation', 'locate-item-ar', 'choose', 'write-text', 'code-keypad', 'code-color', 'code-image', 'find-item', 'use-item', 'jigsaw-puzzle', 'memory']
      // For stepDone, StepFail, StepRandom or StepSuccess
      if (this.selectedStep.newCondition.selectedType === 'stepDone' || this.selectedStep.newCondition.selectedType === 'stepSuccess' || this.selectedStep.newCondition.selectedType === 'stepFail' || this.selectedStep.newCondition.selectedType === 'stepRandom') {
        const response = await StepService.listForAChapter(this.questId, this.selectedStep.form.chapterId, this.quest.version, 'all')
        if (response && response.data && response.data.length > 0) {
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].stepId.toString() !== this.stepId.toString()) {
              if (this.selectedStep.newCondition.selectedType === 'stepDone' ||
                this.selectedStep.newCondition.selectedType === 'stepRandom' ||
                stepsTypesWithSuccessOrFail.indexOf(response.data[i].type) !== -1
              ) {
                let condStepTitle = response.data[i].title[this.lang] ? response.data[i].title[this.lang] : response.data[i].title[Object.keys(response.data[i].title)[0]]
                this.selectedStep.newCondition.values.push({label: condStepTitle, value: response.data[i].stepId})
              }
            }
          }
        }
      }
      // For StepAnswerNb => only QCM
      if (this.selectedStep.newCondition.selectedType === 'stepAnswerNb') {
        const response = await StepService.listForAChapter(this.questId, this.selectedStep.form.chapterId, this.quest.version, 'all')
        if (response && response.data && response.data.length > 0) {
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].stepId.toString() !== this.stepId.toString()) {
              if (response.data[i].type == "choose") {
                let condStepTitle = response.data[i].title[this.lang] ? response.data[i].title[this.lang] : response.data[i].title[Object.keys(response.data[i].title)[0]]
                this.selectedStep.newCondition.values.push({label: condStepTitle, value: response.data[i].stepId})
              }
            }
          }
        }
      }
    },
    /*
     * Save a new condition
     */
    async saveNewCondition() {
      // Update conditions array
      if (this.selectedStep.newCondition.selectedType !== '' && (this.selectedStep.newCondition.selectedValue !== '' || this.selectedStep.newCondition.selectedObject !== '')) {
        if (this.selectedStep.newCondition.selectedType === 'stepDone') {
          // prevent from having several stepDone conditions (only one possible)
          /*for (var i = 0; i < this.selectedStep.form.conditions.length; i++) {
            var condition = this.selectedStep.form.conditions[i]
            var conditionParts = condition.split("_")
            if (conditionParts[0] === "stepDone") {
              Notification(this.$t('label.YourStepCanOnlyFollowOneStep'), 'error')
              return false
            }
          }*/
          this.selectedStep.form.conditions.push('stepDone_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'stepSuccess') {
          this.selectedStep.form.conditions.push('stepSuccess_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'stepFail') {
          this.selectedStep.form.conditions.push('stepFail_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'stepAnswerNb') {
          this.selectedStep.form.conditions.push('stepAnswerNb_' + this.selectedStep.newCondition.selectedValue + "_" + this.selectedStep.newCondition.answerNumber)
        }
        if (this.selectedStep.newCondition.selectedType === 'stepRandom') {
          this.selectedStep.form.conditions.push('stepRandom_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'counter') {
          this.selectedStep.form.conditions.push('counter_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'countergreater') {
          this.selectedStep.form.conditions.push('countergreater_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'counterlower') {
          this.selectedStep.form.conditions.push('counterlower_' + this.selectedStep.newCondition.selectedValue)
        }
        if (this.selectedStep.newCondition.selectedType === 'combineobject') {
          this.selectedStep.form.conditions.push('combineobject_' + this.selectedStep.newCondition.selectedObject)
        }
        if (this.selectedStep.newCondition.selectedType === 'haveobject') {
          this.selectedStep.form.conditions.push('haveobject_' + this.config.useItem.stepsOfItems[this.selectedStep.newCondition.selectedObject])
        }
        if (this.selectedStep.newCondition.selectedType === 'nothaveobject') {
          this.selectedStep.form.conditions.push('nothaveobject_' + this.config.useItem.stepsOfItems[this.selectedStep.newCondition.selectedObject])
        }
      }

      if (this.selectedStep.newCondition.selectedType === 'chapterTimerOver') {
        this.selectedStep.form.conditions.push('chapterTimerOver')
      }
      this.getUnderstandableConditions()
      await this.resetNewConditionForm()
      this.selectedStep.newConditionForm = false
    },
    /*
     * Reset condition form
     */
    async resetNewConditionForm() {
      this.selectedStep.newCondition.selectedType = 'stepDone'
      await this.changeNewConditionType()
      this.selectedStep.newCondition.selectedValue = ''
    },
    /*
     * Reset condition form
     */
    async listChapters(id, version, lang) {
      let chapters = await StepService.listChapters(id, version, lang)
      if (chapters && chapters.data) {
        for (var i = 0; i < chapters.data.length; i++) {
          this.selectedStep.chapters.push({label: chapters.data[i].title, value: chapters.data[i].chapterId})
        }
      }
    },
    async changeChapter(chapterId) {
      //this.selectedStep.form.chapterId = chapterId
      Vue.set(this.selectedStep.form, 'chapterId', chapterId)
      Vue.set(this.options, 'chapterId', chapterId)
      this.$forceUpdate()
      // reset the conditions form
      for (var i = 0; i < this.selectedStep.form.conditions.length; i++) {
        this.deleteCondition(0)
      }
    },
    showHelpPopup (message) {
      this.$q.dialog({
        message: this.$t('label.' + message)
      })
    },
    /*
     * Upload the background image
     * @param   {Object}    e            Upload data
     */
    async uploadBackgroundImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadBackgroundImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          /*if (!this.selectedStep.form.backgroundImage) {
            this.selectedStep.form.backgroundImage = {}
          }*/
          this.selectedStep.form.backgroundImage[this.lang] = uploadResult.data.file
          this.displayBackgroundImageSize(this.selectedStep.form.backgroundImage[this.lang])
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
      //this.hideMedia()
    },
    displayBackgroundImageSize(fileName) {
      this.media.isSimulated = true
      this.media.simulationPicture = this.uploadUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName
      /*var sc1 = document.getElementById('screensize1')
      var sc2 = document.getElementById('screensize2')
      var sc3 = document.getElementById('screensize3')
      sc1.style.backgroundImage = "url('" + this.uploadUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName + "')"
      sc2.style.backgroundImage = "url('" + this.uploadUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName + "')"
      sc3.style.backgroundImage = "url('" + this.uploadUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName + "')"
      sc1.onload = function() { URL.revokeObjectURL(sc1.src) }// free memory
      sc2.onload = function() { URL.revokeObjectURL(sc2.src) }// free memory
      sc3.onload = function() { URL.revokeObjectURL(sc3.src) }// free memory */
    },
    /*
     * Reset the background image
     */
    async resetBackgroundImage() {
      this.selectedStep.form.backgroundImage[this.lang] = null
      // reset input to let admin add the same picture again
      if (document.getElementById("picturefile1")) {
        document.getElementById("picturefile1").value = ""
      }
      /*if (document.getElementById("picturefile2")) {
        document.getElementById("picturefile2").value = ""
      }*/
    },
    /*
     * Upload a video
     * @param   {Object}    e            Upload data
     */
    async uploadVideo(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.selectedStep.form.videoStream[this.lang] = null // Hack added by EMA because video was not updating visually
      this.$q.loading.show()
      var data = new FormData()
      data.append('video', files[0])
      let uploadResult = await StepService.uploadVideo(this.questId, data)

      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          if (!this.selectedStep.form.videoStream) {
            this.selectedStep.form.videoStream = {}
          }
          this.selectedStep.form.videoStream[this.lang] = uploadResult.data.file
          this.$forceUpdate()
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload the picture for the image regognition step
     * @param   {Object}    e            Upload data
     */
    async uploadImageToRecognize(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadImageToRecognize(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          this.selectedStep.form.answers = uploadResult.data.file
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a picture for the multiple choice step
     * @param   {Object}    e            Upload data
     */
    async uploadAnswerImage(key, e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadAnswerImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          this.selectedStep.form.options.items[key].imagePath = uploadResult.data.file
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a picture for the memory step
     * @param   {Object}    e            Upload data
     */
    async uploadMemoryImage(key, e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])

      let uploadResult = await StepService.uploadMemoryImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          this.selectedStep.form.options.items[key].imagePath = uploadResult.data.file
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Delete an answer in the memory game
     */
    deleteMemoryAnswer: function (key) {
      if (this.selectedStep.form.options.items.length <= this.config.memory.minNbAnswers) {
        Notification(this.$t('label.YouMustDefineAtLeastNbAnswers', { nb: this.config.memory.minNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.items.splice(key, 1);
      }
    },
    /*
     * Upload a picture for the image code step
     * @param   {Object}    e            Upload data
     */
    async uploadCodeAnswerImage(key, e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadCodeAnswerImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          this.selectedStep.form.options.images[key].imagePath = uploadResult.data.file
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a picture for the puzzle
     * @param   {Object}    e            Upload data
     */
    async uploadPuzzleImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadPuzzleImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          if (!this.selectedStep.form.options.picture) {
            this.selectedStep.form.options.picture = {}
          }
          //this.selectedStep.form.options.picture[lang] = uploadResult.data.file
          Vue.set(this.selectedStep.form.options.picture, this.lang, uploadResult.data.file)
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload an inventory item picture
     * @param   {Object}    e            Upload data
     */
    async uploadItemImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadItemImage(this.questId, this.options.type.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          Vue.set(this.selectedStep.form.options, 'picture', uploadResult.data.file)
          if (this.selectedStep.form.options.pictures) {
            this.selectedStep.form.options.pictures[this.lang] = uploadResult.data.file
          }
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a picture for the map
     * @param   {Object}    e            Upload data
     */
    async uploadLocatorImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadItemImage(this.questId, this.options.type.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          Vue.set(this.selectedStep.form.options, 'locator', uploadResult.data.file)
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a picture below the button
     * @param   {Object}    e            Upload data
     */
    async uploadImageBelowButton(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadImageBelow(this.questId, this.options.type.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          Vue.set(this.selectedStep.form.options, 'imageBelow', uploadResult.data.file)
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a 3D object
     * @param   {Object}    e            Upload data
     */
    async uploadItemObject(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadItemObject(this.questId, this.options.type.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          this.selectedStep.form.options.customModel = uploadResult.data.file

          await this.displayARObject(this.selectedStep.form.options.customModel, this.questId)
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Change the object selected in the 3D object list
     */
    async changeObjectInList() {
      this.selectedStep.form.options.picture = ""
      this.selectedStep.form.options.customModel = null
      await this.displayARObject(this.selectedStep.form.options.model)
    },
    /*
     * Upload a character picture
     * @param   {Object}    e            Upload data
     */
    async uploadCharacterImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadCharacterImage(this.questId, this.options.type.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          Vue.set(this.config.character.multiple[this.config.character.currentScene], 'picture', uploadResult.data.file)
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Upload a picture when a user has clicked
     * @param   {Object}    e            Upload data
     */
    async uploadAlternativeImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      this.$q.loading.show()
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadAlternativeImage(this.questId, this.options.type.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          Vue.set(this.selectedStep.form.options, 'altFile', uploadResult.data.file)
        } else if (uploadResult.data.message && uploadResult.data.message === 'Error: File too large') {
          Notification(this.$t('label.FileTooLarge'), 'error')
        } else {
          Notification(this.$t('label.UnknowUploadError'), 'error')
        }
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },

    /*
    * loads GLTF data, puts object origin at center, sets position of 3D model according to its settings in 3DModels.json
    * @param     modelCode     code of the 3D model, for example "lamp"
    * @return    object        { object: <3D object>, animations: <animations from GLTF data> }
    */
    async loadAndPrepare3DModel(modelCode, questId) {
      let gltfData
      try {
        this.$q.loading.show()
        gltfData = await this.ModelLoaderAsync(modelCode, questId)
        this.$q.loading.hide()
      } catch (err) {
        console.error("Error while loading 3D model:", err)
        Notification(this.$t('label.CouldNotDisplayObject'), 'error')
        return
      }

      let object = gltfData.scene

      // set object origin at center
      let objBbox = new THREE.Box3().setFromObject(object)

      let pivot = objBbox.getCenter(new THREE.Vector3())
      pivot.multiplyScalar(-1)

      let pivotObj = new THREE.Object3D();
      object.applyMatrix4(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
      pivotObj.add(object)
      pivotObj.up = new THREE.Vector3(0, 0, 1)
      object = pivotObj

      object.rotation.z = Math.PI / 4

      return { object, animations: gltfData.animations }
    },
    /*
    * Loads material file and object file into a 3D Model for Three.js
    * Supports only GLB format
    * Returns a Promise, usable with async/await
    */
    async ModelLoaderAsync(objName, questId) {
      let progress = console.log

      return new Promise((resolve, reject) => {
        let gltfLoader = new GLTFLoader()
        // loads automatically .bin and textures files if necessary
        if (objName.indexOf('blob:') !== -1) {
          gltfLoader.load(objName, resolve, progress, reject)
        } else {
          if (questId) {
            gltfLoader.load(this.uploadUrl + '/upload/quest/' + questId + '/step/3dobject/' + objName + '.glb', resolve, progress, reject)
          } else {
            gltfLoader.load(this.serverUrl + '/statics/3d-models/' + objName + '.glb', resolve, progress, reject)
          }
        }
      })
    },
    /*
    * Display a 3D Model for Three.js
    */
    async displayARObject(model, questId) {
      if (this.config.locateItem.object === null) {
        // first execution: append renderer to DOM
        // wait for DOM <div> canvas to be ready/available
        let _this = this
        this.$nextTick(async () => {
          let canvasItem = document.getElementById('target-canvas')
          if (!canvasItem) {
            throw new Error('missing 3D canvas')
          }
          // Create an empty scene
          _this.config.locateItem.scene = new THREE.Scene()

          // Create a basic perspective camera
          let camera = new THREE.PerspectiveCamera(70, 1.333, 0.001, 1000)
          camera.up = new THREE.Vector3(0, 0, 1)
          camera.rotation.x = Math.PI / 2
          camera.lookAt(new THREE.Vector3(0, 0, 0))
          _this.config.locateItem.camera = camera

          // Create a renderer with Antialiasing
          let renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
          canvasItem.appendChild(renderer.domElement)
          _this.config.locateItem.renderer = renderer

          // Configure renderer size
          _this.config.locateItem.renderer.setSize(Math.round(canvasItem.clientWidth), Math.round(canvasItem.clientWidth * 0.8))
          //_this.config.locateItem.renderer.setSize(Math.round(window.innerWidth * 0.8), Math.round(window.innerWidth * 0.6))
          _this.config.locateItem.renderer.gammaOutput = true

          // Add "orbit controls"
          _this.config.locateItem.controls = new OrbitControls(camera, renderer.domElement)

          let light = new THREE.DirectionalLight(0xdddddd)
          light.position.set(0, 1, 1).normalize()
          _this.config.locateItem.scene.add(light)

          // soft ambient light
          _this.config.locateItem.scene.add(new THREE.AmbientLight(0xb0b0b0))

          await _this.displayARObjectEnd(model, questId)

          _this.animateModelPreview()
        })
      } else {
        // renderer already defined => only replace 3D models
        let objectToRemove = this.config.locateItem.scene.getObjectByName(DEMO_OBJECT_NAME)

        // clean previously loaded object
        this.config.locateItem.scene.remove(objectToRemove)

        await this.displayARObjectEnd(model, questId)
      }
    },
    async displayARObjectEnd(model, questId) {
      let ObjectData = await this.loadAndPrepare3DModel(model, questId)

      let object = ObjectData.object
      object.up = new THREE.Vector3(0, 0, 1)
      object.visible = true
      object.name = DEMO_OBJECT_NAME

      this.config.locateItem.scene.add(object)

      // detect object size and adjust default zoom accordingly
      let box = new THREE.Box3().setFromObject(object)
      let size = new THREE.Vector3()
      box.getSize(size)

      this.config.locateItem.zoom = Math.max(size.x, size.y, size.z) * 1.5

      // distance with object
      this.config.locateItem.camera.position.set(0, -this.config.locateItem.zoom, 0)
      this.config.locateItem.controls.update() // orbit controls update is required when camera position changes

      this.config.locateItem.object = object
    },
    animateModelPreview() {
      requestAnimationFrame(this.animateModelPreview)
      this.config.locateItem.renderer.render(this.config.locateItem.scene, this.config.locateItem.camera)
      this.config.locateItem.controls.update()
    },
    /*
     * Change 2D / 3D mode
     */
    async change2D3DObject() {
      await this.changeObjectInList()
    },
    /*
     * Select an object in the list
     * @param   {Number}    key            key in the objects array
     */
    async selectObject(key) {
      this.selectedStep.form.options.title = this.objectsList[key].name[this.lang]
      this.selectedStep.form.options.picture = 'statics/images/object/' + this.objectsList[key].file
      this.selectedStep.form.options.titles[this.lang] = this.selectedStep.form.options.title
      this.selectedStep.form.options.pictures[this.lang] = this.selectedStep.form.options.picture
    },
    /*
     * Get the list of colors for the color code step
     */
    getColorsForCodeOptions() {
      let options = []
      colorsForCode.forEach((code) => {
        options.push({
          value: code.value,
          label: this.$t('color.' + code.label)
        })
      })
      return options
    },
    /*
     * Get the options for the image code step
     */
    getImagesForCodeOptions() {
      let options = []
      return options
    },
    triggerClickOnColorSelect(index) {
      // [0] is required because of v-for, see https://forum-archive.vuejs.org/topic/5190/this-refs-ref_name-on-dynamic-component-is-array-instead-of-vuecomponent/2
      this.$refs['colorSelect' + index][0].$el.click()
    },
    /*
     * Delete a color for color code
     */
    deleteColor(index) {
      this.config.colorCode.colorsForCode.splice(index, 1)
    },
    /*
     * add a color for color code
     */
    addColor() {
      this.config.colorCode.colorsForCode.push({
        value: this.config.colorCode.newColor.value,
        label: this.config.colorCode.newColor.label
      })
      this.config.colorCode.newColor = {label: "", value: ""}
    },
    /*
     * remove a hint
     */
    removeHint(index) {
      this.selectedStep.form.hint[this.lang].splice(index, 1)
      this.$forceUpdate()
    },
    /*
     * update a hint
     */
    updateHint(index) {
      this.$q.dialog({
        dark: true,
        message: this.$t('label.ModifyTheHint'),
        prompt: {
          model: this.selectedStep.form.hint[this.lang][index],
          type: 'text'
        },
        cancel: true
      }).onOk(async (data) => {
        this.selectedStep.form.hint[this.lang][index] = data
        this.$forceUpdate()
      }).onCancel(() => {})
    },
    /*
     * add a hint
     */
    addHint() {
      if (this.selectedStep.form.hint && this.selectedStep.form.hint[this.lang]) {
        this.selectedStep.form.hint[this.lang].push(this.newHint)
      } else {
        if (!this.selectedStep.form.hint) {
          this.selectedStep.form.hint = {}
        }
        this.selectedStep.form.hint[this.lang] = []
        this.selectedStep.form.hint[this.lang].push(this.newHint)
      }

      this.newHint = ""
    },
    /*
     * Get the list of the items won on previous steps
     */
    async getQuestItemsAsOptions() {
      // load items won on previous steps
      var response = await StepService.listWonObjects(this.questId, this.stepId, this.quest.version)
      if (response && response.data) {
        this.questItems = response.data
        let options = []
        this.questItems.forEach((item) => {
          options.push({
            value: item.picture,
            label: item.title
          })
          this.config.useItem.stepsOfItems[item.picture] = item.step
        })
        options.sort((a, b) => { return a.label > b.label ? 1 : -1 })
        this.config.useItem.questItemsAsOptions = options
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
    },
    /*
     * Get the icon of an item
     * @param   {String}    code            Item code
     */
    getItemIcon(code) {
      let item = this.questItems.find(item => item.code === code)
      return typeof item !== 'undefined' ? item.icon : 'clear'
    },
    /*
     * Get the coordinate of a touch on the screen
     * @param   {Object}    ev            Touch event data
     */
    getClickCoordinates(ev) {
      // see https://stackoverflow.com/a/42111623/488666
      let rect = ev.currentTarget.getBoundingClientRect()
      let posX = ev.clientX - rect.left
      let posY = ev.clientY - rect.top

      const pictureWidth = this.getUseItemPictureWidth()

      // relative position between 0 to 100
      this.selectedStep.form.answerPointerCoordinates.left = Math.round(posX * 100 / pictureWidth)
      this.selectedStep.form.answerPointerCoordinates.top = Math.round(posY * (300 / 4) / pictureWidth)
      this.positionUseItemPointer()
    },
    /*
     * Get the coordinate of a touch on the screen
     * @param   {Object}    ev            Touch event data
     */
    getClickCoordinatesFindItem(ev) {
      // see https://stackoverflow.com/a/42111623/488666
      const rect = ev.currentTarget.getBoundingClientRect()
      const posX = ev.clientX - rect.left
      const posY = ev.clientY - rect.top

      const pictureWidth = this.getFindItemPictureWidth()

      // relative position between 0 to 100
      this.selectedStep.form.options.coordinates[this.config.findItem.currentArea].left = Math.round(posX * 100 / pictureWidth)
      this.selectedStep.form.options.coordinates[this.config.findItem.currentArea].top = Math.round(posY * (300 / 4) / pictureWidth)

      this.positionFindItemPointer()
    },
    /*
     * Position the pointer to locate the item for the find item step
     */
    positionFindItemPointer() {
      const vw = this.getFindItemPictureWidth() / 100 // in px

      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      const solutionAreaRadius = this.config.findItem.crossSize / 2
      for (var i = 0; i < 5; i++) {
        if (document.getElementById("cross" + i)) {
          if (i < this.selectedStep.form.options.nbAreas) {
            document.getElementById("cross" + i).style.display = 'block'
            document.getElementById("cross" + i).style.left = Math.round(this.selectedStep.form.options.coordinates[i].left * vw - solutionAreaRadius) + "px"
            document.getElementById("cross" + i).style.top = Math.round(this.selectedStep.form.options.coordinates[i].top * (4 * vw / 3) - solutionAreaRadius) + "px"
          } else {
            document.getElementById("cross" + i).style.display = 'none'
          }
        }
      }
    },
    getFindItemPictureWidth() {
      const picture = this.$refs['findItemPicture']
      return picture.clientWidth
    },
    initFindItemElements() {
      this.config.findItem.imageWidth = this.getFindItemPictureWidth()
      this.config.findItem.crossSize = this.config.findItem.imageWidth / 8
      this.config.findItem.imageHeight = this.config.findItem.imageWidth * 4 / 3
    },
    getUseItemPictureWidth() {
      const picture = this.$refs['useItemPicture']
      return picture.clientWidth
    },
    initUseItemElements() {
      this.config.useItem.imageWidth = this.getUseItemPictureWidth()
      this.config.useItem.crossSize = this.config.useItem.imageWidth / 8
      this.config.useItem.imageHeight = this.config.useItem.imageWidth * 4 / 3
    },
    /*
     * Position the pointer to locate the item for the find item step
     */
    positionUseItemPointer() {
      let vw = this.getUseItemPictureWidth() / 100 // in px

      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      const solutionAreaRadius = this.config.useItem.crossSize / 2

      document.getElementById("cross").style.left = Math.round(this.selectedStep.form.answerPointerCoordinates.left * vw - solutionAreaRadius) + "px"
      document.getElementById("cross").style.top = Math.round(this.selectedStep.form.answerPointerCoordinates.top * (4 * vw / 3) - solutionAreaRadius) + "px"
    },
    /**
     * Opens geolocation popin
     * @param   {Number}   index   index of the GPS location when there are several 'spots' to locate (used by 'geolocation' step type)
     */
    openGeolocationPopin(index) {
      this.config.geolocation.showPopin = true
      this.config.geolocation.currentIndex = index
    },
    /**
     * Save author's GPS location as current step goal
     * @param   {Object}    pos            Position data
     */
    saveMyGPSLocation() {
      let index = this.config.geolocation.currentIndex
      let position = this.config.geolocation.position

      if (index !== -1 && this.selectedStep.form.options.locations && this.selectedStep.form.options.locations.length > 0) {
        this.$set(this.selectedStep.form.options.locations[index], 'lat', position.latitude)
        this.$set(this.selectedStep.form.options.locations[index], 'lng', position.longitude)
      } else {
        this.$set(this.selectedStep.form.options, 'lat', position.latitude)
        this.$set(this.selectedStep.form.options, 'lng', position.longitude)
        this.$v.selectedStep.form.options.lat.$touch()
        this.$v.selectedStep.form.options.lng.$touch()
      }

      Notification(this.$t('label.LocationSaved'), 'success')
      this.config.geolocation.showPopin = false
    },
    /**
     * On user GPS position, update his current coordinates
     * this may look suboptimal, however keeping GPS running for a while helps getting much more accurate coordinates than a single call.
     */
    onNewUserPosition(position) {
      this.$set(this.config.geolocation, 'position', position.coords)
    },
    /**
     * On user GPS position error
     */
    onUserPositionError(ret) {
      console.error('UserPositionError', ret)
    },
    /*
     * Add a GPS location field
     */
    addGPSLocation() {
      if (this.selectedStep.form.options.locations) {
        this.selectedStep.form.options.locations.push({lat: '', lng: '', destination: ''})
      } else {
        this.selectedStep.form.options.locations = [{lat: '', lng: '', destination: ''}]
      }
    },
    removeGPSLocation(index) {
      this.selectedStep.form.options.locations.splice(index, 1)
    },
    /*
     * Check the length of the text input
     * @param   {String}    value            Value of text typed in the input
     */
    checkMainTextLength(value) {
      let maxNbCarriageReturns = 11 // default
      let maxNbChars = this.mainTextMaxLength

      if (this.options.type.textRules && this.options.type.textRules.maxNbCarriageReturns) {
        maxNbCarriageReturns = this.options.type.textRules.maxNbCarriageReturns
      }

      if (value === null || typeof value === 'undefined') {
        value = ''
      }

      // (value.match(/\n/g) || []).length counts number of carriage returns in value.
      // see https://stackoverflow.com/q/881085/488666
      return value.length <= maxNbChars && (value.match(/\n/g) || []).length <= maxNbCarriageReturns
    },
    addWriteTextAnswer() {
      this.selectedStep.form.answers.push("")
    },
    openChooseMarkerModal() {
      this.config.locateMarker.markerModalOpened = true
    },
    closeChooseMarkerModal() {
      this.config.locateMarker.markerModalOpened = false
    },
    selectMarker(code) {
      this.selectedStep.form.answers = code
      this.closeChooseMarkerModal()
    },
    close() {
      if (hash(this.originalStepData) !== hash(this.selectedStep.form)) {
        this.saveChangesModalOpened = true
      } else {
        this.$emit('close')
      }
    },
    getStepType(code) {
      for (let stepType of stepTypes) {
        if (stepType.code === code) {
          return stepType
        }
      }
      console.warn("Could not retrieve step type from code '" + code + "'")
      return null
    },
    /*
     * Show the media panel
     */
    async showMedia() {
      // load quest medias
      await this.loadMedia('background')

      // open the panel
      this.media.isOpened = true
    },
    /*
     * select a media
     */
    async selectMedia(index) {
      this.selectedStep.form.backgroundImage[this.lang] = this.media.items[index].file
      this.hideMedia()
    },
    /*
     * Load the quest media
     */
    async loadMedia(type) {
      // load quest medias
      let media = await QuestService.listMedia(this.quest.questId, this.quest.version, type)

      if (media && media.data) {
        this.media.items = media.data
      }
    },
    /*
     * Hide the media panel
     */
    async hideMedia() {
      this.media.isOpened = false
      this.media.isSimulated = false
      if (this.options.type.code === 'use-item') {
        utils.setTimeout(this.initUseItemElements, 2000)
      }
      if (this.options.type.code === 'find-item') {
        utils.setTimeout(this.initFindItemElements, 2000)
      }
    },
    /**
     * Get iot objects list as options for <q-select>
     * @param   {String}   stepType    Required. Must be either "wait-for-event" or "trigger-event".
     */
    getIotObjectsAsOptions (stepType) {
      if (!['wait-for-event', 'trigger-event'].includes(stepType)) {
        throw new Error('Unsupported step type: ' + stepType)
      }

      let options = []
      iotObjectsList.forEach((object) => {
        if (object.step === stepType) {
          options.push({
            value: object.code,
            label: this.$t('iotObjects.' + object.code)
          })
        }
      })
      options.sort((a, b) => { return a.label > b.label ? 1 : -1 })
      return options
    },
    /**
     * Updates step options data structure (required for view part to avoid undefined errors) when selected IoT object changes
     */
    updateIotStepOptions () {
      // clean possible custom properties first
      let propertiesToClean = ['range', 'rangeX', 'rangeY', 'message', 'answer']
      for (let i = 1; i <= 3; i++) {
        propertiesToClean.push('range' + i)
      }
      for (let prop of propertiesToClean) {
        delete this.selectedStep.form.options[prop]
      }

      switch (this.selectedStep.form.options.object) {
        case 'keypad':
          this.$set(this.selectedStep.form.options, 'answer', '')
          break
        case 'joystick':
          this.$set(this.selectedStep.form.options, 'rangeX', { min: 100, max: 200 })
          this.$set(this.selectedStep.form.options, 'rangeY', { min: 100, max: 200 })
          break
        case 'distance':
          this.$set(this.selectedStep.form.options, 'range', { min: 50, max: 150 })
          break
        case 'pot':
          for (let i = 1; i <= 3; i++) {
            this.$set(this.selectedStep.form.options, 'range' + i, { min: 100, max: 200 })
          }
          break
        case 'escapebox':
          break
        case 'lcd':
          this.$set(this.selectedStep.form.options, 'message', '')
          break
        case 'buzzer':
          this.$set(this.selectedStep.form.options, 'duration', 1000)
          this.$set(this.selectedStep.form.options, 'frequency', 440)
          break
        case 'chest':
          break
        case 'relay':
          break
        default:
          throw new Error("unknown IoT object code '" + this.selectedStep.form.options.object + "'")
      }
    },
    async activateCountDown (param) {
     var _this = this;
      if (param === true) {
         this.$q.dialog({
          dark: true,
          message: this.$t('label.CountDownWarning'),
          ok: true,
          cancel: true
        }).onCancel(async () => {
          _this.selectedStep.form.countDownTime.enabled = false;
        })
      }
    },
    selectFindItemArea (index) {
      for (var i = 0; i < this.selectedStep.form.options.nbAreas; i++) {
        if (document.getElementById('cross' + i)) {
          document.getElementById('cross' + i).style.opacity = 0.5
        }
      }
      if (document.getElementById('cross' + index)) {
        document.getElementById('cross' + index).style.opacity = 1
      }
      this.config.findItem.currentArea = index
    },
    changeNbAreas () {
      if (this.selectedStep.form.options && this.selectedStep.form.options.coordinates) {
        if (this.selectedStep.form.options.coordinates.length < this.selectedStep.form.options.nbAreas) {
          for (var i = this.selectedStep.form.options.coordinates.length; i < this.selectedStep.form.options.nbAreas; i++) {
            this.selectedStep.form.options.coordinates.push({top: 50, left: 50})
          }
          //this.selectedStep.form.answers.coordinates.length = this.selectedStep.form.options.nbAreas
          this.config.findItem.currentArea = this.selectedStep.form.options.coordinates.length - 1
          this.selectFindItemArea(this.config.findItem.currentArea - 1)
        } else {
          this.selectedStep.form.options.coordinates.length = this.selectedStep.form.options.nbAreas
          this.config.findItem.currentArea = this.selectedStep.form.options.coordinates.length - 1
        }
      }
      this.positionFindItemPointer()
      return true
    },
    /**
     * @param modeLabel {String} geolocation mode label ('CompassMode' or 'MapMode')
     */
    showGeolocationModeHelp (modeLabel) {
      this.$q.dialog({
        title: this.$t('label.' + modeLabel),
        message: this.$t('label.' + modeLabel + 'Help')
      })
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
      let uploadAudioResult = await StepService.uploadAudio(this.quest.questId, data)
      if (uploadAudioResult && uploadAudioResult.hasOwnProperty('data')) {
        if (uploadAudioResult.data.file) {
          Notification(this.$t('label.UploadSucessful'), 'positive')
          this.$set(this.selectedStep.form.audioStream, this.lang, uploadAudioResult.data.file)
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
      this.selectedStep.form.audioStream[this.lang] = ""
    },
    selectCharacter(n) {
      Vue.set(this.config.character.multiple[this.config.character.currentScene], 'picture', n.toString())
      //this.selectedStep.form.options.character = n.toString()
    },
    addAnotherCharacter() {
      this.config.character.multiple.push({
        picture: "1",
        text: {fr: '', en: ''},
        position: 'right'
      })
      //this.config.character.multiple[this.config.character.multiple.length - 1].text[this.lang] = ""
    },
    moveCharacter(index, position) {
      this.config.character.multiple[index].position = position
    },
    removeCharacter(index) {
      this.config.character.multiple.splice(index, 1)
    }
  },
  validations() {
    let fieldsToValidate = {
      title: {},
      text: {}
    }

    fieldsToValidate.title[this.lang] = { required }
    //fieldsToValidate.text[this.lang] = { }//function(value) { return this.checkMainTextLength(value) } }
    
    // alphabetical order
    switch (this.options.type.code) {
      case 'choose':
        fieldsToValidate.options = {
          items: {
            $each: this.config.choose.answerType === 'text' ? { text: { required }, imagePath: {} } : { text: {}, imagePath: { required } }
          }
        }
        break
      case 'code-keypad':
        fieldsToValidate.answers = { required,
          function(value) {
            let regexp = new RegExp("^([0-9*#]{2,10})$", "g")
            return regexp.test(value)
          }
        }
        break
      case 'find-item':
        fieldsToValidate.backgroundImage = { required }
        break
      case 'geolocation':
        //fieldsToValidate.options = { locator: { required } }
        break
      case 'info-video':
        fieldsToValidate.videoStream = { required }
        break
      case 'jigsaw-puzzle':
        fieldsToValidate.options = { picture: { required } }
        break
      case 'new-item':
        fieldsToValidate.options = { picture: { required }, title: { required } }
        break
      //case 'character':
        //fieldsToValidate.options = { character: { required } }
        //break
      case 'use-item':
        fieldsToValidate.backgroundImage = { required }
        fieldsToValidate.answerItem = { required }
        break
      case 'write-text':
        fieldsToValidate.answers = { required }
        break
      case 'locate-item-ar':
        fieldsToValidate.options = { lat: { required }, lng: { required } }
        if (this.selectedStep.form.options.is3D) {
          fieldsToValidate.options.model = { required }
        } else { // 2D
          fieldsToValidate.options.picture = { required }
        }
        break
      case 'touch-object-on-marker':
        fieldsToValidate.options = { model: { required } }
        break
      case 'wait-for-event':
        fieldsToValidate.options = { protocol: { required }, object: { required } }
        break
    }

    return { selectedStep: { form: fieldsToValidate } }
  }
}
</script>

<style scoped>

h1 { margin-top: 0; }
h2 { font-size: 1.2rem; color: grey; line-height: 3rem; margin-bottom: 0; }
p { margin-bottom: 0.5rem; }

.q-item { padding-top: 0; padding-bottom: 0; min-height: 2rem; }
.q-list { padding-top: 0; }
.q-slider { margin-top: 2rem; }

.q-card h1 { font-size: 2rem; line-height: 2rem; }
.warning { color: #F2C037; }

.answer { display: flex; flex-flow: row nowrap; align-items: center; }
.answer .q-input { flex-grow: 1; }
.answer p { min-width: 1rem; margin: 0; }
.answer img { width: 50vw; max-width: 450px; }
.answer .q-radio { padding-right: 0.5rem; }
.answer .q-btn { margin: 0.2rem; }
.answer .error-label { flex-grow: 1; }
.add-answer { margin: 0.5rem auto; }

.background-upload { padding-bottom: 10px; margin-bottom: 10px; background: #efefef; text-align: center;}

.code-color h2 { margin-bottom: 0; }
.code-color table { margin: auto; }
.code-color table td { padding: 0rem; }
.code-color .color-bubble { display: block; width: 4rem; height: 4rem; border: 4px solid black; border-radius: 2rem; transition: background-color 0.3s; }

.code-image table { width: 100% }
.code-image td img { width: 100% }
.code-image td .q-icon { font-size: 2em }
.code-image .answer p { flex-grow: 1 }

.locate-item-ar .q-radio { padding:0.5rem 1rem; }

.locate-marker p, .modal .q-btn { display: flex; align-items: center; }
.locate-marker p img,  .modal .q-btn img { width: 20vw; height: 20vw; flex-grow: 0 }
.locate-marker p span, .modal .q-btn span { flex-grow: 1; color: #000; }
.locate-marker p .q-btn { flex-grow: 0 }

.fields-group { padding: 0.5rem; margin: 0.5rem; border: 1px solid #999; border-radius: 0.5rem; }

.inventory div { margin: 0.5rem auto; }
.inventory .q-icon { width: 3rem; height: 3rem; font-size: 3rem; }

.error-label { color: #db2828; }
.answer .error-label { font-size: 1rem; white-space: nowrap; }

#save-changes-modal .q-card__actions .q-btn { flex-grow: 1; }

#choose-marker-modal img { width: 5rem; height: 5rem; }
#choose-marker-modal span { flex-grow: 1; font-size:1.5rem; color: #000; }

#target-canvas { margin: 1rem auto 0 auto; background: linear-gradient(#aab, #657); }

</style>

<!-- not scoped -->
<style>
.answer .native-input-class { font-size: 1rem; }
.answer .q-field__control { height: 2rem; }
</style>
