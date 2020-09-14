<template>
  <div class="bg-white arial step-setting">
    
    <!------------------ COMMON FOR ALL STEPS ------------------------>
    
    <div class="q-pa-md q-pt-xl q-mt-lg bottom-margin-for-keypad">
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
        v-if="options.type.code !== 'end-chapter'"
        :label="$t('label.' + mainTextFieldLabel) + ' ' + currentLanguageForLabels"
        v-model="selectedStep.form.text[lang]"
        type="textarea"
        :max-height="100"
        :min-rows="4"
        class="full-width"
        @blur="$v.selectedStep.form.text[lang].$touch"
        @input="$v.selectedStep.form.text[lang].$touch"
        bottom-slots
        counter
        :maxlength="mainTextMaxLength"
        :error="$v.selectedStep.form.text[lang].$error"
        :error-message="$t('label.KeepEnigmaQuestionsShort')"
        test-id="step-text"
      />

      <div class="background-upload" v-show="options.type.hasBackgroundImage && options.type.hasBackgroundImage === 'main'">
        <q-btn class="full-width" type="button" @click="showMedia">
          {{ $t('label.AddABackgroundImage') }}
        </q-btn>
        <div v-if="selectedStep.form.backgroundImage !== null && selectedStep.form.backgroundImage !== '' && options.type.code !== 'find-item' && options.type.code !== 'use-item'">
          <p>{{ $t('label.YourPicture') }} :</p>
          <img v-if="questId !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage" /> <br />
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
          <!-- TODO show video file infos (size on disk, width x height, etc.) -->
          <p v-show="$v.selectedStep.form.videoStream.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p v-show="selectedStep.form.videoStream === null">{{ $t('label.NoVideoUploaded') }}</p>
          <video v-if="selectedStep.form.videoStream !== null" class="full-width" controls controlsList="nodownload" test-id="uploaded-video">
            <source :src="serverUrl + '/upload/quest/' + questId + '/step/video/' + selectedStep.form.videoStream" type="video/mp4" />
          </video>
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
            {{ $t('label.UploadTheItemPicture') }}:
            <input @change="uploadItemImage" ref="itemfile" type="file" accept="image/*" />
          </div>
          <p v-show="$v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p>{{ $t('label.WarningImageSizeSquare') }}</p>
        </div>
        <div v-if="selectedStep.form.options !== null && selectedStep.form.options.picture && selectedStep.form.options.picture !== null">
          <p>{{ $t('label.YourItemPicture') }} :</p>
          <div class="centered">
            <img style="width:100%" :src="(selectedStep.form.options.picture.indexOf('statics/') !== -1 ? selectedStep.form.options.picture : serverUrl + '/upload/quest/' + questId + '/step/new-item/' + selectedStep.form.options.picture)" test-id="img-new-item" />
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
        <h2>{{ $t('label.Character') }}</h2>
        <div v-if="quest.customization.character && quest.customization.character !== ''">
          <q-radio v-model="selectedStep.form.options.character" val="usequestcharacter" />
          <p><img :src="serverUrl + '/upload/quest/' + quest.customization.character" /></p>
        </div>
        <div class="answer" v-for="n in 6" :key="n">
          <q-radio v-model="selectedStep.form.options.character" :val="n.toString()" />
          <p><img :src="'statics/icons/story/character' + n + '_attitude1.png'" /></p>
        </div>
        <q-list bordered>
          <q-expansion-item :label="$t('label.OtherCharacters')">
            <div class="answer" v-for="n in 34" :key="n">
              <q-radio v-model="selectedStep.form.options.character" :val="(n + 6).toString()" />
              <p><img :src="'statics/icons/story/character' + (n + 6) + '_attitude1.png'" /></p>
            </div>
          </q-expansion-item>
        </q-list>
        <div>
          <div class="q-mb-sm">
            {{ $t('label.OrDownloadAFile') }}
            <div v-if="!isIOs">
              <q-btn class="full-width" type="button" :label="$t('label.UploadACharacter')" @click="$refs['characterfile'].click()" />
              <input @change="uploadCharacterImage" ref="characterfile" type="file" accept="image/*" hidden />
            </div>
            <div v-if="isIOs">
              {{ $t('label.UploadACharacter') }}:
              <input @change="uploadCharacterImage" ref="characterfile" type="file" accept="image/*" />
            </div>
            <p v-show="$v.selectedStep.form.options.character.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
            <div class="centered" v-if="selectedStep.form.options.character && selectedStep.form.options.character.length > 2 && selectedStep.form.options.character !== 'usequestcharacter'">
              <img style="width:100%" :src="serverUrl + '/upload/quest/' + questId + '/step/character/' + selectedStep.form.options.character" />
            </div>
          </div>
          <!--<div class="q-mb-sm">
            <q-btn class="full-width" type="button" color="grey" :label="$t('label.UploadACharacter')" @click="premium.show = true" />
          </div>-->
        </div>
      </div>
      
      <!------------------ STEP : GEOLOCATION ------------------------>
      
      <div v-if="options.type.code == 'geolocation'" class="location-gps">
        <h2>{{ $t('label.AddressToFind') }}</h2>
        <div class="fields-group">
          <div v-if="!isIOs" class="location-address">
            <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
              <!-- using :value + @input trick to avoid this issue: https://github.com/xkjyeah/vue-google-maps/issues/592 -->
              <gmap-autocomplete id="destination" :placeholder="$t('label.Address')" :value="selectedStep.form.options.destination" class="col q-input-target text-left" @place_changed="setLocation" @input="value = $event.target.value" />
            </div>
            <a class="dark" @click="getCurrentLocation()"><img src="statics/icons/game/location.png" /></a>
          </div>
          <div v-if="isIOs">
            {{  $t('label.DefineGPSLocation') }}
            <div class="location-gps-inputs">
              <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
              <div>
                <label for="answer-latitude">{{ $t('label.Latitude') }}</label>
                <input type="number" id="answer-latitude" v-model.number="selectedStep.form.options.lat" placeholder="par ex. 5,65487" step="any" @input="$v.selectedStep.form.options.lat.$touch" @blur="$v.selectedStep.form.options.lat.$touch" />
                <p class="error-label" v-show="$v.selectedStep.form.options.lat.$error">{{ $t('label.RequiredField') }}</p>
              </div>
              <div>
                <label for="answer-longitude">{{ $t('label.Longitude') }}</label>
                <input type="number" id="answer-longitude" v-model.number="selectedStep.form.options.lng" placeholder="par ex. 45,49812" step="any" @input="$v.selectedStep.form.options.lng.$touch" @blur="$v.selectedStep.form.options.lng.$touch" />
                <p class="error-label" v-show="$v.selectedStep.form.options.lng.$error">{{ $t('label.RequiredField') }}</p>
              </div>
            </div>
            <div>
              <a class="dark" @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
            </div>
          </div>
          <q-list v-if="!isIOs">
            <q-expansion-item icon="explore" :label="$t('label.OrDefineGPSLocation')">
              <div class="location-gps-inputs">
                <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
                <div>
                  <label for="answer-latitude">{{ $t('label.Latitude') }}</label>
                  <input type="number" id="answer-latitude" v-model.number="selectedStep.form.options.lat" placeholder="par ex. 5,65487" step="any" @input="$v.selectedStep.form.options.lat.$touch" @blur="$v.selectedStep.form.options.lat.$touch" />
                  <p class="error-label" v-show="$v.selectedStep.form.options.lat.$error">{{ $t('label.RequiredField') }}</p>
                </div>
                <div>
                  <label for="answer-longitude">{{ $t('label.Longitude') }}</label>
                  <input type="number" id="answer-longitude" v-model.number="selectedStep.form.options.lng" placeholder="par ex. 45,49812" step="any" @input="$v.selectedStep.form.options.lng.$touch" @blur="$v.selectedStep.form.options.lng.$touch" />
                  <p class="error-label" v-show="$v.selectedStep.form.options.lng.$error">{{ $t('label.RequiredField') }}</p>
                </div>
              </div>
              <div>
                <a class="dark" @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
              </div>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
      
      <!------------------ STEP : MULTIPLE CHOICE ------------------------>
      
      <div v-if="options.type.code == 'choose'">
        
        <h2>{{ $t('label.ResponseTypes') }}</h2>
        <q-radio v-model="config.choose.answerType" val="text" :label="$t('label.Texts')" @click="$v.selectedStep.form.options.items.$touch" />
        <q-radio v-model="config.choose.answerType" val="image" :label="$t('label.Pictures')" @click="$v.selectedStep.form.options.items.$touch" test-id="radio-choose-images" />
          
        <h2>{{ $t('label.PossibleAnswers') }}</h2>
        <p>{{ $t('label.SelectTheGoodAnswer') }}</p>
          
        <div class="answer" v-for="(option, key) in selectedStep.form.options.items" :key="key">
          <q-radio v-model="selectedStep.form.answers" :val="key" :test-id="'radio-answer-' + key" />
          
          <q-input v-show="config.choose.answerType === 'text'" v-model="option.text" @input="$v.selectedStep.form.options.items ? $v.selectedStep.form.options.items.$each[key].text.$touch : null" input-class="native-input-class" :test-id="'text-answer-' + key" />
          <p class="error-label" v-if="config.choose.answerType === 'text' && $v.selectedStep.form.options && $v.selectedStep.form.options.items && !$v.selectedStep.form.options.items.$each[key].text.required">{{ $t('label.RequiredField') }}</p>
          
          <p v-show="config.choose.answerType === 'image' && option.imagePath === null" :class="{'error-label': $v.selectedStep.form.options && $v.selectedStep.form.options.items && !$v.selectedStep.form.options.items.$each[key].imagePath.required}">{{ $t('label.NoPictureUploaded') }}</p>
          <p><img v-if="config.choose.answerType === 'image' && option.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/choose-image/' + option.imagePath" /></p>
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
          max-length="6"
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
            <div class="centered"><q-btn :label="$t('label.Add')" color="secondary" @click="addColor()" /></div>
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
      </div>
      
      <!------------------ STEP : IMAGE CODE ------------------------>
      
      <div v-if="options.type.code == 'code-image'" class="code-image">
        <h2>{{ $t('label.ImagesUsedForCode') }}</h2>
        <div class="answer" v-for="(image, key) in selectedStep.form.options.images" :key="key">
          
          <p v-show="image.imagePath === null" :class="{'error-label': $v.selectedStep.form.options && !$v.selectedStep.form.options.$each[key].imagePath.required}">{{ $t('label.NoPictureUploaded') }}</p>
          <p><img v-if="image.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/code-image/' + image.imagePath" /></p>
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
                <img :id="'image-code-setting-' + index" :src="serverUrl + '/upload/quest/' + questId + '/step/code-image/' + selectedStep.form.options.images[code].imagePath" />
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
      
      <!------------------ STEP : IMAGE RECOGNITION ------------------------>
      
      <div v-if="options.type.code == 'image-recognition'" class="image-recognition">
        <div v-if="!isIOs">
          <q-btn class="full-width" :label="$t('label.UploadThePictureOfTheObjectToFind')" @click="$refs['image-to-recognize'].click()" />
          <input @change="uploadImageToRecognize" ref="image-to-recognize" id="image-to-recognize" type="file" accept="image/*" hidden />
        </div>
        <div v-if="isIOs">
          {{ $t('label.UploadThePictureOfTheObjectToFind') }}:
          <input @change="uploadImageToRecognize" ref="image-to-recognize" id="image-to-recognize" type="file" accept="image/*" />
        </div>
        <p v-show="$v.selectedStep.form.answers.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
        <div v-if="selectedStep.form.answers != ''">
          <p>{{ $t('label.UploadedPicture') }} :</p>
          <img :src="serverUrl + '/upload/quest/' + questId + '/step/image-recognition/' + selectedStep.form.answers" />
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
            {{ $t('label.UploadThePuzzlePicture') }}:
            <input @change="uploadPuzzleImage" ref="puzzlefile" type="file" accept="image/*" test-id="upload-puzzle-image" />
          </div>
          <p v-show="$v.selectedStep.form.options.picture && $v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p v-if="!selectedStep.form.options.picture">{{ $t('label.WarningImageSizeSquare') }}</p>
          <div v-if="selectedStep.form.options.picture">
            <p>{{ $t('label.YourPuzzlePicture') }} :</p>
            <img :src="serverUrl + '/upload/quest/' + questId + '/step/jigsaw-puzzle/' + selectedStep.form.options.picture" />
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
          <p><img v-if="option.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/memory/' + option.imagePath" /></p>
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
      
      <!------------------ STEP : USE INVENTORY ITEM ------------------------>
      
      <div class="find-item" v-if="options.type.code == 'use-item' && selectedStep.form.backgroundImage">
        <p>{{ $t('label.ClickOnTheLocationTheItemMustBeUsed') }} :</p>
        <div @click="getClickCoordinates($event)" id="useItemPicture" ref="useItemPicture" :style="'overflow: hidden; background-image: url(' + serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 90vw; height: 120vw; margin: auto;'">
          <img id="cross" :style="'position: relative; z-index: 500; top: 52vw; left: 37vw; width: 16vw; height: 16vw;'" src="statics/icons/game/find-item-locator.png" />
        </div>
      </div>
      <div class="inventory" v-if="options.type.code == 'use-item'">
        <q-select emit-value map-options
          :label="$t('label.ObjectToUse')"
          :options="config.useItem.questItemsAsOptions"
          v-model="selectedStep.form.answerItem"
          @change="$v.selectedStep.form.answerItem.$touch"
          bottom-slots
          :error="$v.selectedStep.form.answerItem && $v.selectedStep.form.answerItem.$error"
          :error-message="$t('label.RequiredField')"/>
        <div v-if="selectedStep.form.answerItem">
          {{ $t('label.SelectedObject') }} :
          <img style="width: 100%" :src="(selectedStep.form.answerItem.indexOf('statics/') !== -1 ? selectedStep.form.answerItem : serverUrl + '/upload/quest/' + questId + '/step/new-item/' + selectedStep.form.answerItem)" />
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
            <img style="width:100%" :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.options.altFile" />
          </div>
        </div>
      </div>
      
      <!------------------ STEP : FIND ITEM ------------------------>

      <div class="find-item" v-if="options.type.code === 'find-item' && (selectedStep.form.backgroundImage !== null && selectedStep.form.backgroundImage !== '')">
        <p>{{ $t('label.ClickOnTheItemThatIsToFind') }} :</p>
        <div @click="getClickCoordinates($event)" id="findItemPicture" ref="findItemPicture" :style="'overflow: hidden;background-image: url(' + serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 90vw; height: 120vw; margin: auto;'">
          <img id="cross" :style="'position: relative; z-index: 500; top: 52vw; left: 37vw; width: 16vw; height: 16vw;'" src="statics/icons/game/find-item-locator.png" />
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
            <img style="width:100%" :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.options.altFile" />
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
              <img :src="serverUrl + '/upload/quest/' + questId + '/step/locate-item-ar/' + selectedStep.form.options.picture" />
            </div>
            <div>
              <p>{{ $t('label.ObjectSize') }}</p>
              <q-slider v-if="typeof selectedStep.form.options.objectSize !== 'undefined'" v-model="selectedStep.form.options.objectSize" :min="0.5" :max="10" :step="0.1" label-always :label-value="(selectedStep.form.options.objectSize || 0.5) + 'm'" />
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
            <div>
              {{ $t('label.TouchAndDragObject') }}
            </div>
          </div>
        </div>
        
        <h2>{{ $t('label.AddressToFind') }}</h2>
        <div class="fields-group">       
          <div v-if="!isIOs" class="location-address">
            <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
              <!-- using :value + @input trick to avoid this issue: https://github.com/xkjyeah/vue-google-maps/issues/592 -->
              <gmap-autocomplete id="destination" :placeholder="$t('label.Address')" :value="selectedStep.form.options.destination" class="col q-input-target text-left" @place_changed="setLocation" @input="value = $event.target.value" />
            </div>
            <a class="dark" @click="getCurrentLocation()"><img src="statics/icons/game/location.png" /></a>
          </div>
          <div v-if="isIOs">
            {{  $t('label.DefineGPSLocation') }}
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
              <a class="dark" @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
            </div>
          </div>
          <q-list v-if="!isIOs">
            <q-expansion-item icon="explore" :label="$t('label.OrDefineGPSLocation')">
              <div class="location-gps-inputs">
                <!-- q-input does not support value 'any' for attribute 'step' => use raw HTML inputs & labels -->
                <div>
                  <label for="answer-latitude">{{ $t('label.Latitude') }}</label>
                  <input type="number" id="answer-latitude" v-model.number="selectedStep.form.options.lat" placeholder="par ex. 5,65487" step="any" />
                  <p class="error-label" v-show="$v.selectedStep.form.options.lat.$error">{{ $t('label.RequiredField') }}</p>
                </div>
                <div>
                  <label for="answer-longitude">{{ $t('label.Longitude') }}</label>
                  <input type="number" id="answer-longitude" v-model.number="selectedStep.form.options.lng" placeholder="par ex. 45,49812" step="any" />
                  <p class="error-label" v-show="$v.selectedStep.form.options.lng.$error">{{ $t('label.RequiredField') }}</p>
                </div>
              </div>
              <div>
                <a class="dark" @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
              </div>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
      
      <!------------------ STEP : FIND AR MARKER ------------------------>
      
      <div class="locate-marker" v-if="options.type.code === 'locate-marker' && typeof selectedStep.form.answers === 'string'">
        <h2>{{ $t('label.Marker') }}</h2>
        
        <p>
          <img :src="'statics/markers/' + selectedStep.form.answers + '/marker.png'" />
          <span>{{ selectedStep.form.answers }}</span>
          <q-btn color="primary" :label="$t('label.Choose')" @click="openChooseMarkerModal()" test-id="btn-open-choose-marker-modal" />
        </p>
        
        <!--
        <h2>{{ $t('label.Mode') }}</h2>
        
        <div class="fields-group">
          
          <q-option-group
            type="radio"
            color="secondary"
            v-model="selectedStep.form.options.mode"
            :options="[
              { label: $t('label.TouchA3DObjectOnTheMarker'), value: 'touch' },
              { label: $t('label.ScanTheMarker'), value: 'scan' }
            ]"
          />
          
          <div v-if="selectedStep.form.options.mode === 'touch'">
            <q-select emit-value map-options v-model="selectedStep.form.options.model" :label="$t('label.Choose3DModel')" :options="selectModel3DOptions" />
            <p class="error-label" v-show="$v.selectedStep.form.options && $v.selectedStep.form.options.model.$error">{{ $t('label.RequiredField') }}</p>
          </div>
          
          <q-select emit-value map-options v-if="selectedStep.form.options.mode === 'scan'" :label="$t('label.TransparentImageAboveCameraStream')" :options="layersForMarkersOptions" v-model="selectedStep.form.options.layerCode" />
        
        </div>-->
        
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
      
      <!---------- STEPS IOT : WAIT FOR EVENT / TRIGGER EVENT  ------------>
      
      <div v-if="options.type.code === 'wait-for-event' || options.type.code === 'trigger-event'">
        
        <q-select emit-value map-options :label="$t('label.Protocol')" v-model="selectedStep.form.options.protocol" :options="config.iot.protocols" />
        
        <q-select v-if="options.type.code === 'wait-for-event'" emit-value map-options :label="$t('label.IotObject')" v-model="selectedStep.form.options.object" :options="config.iot.waitForEvent.iotObjectsAsOptions" @input="updateIotStepOptions()" />
        
        <q-select v-if="options.type.code === 'trigger-event'" emit-value map-options :label="$t('label.IotObject')" v-model="selectedStep.form.options.object" :options="config.iot.triggerEvent.iotObjectsAsOptions" @input="updateIotStepOptions()" />
        
        <q-select v-if="options.type.code === 'trigger-event'" emit-value map-options v-model="selectedStep.form.options.triggerMode" :label="$t('label.TriggerMode')" :options="config.iot.triggerEvent.modes" />
        
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
              <q-select emit-value map-options :label="$t('label.ConditionValue')" v-model="selectedStep.newCondition.selectedValue" :options="selectedStep.newCondition.values" />
              <div class="centered">
                <q-btn class="glossy normal-button" color="primary" @click="saveNewCondition()" :label="$t('label.Save')" />
                <q-btn class="q-mx-md" color="primary" flat @click="selectedStep.newConditionForm = false" :label="$t('label.Cancel')" />
              </div>
            </div>
          </div>
        </q-expansion-item>
      </q-list>
      
      <!------------------ OTHER OPTIONS ------------------------>
      
      <q-list v-show="options.type.hasOptions" bordered>
        <q-expansion-item icon="add_box" :label="$t('label.OtherOptions')">
          <div class="q-pa-sm">
            <div v-if="options && options.mode && options.mode === 'advanced' && (options.type.code == 'use-item' || options.type.code == 'find-item' || options.type.code == 'code-image' || options.type.code == 'code-color' || options.type.code == 'code-keypad' || options.type.code == 'choose' || options.type.code == 'write-text')" class="q-pb-md">
              <q-toggle v-model="selectedStep.form.displayRightAnswer" :label="$t('label.DisplayRightAnswer')" />
            </div>
            <div v-if="options.type.code == 'geolocation' || options.type.code == 'locate-item-ar'" class="location-gps">
              <q-toggle v-model="selectedStep.form.showDistanceToTarget" :label="$t('label.DisplayDistanceBetweenUserAndLocation')" />
              <q-toggle v-model="selectedStep.form.showDirectionToTarget" :label="$t('label.DisplayDirectionArrow')" />
              <q-toggle v-model="selectedStep.form.options.showHelp" :label="$t('label.DisplayGeolocationHelp')" />
            </div>
            <div v-if="options.type.code == 'geolocation'">
              <q-input v-model="selectedStep.form.options.distance" :label="$t('label.DistanceToWin')" />
            </div>
            <div v-if="options.type.code === 'memory'">
              <q-toggle v-model="selectedStep.form.options.lastIsSingle" :label="$t('label.LastItemIsUniq')" />
            </div>
            <div v-if="options.type.nbTrials > 0">
              <q-input v-model="selectedStep.form.nbTrial" :label="$t('label.NbTrials')" />
            </div>
            <div v-if="options.type.passOption > 0">
              <q-toggle v-model="selectedStep.form.canPass" :label="$t('label.UserCanPass')" />
            </div>
            <div v-if="options.type.code === 'image-over-flow'">
              <q-toggle v-model="selectedStep.form.options.fullWidthPicture" :label="$t('label.EnlargePictureToFullWidth')" />
              <q-toggle v-model="selectedStep.form.options.snapshotAllowed" :label="$t('label.PlayerCanTakeSnapshot')" />
              <q-toggle v-model="selectedStep.form.options.redFilter" :label="$t('label.ReplacePictureByRedFilter')" />
            </div>
            <div v-if="options.type.code === 'info-text' || options.type.code === 'character' || options.type.code === 'choose' || options.type.code === 'write-text' || options.type.code === 'code-keypad'">
              <q-input v-model="selectedStep.form.options.initDuration" :label="$t('label.DurationBeforeTextAppearAbovePicture')" />
            </div>
            <div class="background-upload" v-show="options.type.hasBackgroundImage && options.type.hasBackgroundImage === 'option'">
              <q-btn class="full-width" type="button" @click="showMedia">
                {{ $t('label.AddABackgroundImage') }}
              </q-btn>
              <!--toot<div v-if="!isIOs">
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
              <div v-if="selectedStep.form.backgroundImage !== null && selectedStep.form.backgroundImage !== '' && options.type.code !== 'find-item' && options.type.code !== 'use-item'">
                <p>{{ $t('label.YourPicture') }} :</p>
                <img v-if="questId !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage" /> <br />
                <a class="dark" @click="resetBackgroundImage">{{ $t('label.remove') }}</a>
              </div>
            </div>
            <q-input
              :label="$t('label.ExtraTextFieldLabel')"
              v-model="selectedStep.form.extraText[lang]"
              type="textarea"
              :max-height="100"
              :min-rows="4"
              class="full-width"
            />
            
          </div>
        </q-expansion-item>
      </q-list>
      
      <!------------------ HINT ------------------------>
      
      <q-list v-show="options.type.showTrick == 'yes'" bordered>
        <q-expansion-item icon="lightbulb" :label="$t('label.Hints')">
          <div class="q-pa-sm">
            <div v-if="selectedStep.form.hint && selectedStep.form.hint[lang] && selectedStep.form.hint[lang].length > 0" v-for="(item, key) in selectedStep.form.hint[lang]" :key="key">
              <q-btn class="float-right" @click="removeHint(key)"><q-icon name="delete" /></q-btn>
              <div class="text-subtitle1">{{ $t('label.Hint') + " " + (key + 1) }}</div>
              {{ item }}
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
      
      <!------------------ SAVE BUTTONS ------------------------>
      
      <div class="centered q-pa-md q-pt-lg q-pb-sm">
        <q-btn class="glossy large-button" color="primary" @click="submitStep(true)" test-id="btn-save-step">{{ $t('label.SaveAndTestThisStep') }}</q-btn>
      </div>
      <div class="centered q-px-md q-pb-xl">
        <a class="text-primary" @click="submitStep(false)" test-id="btn-save-step-no-test">{{ $t('label.SaveThisStep') }}</a>
      </div>
    </div>
    
    <!------------------ HEADER ------------------------>
    
    <div class="q-pa-md background-dark fixed-top">
      <a class="float-right no-underline" color="grey" @click="close"><q-icon name="close" class="subtitle4" /></a>
      
      <div class="subtitle3" v-if="selectedStep.type !== null">{{ $t('stepType.' + selectedStep.type.title) }}</div>
    </div>
    
    <q-dialog id="save-changes-modal" class="full-width" v-model="saveChangesModalOpened">
      <q-card>
        <div class="q-pa-md">
          {{ $t('label.ConfirmSaveChanges') }}
        </div>
        <q-card-actions>
          <q-btn color="primary" @click="submitStep(false)" :label="$t('label.Yes')" />
          <q-btn color="primary" @click="$emit('close')" :label="$t('label.No')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!------------------ PREMIUM POPIN ------------------------>
    
    <q-dialog v-model="premium.show">
      <div class="q-pa-md centered">
        <div v-html="$t('label.PremiumWarning')" />
        <q-btn class="q-mt-md" color="primary" @click="premium.show = false">{{ $t('label.Close') }}</q-btn>
      </div>
    </q-dialog>
    
    <!------------------ MEDIA LIST AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="bg-white panel-bottom q-pa-md" v-show="media.isOpened">
        <div class="text-h4 q-pt-md q-pb-lg">{{ $t('label.AddABackgroundImage') }}</div>
        <div v-if="!isIOs">
          <q-btn class="full-width" type="button" @click="$refs['backgroundfile'].click()">
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
        <div class="centered" v-if="!selectedStep.form.backgroundImage && !media.isSimulated">{{ $t('label.WarningImageResize') }}</div>
        
        <div v-if="media && media.items && media.items.length > 0 && !media.isSimulated">
          <div class="centered q-pa-md">{{ $t('label.OrSelectAnImageInTheList') }}</div>
          <img v-for="(item, index) in media.items" :key="item.id" :src="serverUrl + '/upload/quest/' + questId + item.type + item.file" style="width: 30vw; height: 40vw;" @click="selectMedia(index)">
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

