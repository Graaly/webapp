<template>
  <div class="q-pa-md">

    <a class="float-right no-underline" color="grey" @click="close"><q-icon name="close" class="medium-icon" /></a>
    
    <h1 class="size-3" v-if="selectedStep.type !== null">{{ $t('stepType.' + selectedStep.type.title) }}</h1>
    
    <!------------------ COMMON FOR ALL STEPS ------------------------>
    
    <q-field :error="$v.selectedStep.form.title[lang].$error" :count="titleMaxLength">
      <q-input type="text" :float-label="$t('label.Title') + ' ' + currentLanguageForLabels" v-model="selectedStep.form.title[lang]" @blur="$v.selectedStep.form.title[lang].$touch" :maxlength="titleMaxLength" />
      <div class="q-field-bottom" v-if="$v.selectedStep.form.title[lang].$error">
        <div class="q-field-error" v-if="!$v.selectedStep.form.title[lang].required">{{ $t('label.PleaseEnterATitle') }}</div>
      </div>
    </q-field>
    
    <q-field
      :error="$v.selectedStep.form.text[lang].$error"
      :error-label="$t('label.KeepEnigmaQuestionsShort')"
      :count="mainTextMaxLength"
    >
      <q-input
        :float-label="$t('label.' + mainTextFieldLabel) + ' ' + currentLanguageForLabels"
        v-model="selectedStep.form.text[lang]"
        type="textarea"
        :max-height="100"
        :min-rows="4"
        class="full-width"
        @blur="$v.selectedStep.form.text[lang].$touch"
        @input="$v.selectedStep.form.text[lang].$touch"
      />
    </q-field>
    
    <div class="background-upload" v-show="options.hasBackgroundImage && options.hasBackgroundImage === 'main'">
      <q-btn class="full-width" type="button">
        <q-icon name="cloud_upload" /> <label for="picturefile1">{{ $t('label.UploadABackgroundImage') }}</label>
        <input @input="uploadBackgroundImage" name="picturefile1" id="picturefile1" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <p v-show="$v.selectedStep.form.backgroundImage && $v.selectedStep.form.backgroundImage.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
      <p v-if="!selectedStep.form.backgroundImage">{{ $t('label.WarningImageResize') }}</p>
      <div v-if="selectedStep.form.backgroundImage !== null && selectedStep.form.backgroundImage !== '' && options.code !== 'find-item' && options.code !== 'use-item'">
        <p>{{ $t('label.YourPicture') }} :</p>
        <img v-if="questId !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage" /> <br />
        <a @click="resetBackgroundImage">{{ $t('label.remove') }}</a>
      </div>
    </div>
    
    <!------------------ STEP : VIDEO ------------------------>
    
    <div v-if="options.code == 'info-video'">
      <q-btn class="full-width" type="button">
        <q-icon name="cloud_upload" /> <label for="videofile">{{ $t('label.UploadAVideo') }}</label>
        <input @change="uploadVideo" name="videofile" id="videofile" type="file" accept="video/mp4,video/x-m4v,video/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <div>
        <!-- TODO show video file infos (size on disk, width x height, etc.) -->
        <p v-show="$v.selectedStep.form.videoStream.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
        <p v-show="selectedStep.form.videoStream === null">{{ $t('label.NoVideoUploaded') }}</p>
        <video v-if="selectedStep.form.videoStream !== null" class="full-width" controls controlsList="nodownload">
          <source :src="serverUrl + '/upload/quest/' + questId + '/step/video/' + selectedStep.form.videoStream" type="video/mp4" />
        </video>
      </div>
    </div>
    
    <!------------------ STEP : WIN NEW ITEM ------------------------>
    
    <div class="inventory" v-if="options.code == 'new-item'">
      <q-radio v-model="imageSource" val="list" :label="$t('label.SelectPictureInTheList')" />
      <div class="row objects-list" v-show="imageSource === 'list'">
        <div class="col-2 q-pa-sm" v-for="(item, key) in objectsList" :key="key">
          <img style="width: 100%" :class="{'selected': (selectedStep.form.options.picture && selectedStep.form.options.picture === 'statics/images/object/' + objectsList[key].file)}" :src="'statics/images/object/' + item.thumb" @click="selectObject(key)" />
        </div>
      </div>
      <q-radio v-model="imageSource" val="upload" :label="$t('label.UploadTheItemPicture')" />
      <div v-show="imageSource === 'upload'">
        <q-btn class="full-width" type="button">
          <label for="itemfile">{{ $t('label.UploadTheItemPicture') }}</label>
          <input @change="uploadItemImage" name="itemfile" id="itemfile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
        </q-btn>
        <p v-show="$v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
        <p>{{ $t('label.WarningImageSizeSquare') }}</p>
      </div>
      <div v-if="selectedStep.form.options !== null && selectedStep.form.options.picture && selectedStep.form.options.picture !== null">
        <p>{{ $t('label.YourItemPicture') }} :</p>
        <img style="width:100%" :src="(selectedStep.form.options.picture.indexOf('statics/') !== -1 ? selectedStep.form.options.picture : serverUrl + '/upload/quest/' + questId + '/step/new-item/' + selectedStep.form.options.picture)" />
      </div>
      <!--<p>{{ $t('message.Or') }}</p>
      <q-select :float-label="$t('message.ObjectToUse')" :options="questItemsAsOptions" v-model="form.answerItem" />
      <div v-show="form.answerItem !== null">
        {{ $t('message.SelectedObject') }} :
        <q-icon :name="getItemIcon(form.answerItem)" />
      </div>-->
      <q-field
        :error="$v.selectedStep.form.options.title.$error"
        :error-label="$t('label.RequiredField')"
      >
        <q-input v-model="selectedStep.form.options.title" :float-label="$t('label.ObjectName')" />
      </q-field>
    </div>
    
    <!------------------ STEP : GRAALY CHARACTER ------------------------>
    
    <div v-if="options.code == 'character'">
      <h2>{{ $t('label.Character') }}</h2>
      <div class="answer">
        <q-radio v-model="selectedStep.form.options.character" val="1" />
        <p><img src="statics/icons/story/character1_attitude1.png" /></p>
      </div>
      <div class="answer">
        <q-radio v-model="selectedStep.form.options.character" val="2" />
        <p><img src="statics/icons/story/character2_attitude1.png" /></p>
      </div>
      <div class="answer">
        <q-radio v-model="selectedStep.form.options.character" val="3" />
        <p><img src="statics/icons/story/character3_attitude1.png" /></p>
      </div>
      <div class="answer">
        <q-radio v-model="selectedStep.form.options.character" val="4" />
        <p><img src="statics/icons/story/character4_attitude1.png" /></p>
      </div>
    </div>
    
    <!------------------ STEP : GEOLOCATION ------------------------>
    
    <div v-if="options.code == 'geolocation'" class="location-gps">
      <h2>{{ $t('label.AddressToFind') }}</h2>
      <div class="fields-group">
        <div class="location-address">
          <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
            <gmap-autocomplete id="destination" :placeholder="$t('label.Address')" v-model="selectedStep.form.options.destination" class="col q-input-target text-left" @place_changed="setLocation"></gmap-autocomplete>
          </div>
          <a @click="getCurrentLocation()"><img src="statics/icons/game/location.png" /></a>
        </div>
        <q-list>
          <q-collapsible icon="explore" :label="$t('label.OrDefineGPSLocation')">
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
              <a @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
            </div>
          </q-collapsible>
        </q-list>
      </div>
    </div>
    
    <!------------------ STEP : MULTIPLE CHOICE ------------------------>
    
    <div v-if="options.code == 'choose'">
      
      <h2>{{ $t('label.ResponseTypes') }}</h2>
      <q-radio v-model="answerType" val="text" :label="$t('label.Texts')" @click="$v.selectedStep.form.options.$touch" />
      <q-radio v-model="answerType" val="image" :label="$t('label.Pictures')" @click="$v.selectedStep.form.options.$touch" />
        
      <h2>{{ $t('label.PossibleAnswers') }}</h2>
      <p>{{ $t('label.SelectTheGoodAnswer') }}</p>
        
      <div class="answer" v-for="(option, key) in selectedStep.form.options" :key="key">
        <q-radio v-model="selectedStep.form.answers" :val="key" />
        
        <q-input v-show="answerType === 'text'" v-model="option.text" @input="$v.selectedStep.form.options ? $v.selectedStep.form.options.$each[key].text.$touch : null" />
        <p class="error-label" v-if="answerType === 'text' && $v.selectedStep.form.options && !$v.selectedStep.form.options.$each[key].text.required">{{ $t('label.RequiredField') }}</p>
        
        <p v-show="answerType === 'image' && option.imagePath === null" :class="{'error-label': $v.selectedStep.form.options && !$v.selectedStep.form.options.$each[key].imagePath.required}">{{ $t('label.NoPictureUploaded') }}</p>
        <p><img v-if="answerType === 'image' && option.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/choose-image/' + option.imagePath" /></p>
        <q-btn v-show="answerType === 'image'">
          <label :for="'answerImage' + key"><q-icon name="file upload" /></label>
          <input @change="uploadAnswerImage(key, $event)" :name="'answerImage' + key" :id="'answerImage' + key" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
        </q-btn>
        <q-btn @click="deleteAnswer(key)">
          <q-icon name="clear" />
        </q-btn>
      </div>
      <q-btn @click="addAnswer()" class="full-width add-answer">
        {{ $t('label.AddAnAnswer') }}
      </q-btn>
    </div>
    
    <!------------------ STEP : SIMPLE TEXT ------------------------>
    
    <div v-if="options.code == 'write-text'">
      <q-field 
        :error="$v.selectedStep.form.answers.$error"
        :error-label="$t('label.RequiredField')">
        <q-input
          v-model="selectedStep.form.answers"
          :float-label="$t('label.ExpectedAnswer')"
        />
      </q-field>
    </div>
    
    <!------------------ STEP : CODE KEYPAD ------------------------>
    
    <div v-if="options.code == 'code-keypad'">
    
      <q-field 
        :error="$v.selectedStep.form.answers.$error"
        :error-label="$t('label.CodeKeypadFormatError')">
        <q-input
          v-model="selectedStep.form.answers"
          :float-label="$t('label.Code')"
          min-length="2"
          max-length="6"
          @blur="$v.selectedStep.form.answers.$touch"
          @input="$v.selectedStep.form.answers.$touch"
        />
      </q-field>
    </div>
    
    <!------------------ STEP : COLOR CODE ------------------------>
    
    <div v-if="options.code == 'code-color'" class="code-color">
      <q-select :float-label="$t('label.NumberOfColorsInTheCode')" :options="numberOfDigitsOptions" v-model="selectedStep.form.options.codeLength" @input="changeDigitsNumberInCode" />
      <h2>{{ $t('label.ExpectedColorCodeAnswer') }}</h2>
      <table>
      <tr>
        <td v-for="(color, index) in unformatedAnswer" :key="index">
          <q-select :ref="'colorSelect' + index" v-model="unformatedAnswer[index]" :options="colorsForCode"  />
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
    
    <div v-if="options.code == 'code-image'" class="code-image">
      <h2>{{ $t('label.ImagesUsedForCode') }}</h2>
      <div class="answer" v-for="(image, key) in selectedStep.form.options.images" :key="key">
        
        <p v-show="image.imagePath === null" :class="{'error-label': $v.selectedStep.form.options && !$v.selectedStep.form.options.$each[key].imagePath.required}">{{ $t('label.NoPictureUploaded') }}</p>
        <p><img v-if="image.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/code-image/' + image.imagePath" /></p>
        <q-btn>
          <label :for="'answerImage' + key"><q-icon name="file upload" /></label>
          <input @change="uploadCodeAnswerImage(key, $event)" :name="'answerImage' + key" :id="'answerImage' + key" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
        </q-btn>
        <q-btn @click="deleteCodeAnswer(key)">
          <q-icon name="clear" />
        </q-btn>
      </div>
      <q-btn @click="addCodeAnswer()" class="full-width add-answer">
        {{ $t('label.AddAnImage') }}
      </q-btn>
      <div v-if="selectedStep.form.options.images && selectedStep.form.options.images.length > 0 && selectedStep.form.options.images[0].imagePath">
        <h2>{{ $t('label.ExpectedCode') }}</h2>
        <q-select :float-label="$t('label.NumberOfImagesInTheCode')" :options="numberOfDigitsOptions" v-model="selectedStep.form.options.codeLength" @input="changeDigitsNumberInCode" />
        <table>
          <tr>
            <td v-for="(code, index) in unformatedAnswer" :key="index" class="text-center" @click="previousCodeAnswer(index)">
              <q-icon name="keyboard_arrow_up" />
            </td>
          </tr>
          <tr>
            <td v-for="(code, index) in unformatedAnswer" :key="index">
              <img :id="'image-code-setting-' + index" :src="serverUrl + '/upload/quest/' + questId + '/step/code-image/' + selectedStep.form.options.images[code].imagePath" />
            </td>
          </tr>
          <tr>
            <td v-for="(code, index) in unformatedAnswer" :key="index" class="text-center" @click="nextCodeAnswer(index)">
              <q-icon name="keyboard_arrow_down" />
            </td>
          </tr>
        </table>
      </div>
    </div>
    
    <!------------------ STEP : IMAGE RECOGNITION ------------------------>
    
    <div v-if="options.code == 'image-recognition'" class="image-recognition">
      <q-btn class="full-width" type="button">
        <label for="image-to-recognize">{{ $t('label.UploadThePictureOfTheObjectToFind') }}</label>
        <input @change="uploadImageToRecognize" name="image-to-recognize" id="image-to-recognize" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
      </q-btn>
      <p v-show="$v.selectedStep.form.answers.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
      <div v-if="selectedStep.form.answers != ''">
        <p>{{ $t('label.UploadedPicture') }} :</p>
        <img :src="serverUrl + '/upload/quest/' + questId + '/step/image-recognition/' + selectedStep.form.answers" />
      </div>
    </div>
    
    <!------------------ STEP : JIGSAW PUZZLE ------------------------>
    
    <div v-if="options.code === 'jigsaw-puzzle'">
      <div class="background-upload">
        <q-btn class="full-width" type="button">
          <label for="puzzlefile">{{ $t('label.UploadThePuzzlePicture') }}</label>
          <input @change="uploadPuzzleImage" name="puzzlefile" id="puzzlefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
        </q-btn>
        <p v-show="$v.selectedStep.form.options.picture && $v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
        <p v-if="!selectedStep.form.options.picture">{{ $t('label.WarningImageSizeSquare') }}</p>
        <div v-if="selectedStep.form.options.picture">
          <p>{{ $t('label.YourPuzzlePicture') }} :</p>
          <img :src="serverUrl + '/upload/quest/' + questId + '/step/jigsaw-puzzle/' + selectedStep.form.options.picture" />
        </div>
      </div>
      <div>
        <q-select :float-label="$t('label.Difficulty')" :options="jigsawLevels" v-model="selectedStep.form.options.level" />
      </div>
    </div>
    
    <!------------------ STEP : MEMORY PUZZLE ------------------------>
    
    <div v-if="options.code === 'memory'">
      <h2>{{ $t('label.ImagesUsedForCards') }}</h2>
      <div class="answer" v-for="(option, key) in memoryItems" :key="key">       
        <p v-show="option.imagePath === null" class="error-label">{{ $t('label.NoPictureUploaded') }}</p>
        <p><img v-if="option.imagePath !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/memory/' + option.imagePath" /></p>
        <q-btn>
          <label :for="'answerImage' + key"><q-icon name="file upload" /></label>
          <input @change="uploadMemoryImage(key, $event)" :name="'answerImage' + key" :id="'answerImage' + key" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
        </q-btn>
        <q-btn @click="deleteMemoryAnswer(key)">
          <q-icon name="clear" />
        </q-btn>
      </div>
      <q-btn @click="addAnswer()" class="full-width add-answer">
        {{ $t('label.AddAnAnswer') }}
      </q-btn>
    </div>
    
    <!------------------ STEP : USE INVENTORY ITEM ------------------------>
    
    <div class="find-item" v-if="options.code == 'use-item' && selectedStep.form.backgroundImage">
      <p>{{ $t('label.ClickOnTheLocationTheItemMustBeUsed') }} :</p>
      <div @click="getClickCoordinates($event)" id="useItemPicture" ref="useItemPicture" :style="'overflow: hidden; background-image: url(' + serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 90vw; height: 120vw; margin: auto;'">
        <img id="cross" :style="'position: relative; z-index: 500; top: 52vw; left: 37vw; width: 16vw; height: 16vw;'" src="statics/icons/game/find-item-locator.png" />
      </div>
    </div>
    <div class="inventory" v-if="options.code == 'use-item'">
      <q-field
        :error="$v.selectedStep.form.answerItem && $v.selectedStep.form.answerItem.$error"
        :error-label="$t('label.RequiredField')">
        <q-select :float-label="$t('label.ObjectToUse')" :options="questItemsAsOptions" v-model="selectedStep.form.answerItem" @change="$v.selectedStep.form.answerItem.$touch" />
      </q-field>
      <div v-if="selectedStep.form.answerItem">
        {{ $t('label.SelectedObject') }} :
        <img style="width: 100%" :src="(selectedStep.form.answerItem.indexOf('statics/') !== -1 ? selectedStep.form.answerItem : serverUrl + '/upload/quest/' + questId + '/step/new-item/' + selectedStep.form.answerItem)" />
      </div>
    </div>
    
    <!------------------ STEP : FIND ITEM ------------------------>

    <div class="find-item" v-if="options.code === 'find-item' && (selectedStep.form.backgroundImage !== null && selectedStep.form.backgroundImage !== '')">
      <p>{{ $t('label.ClickOnTheItemThatIsToFind') }} :</p>
      <div @click="getClickCoordinates($event)" id="findItemPicture" ref="findItemPicture" :style="'overflow: hidden;background-image: url(' + serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 90vw; height: 120vw; margin: auto;'">
        <img id="cross" :style="'position: relative; z-index: 500; top: 52vw; left: 37vw; width: 16vw; height: 16vw;'" src="statics/icons/game/find-item-locator.png" />
      </div>
    </div>
    
    <!------------------ STEP : LOCATE ITEM USING AR ------------------------>

    <div class="locate-item-ar" v-if="options.code === 'locate-item-ar'">
      <h2>{{ $t('label.ObjectFormat') }}</h2>
      <div class="fields-group">
        <q-radio v-model="selectedStep.form.options.is3D" :val="false" :label="$t('label.2DPicture')" />
        <q-radio v-model="selectedStep.form.options.is3D" :val="true" :label="$t('label.3DObject')" />
      
        <div v-if="!selectedStep.form.options.is3D">
          <q-btn class="full-width" type="button">
            <label for="item-to-find">{{ $t('label.UploadThePictureOfTheObjectToFind') }}</label>
            <input @change="uploadItemImage" name="item-to-find" id="item-to-find" type="file" accept="image/png" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
          </q-btn>
          <p v-show="!selectedStep.form.options.picture">{{ $t('label.PleaseUploadAFileInPNGFormat') }}</p>
          <p v-show="$v.selectedStep.form.options.picture.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <div v-if="selectedStep.form.options.picture">
            <p>{{ $t('label.UploadedPicture') }} :</p>
            <img :src="serverUrl + '/upload/quest/' + questId + '/step/locate-item-ar/' + selectedStep.form.options.picture" />
          </div>
          <div>
            <p>{{ $t('label.ObjectSize') }}</p>
            <q-slider v-model="selectedStep.form.options.objectSize" :min="0.5" :max="10" :step="0.1"
              label-always :decimals="1" :label-value="`${ selectedStep.form.options.objectSize || 0.5 }m`" />
          </div>
        </div>
        <div v-if="selectedStep.form.options.is3D">
          <q-select v-model="selectedStep.form.options.model" :float-label="$t('label.Choose3DModel')" :options="selectModel3DOptions" />
          <p class="error-label" v-show="$v.selectedStep.form.options.model.$error">{{ $t('label.RequiredField') }}</p>
        </div>
      </div>
      
      <h2>{{ $t('label.AddressToFind') }}</h2>
      <div class="fields-group">
        <div class="location-address">
          <div class="q-if row no-wrap items-center relative-position q-input q-if-has-label text-primary">
            <gmap-autocomplete id="destination" :placeholder="$t('label.Address')" v-model="selectedStep.form.options.destination" class="col q-input-target text-left" @place_changed="setLocation"></gmap-autocomplete>
          </div>
          <a @click="getCurrentLocation()"><img src="statics/icons/game/location.png" /></a>
        </div>
        <q-list>
          <q-collapsible icon="explore" :label="$t('label.OrDefineGPSLocation')">
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
              <a @click="getMyGPSLocation()">{{ $t('label.UseMyCurrentGPSLocation') }}</a>
            </div>
          </q-collapsible>
        </q-list>
      </div>
    </div>
    
    <!------------------ STEPS : FIND AR MARKER, TOUCH OBJECT ON AR MARKER ------------------------>
    
    <div class="locate-marker" v-if="(options.code === 'locate-marker' || options.code === 'touch-object-on-marker') && typeof selectedStep.form.answers === 'string'">
      <h2>{{ $t('label.Marker') }}</h2>
      
      <p>
        <img :src="'statics/markers/' + selectedStep.form.answers + '/marker.png'" />
        <span>{{ selectedStep.form.answers }}</span>
        <q-btn color="primary" :label="$t('label.Choose')" @click="openChooseMarkerModal()" />
      </p>
      
      <q-select v-if="options.code === 'locate-marker'" :float-label="$t('label.TransparentImageAboveCameraStream')" :options="layersForMarkersOptions" v-model="selectedStep.form.options.layerCode" />
      
      <div v-if="options.code === 'touch-object-on-marker'">
        <q-select v-model="selectedStep.form.options.model" :float-label="$t('label.Choose3DModel')" :options="selectModel3DOptions" />
        <p class="error-label" v-show="$v.selectedStep.form.options && $v.selectedStep.form.options.model.$error">{{ $t('label.RequiredField') }}</p>
      </div>
      
      <q-modal v-model="markerModalOpened">
        <h2>{{ $t('label.ChooseTheMarker') }}</h2>
        
        <q-btn v-for="(option, key) in markersList" :key="key" color="white" class="full-width" @click="selectMarker(option)">
          <img :src="'statics/markers/' + option + '/marker.png'" />
          <span>{{ option }}</span>
        </q-btn>
        
        <q-btn
          color="primary"
          class="full-width"
          @click="closeChooseMarkerModal()"
          label="Cancel"
        />
      </q-modal>
    </div>
    
    <!------------------ OTHER OPTIONS ------------------------>
    
    <q-list v-show="options.hasOptions" separator>
      <q-collapsible icon="add_box" :label="$t('label.OtherOptions')">
        <div v-if="options.code == 'geolocation' || options.code == 'locate-item-ar'" class="location-gps">
          <q-toggle v-model="selectedStep.form.showDistanceToTarget" :label="$t('label.DisplayDistanceBetweenUserAndLocation')" />
          <q-toggle v-model="selectedStep.form.showDirectionToTarget" :label="$t('label.DisplayDirectionArrow')" />
        </div>
        <div v-if="options.code === 'memory'">
          <q-toggle v-model="selectedStep.form.options.lastIsSingle" :label="$t('label.LastItemIsUniq')" />
        </div>
        <div v-if="options.code === 'info-text'">
          <q-input v-model="selectedStep.form.options.initDuration" :float-label="$t('label.DurationBeforeTextAppearAbovePicture')" />
        </div>
        <div class="background-upload" v-show="options.hasBackgroundImage && options.hasBackgroundImage === 'option'">
          <q-btn class="full-width" type="button">
            <q-icon name="cloud_upload" /> <label for="picturefile2">{{ $t('label.UploadABackgroundImage') }}</label>
            <input @input="uploadBackgroundImage" name="picturefile2" id="picturefile2" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;" />
          </q-btn>
          <p v-show="$v.selectedStep.form.backgroundImage && $v.selectedStep.form.backgroundImage.$error" class="error-label">{{ $t('label.PleaseUploadAFile') }}</p>
          <p v-if="!selectedStep.form.backgroundImage">{{ $t('label.WarningImageResize') }}</p>
          <div v-if="selectedStep.form.backgroundImage !== null && selectedStep.form.backgroundImage !== '' && options.code !== 'find-item' && options.code !== 'use-item'">
            <p>{{ $t('label.YourPicture') }} :</p>
            <img v-if="questId !== null" :src="serverUrl + '/upload/quest/' + questId + '/step/background/' + selectedStep.form.backgroundImage" /> <br />
            <a @click="resetBackgroundImage">{{ $t('label.remove') }}</a>
          </div>
        </div>
        <q-field>
          <q-input
            :float-label="$t('label.ExtraTextFieldLabel')"
            v-model="selectedStep.form.extraText[lang]"
            type="textarea"
            :max-height="100"
            :min-rows="4"
            class="full-width"
          />
        </q-field>
      </q-collapsible>
    </q-list>
    
    <!------------------ HINT ------------------------>
    
    <q-list v-show="options.showTrick == 'yes'" separator>
      <q-collapsible icon="lightbulb outline" :label="$t('label.Hint')">
        <q-input v-model="selectedStep.form.hint[lang]" :float-label="$t('label.HintText')" />
      </q-collapsible>
    </q-list>
    
    <q-btn class="full-width" color="primary" @click="submitStep">{{ $t('label.SaveThisStep') }}</q-btn>
    
    <q-modal id="save-changes-modal" v-model="saveChangesModalOpened" minimized>
      <a class="float-right no-underline" @click="saveChangesModalOpened = false"><q-icon name="close" class="medium-icon" /></a>
      
      <p>{{ $t('label.ConfirmSaveChanges') }}</p>
      
      <div class="full-width">
        <q-btn color="primary" @click="submitStep()" :label="$t('label.Yes')" />
        <q-btn color="primary" @click="$emit('close')" :label="$t('label.No')" />
      </div>
    </q-modal>
    
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Notification from 'plugins/NotifyHelper'
import hash from 'object-hash'
import utils from 'src/includes/utils'