import Vue from 'vue'

import colorsForCode from 'data/colorsForCode.json'
import stepTypes from 'data/stepTypes.json'
import modelsList from 'data/3DModels.json'
import objectsList from 'data/2Dobjects.json'
import markersList from 'data/markers.json'
import iotObjectsList from 'data/iotObjects.json'
import layersForMarkers from 'data/layersForMarkers.json'

import StepService from 'services/StepService'
import QuestService from 'services/QuestService'

import * as THREE from 'three'
//import * as TWEEN from '@tweenjs/tween.js'
import GLTFLoader from 'three-gltf-loader'
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
      selectedStep: {
        isNew: true,
        newConditionForm: false,
        id: 0,
        code: null,
        type: null,
        form: {
          title: {},
          text: {},
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
          }
        },
        formatedConditions: [],
        newCondition: {
          selectedType: 'stepDone',
          types: [
            {label: this.$t('label.FollowStep'), value: 'stepDone'},
            {label: this.$t('label.StepSuccess'), value: 'stepSuccess'},
            {label: this.$t('label.StepFail'), value: 'stepFail'}
          ],
          selectedValue: '',
          values: []
        }
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
          maxNbAnswers: 6
        },
        colorCode: {
          numberOfDigitsOptions: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" }
          ],
          colorsForCode: this.getColorsForCodeOptions(),
          newColor: {
            label: "",
            value: ""
          }
        },
        imageCode: {
          numberOfDigitsOptions: [
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
            { value: 4, label: "4" }
          ],
          defaultNbAnswers: 4,
          imagesForCode: this.getImagesForCodeOptions()
        },
        memory: {
          minNbAnswers: 3,
          maxNbAnswers: 10
        },
        useItem: {
          questItemsAsOptions: []
        },
        locateItem: {
          selectModel3DOptions: [],
          zoom: 60,
          rotation: {},
          object: null
        },
        locateMarker: {
          markerModalOpened: false,
          layersForMarkersOptions: []
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
          protocols: [
            { label: 'MQTT', value: 'mqtt' },
            { label: 'Bluetooth', value: 'bluetooth' }
          ]
        }
      },
      newHint: "",
      questItems: [],
      isIOs: (window.cordova && window.cordova.platformId && window.cordova.platformId === 'ios'),
      serverUrl: process.env.SERVER_URL,
      
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
        maxNbChars = this.options.type.textRules.maxNbChars
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
      this.selectedStep.form = {
        title: {}, // {fr: 'mon titre', en: 'my title', ...}
        text: {}, // {fr: 'ma description', en: 'my description', ...}
        extraText: {}, // {fr: 'ma description', en: 'my description', ...}
        answers: {}, // using null triggers lots of "undefined property" errors complex to handle, due to nested objects + using them like v-model="form.answers.level" + template rendering executed before "mounted()"
        options: {},
        conditions: [],
        backgroundImage: null,
        // info-video step specific
        videoStream: null,
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
        startDate: { enabled: false },
        number: null
      }
      // reset upload item (after document fully loaded)
      this.$nextTick(function () {
        if (document.getElementById("picturefile1")) {
          document.getElementById("picturefile1").value = ""
        }
        if (document.getElementById("picturefile2")) {
          document.getElementById("picturefile2").value = ""
        }
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
      
      // define the default hint for the step
      if (!this.selectedStep.form.hint[this.lang] || this.selectedStep.form.hint[this.lang] === '') {
        if (this.lang !== this.quest.mainLanguage && this.selectedStep.form.hint[this.quest.mainLanguage] !== '') {
          this.$set(this.selectedStep.form.hint, this.lang, this.selectedStep.form.hint[this.quest.mainLanguage])
        }
      }
      
      // define players select list
      if (this.options.type.code === 'info-text' || this.options.type.code === 'info-video' || this.options.type.code === 'new-item' || this.options.type.code === 'character' || this.options.type.code === 'end-chapter') {
        this.players.push({ label: this.$t('label.All'), value: 'All' })
      }
      for (var p = 0; p < this.quest.playersNumber; p++) {
        this.players.push({ label: this.$t('label.Player') + " " + (p + 1), value: 'P' + (p + 1) })
      }
      
      // initialize specific steps
      if (this.options.type.code === 'choose') {
        if (!this.selectedStep.form.options || !this.selectedStep.form.options.items || !Array.isArray(this.selectedStep.form.options.items)) {
          this.config.choose.answerType = 'text'
          this.selectedStep.form.options = {items: []}
          this.selectedStep.form.answers = 0
          for (let i = 0; i < this.config.choose.defaultNbAnswers; i++) {
            this.selectedStep.form.options.items.push({ text: this.$t('label.AnswerNb', { nb: (i + 1) }), imagePath: null })
          }
        } else {
          this.config.choose.answerType = this.selectedStep.form.options.items[0].hasOwnProperty('imagePath') && this.selectedStep.form.options.items[0].imagePath !== null ? 'image' : 'text'
          if (this.config.choose.answerType === 'text') {
            for (var i = 0; i < this.selectedStep.form.options.items.length; i++) {
              if (this.selectedStep.form.options.items[i].textLanguage && this.selectedStep.form.options.items[i].textLanguage[this.lang]) {
                this.selectedStep.form.options.items[i].text = this.selectedStep.form.options.items[i].textLanguage[this.lang]
              }
            }
          }          
        }
      } else if (this.options.type.code === 'code-color') {
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
          this.selectedStep.form.options = {images: []}
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
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.selectedStep.form.answers = ""
        }
      } else if (this.options.type.code === 'write-text') {
        if (typeof this.selectedStep.form.answers !== 'object' || !this.selectedStep.form.answers.length) {
          this.selectedStep.form.answers = []
          this.selectedStep.form.answers.push("")
        }
      } else if (this.options.type.code === 'info-text' || this.options.type.code === 'character' || this.options.type.code === 'choose' || this.options.type.code === 'write-text' || this.options.type.code === 'code-keypad') {
        if (!this.selectedStep.form.options.hasOwnProperty('initDuration')) {
          this.selectedStep.form.options.initDuration = 1
        }
        if (this.options.type.code === 'character' && !this.selectedStep.form.options.character) {
          Vue.set(this.selectedStep.form.options, 'character', '1')
        }
      } else if (this.options.type.code === 'image-recognition') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.selectedStep.form.answers = ""
        }
      } else if (this.options.type.code === 'find-item') {
        if (this.selectedStep.form.answers.hasOwnProperty('top')) {
          this.selectedStep.form.answerPointerCoordinates = this.selectedStep.form.answers
          this.$nextTick(function () {
            // Code that will run only after the entire view has been rendered
            this.positionFindItemPointer()
          })
        }
        if (!this.selectedStep.form.options) {
          this.selectedStep.form.options = {}
        }
      } else if (this.options.type.code === 'use-item') {
        if (this.selectedStep.form.answers.hasOwnProperty('coordinates')) {
          this.selectedStep.form.answerPointerCoordinates = this.selectedStep.form.answers.coordinates
          this.$nextTick(function () {
            // Code that will run only after the entire view has been rendered
            this.positionFindItemPointer()
          })
        }
        if (this.selectedStep.form.answers && this.selectedStep.form.answers.item) {
          this.selectedStep.form.answerItem = this.selectedStep.form.answers.item
        }
        this.getQuestItemsAsOptions()
        if (!this.selectedStep.form.options) {
          this.selectedStep.form.options = {}
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
      } else if (this.options.type.code === 'memory') {
        if (!this.selectedStep.form.options.hasOwnProperty('items')) {
          let defaultItems = []
          for (let i = 0; i < 8; i++) {
            defaultItems.push({ imagePath: null, single: false })
          }
          this.$set(this.selectedStep.form.options, 'items', defaultItems)
        }
      } else if (this.options.type.code === 'geolocation') {
        if (!this.selectedStep.form.options.hasOwnProperty('distance')) {
          this.$set(this.selectedStep.form.options, 'distance', '20')
        }
      } else if (this.options.type.code === 'locate-item-ar') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.$set(this.selectedStep.form.options, 'picture', null)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('objectSize')) {
          this.$set(this.selectedStep.form.options, 'objectSize', 1)
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
        // create options for layer above camera stream selection
        for (let layer of layersForMarkers) {
          this.config.locateMarker.layersForMarkersOptions.push({ label: this.$t('layersForMarkers.' + layer.label), value: layer.code })
        }
        // sort options in alphabetical order
        this.config.locateMarker.layersForMarkersOptions = this.config.locateMarker.layersForMarkersOptions.sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
        // default layer = first
        if (!this.selectedStep.form.options.hasOwnProperty('layerCode')) {
          this.$set(this.selectedStep.form.options, 'layerCode', layersForMarkers[0].code)
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
      }
      
      this.originalStepData = utils.clone(this.selectedStep.form)
      
      // init the conditions form
      await this.changeNewConditionType()
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
      }
      if (this.options.type.code === 'character') {
        if (!this.selectedStep.form.options.character) {
          this.selectedStep.form.options.character = "1"
        }
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
      if (this.options.type.code === 'find-item') {
        this.selectedStep.form.answers = this.selectedStep.form.answerPointerCoordinates
      }
      if (this.options.type.code === 'use-item') {
        this.selectedStep.form.answers = {coordinates: this.selectedStep.form.answerPointerCoordinates, item: this.selectedStep.form.answerItem}
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
        Notification('Step saved !', 'success')
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
      if (this.selectedStep.form.options.images.length >= this.config.choose.maxNbAnswers) {
        Notification(this.$t('label.YouCantAddMoreThanNbAnswers', { nb: this.config.choose.maxNbAnswers }), 'error')
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
      document.getElementById('image-code-setting-' + key).src = this.serverUrl + '/upload/quest/' + this.questId + '/step/code-image/' + this.selectedStep.form.options.images[this.unformatedAnswer[key]].imagePath
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
      document.getElementById('image-code-setting-' + key).src = this.serverUrl + '/upload/quest/' + this.questId + '/step/code-image/' + this.selectedStep.form.options.images[this.unformatedAnswer[key]].imagePath
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
        if (conditionParts[0] === 'stepDone' || conditionParts[0] === 'stepSuccess' || conditionParts[0] === 'stepFail') {
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
      const stepsTypesWithSuccessOrFail = ['geolocation', 'locate-item-ar', 'choose', 'write-text', 'code-keypad', 'code-color', 'code-image', 'find-item', 'use-item', 'image-recognition', 'jigsaw-puzzle', 'memory']
      if (this.selectedStep.newCondition.selectedType === 'stepDone' || this.selectedStep.newCondition.selectedType === 'stepSuccess' || this.selectedStep.newCondition.selectedType === 'stepFail') {
        const response = await StepService.listForAChapter(this.questId, this.selectedStep.form.chapterId, this.quest.version, 'all')
        if (response && response.data && response.data.length > 0) {
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].stepId.toString() !== this.stepId.toString()) {
              if (this.selectedStep.newCondition.selectedType === 'stepDone' ||
                stepsTypesWithSuccessOrFail.indexOf(response.data[i].type) !== -1
              ) {
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
      if (this.selectedStep.newCondition.selectedType !== '' && this.selectedStep.newCondition.selectedValue !== '') {
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
          this.selectedStep.form.backgroundImage = uploadResult.data.file
          this.displayBackgroundImageSize(this.selectedStep.form.backgroundImage)
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
      this.media.simulationPicture = this.serverUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName
      /*var sc1 = document.getElementById('screensize1')
      var sc2 = document.getElementById('screensize2')
      var sc3 = document.getElementById('screensize3')
      sc1.style.backgroundImage = "url('" + this.serverUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName + "')"
      sc2.style.backgroundImage = "url('" + this.serverUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName + "')"
      sc3.style.backgroundImage = "url('" + this.serverUrl + '/upload/quest/' + this.questId + '/step/background/' + fileName + "')"
      sc1.onload = function() { URL.revokeObjectURL(sc1.src) }// free memory 
      sc2.onload = function() { URL.revokeObjectURL(sc2.src) }// free memory 
      sc3.onload = function() { URL.revokeObjectURL(sc3.src) }// free memory */
    },
    /*
     * Reset the background image
     */
    async resetBackgroundImage() {
      this.selectedStep.form.backgroundImage = null
      // reset input to let admin add the same picture again
      if (document.getElementById("picturefile1")) {
        document.getElementById("picturefile1").value = ""
      }
      if (document.getElementById("picturefile2")) {
        document.getElementById("picturefile2").value = ""
      }
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
      this.$q.loading.show()
      var data = new FormData()
      data.append('video', files[0])
      let uploadResult = await StepService.uploadVideo(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        if (uploadResult.data.file) {
          this.selectedStep.form.videoStream = uploadResult.data.file
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
          this.selectedStep.form.options.picture = uploadResult.data.file
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
          this.selectedStep.form.options.picture = uploadResult.data.file
          this.selectedStep.form.options.pictures[this.lang] = uploadResult.data.file
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
          Vue.set(this.selectedStep.form.options, 'character', uploadResult.data.file)
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
      object.applyMatrix(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
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
            gltfLoader.load(this.serverUrl + '/upload/quest/' + questId + '/step/3dobject/' + objName + '.glb', resolve, progress, reject)
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
          _this.config.locateItem.renderer.setSize(Math.round(window.innerWidth * 0.8), Math.round(window.innerWidth * 0.6))
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
    },
    /*
     * add a hint
     */
    addHint() {
      if (this.selectedStep.form.hint && this.selectedStep.form.hint[this.lang]) {
        this.selectedStep.form.hint[this.lang].push(this.newHint)
      } else {
        this.selectedStep.form.hint = {}
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
      
      let picture = this.options.type.code === 'use-item' ? this.$refs['useItemPicture'] : this.$refs['findItemPicture']
      
      // relative position between 0 to 100
      this.selectedStep.form.answerPointerCoordinates.left = Math.round(posX / picture.clientWidth * 100)
      this.selectedStep.form.answerPointerCoordinates.top = Math.round(posY / picture.clientHeight * 100)
      this.positionFindItemPointer()
    },
    /*
     * Position the pointer to locate the item for the find item step
     */
    positionFindItemPointer() {
      let vw = window.innerWidth / 100 // in px
      
      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = Math.round(8 * vw)
      
      document.getElementById("cross").style.left = Math.round(this.selectedStep.form.answerPointerCoordinates.left * 90 * vw / 100 - solutionAreaRadius) + "px"
      document.getElementById("cross").style.top = Math.round(this.selectedStep.form.answerPointerCoordinates.top * 120 * vw / 100 - solutionAreaRadius) + "px"
    },
    /*
     * Fill the GPS location in the settings
     * @param   {Object}    place            Position & address data
     */
    async setLocation(place) {
      this.selectedStep.form.options.lat = parseFloat(place.geometry.location.lat())
      this.selectedStep.form.options.lng = parseFloat(place.geometry.location.lng())
      this.selectedStep.form.options.destination = (place.formatted_address || '')
      this.$v.selectedStep.form.options.lat.$touch()
      this.$v.selectedStep.form.options.lng.$touch()
    },
    /*
     * Get current user location
     */
    async getCurrentLocation() {
      this.$q.loading.show()
      // get the current coords
      navigator.geolocation.getCurrentPosition(this.fillLocation, this.getLocationError, {timeout: 5000, maximumAge: 10000});
    },
    getLocationError(err) {
      this.$q.loading.hide()
      console.log(err)
      this.$q.dialog({
        title: this.$t('label.GeolocationFailed'),
        message: this.$t('label.GeolocationFailedDesc')
      })
    },
    /*
     * Get the address based on the position
     * @param   {Object}    pos            Position data
     */
    fillLocation(pos) {
      this.selectedStep.form.options.lat = pos.coords.latitude
      this.selectedStep.form.options.lng = pos.coords.longitude
      this.$v.selectedStep.form.options.lat.$touch()
      this.$v.selectedStep.form.options.lng.$touch()
      // get the address
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': {lat: pos.coords.latitude, lng: pos.coords.longitude}}, (results, status) => {
        this.$q.loading.hide()
        if (status === 'OK' && results[0].formatted_address) {
          this.selectedStep.form.options.destination = results[0].formatted_address
          // force field to be refreshed
          document.getElementById("destination").value = this.selectedStep.form.options.destination
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      });
    },
    /*
     * Get the GPS location based on user location
     * @param   {Object}    pos            Position data
     */
    getMyGPSLocation() {
      this.$q.loading.show()
      var _this = this
      navigator.geolocation.getCurrentPosition(function (position) {
        _this.$set(_this.selectedStep.form.options, 'lat', position.coords.latitude)
        _this.$set(_this.selectedStep.form.options, 'lng', position.coords.longitude)
        _this.$v.selectedStep.form.options.lat.$touch()
        _this.$v.selectedStep.form.options.lng.$touch()
        _this.$q.loading.hide()
      }, 
      this.getLocationError, 
      { 
        timeout: 5000, 
        maximumAge: 10000 
      });
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
      this.selectedStep.form.backgroundImage = this.media.items[index].file
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
        default:
          throw new Error("unknown IoT object code '" + this.selectedStep.form.options.object + "'")
      }
    }
  },
  validations() {
    let fieldsToValidate = {
      title: {},
      text: {}
    }
    
    fieldsToValidate.title[this.lang] = { required }
    fieldsToValidate.text[this.lang] = { function(value) { return this.checkMainTextLength(value) } }
    
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
            let regexp = new RegExp("^([0-9*#]{2,6})$", "g")
            return regexp.test(value)
          }
        }
        break
      case 'find-item':
        fieldsToValidate.backgroundImage = { required }
        break
      case 'geolocation':
        fieldsToValidate.options = { lat: { required }, lng: { required } }
        break
      case 'info-video':
        fieldsToValidate.videoStream = { required }
        break
      case 'image-recognition':
        fieldsToValidate.answers = { required }
        break
      case 'jigsaw-puzzle':
        fieldsToValidate.options = { picture: { required } }
        break
      case 'new-item':
        fieldsToValidate.options = { picture: { required }, title: { required } }
        break
      case 'character':
        fieldsToValidate.options = { character: { required } }
        break
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
h2 { font-size: 1.2rem; color: grey; }
p { margin-bottom: 0.5rem; }

.q-item { padding-top: 0; padding-bottom: 0; min-height: 2rem; }
.q-list { padding-top: 0; }

.answer { display: flex; flex-flow: row nowrap; align-items: center; }
.answer .q-input { flex-grow: 1; }
.answer p { min-width: 1rem; margin: 0; }
.answer img { width: 50vw; max-width: 450px; }
.answer .q-radio { padding-right: 0.5rem; }
.answer .q-btn { padding: 0.3rem; margin: 0.2rem; }
.answer .error-label { flex-grow: 1; }
.add-answer { margin: 0.5rem auto; }

.background-upload { padding-bottom: 10px; margin-bottom: 10px; background: #efefef; text-align: center;}
.background-upload img, .image-recognition img { max-height: 8rem; max-width: 8rem; width: auto; height: auto; }

.code-color h2 { margin-bottom: 0; }
.code-color table { margin: auto; }
.code-color table td { padding: 0rem; width: 6rem; }
.code-color .color-bubble { display: block; width: 4rem; height: 4rem; border: 4px solid black; border-radius: 2rem; transition: background-color 0.3s; }

.code-image td { width: 20% }
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
.answer .error-label { font-size: 0.8rem; white-space: nowrap; }

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