import colorsForCode from 'data/colorsForCode.json'
import stepTypes from 'data/stepTypes.json'
import modelsList from 'data/3DModels.json'
import objectsList from 'data/2Dobjects.json'
import markersList from 'data/markers.json'
import layersForMarkers from 'data/layersForMarkers.json'

import StepService from 'services/StepService'

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
    stepId: async function(newVal, oldVal) {
      await this.initData()
    }
  },
  data() {
    return {
      questId: null,
      selectedStep: {
        isNew: true,
        id: 0,
        code: null,
        type: null,
        form: {
          title: {},
          text: {},
          extraText: {},
          options: {},
          hint: {}
        }
      },
      stepTypes,
      objectsList,
      markersList,
      titleMaxLength: 50,
      imageSource: '',
      originalStepData: {}, // helps to detect if step has been modified
      saveChangesModalOpened: false,
      
      /*
       * List of the levels for the jigsaw step
       */
      jigsawLevels: [
        { value: 1, label: this.$t('label.Easy') },
        { value: 2, label: this.$t('label.Medium') },
        { value: 3, label: this.$t('label.Hard') }
      ],
            
      answerType: 'text',
      numberOfDigitsOptions: [
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3" },
        { value: 4, label: "4" }
      ],
      defaultNbAnswers: 4,
      minNbAnswers: 2,
      maxNbAnswers: 6,
      rightAnswerIndex: 0,
      serverUrl: process.env.SERVER_URL,
      
      // for 'code-color' steps
      colorsForCode: this.getColorsForCodeOptions(),
      
      // for 'code-image' steps
      imagesForCode: this.getImagesForCodeOptions(),
      
      // for 'new-item' & 'use-item' steps
      questItemsAsOptions: [],
      questItems: [],
      
      // for 'memory' steps
      memoryItems: [],
      
      unformatedAnswer: null,
      
      // for 'locate-item-ar'
      selectModel3DOptions: [],
      
      // for 'locate-marker' and 'touch-object-on-marker'
      markerModalOpened: false,
      layersForMarkersOptions: [] // for 'locate-marker' only
    }
  },
  computed: {
    mainTextFieldLabel() {
      return this.options.category === 'enigma' ? 'Question' : 'Text'
    },
    /*
     * Define text field length
     */
    mainTextMaxLength() {
      let maxNbChars = 500 // default
      
      if (this.options.textRules && this.options.textRules.maxNbChars) {
        maxNbChars = this.options.textRules.maxNbChars
      }
      
      return maxNbChars
    },
    currentLanguageForLabels() {
      return this.quest.languages.length > 1 ? '[' + this.lang.toUpperCase() + ']' : ''
    }
  },
  async mounted() {
    await this.initData()
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
        backgroundImage: null,
        // info-video step specific
        videoStream: null,
        // geoloc step specific
        answerPointerCoordinates: {top: 50, left: 50},
        answerItem: null,
        showDistanceToTarget: true,
        showDirectionToTarget: true,
        trigger: {
          type: 'none'
        },
        wrongAnswerAnimation: {
          type: 'none'
        },
        hint: {}, // {fr: 'un indice', en: 'a hint', ...}
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
      this.questId = this.quest._id
      // reset step data
      this.resetStep()
      // if step is not defined and step type is not choosen
      if (this.stepId && this.stepId === '-1') {
        return
      }
      await this.getStepId()
      // initialize step form data when edited
      if (!this.selectedStep.isNew) {
        var response = await StepService.getById(this.stepId)
        if (response && response.data) {
          Object.assign(this.selectedStep.form, response.data)
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      } else {
        this.selectedStep.form.type = this.options.code
      }
      // retrieve step type properties
      this.selectedStep.type = this.getStepType(this.selectedStep.form.type)
      
      // compute number of steps
      if (this.selectedStep.form.number === null) {
        var numberOfSteps = await StepService.countForAQuest(this.questId)
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
      
      // initialize specific steps
      if (this.options.code === 'choose') {
        if (!Array.isArray(this.selectedStep.form.options)) {
          this.answerType = 'text'
          this.selectedStep.form.options = []
          this.selectedStep.form.answers = 0
          for (let i = 0; i < this.defaultNbAnswers; i++) {
            this.selectedStep.form.options.push({ text: this.$t('label.AnswerNb', { nb: (i + 1) }), imagePath: null })
          }
        } else {
          this.answerType = this.selectedStep.form.options[0].hasOwnProperty('imagePath') && this.selectedStep.form.options[0].imagePath !== null ? 'image' : 'text'
        }
        this.minNbAnswers = 2
        this.maxNbAnswers = 6
      } else if (this.options.code === 'code-color') {
        if (this.selectedStep.form.answers && typeof this.selectedStep.form.answers === 'string' && this.selectedStep.form.answers.indexOf('|') !== -1) {
          this.unformatedAnswer = this.selectedStep.form.answers.split("|")
        } else {
          this.unformatedAnswer = Array(4).fill('red')
        }
        if (!this.selectedStep.form.options.codeLength) {
          this.selectedStep.form.options.codeLength = 4
        }
      } else if (this.options.code === 'code-image') {
        // init images list
        if (!this.selectedStep.form.options || !this.selectedStep.form.options.images) {
          this.selectedStep.form.options = {images: []}
          for (let i = 0; i < this.defaultNbAnswers; i++) {
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
      } else if (this.options.code === 'code-keypad') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.selectedStep.form.answers = ""
        }
      } else if (this.options.code === 'write-text') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.selectedStep.form.answers = ""
        }
      } else if (this.options.code === 'info-text') {
        if (!this.selectedStep.form.options.hasOwnProperty('initDuration')) {
          this.selectedStep.form.options = { initDuration: 1 }
        }
      } else if (this.options.code === 'image-recognition') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.selectedStep.form.answers = ""
        }
      } else if (this.options.code === 'find-item') {
        if (this.selectedStep.form.answers.hasOwnProperty('top')) {
          this.selectedStep.form.answerPointerCoordinates = this.selectedStep.form.answers
          this.$nextTick(function () {
            // Code that will run only after the entire view has been rendered
            this.positionFindItemPointer()
          })
        }
      } else if (this.options.code === 'use-item') {
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
      } else if (this.options.code === 'new-item') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.selectedStep.form.options = { picture: null, title: "" }
        }
      } else if (this.options.code === 'jigsaw-puzzle') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.selectedStep.form.options = { picture: null, level: 2 }
        }
      } else if (this.options.code === 'memory') {
        if (!this.selectedStep.form.options.items) {
          this.selectedStep.form.options = {lastIsSingle: false}
          this.memoryItems = []
          for (let i = 0; i < 8; i++) {
            this.memoryItems.push({ imagePath: null, single: false })
          }
        } else {
          this.memoryItems = this.selectedStep.form.options.items
        }
        this.minNbAnswers = 3
        this.maxNbAnswers = 12
      } else if (this.options.code === 'locate-item-ar') {
        if (!this.selectedStep.form.options.hasOwnProperty('picture')) {
          this.$set(this.selectedStep.form.options, 'picture', null)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('objectSize')) {
          this.$set(this.selectedStep.form.options, 'objectSize', 1)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('is3D')) {
          this.$set(this.selectedStep.form.options, 'is3D', false)
        }
        if (!this.selectedStep.form.options.hasOwnProperty('model')) {
          this.$set(this.selectedStep.form.options, 'model', null)
        }
        // create options for 3D Model selection
        for (let key in modelsList) {
          this.selectModel3DOptions.push({ label: modelsList[key].name[this.$store.state.user.language], value: key })
        }
        // sort options in alphabetical order
        this.selectModel3DOptions = this.selectModel3DOptions.sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
      } else if (this.options.code === 'locate-marker') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.$set(this.selectedStep.form, 'answers', markersList[0])
        }
        // create options for layer above camera stream selection
        for (let layer of layersForMarkers) {
          this.layersForMarkersOptions.push({ label: this.$t('layersForMarkers.' + layer.label), value: layer.code })
        }
        // sort options in alphabetical order
        this.layersForMarkersOptions = this.layersForMarkersOptions.sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
        // default layer = first
        if (!this.selectedStep.form.options.hasOwnProperty('layerCode')) {
          this.$set(this.selectedStep.form.options, 'layerCode', layersForMarkers[0].code)
        }
      } else if (this.options.code === 'touch-object-on-marker') {
        if (typeof this.selectedStep.form.answers !== 'string') {
          this.$set(this.selectedStep.form, 'answers', markersList[0])
        }
        // create options for 3D Model selection
        for (let key in modelsList) {
          this.selectModel3DOptions.push({ label: modelsList[key].name[this.$store.state.user.language], value: key })
        }
        // sort options in alphabetical order
        this.selectModel3DOptions = this.selectModel3DOptions.sort((a, b) => {
          return a.label.localeCompare(b.label)
        })
        if (!this.selectedStep.form.options.hasOwnProperty('model')) {
          this.$set(this.selectedStep.form.options, 'model', null)
        }
      }
      
      this.originalStepData = utils.clone(this.selectedStep.form)
    },
    /*
     * Submit step data
     */
    async submitStep() {
      this.$v.selectedStep.form.$touch()
      
      // treat form errors (based on validation rules)
      if (this.$v.selectedStep.form.$error) {
        Notification(this.$t('label.StepSettingsFormError'), 'error')
        return
      }
      
      // format answer based on the type of step
      if (this.options.code === 'choose') {
        if (this.answerType === 'text') {
          // clear all images => playStep.vue will consider that player should choose between text options
          this.selectedStep.form.options = this.selectedStep.form.options.map((option) => { option.imagePath = null; return option })
        }
      }
      if (this.options.code === 'character') {
        if (!this.selectedStep.form.options.character) {
          this.selectedStep.form.options.character = "1"
        }
      }
      if (this.options.code === 'code-keypad') {
        this.selectedStep.form.options.codeLength = this.selectedStep.form.answers.length
      }
      if (this.options.code === 'code-color') {
        this.selectedStep.form.answers = this.unformatedAnswer.join('|')
      }
      if (this.options.code === 'code-image') {
        this.selectedStep.form.answers = this.unformatedAnswer.join('|')
      }
      if (this.options.code === 'jigsaw-puzzle') {
        // build random order for jigsaw puzzle pieces.
        let piecePositionArray = utils.buildIncrementalArray(Math.pow(parseInt(this.selectedStep.form.options.level, 10) * 2, 2))
        piecePositionArray = utils.shuffle(piecePositionArray)
        this.selectedStep.form.answers = piecePositionArray.join('|')
      }
      if (this.options.code === 'memory') {
        this.selectedStep.form.options.items = this.memoryItems
        if (this.selectedStep.form.options.lastIsSingle && this.selectedStep.form.options.items && this.selectedStep.form.options.items.length > 0) {
          this.selectedStep.form.options.items[this.selectedStep.form.options.items.length - 1].single = true
        }
      }
      if (this.options.code === 'find-item') {
        this.selectedStep.form.answers = this.selectedStep.form.answerPointerCoordinates
      }
      if (this.options.code === 'use-item') {
        this.selectedStep.form.answers = {coordinates: this.selectedStep.form.answerPointerCoordinates, item: this.selectedStep.form.answerItem}
      }
      if (this.options.code === 'new-item') {
        //this.selectedStep.form.answers = this.selectedStep.form.answerItem
      }
      
      // save step data
      let newStepData = Object.assign(this.selectedStep.form, {
        questId: this.questId,
        type: this.options.code
      })
      this.$q.loading.show()
      let stepData = await StepService.save(newStepData)
      this.$q.loading.hide()

      if (stepData && stepData.data && stepData.data.stepId) {
        // send change event to parent, with stepId information
        newStepData.id = stepData.data.stepId
        this.$emit('change', newStepData)
      } else {
        Notification(this.$t('label.TechnicalIssue'), 'error')
      }
    },
    
    /*
     * Add an answer in the multiple choice step
     */
    addAnswer: function () {
      if (this.selectedStep.form.options.length >= this.maxNbAnswers) {
        Notification(this.$t('label.YouCantAddMoreThanNbAnswers', { nb: this.maxNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.push({
          isRightAnswer: false,
          text: this.$t('label.AnswerNb', { nb: (this.selectedStep.form.options.length + 1) }), // text default data
          imagePath: null // image default data
        })
      }
    },
    /*
     * Add a picture answer in the multiple choice step
     */
    addCodeAnswer: function () {
      if (this.selectedStep.form.options.images.length >= this.maxNbAnswers) {
        Notification(this.$t('label.YouCantAddMoreThanNbAnswers', { nb: this.maxNbAnswers }), 'error')
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
      if (this.selectedStep.form.options.length <= this.minNbAnswers) {
        Notification(this.$t('label.YouMustDefineAtLeastNbAnswers', { nb: this.minNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.splice(key, 1);
      }
    },
    /*
     * Add a picture answer in the multiple choice step
     */
    deleteCodeAnswer: function (key) {
      if (this.selectedStep.form.options.images.length <= this.minNbAnswers) {
        Notification(this.$t('label.YouMustDefineAtLeastNbAnswers', { nb: this.minNbAnswers }), 'error')
      } else {
        this.selectedStep.form.options.images.splice(key, 1);
      }
    },
    /*
     * Change the number of digits in code
     */
    changeDigitsNumberInCode: function() {
      if (this.options.code === 'code-color') {
        this.unformatedAnswer.length = 0      
        const codeLength = parseInt(this.selectedStep.form.options.codeLength, 10)
        while (codeLength > this.unformatedAnswer.length) {
          this.unformatedAnswer.push('red')
        }
      } else if (this.options.code === 'code-image') {
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
     * Upload the background image
     * @param   {Object}    e            Upload data
     */
    async uploadBackgroundImage(e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadBackgroundImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.backgroundImage = uploadResult.data.file
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
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
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('video', files[0])
      let uploadResult = await StepService.uploadVideo(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.videoStream = uploadResult.data.file
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
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadImageToRecognize(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.answers = uploadResult.data.file
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
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadAnswerImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.options[key].imagePath = uploadResult.data.file
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
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadMemoryImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.memoryItems[key].imagePath = uploadResult.data.file
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Delete an answer in the memory game
     */
    deleteMemoryAnswer: function (key) {
      if (this.memoryItems.length <= this.minNbAnswers) {
        Notification(this.$t('label.YouMustDefineAtLeastNbAnswers', { nb: this.minNbAnswers }), 'error')
      } else {
        this.memoryItems.splice(key, 1);
      }
    },
    /*
     * Upload a picture for the image code step
     * @param   {Object}    e            Upload data
     */
    async uploadCodeAnswerImage(key, e) {
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadCodeAnswerImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.options.images[key].imagePath = uploadResult.data.file
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
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadPuzzleImage(this.questId, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.options.picture = uploadResult.data.file
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
      this.$q.loading.show()
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      let uploadResult = await StepService.uploadItemImage(this.questId, this.options.code, data)
      if (uploadResult && uploadResult.hasOwnProperty('data')) {
        this.selectedStep.form.options.picture = uploadResult.data.file
      } else {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
      }
      this.$q.loading.hide()
    },
    /*
     * Select an object in the list
     * @param   {Number}    key            key in the objects array
     */
    async selectObject(key) {
      this.selectedStep.form.options.title = this.objectsList[key].name[this.lang]
      this.selectedStep.form.options.picture = 'statics/images/object/' + this.objectsList[key].file
    },
    /*
     * Get the list of colors for the color code step
     */
    getColorsForCodeOptions() {
      let options = []
      colorsForCode.forEach((code) => {
        options.push({
          value: code,
          label: this.$t('color.' + code)
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
     * Get the list of the items won on previous steps
     */
    async getQuestItemsAsOptions() {
      // load items won on previous steps
      var response = await StepService.listWonObjects(this.questId, this.stepId)
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
        this.questItemsAsOptions = options
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
      
      let picture = this.options.code === 'use-item' ? this.$refs['useItemPicture'] : this.$refs['findItemPicture']
      
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
    async getMyGPSLocation() {
      this.$q.loading.show()
      navigator.geolocation.getCurrentPosition(async (position) => {
        this.selectedStep.form.options.lat = position.coords.latitude
        this.selectedStep.form.options.lng = position.coords.longitude
        this.$v.selectedStep.form.options.lat.$touch()
        this.$v.selectedStep.form.options.lng.$touch()
        this.$q.loading.hide()
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
      
      if (this.options.textRules && this.options.textRules.maxNbCarriageReturns) {
        maxNbCarriageReturns = this.options.textRules.maxNbCarriageReturns
      }
      
      if (value === null || typeof value === 'undefined') {
        value = ''
      }
      
      // (value.match(/\n/g) || []).length counts number of carriage returns in value.
      // see https://stackoverflow.com/q/881085/488666
      return value.length <= maxNbChars && (value.match(/\n/g) || []).length <= maxNbCarriageReturns
    },
    openChooseMarkerModal() {
      this.markerModalOpened = true
    },
    closeChooseMarkerModal() {
      this.markerModalOpened = false
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
    switch (this.options.code) {
      case 'choose':
        fieldsToValidate.options = {
          $each: this.answerType === 'text' ? { text: { required }, imagePath: {} } : { text: {}, imagePath: { required } }
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
    }
    
    return { selectedStep: { form: fieldsToValidate } }
  }
}
</script>

<style scoped>

#main-view { padding: 1rem; overflow-y: scroll; }

h1 { margin-top: 0; }
h2 { font-size: 1.2rem; color: grey; }
p { margin-bottom: 0.5rem; }

.q-item { padding-top: 0; padding-bottom: 0; min-height: 2rem; }
.q-list { padding-top: 0; }

.answer { display: flex; flex-flow: row nowrap; align-items: center; }
.answer .q-input { flex-grow: 1 }
.answer p { flex-grow: 1; margin: auto; }
.answer img { width: 50vw; }
.answer .q-radio { padding: 0.5rem; }
.answer .q-btn { padding: 0.3rem; margin: 0.2rem; }
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

#save-changes-modal p { font-size: 2rem; }
#save-changes-modal div { display: flex; flex-flow: row nowrap; width: 100%; }
#save-changes-modal .q-btn { flex-grow: 1 }
#save-changes-modal .q-btn:not(:last-child) { margin-right: 3vw; }

</style>
