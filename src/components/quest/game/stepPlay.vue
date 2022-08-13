<template>

  <div id="play-view" class="fit" :class="{'bg-black': (!showNonHybridQRReader && step.type === 'locate-marker' || step.id === 'sensor'), 'loaded': pageReady, 'bg-transparent': showNonHybridQRReader || step.type === 'image-over-flow'}">
    <div id="background-image" v-show="(step.type !== 'image-over-flow' && step.type !== 'locate-marker')" class="step-background" :class="{
      'effect-kenburns': (step.options && step.options.kenBurnsEffect),
      'effect-blur': (step.options && step.options.blurEffect),
      'opacity0': (step.type === 'locate-item-ar' && !stepPlayed),
      'fadeIn': (step.type === 'locate-item-ar' && stepPlayed)
      }">
    </div>
    <div v-if="showNonHybridQRReader">
      <!--====================== QR CODE READER ON WEBAPP =================================-->
      <div 
        class="text-white q-pt-xl q-pl-md q-pb-sm"
        :style="(customization && customization.color && customization.color !== '') ? 'background-color: ' + customization.color : ''"
        :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}">
        <div class="float-right no-underline close-btn q-pa-sm" @click="closeQRCodeReader"><q-icon name="close" class="subtitle1" /></div>
        {{ $t('label.PassTheQRCodeInFrontOfYourCamera') }}
      </div>

      <qr-code-stream
        v-if="showNonHybridQRReader"
        v-on:QrCodeResult="checkAnswer"
        :color="(customization && customization.color && customization.color !== '') ? customization.color : 'primary'"
      />
    </div>
    <div v-if="!showNonHybridQRReader" :class="controlsAreDisplayed ? 'fadeIn' : 'hidden'" :style="'color: ' + customization.fontColor">
      <!------------------ QUEST TIMER ------------------------>
      <div v-if="timer && timer.remaining > 0">
        <q-linear-progress
          size="25px"
          :class="{ 'with-camera-stream' : step.type === 'locate-marker' || step.type === 'locate-item-ar' }"
          :value="timer.remaining"
          :color="(timer.remaining < 0.1 ? 'negative' : ( timer.remaining < 0.25 ? 'warning' : 'positive'))"
          v-if="!isIOs"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="black" :label="parseInt(timer.remainingMinutes, 10) + ' ' + $t('label.minutes')" />
          </div>
        </q-linear-progress>
        <div
          style="height: 25px; position: relative;"
          :class="{ 'with-camera-stream' : step.type === 'locate-marker' || step.type === 'locate-item-ar' }"
          class="bg-positive text-white centered"
          v-if="isIOs"
          >
          <strong>{{ parseInt(timer.remainingMinutes, 10) + ' ' + $t('label.minutes') }}</strong>
        </div>
      </div>
      <!------------------ STEP TIMER ------------------------>
      <div
        v-if="step.countDownTime !== null &&
            step.countDownTime !== undefined &&
            step.countDownTime.enabled === true &&
            this.countdowntimeleft > 0">
        <q-linear-progress
          size="25px"
          :class="{ 'with-camera-stream' : step.type === 'locate-marker' || step.type === 'locate-item-ar' }"
          :value="map(this.countdowntimeleft,0,this.step.countDownTime.time,0,1)"
          color="primary"
          v-if="!isIOs"
          >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="black" :label="parseInt(this.countdowntimeleft, 10) + ' ' + $t('label.secondes')" />
          </div>
        </q-linear-progress>
        <div
          style="height: 25px; position: relative;"
          :class="{ 'with-camera-stream' : step.type === 'locate-marker' || step.type === 'locate-item-ar' }"
          class="bg-positive text-white centered"
          v-if="isIOs"
          >
          <strong>{{ parseInt(this.countdowntimeleft, 10) + ' ' + $t('label.secondes') }}</strong>
        </div>
      </div>

      <!------------ GEOLOCATION STEPS ------------------>

      <!-- low GPS accuracy warning -->
      <q-page-sticky position="top-right" style="z-index: 15000;" :offset="[18, 18]" v-if="geolocation.lowCompassAccuracy || geolocation.lowGpsAccuracy">
        <q-btn color="primary" round icon="location_off" style="font-size: 15px;" class="flashing">
          <q-tooltip class="primary" style="font-size: 16px" :offset="[10, 10]" v-if="!geolocation.persistentLowAccuracy">{{ $t('label.WarningLowGpsAccuracy') }}</q-tooltip>
          <q-tooltip class="primary" style="font-size: 16px" :offset="[10, 10]" v-if="geolocation.persistentLowAccuracy">{{ $t('label.PersistentLowGpsAccuracyPleaseSkipStep') }}</q-tooltip>
        </q-btn>
      </q-page-sticky>

      <!------------------ AUDIO ------------------------>

      <div v-if="audio && audio.file && audio.file !== ''">
        <audio
          id="step-music"
          autoplay>
          <source :src="audio.file" type="audio/mpeg">
        </audio>
        <div style="position: absolute; top: 4px; right: 10px; z-index: 1000;">
          <q-btn-group
            rounded
            :style="(customization && customization.color && customization.color !== '') ? 'background-color: ' + customization.color : ''"
            :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
            style="color: #fff;"
            >
            <div style="padding: 4px;">{{ $t("label.Audio") }}</div>
            <q-icon
              @click="replayAudioSound"
              name="replay_circle_filled"
              style="font-size: 2em;"
              />
            <q-icon
              v-if="audio.play"
              @click="switchAudioSound"
              name="pause_circle"
              style="font-size: 2em;"
              />
            <q-icon
              v-if="!audio.play"
              @click="switchAudioSound"
              name="play_circle"
              style="font-size: 2em;"
              />
          </q-btn-group>
        </div>
      </div>

      <div class="bg-accent text-white q-pa-md" v-if="isNetworkLow">{{ $t('label.WarningLowNetwork') }}</div>

      <!------------------ TRANSITION AREA ------------------------>

      <div class="info" v-if="step.type == 'info-text' || step.type == 'info-video' || step.type == 'help'">
        <div v-if="showTools && getTranslatedText() != ''" id="info-clickable" :class="{ grow: (!step.videoStream || !step.videoStream[lang]) }">
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && step.options && step.options.html" v-html="getTranslatedText()"></p>
          <div v-if="step.type !== 'help' && step.type !== 'info-video' && (!step.options || !step.options.hideHideButton)" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
        <div class="video" v-if="step.videoStream && step.videoStream[lang]">
          <video v-if="!step.options || !step.options.rotateVideo" class="full-width" controls controlsList="nodownload" autoplay>
            <source :src="(step.videoStream && step.videoStream[lang] && step.videoStream[lang].indexOf('blob:') !== -1) ? step.videoStream[lang] : serverUrl + '/upload/quest/' + step.questId + '/step/video/' + step.videoStream[lang]" type="video/mp4" />
          </video>
          <video v-if="step.options && step.options.rotateVideo" controls controlsList="nodownload" autoplay style="position: absolute;transform: rotate(90deg);transform-origin: bottom left;width: 100vh;height: 100vw;margin-top: -100vw;object-fit: cover;z-index: 4;visibility: visible;">
            <source :src="(step.videoStream && step.videoStream[lang] && step.videoStream[lang].indexOf('blob:') !== -1) ? step.videoStream[lang] : serverUrl + '/upload/quest/' + step.questId + '/step/video/' + step.videoStream[lang]" type="video/mp4" />
          </video>
        </div>
      </div>

      <!------------------ HELP AREA ------------------------>
      <div v-if="step.type == 'help'" :class="'font-' + customization.font" style="overflow: auto; margin-bottom: 80px;">
        <p class="text help-text" v-html="$t('label.HelpStepMessage')"></p>
        <div v-if="step.options && step.options.helpNext" class="text help-text centered">
          <div class="white-buttons">
            <q-btn
              round
              size="lg"
              :style="(customization && customization.color && customization.color !== '') ? 'background-color: ' + customization.color : ''"
              :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
              icon="arrow_forward"
            />
          </div>
          <div>{{ $t('label.HelpStepMessageNextMessage') }}</div>
        </div>
        <div v-if="step.options && step.options.helpPrevious" class="text help-text centered">
          <div class="white-buttons">
            <q-btn
              round
              size="lg"
              :style="(customization && customization.color && customization.color !== '') ? 'background-color: ' + customization.color : ''"
              :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
              icon="arrow_back"
            />
          </div>
          <div>{{ $t('label.HelpStepMessagePreviousMessage') }}</div>
        </div>
        <div v-if="step.options && step.options.helpInventory" class="text help-text centered">
          <div class="white-buttons">
            <q-btn
              round
              size="lg"
              :style="(customization && customization.color && customization.color !== '') ? 'background-color: ' + customization.color : ''"
              :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
              icon="work"
            />
          </div>
          <div>{{ $t('label.HelpStepMessageInventoryMessage') }}</div>
        </div>
        <div v-if="step.options && step.options.helpHint" class="text help-text centered">
          <div class="white-buttons">
            <q-btn
              round
              size="lg"
              :style="(customization && customization.color && customization.color !== '') ? 'background-color: ' + customization.color : ''"
              :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
              icon="lightbulb"
            />
          </div>
          <div>{{ $t('label.HelpStepMessageHintMessage') }}</div>
        </div>
        <p class="text help-text" v-html="$t('label.HelpStepMessageEnd')"></p>
      </div>

      <!------------------ WIN ITEM STEP AREA ------------------------>

      <div class="new-item" v-if="step.type == 'new-item'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div class="item">
          <img 
            style="width: 80%" 
            :src="((step.options.picture.indexOf('statics/') > -1 || step.options.picture.indexOf('blob:') !== -1) ? step.options.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + step.options.picture)" 
            @click="openInventory(step.options)"
            />
          <p v-if="step.options.title != '' && step.options.title != ' '"><span>{{ step.options.title }}</span></p>
        </div>
      </div>

      <!------------------ END OF CHAPTER AREA ------------------------>

      <div class="end-of-chapter" v-if="step.type == 'end-chapter' ">
        {{ $t('label.ThisStepIsNotShowToPlayers') }}
      </div>

      <!------------------ END OF CHAPTER AREA ------------------------>

      <div class="end-of-chapter" v-if="step.type == 'increment-counter' ">
        {{ $t('label.ThisStepIsNotShowToPlayers') }}
      </div>

      <!------------------ CHARACTER STEP AREA ------------------------>

      <div class="character" v-if="step.type == 'character'">
        <div class="fixed-bottom-character story" @click="nextCharacterBubbleText()">
          <div class="bubble-top"><img src="statics/icons/story/sticker-top.png" /></div>
          <div class="bubble-middle" style="font-size: 0.9em; background: url(statics/icons/story/sticker-middle.png) repeat-y;">
            <div v-if="character.needToScroll" class="scroll-indicator">
              <q-icon class="flashing" size="2.5em" name="arrow_drop_down_circle" />
            </div>
            <p ref="bubbleText" style="text-align: left;" class="carrier-return small-margin" :class="'font-' + customization.font" v-if="character.bubbleText.length > 0 && character.bubbleText[character.bubbleNumber] != '' && !(step.options && step.options.html)">{{ character.bubbleText[character.bubbleNumber] }}</p>
            <p ref="bubbleTextHtml" style="text-align: left;" class="text small-margin" :class="'font-' + customization.font" v-if="character.bubbleText.length > 0 && character.bubbleText[character.bubbleNumber] != '' && step.options && step.options.html" v-html="character.bubbleText[character.bubbleNumber]"></p>
            <p class="text-grey small-margin" v-if="character.bubbleNumber < (character.numberOfBubble - 1)">{{ $t('label.ReadNext') }}</p>
          </div>
          <div class="bubble-bottom"><img src="statics/icons/story/sticker-bottom.png" /></div>
          <div class="character">
            <img style="vertical-align:bottom" v-if="step.options.character.length < 3" :src="'statics/icons/story/character' + step.options.character + '_attitude1.png'" />
            <img style="vertical-align:bottom;" v-if="step.options.character.length > 2 && step.options.character !== 'usequestcharacter'" :src="step.options.character.indexOf('blob:') !== -1 ? step.options.character : serverUrl + '/upload/quest/' + step.questId + '/step/character/' + step.options.character" />
            <img style="vertical-align:bottom;" v-if="step.options.character === 'usequestcharacter'" :src="customization.character.indexOf('blob:') === -1 ? serverUrl + '/upload/quest/' + customization.character : customization.character" />
          </div>
          <div v-if="step.options && step.options.characterBarColor && step.options.characterBarColor !== ''" class="full-width" :class="(step.options && step.options.characterBarColor) ? '' : 'bg-black'" :style="'height: 68px; ' + ((step.options && step.options.characterBarColor && step.options.characterBarColor !== '') ? 'background-color: ' + step.options.characterBarColor : '')">
          </div>
          <div v-if="!step.options || !step.options.characterBarColor || step.options.characterBarColor === ''" class="full-width" style="height: 68px;">
          </div>
        </div>
      </div>

      <!------------------ CHOOSE STEP AREA ------------------------>

      <div class="choose" v-if="step.type == 'choose'" style="overflow: auto; margin-bottom: 80px;">
        <div v-if="showTools">
          <div>
             <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
             <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="answers-text q-mt-lg" v-if="answerType === 'text'">
            <q-btn v-for="(option, key) in step.options.items" :key="key" class="full-width shadowed" :class="option.class" :icon="option.icon" @click="chooseSelectValue(key)" :disabled="playerResult !== null" :test-id="'answer-text-' + key">
              <span :class="'font-' + customization.font" v-if="!option.textLanguage || !option.textLanguage[lang]">{{ option.text }}</span>
              <span :class="'font-' + customization.font" v-if="option.textLanguage && option.textLanguage[lang]">{{ option.textLanguage[lang] }}</span>
            </q-btn>
          </div>
          <div class="answers-images" v-if="answerType === 'image'">
            <div class="images-block">
              <div v-for="(option, key) in step.options.items" :key="key" :class="option.class" @click="chooseSelectValue(key)" :test-id="'answer-image-' + key">
                <img :src="option.imagePath.indexOf('blob:') !== -1 ? option.imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/choose-image/' + option.imagePath" :class="option.class" />
                <q-btn v-if="option.class !== null" round :class="option.class" :icon="option.icon" disable />
              </div>
            </div>
          </div>
          <div v-if="step.options.multipleAnswers" class="q-pa-md centered">
            <q-btn class="glossy" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" :disable="playerCode[step.answers.length - 1] === ''" @click="checkAnswer()">
              <div>{{ $t('label.Confirm') }}</div>
            </q-btn>
          </div>
          <div v-if="!step.options || !step.options.hideHideButton" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>

      <!------------------ KEYPAD STEP AREA ------------------------>

      <div class="code" v-if="step.type == 'code-keypad'" style="overflow: auto; margin-bottom: 80px;">
        <div v-if="showTools">
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="typed-code">
            <table class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}">
              <tr>
                <td v-for="(sign, key) in playerCode" :key="key" :class="{ typed: sign !== '' }">{{ sign == '' ? '?' : sign }}</td>
              </tr>
            </table>
            <table v-if="rightAnswer" class="shadow-8 right">
              <tr>
                <td v-for="(sign, key) in rightAnswer" :key="key" class="typed">{{ sign }}</td>
              </tr>
            </table>
          </div>
          <div class="keypad">
            <div class="keypadLine">
              <div v-for="(keypadLine, rowKey) in keypad" :key="rowKey">
                <q-btn v-for="(keypadButton, btnKey) in keypadLine" :key="btnKey" color="grey" glossy @click="addCodeChar(keypadButton)" :disable="playerResult !== null" :test-id="'btn-keypad-' + keypadButton">{{ keypadButton }}</q-btn>
              </div>
            </div>
          </div>
          <div class="actions q-mt-sm q-mb-md q-px-md" v-show="playerResult === null">
            <div>
              <q-btn class="glossy small-button"
                :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''"
                :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
                icon="clear"
                :disable="playerCode[0] === ''"
                @click="clearLastCodeChar()">
                <div>
                  {{ $t('label.Clear') }}
                </div>
              </q-btn>
              <q-btn class="glossy small-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" :disable="playerCode[step.answers.length - 1] === ''" @click="checkAnswer()" test-id="btn-check-keypad-answer">
                <div>
                  {{ $t('label.Confirm') }}
                </div>
              </q-btn>
            </div>
          </div>
          <div v-if="!step.options || !step.options.hideHideButton" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>

      <!------------------ CODE COLOR STEP AREA ------------------------>

      <div class="code code-color" v-if="step.type == 'code-color'" style="overflow: auto; margin-bottom: 80px;">
        <div v-if="showTools">
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="color-bubbles" style="margin-top: 5rem;">
            <div v-for="(color, index) in playerCode" :key="index" :style="'background-color: ' + playerCode[index]" @click="changeColorForCode(index)" class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}" :test-id="'color-code-' + index">&nbsp;</div>
          </div>
          <div class="color-bubbles" v-if="rightAnswer">
            <div v-for="(color, index) in rightAnswer" :key="index" :style="'background-color: ' + color" class="shadow-8 right">&nbsp;</div>
          </div>

          <div class="actions q-mt-lg q-mx-md" v-show="playerResult === null">
            <div>
              <q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" @click="checkAnswer()" test-id="btn-check-color-code"><div>{{ $t('label.Confirm') }}</div></q-btn>
            </div>
          </div>
          <div v-if="!step.options || !step.options.hideHideButton" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>

      <!------------------ IMAGE CODE STEP AREA ------------------------>

      <div class="code code-image" v-if="step.type == 'code-image'" style="overflow: auto; margin-bottom: 80px;">
        <div v-if="showTools">
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <table>
            <tr>
              <td v-for="(code, index) in playerCode" :key="index" class="text-center">
                <q-btn :disabled="stepPlayed" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" round icon="keyboard_arrow_up" @click="previousCodeAnswer(index)" :test-id="'previous-image-' + index" />
              </td>
            </tr>
            <tr>
              <td v-for="(code, index) in playerCode" :key="index">
                <img v-if="step.options.images[code]" :id="'image-code-' + index" @click="enlargeThePicture(index)" :src="step.options.images[code].imagePath.indexOf('blob:') !== -1 ? step.options.images[code].imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/code-image/' + step.options.images[code].imagePath" />
              </td>
            </tr>
            <tr v-show="rightAnswer">
              <td v-for="(code, index) in rightAnswer" :key="index" class="right">
                <img v-if="step.options.images[code]" :src="step.options.images[code].imagePath.indexOf('blob:') !== -1 ? step.options.images[code].imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/code-image/' + step.options.images[code].imagePath" />
              </td>
            </tr>
            <tr>
              <td v-for="(code, index) in playerCode" :key="index" class="text-center">
                <q-btn :disabled="stepPlayed" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" round icon="keyboard_arrow_down" @click="nextCodeAnswer(index)" :test-id="'next-image-' + index" />
              </td>
            </tr>
          </table>

          <div class="actions q-ma-md" v-show="playerResult === null">
            <div>
              <q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" @click="checkAnswer()" test-id="btn-check-image-code"><div>{{ $t('label.Confirm') }}</div></q-btn>
            </div>
          </div>
          <div v-if="!step.options || !step.options.hideHideButton" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>

          <div class="centered" v-if="!step.options || !step.options.hideEnlargeMessage">
            <q-btn flat class="no-box-shadow hide-button text-black">{{ $t('label.ClickToEnlargePictures') }}</q-btn>
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>

      <!------------------ GEOLOCALISATION STEP AREA ------------------------>

      <div class="geolocation" v-if="step.type == 'geolocation'">
        <div :class="geolocation.mode + 'mode'">
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          <p class="text" :class="'font-' + customization.font" v-if="step.showDistanceToTarget">{{ $t('label.DistanceInMeters', { distance: (geolocation.GPSdistance == 0 ? '...' : Math.round(geolocation.GPSdistance)) }) }}</p>
        </div>

        <geolocationStepMap class="geolocation-step-map" :class="'font-' + customization.font" v-show="geolocation.mode === 'map' && playerResult === null" :target-position="geolocation.destinationPosition" :player-position="geolocation.playerPosition" />

        <q-btn
          id="mode-switch"
          v-if="step.options.switchmode"
          :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''"
          :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
          :icon="getGeolocationStepSwitchButtonIcon()"
          round size="lg"
          @click="switchModeForGeolocationStep()" />
      </div>

      <div class="background-map full-width full-height q-pa-md centered" v-if="step.id == 'gpssensor' && geolocation.mode === 'sensor'">
        <div v-if="customization.geolocationMessage && customization.geolocationMessage !== '' && lang">{{ customization.geolocationMessage[lang] }}</div>
        <div v-if="!customization.geolocationMessage || customization.geolocationMessage === '' || !lang">{{ $t('label.FindAllLocationsToStartSteps') }}</div>
        <div class="q-mt-xl centered">
          <q-spinner-orbit :color="geolocation.colorIndicator" size="50vw" />
        </div>
        {{ $t('label.ColorIndicatorExplaination', {distance: geolocation.closestDistance}) }}
      </div>
      
      <div class="background-map full-width full-height q-pa-md centered" v-if="step.id == 'gpssensor' && geolocation.mode === 'map'">
        <geolocationStepMap class="geolocation-step-map" :class="'font-' + customization.font" :target-position="geolocation.destinationPosition" :player-position="geolocation.playerPosition" />
      </div>

      <!------------------ SIMPLE TEXT INPUT STEP AREA ------------------------>

      <div class="write-text" v-if="step.type == 'write-text'" style="overflow: auto; margin-bottom: 80px;">
        <div v-if="showTools">
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="row">
            <div class="answer-text q-pa-md col-9">
              <!-- could not use v-model here, see https://github.com/vuejs/vue/issues/8231 -->
              <input
                v-bind:value="writetext.playerAnswer"
                v-on:input="writetext.playerAnswer = $event.target.value"
                :placeholder="$t('label.YourAnswer')"
                :class="{right: playerResult === true, wrong: playerResult === false}"
                :disabled="stepPlayed"
                style="height: 55px;" />
              <input
                v-if="rightAnswer"
                class="right"
                v-bind:value="rightAnswer"
                disabled />
            </div>
            <div class="col-3">
              <q-btn round class="glossy" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" :disabled="writetext.playerAnswer === '' || stepPlayed" @click="checkAnswer()" test-id="btn-check-text-answer" icon="done"></q-btn>
            </div>
          </div>
          <div v-if="!step.options || !step.options.hideHideButton" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>

      <!------------------ JIGSAW STEP AREA ------------------------>

      <div class="puzzle" v-if="step.type === 'jigsaw-puzzle'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div id="pieces">
            <div draggable="true"
              v-for="piece in puzzle.pieces"
              :key="piece.pos"
              :id="'piece-' + piece.pos"
              @dragstart="handleDragStart($event)"
              @dragover="handleDragOver($event)"
              @drop="handleDrop($event)"
              @dragend="handleDragEnd($event)"
              @click="movePieceWithClick(piece.pos)"
              :class="piece.classes"
              :style="'background-image: url(' + puzzle.picture + '); background-size: ' + piece.backSize + '% ' + piece.backSize + '%;background-position: -' + piece.backXPos + ' -' + piece.backYPos + ';'"
            ><header :style="'width: ' + piece.width + 'px;height: ' + piece.height + 'px;'"></header></div>
        </div>
        <img style="display: none" :src="puzzle.picture" /><!--trick to be sure that the puzzle display -->
        <div class="q-mt-lg background-lighter4 q-pa-md" v-if="!step.options.hidePuzzleNotWorkingMessage">
          <div class="centered arial" v-if="puzzle && puzzle.mode === 'drag'">
            {{ $t('label.PuzzleHelpText') }}
          </div>
          <div class="centered text-primary q-pt-lg arial" v-if="puzzle.mode === 'click'">
            {{ $t('label.PuzzleHelpTextClick') }}
          </div>
          <div class="centeredq-pt-sm" v-if="puzzle && puzzle.mode === 'drag'">
            <a class="text-black" @click="changePuzzleMode()">{{ $t('label.PuzzleChangeMode') }}</a>
          </div>
        </div>
      </div>

      <!------------------ MEMORY STEP AREA ------------------------>

      <div class="puzzle" v-if="step.type === 'memory'" style="overflow: auto; margin-bottom: 80px;">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div class="row memory" id="card-deck">
          <div
            v-for="(item, key) in memory.items"
            :key="key"
            class="col-3 q-pa-sm">
            <div
              class="card"
              :class="{ open: item.isClicked, closed: !item.isClicked, disabled: item.isFound }"
              @click="selectMemoryCard(key)"
              :style="((step.options && step.options.memoryCardColor && step.options.memoryCardColor !== '') ? 'background: ' + step.options.memoryCardColor : '')"
            >
              <img style="display: block; position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;" v-if="item.imagePath" :src="item.imagePath.indexOf('blob:') !== -1 ? item.imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/memory/' + item.imagePath" />
            </div>
          </div>
        </div>
      </div>

      <!------------------ COMPOSITE DRAWING STEP AREA ------------------------>

      <div class="portrait-robot" v-if="step.type === 'portrait-robot'" style="overflow: auto; margin-bottom: 80px;">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div class="relative-position">
          <div v-if="portrait.face">
            <img :src="'statics/' + portrait.type + '/face-' + portrait.face.position + '.png'" />
          </div>
          <div v-if="portrait.eye" class="absolute">
            <img :src="'statics/' + portrait.type + '/eye-' + portrait.eye.position + '.png'" />
          </div>
          <div v-if="portrait.mouth" class="absolute">
            <img :src="'statics/' + portrait.type + '/mouth-' + portrait.mouth.position + '.png'" />
          </div>
          <div v-if="portrait.nose" class="absolute">
            <img :src="'statics/' + portrait.type + '/nose-' + portrait.nose.position + '.png'" />
          </div>
          <div v-if="portrait.hair" class="absolute">
            <img :src="'statics/' + portrait.type + '/hair-' + portrait.hair.position + '.png'" />
          </div>
          <div v-if="portrait.beard" class="absolute">
            <img :src="'statics/' + portrait.type + '/beard-' + portrait.beard.position + '.png'" />
          </div>
          <div v-if="portrait.glass" class="absolute">
            <img :src="'statics/' + portrait.type + '/glass-' + portrait.glass.position + '.png'" />
          </div>
          <div v-if="portrait.hat" class="absolute">
            <img :src="'statics/' + portrait.type + '/hat-' + portrait.hat.position + '.png'" />
          </div>
        </div>
        <table class="portrait-parts relative-position">
          <tr>
            <td v-if="portrait.face"><img @click="changePortraitPart('face')" :src="'statics/' + portrait.type + '/face-0.png'" /></td>
            <td v-if="portrait.eye"><img @click="changePortraitPart('eye')" :src="'statics/' + portrait.type + '/eye-0.png'" /></td>
            <td v-if="portrait.mouth"><img @click="changePortraitPart('mouth')" :src="'statics/' + portrait.type + '/mouth-0.png'" /></td>
            <td v-if="portrait.nose"><img @click="changePortraitPart('nose')" :src="'statics/' + portrait.type + '/nose-0.png'" /></td>
            <td v-if="portrait.hair"><img @click="changePortraitPart('hair')" :src="'statics/' + portrait.type + '/hair-0.png'" /></td>
            <td v-if="portrait.beard"><img @click="changePortraitPart('beard')" :src="'statics/' + portrait.type + '/beard-0.png'" /></td>
            <td v-if="portrait.glass"><img @click="changePortraitPart('glass')" :src="'statics/' + portrait.type + '/glass-0.png'" /></td>
            <td v-if="portrait.hat"><img @click="changePortraitPart('hat')" :src="'statics/' + portrait.type + '/hat-0.png'" /></td>
          </tr>
        </table>
        <div class="actions q-mx-md" style="padding-bottom: 100px" v-show="playerResult === null">
          <div>
            <q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" @click="checkAnswer()"><div>{{ $t('label.Confirm') }}</div></q-btn>
          </div>
        </div>
      </div>

      <!------------------ BINOCULAR STEP AREA ------------------------>

      <div class="binocular" v-if="step.type === 'binocular'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div class="relative-position">
          <div style="width: 100%; height: 100vw; overflow-x: scroll; overflow-y: scroll;">
            <img style="width: 400%" :src="getBackgroundImage()" />
          </div>
          <div class="absolute no-mouse-event" style="top: 0px; width: 100%;">
            <img class="no-mouse-event" v-if="!step.options.shape || step.options.shape === 'binocular'" style="width: 100%;" src="statics/icons/game/binoculars.png">
            <img class="no-mouse-event" v-if="step.options.shape && step.options.shape === 'flashlight'" style="width: 100%;" src="statics/icons/game/flashlight.png">
          </div>
        </div>
        <div class="absolute text-white centered" style="width: 100%; left: 0px; right: 0px; bottom: 130px">
          {{ $t('label.MovePictureWithFinger')}}
        </div>
      </div>

      <!------------------ PHONE CALL STEP AREA ------------------------>

      <div class="phone-call fit" v-if="step.type === 'phone-call'">
        <div class="fit bg-black">
          <div class="q-pb-xxl">
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="fixed-bottom q-pb-xxl q-pl-xl q-pr-xl">
            <q-btn round color="positive" icon="call" @click="phoneCall()" />
            <q-btn class="float-right" round color="negative" icon="call_end" @click="cancelPhoneCall()" />
              <!--<q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" @click="phoneCall()"><div>{{ $t('label.Call') }}</div></q-btn>-->
          </div>
        </div>
      </div>

      <!------------------ USE ITEM STEP AREA ------------------------>

      <div class="use-item" v-if="step.type == 'use-item'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div ref="useItemPicture" @click="checkUseItem($event)" :style="'overflow: hidden; background-image: url(' + getBackgroundImage() + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100%; height: ' + useItem.imageHeight + 'px;'" test-id="use-item-picture">
          <img id="cross-play" :style="'position: relative; z-index: 500; width: ' + useItem.crossSize + 'px; height: ' + useItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
        </div>
      </div>

      <p v-if="step.type == 'use-item' && nbTry < 2 && playerResult === null && itemUsed !== null" class="inventory-btn" >
        <q-btn round :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color">
          <q-avatar>
          <!--<img v-if="itemUsed" :src="((itemUsed.picture.indexOf('statics/') > -1 || itemUsed.picture.indexOf('blob:') !== -1) ? itemUsed.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + itemUsed.picture)" />-->
          <img v-if="itemUsed && itemUsed.pictures && itemUsed.pictures[lang] && itemUsed.pictures[lang] !== ''" :src="((itemUsed.picture.indexOf('statics/') > -1 || itemUsed.picture.indexOf('blob:') !== -1) ? itemUsed.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + itemUsed.picture)" />
          <img v-if="itemUsed && !(itemUsed.pictures && itemUsed.pictures[lang] && itemUsed.pictures[lang] !== '')" :src="((itemUsed.picture.indexOf('statics/') > -1 || itemUsed.picture.indexOf('blob:') !== -1) ? itemUsed.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + itemUsed.picture)" />
          </q-avatar>
        </q-btn>
        {{ $t('label.TouchWhereYouUseThisItem') }}
      </p>

      <!------------------ FIND ITEM STEP AREA ------------------------>

      <div class="find-item" v-if="step.type == 'find-item'" style="overflow: auto; margin-bottom: 80px;">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div ref="findItemPicture" @click="checkFindItem($event)" :style="'position: relative; overflow: hidden; background-image: url(' + getBackgroundImage() + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100%; height: ' + findItem.imageHeight + 'px;'" test-id="find-item-picture">
          <img id="cross-play0" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play1" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play2" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play3" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play4" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
        </div>
      </div>

      <!------------------ LOCATE ITEM IN AUGMENTED REALITY STEP AREA ------------------------>

      <div class="locate-item-ar" v-if="step.type === 'locate-item-ar'" v-show="$refs['geolocation-component'] && $refs['geolocation-component'].isActive">
        <!-- PAS DE CAPTEUR -->
        <div v-if="noSensorFound" class="text text-center" :class="'font-' + customization.font">
          <p class="q-mb-lg">{{ $t('label.noSensorFound') }}</p>
          <q-icon
            class="q-mb-lg"
            size="3em"
            name="sensors_off"
          />
          <p>{{ $t('label.noSensorNext') }}</p>
        </div>
        <div v-else>
          <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
            <video ref="camera-stream-for-locate-item-ar" v-show="cameraStreamEnabled && geolocation.active && playerResult === null"></video>
          </transition>
          <div v-show="playerResult === null && (this.geolocation.active || isIOs)" class="q-mt-xl">
            <div class="text" :class="'font-' + customization.font">
              <p v-if="!(step.options && step.options.html)">{{ getTranslatedText() }}</p>
              <p v-if="step.options && step.options.html" v-html="getTranslatedText()" />
              <p v-if="!geolocation.active">{{ $t('label.PleaseWaitLoadingAndGPSInit') }}</p>
              <p v-if="step.showDistanceToTarget && geolocation.active">{{ $t('label.DistanceInMeters', { distance: (geolocation.GPSdistance == 0 ? '...' : Math.round(geolocation.GPSdistance)) }) }}</p>
              <p v-if="!geolocation.canSeeTarget && geolocation.active">{{ $t('label.ObjectIsTooFar') }}</p>
              <p v-if="geolocation.canTouchTarget && geolocation.active" style="color: #f00">{{ $t('label.TouchTheObject') }}</p>
              <p v-if="geolocation.canSeeTarget && !geolocation.canTouchTarget && geolocation.active">{{ $t('label.MoveCloserToTheObject') }}</p>
            </div>
          </div>
          <div class="target-view" v-show="(playerResult === null) || (playerResult !== null && step.options && step.options.is3D)">
            <canvas id="target-canvas" @click="onTargetCanvasClick" v-touch-pan="handlePanOnTargetCanvas"></canvas>
          </div>
          <div style="width:100%; text-align:center;">
            <img ref="item-image" v-show="playerResult && step.options && !step.options.is3D" />
          </div>
          <!-- DIALOG PHONE VERTICALY -->
          <q-dialog ref="raVerticallyDialog">
            <q-card class="q-dialog-plugin">
              <q-card-section class="bg-negative text-white q-pa-sm">
                ATTENTION
              </q-card-section>
              <q-card-section >
                <p class="q-pt-md q-ma-none">{{  $t('label.holdVerticaly')}}</p>
              </q-card-section>
            </q-card>
          </q-dialog>
        </div>
      </div>

      <!------------------ SUPERIMPOSE IMAGE AND CAMERA STEP AREA ------------------------>

<!--      <div class="image-over-flow" v-if="step.type == 'image-over-flow'">
        &lt;!&ndash;<transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">&ndash;&gt;
          <video ref="camera-stream-for-image-over-flow" v-show="cameraStreamEnabled"></video>
        &lt;!&ndash;</transition>&ndash;&gt;
        <div>
          <div v-if="!takingSnapshot" style="position: absolute; top: 58px; right: 8px;z-index: 1990;">
            <q-btn
              round
              size="lg"
              class="text-white q-mr-md"
              :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
              :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
              icon="flip_camera_ios"
              @click="switchCamera()"
            />
            <q-btn
              v-if="step.options && step.options.snapshotAllowed"
              round
              size="lg"
              class="text-white"
              :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
              :class="{'bg-primary': (!customization || !customization.color || customization.color === '')}"
              icon="photo_camera"
              @click="prepareSnapshot()"
            />
          </div>
          <img id="snapshotImage" v-show="false" style="position: absolute; top: 0; left: 0; height: 100%; width: auto; z-index: 1980;" />
          <img id="snapshotImageIos" v-if="isIOs && takingSnapshot" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1980" />
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          &lt;!&ndash; background image -normal &ndash;&gt;
          <div v-if="!step.options || (!step.options.fullWidthPicture && !step.options.redFilter && !step.options.fullHeightPicture)" class="image" ref="ImageOverFlowPicture" :style="'overflow: hidden; background-image: url(' + getBackgroundImage() + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw; z-index: 1985;'"></div>
          &lt;!&ndash; background image -fullwidth &ndash;&gt;
          <img v-if="step.options && step.options.fullWidthPicture && !step.options.redFilter" :src="getBackgroundImage()" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; z-index: 1985;" />
          &lt;!&ndash; background image -fullheight &ndash;&gt;
          <img v-if="step.options && !step.options.fullWidthPicture && step.options.fullHeightPicture  && !step.options.redFilter" :src="getBackgroundImage()" style="position: absolute; top: 0; bottom: 0; height: 100%; width: auto; z-index: 1985; left: 50%; top: 50%; -webkit-transform: translateY(-50%) translateX(-50%);" />
          &lt;!&ndash; A copy of the image in an <img> tag which can be used by canvas methods for captures &ndash;&gt;
          <img :src="getBackgroundImage()" style="display:none" ref="imageOverflowForCapture" crossorigin="anonymous" />

          &lt;!&ndash; Red filter & alternate button for iOS &ndash;&gt;
          <div v-if="isIOs && imageOverFlow.snapshot === '' && step.options && step.options.redFilter" class="centered" style="background: transparent; position: absolute; bottom: 200px; width: 100%; z-index: 1980;">
            <q-btn
              class="glossy large-button"
              :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''"
              :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
              @click="takeVideoSnapShot()">{{ $t('label.ApplyRedFilter') }}</q-btn>
          </div>
          <img v-if="isIOs && imageOverFlow.snapshot !== ''" :src="imageOverFlow.snapshot" style="object-fit: cover; position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; z-index: 1980;" />
          <img v-if="((isIOs && imageOverFlow.snapshot !== '') || !isIOs) && step.options && step.options.redFilter" src="statics/images/background/red.png" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; z-index: 1985; mix-blend-mode: multiply; opacity: 0.8;" />
        </div>
      </div>-->
      <super-impose-image-camera-step
      v-if="step.type == 'image-over-flow'"
      :quest="quest"
      :step="step"
      :customization="customization"
      v-on:showButtons="$emit('showButtons')"
      v-on:hideButtons="$emit('hideButtons')"
      />

      <!------------------ LOCATE A 2D MARKER / TOUCH OBJECT ON MARKER ------------------------>

      <div class="locate-marker" v-if="step.type == 'locate-marker' || step.id == 'sensor'">
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <video ref="camera-stream-for-locate-marker"  webkit-playsinline playsinline src="" autoplay v-show="cameraStreamEnabled && playerResult === null"></video>
        </transition>

        <div v-show="playerResult === null">
          <div class="text" :class="'font-' + customization.font" v-show="getTranslatedText() != ''">
            <p v-if="!(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p v-if="step.options && step.options.html" v-html="getTranslatedText()" />
          </div>
        </div>

        <!-- HELP -->
        <!--<q-btn round size="lg" v-if="playerResult === null && !isHybrid" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" @click="locateMarker.showHelp = true"><span>?</span></q-btn>-->
        <div v-if="playerResult === null" class="text-white centered q-mt-md q-pt-xl">
          <div v-if="customization.qrCodeMessage && customization.qrCodeMessage !== '' && lang">{{ customization.qrCodeMessage[lang] }}</div>
          <div v-if="!customization.qrCodeMessage || customization.qrCodeMessage === '' || !lang">{{ $t('label.ScanTheMarkersLikeThat') }}</div>
          <div class="q-mt-md"><img src="statics/markers/020/marker_full.png" style="width: 50%" /></div>
          {{ $t('label.ScanTheMarkersLikeThat2') }}
          <div>
            <q-btn
              class="glossy large-button"
              :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''"
              :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color"
              @click="startScanQRCode()">
                <div>{{ $t('label.LaunchTheScanner') }}</div>
            </q-btn>
          </div>
        </div>
        <div class="text-center">
          <img class="locate-marker-answer" v-if="playerResult && step.options && step.options.mode == 'scan'" :src="'statics/markers/' + locateMarker.playerAnswer + '/marker.png'" />
        </div>
        <div class="over-map mobile-fit" :class="'font-' + customization.font" style="height: 100%" v-if="locateMarker.showHelp">
          <story step="help" :data="{ help: step.type == 'locate-marker' && step.options && step.options.mode === 'scan' ? 'FindMarkerHelp' : 'TouchObjectOnMarkerHelp' }" @next="locateMarker.showHelp = false"></story>
        </div>
      </div>

      <!------------------ WAIT FOR IOT EVENT ------------------------>

      <div v-if="step.type == 'wait-for-event'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />

          <!-- distance -->
          <h2 v-if="step.options.object === 'distance' && iot.distance !== null" class="centered big q-pb-lg" :class="{'right': playerResult === true}">
            {{ iot.distance }} cm
          </h2>

          <!-- potientiometers -->
          <div v-if="step.options.object === 'pot' && iot['pot1'] !== null">
            <q-linear-progress v-for="index of [1, 2, 3]" v-bind:key="index" :value="iot['pot' + index]" stripe rounded class="q-pa-md q-my-md" :color="playerResult === true ? 'positive' : 'primary'" />
          </div>

          <!-- keypad -->
          <div v-if="step.options.object === 'keypad'">
            <p>{{ $t('label.KeypadInput') }}</p>
            <p class="iot-keypad" :class="{ 'right': playerResult === true, 'wrong': playerResult === false, 'shake': playerResult === false }" ref="iot-keypad">{{ iot.keypadAnswer }}</p>
          </div>

          <!-- joystick -->
          <div v-if="step.options.object === 'joystick' && iot['axisX'] !== null">
            <div v-for="index of ['X', 'Y']" v-bind:key="index">
              <p>{{ index === 'X' ? $t('label.Horizontal') : $t('label.Vertical') }}</p>
              <q-linear-progress :value="iot['axis' + index]" stripe rounded class="q-pa-md q-my-md" :color="playerResult === true ? 'positive' : 'primary'" />
            </div>
          </div>

          <!-- button -->
          <div v-if="step.options.object === 'button' && playerResult === true">
            <p class="right q-pb-md q-px-md q-my-md">{{ this.step.options.message }}</p>
          </div>
        </div>
      </div>

      <!------------------ TRIGGER IOT EVENT ------------------------>

      <div v-if="step.type == 'trigger-event'" class="trigger-event">
        <p class="text" :class="'font-' + customization.font" style="flex-grow: 1" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
        <p class="text" :class="'font-' + customization.font" style="flex-grow: 1" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        <div v-if="step.options.object !== 'chest' || step.options.object === 'relay'">
          <q-btn
            v-if="step.options.triggerMode && step.options.triggerMode === 'manual'"
            class="full-width" color="primary"
            :label="$t('label.TriggerTheEvent')"
            size="xl"
            @click="triggerIotEvent()"
            :disable="bluetooth.deviceId === null"
          />
        </div>
        <div v-if="step.options.object === 'chest'"><!-- TODO : this is for yannick , please change when more people will use IOT || step.options.object === 'relay'">-->
          <p>{{ $t('label.ChestActions') }}</p>
          <div style="display:flex; ">
            <q-btn
              style="flex-grow:1; margin-right: 1rem;"
              color="primary" :label="$t('label.Open')"
              size="xl" @click="triggerIotEvent('open')"
              :disable="bluetooth.deviceId === null || iot.chest.disableActionButtons || iot.relay.disableActionButtons"
            />
            <q-btn
              style="flex-grow:1" color="primary"
              :label="$t('label.Close')"
              size="xl"
              @click="triggerIotEvent('close')"
              :disable="bluetooth.deviceId === null || iot.chest.disableActionButtons || iot.relay.disableActionButtons"
            />
          </div>
        </div>
        <p v-if="step.options.protocol === 'bluetooth' && bluetooth.deviceId === null">{{ $t('label.SearchingBluetoothDevice') }}</p>
      </div>

      <!--====================== STORY =================================-->

      <div class="over-map mobile-fit" :class="'font-' + customization.font" v-if="story.step !== null && story.step !== 'end'">
        <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
      </div>

      <!------------------ WAITING SCREEN (if waiting for another player actions) ------------------------>

      <transition name="slideInBottom">
        <div class="panel-bottom background-dark" v-show="step.id == 'waiting'">
          <div class="centered q-pa-lg title4 text-primary">
            <div class="q-pa-lg text-uppercase" :class="'font-' + customization.font">{{ $t('label.WaitingForOtherUsersActions') }}</div>
            <img src="statics/images/animation/map.gif" class="full-width q-mb-lg" />
          </div>
          <div>
            <div class="q-pa-lg centered">
              {{ $t('label.WaitingForOtherUsersActionsDesc') }}
            </div>
          </div>
        </div>
      </transition>
      
    </div>

    <!------------------ COMMON COMPONENTS ------------------>
    <div class="direction-helper" v-show="((step.type == 'geolocation' && geolocation.mode === 'compass') || (step.type == 'locate-item-ar' && deviceHasGyroscope)) && step.showDirectionToTarget && playerResult === null && (geolocation.active || isIOs)">
      <canvas id="direction-canvas" :style="{ width: directionHelperSize + 'rem', height: directionHelperSize + 'rem' }"></canvas>
    </div>
    <div class="direction-helper centered" v-show="step.type == 'geolocation' && playerResult === true">
      <q-avatar size="140px" font-size="52px" style="margin: auto; margin-bottom: 30px;" color="positive" text-color="white" icon="thumb_up" />
    </div>

    <!-- keep geolocation active during all quest duration -->
    <geolocation ref="geolocation-component" @success="onNewUserPosition($event)" @error="onUserPositionError($event)" />
    
    <div class="geolocation-issue" v-show="(step.type === 'geolocation' || step.type === 'locate-item-ar') && $refs['geolocation-component'] && ($refs['geolocation-component'].userDeniedGeolocation || !$refs['geolocation-component'].isActive)">
      <div>
        <p class="bg-warning">{{ $t('label.GeolocationCouldNotBeRetrieved') }}</p>
        <p>{{ $t('label.GeolocationIssuePleaseSkipThisStep') }}</p>
      </div>
    </div>
    
    <!-- keep orientation detection active during all quest duration -->
    <orientation ref="orientation-component" @success="onNewDeviceOrientation($event)" @error="onDeviceOrientationError($event)" :disabled="!quest.hasGeolocationSteps" />

    <!--====================== WIN POINTS ANIMATION =================================-->

    <!--<div v-show="playerResult === true && score >= 1" class="fadein-message">+{{ score }}</div>-->
    <div v-if="playerResult === true && displaySuccessIcon && step && step.options && step.options.successIcon && step.options.successIcon !== 'block'" class="fadein-message" style="padding-left: 40%">
      <q-icon color="white" :name="step.options.successIcon" />
    </div>
    <div v-show="geolocation.foundStep" class="fadein-message" style="padding-left: 40%"><q-icon color="white" name="check_box" /></div>
    <div v-show="playerResult === true && reward > 0" class="fadein-message">+{{ reward }} <q-icon color="white" name="fas fa-bolt" /></div>
    <div
      v-show="
        this.countdowntimeleft === 60 ||
        this.countdowntimeleft === 30 ||
        this.countdowntimeleft === 15 ||
        this.countdowntimeleft === 10 ||
        this.countdowntimeleft === 5
        "
      class="fadein-message text-center"
      >
        <div style="font-size: 0.6em;">{{ $t('label.ItRemains') }}</div>
        {{ this.countdowntimeleft }} {{ $t('label.s') }}
    </div>

    <!--====================== STORY =================================-->

    <div class="fixed-bottom over-map" v-if="story.step !== null && story.step !== 'end'">
      <story :step="story.step" :data="story.data" @next="story.step = 'end'"></story>
    </div>

    <!--====================== ENLARGE PICTURE =================================-->

    <q-dialog v-model="enlargePicture.show">
      <div class="bg-white centered q-pa-md">
        <img style="width: 100%" :src="enlargePicture.url">
        <q-btn class="q-mb-xl glossy large-button" color="primary" @click="enlargePicture.show = false"><div>{{ $t('label.Close') }}</div></q-btn>
      </div>
    </q-dialog>

    <!--====================== GPS CALIBRATION =================================-->
    <gpscalibration
      ref="gpscal">
    </gpscalibration>

    <!--====================== HOLD PHONE VERTICAL =================================-->
    <holdphonevertically
      :show="geolocation.showARHelp">
    </holdphonevertically>
  </div>
</template>

<script>
import { colors } from 'quasar'

import StepService from 'services/StepService'
import TimerStorageService from 'services/TimerStorageService'
import utils from 'src/includes/utils'
// import draw from 'src/includes/draw'

import colorsForCode from 'data/colorsForCode.json'
import modelsList from 'data/3DModels.json'
import iotObjectsList from 'data/iotObjects.json'
import iotOptions from 'data/iotOptions.json'
import stepTypes from 'data/stepTypes.json'

import Notification from 'boot/NotifyHelper'

import geolocation from 'components/geolocation'
import orientation from 'components/orientation'
import gpscalibration from 'components/gpsCalibration'
import holdphonevertically from 'components/holdPhoneVertically'
import story from 'components/story'
import geolocationStepMap from 'components/quest/game/geolocationStepMap'
import qrCodeStream from "../../qrCodeStream";
// import snapshotDialogComponent from "./StepPlayComp/snapshotDialogComponent";

import Vue from 'vue'
import debounce from 'lodash/debounce'

// required for step 'locate-item-ar'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

//import Step Composant
import SuperImposeImageCameraStep from "./StepPlayComp/SuperImposeImageCameraStep";

// required for steps 'wait-for-event' and 'trigger-event' (IoT):
import * as mqtt from 'mqtt'
import "image-capture"

export default {
  /*
   * Properties used on component call
   * step : step data (mandatory)
   * runId : Id of the run (0 = simulation mode)
   * reload : set to true if data must be reload
   * itemUsed : item of the inventory used
   * lang : language of the step (fr, en, ...)
   */
  props: ['step', 'runId', 'reload', 'itemUsed', 'lang', 'answer', 'customization', 'player', 'inventory', 'timer', 'quest', 'offline'],
  components: {
    holdphonevertically,
    gpscalibration,
    geolocation,
    orientation,
    story,
    geolocationStepMap,
    qrCodeStream,
    //Composant
    SuperImposeImageCameraStep
  },
  watch: {
    // refresh component if stepId change
    reload: async function(newVal, oldVal) {
      if (newVal === true || newVal === 'true') {
        await this.initData()
      }
      if (newVal === false || newVal === 'false') {
        this.hideReadMoreAlert()
      }
    },
    // check if item used is the right one
    itemUsed: async function(newVal, oldVal) {
      if (this.step && this.step.type === "use-item" && this.step.options && this.step.options.hasOwnProperty("touchLocation") && this.step.options.touchLocation === false) {
        this.checkUseItem()
      }
    }
  },
  data: function () {
    return this.initialState()
  },
  computed: {
    directionHelperSize: function () {
      return this.step && this.step.type === 'locate-item-ar' ? 9 : 12 // in rem
    }
  },
  mounted () {
    // seems always already done by "watch" on "reload" key // Uncommented by EMA on 122018, in some case watcher does not work
    //this.initData()
    utils.setTimeout(this.checkIfDataAreInit, 5000)
  },
  updated: debounce(function () {
    this.$nextTick(() => {
      this.pageReady = true
    })
  }, 250),
  beforeDestroy() {
    this.resetEvents();
  },
  methods: {
    initialState () {
      return {
        playerResult: null, // can be null even if step is played (answered)
        stepPlayed: false, // changes to true when step is played
        cameraStreamEnabled: false,
        imageCapture: null,
        takingSnapshot: false,
        cameraUsed: "environment",
        serverUrl: process.env.SERVER_URL,
        nbTry: 0,
        score: 0,
        reward: 0,
        controlsAreDisplayed: false,
        isHybrid: window.cordova,
        showNonHybridQRReader: false,
        showGeolocationIssueMessage: false,
        isIOs: utils.isIOS(),
        isSafari: utils.isSafari(),
        isPageInit: false,
        isNetworkLow: false,
        isTimeUp: false,
        displaySuccessIcon: false,
        rightAnswer: null,
        audio: {
          file: null,
          play: true
        },
        noSensorFound: false,

        // for step 'character'
        character: {
          bubbleText: [],
          numberOfBubble: 1,
          bubbleNumber: 0,
          needToScroll: false
        },
        // for step 'choose'
        answerType: 'text', // 'text' or 'image'

        // for steps type 'code-keypad' & 'code-color'
        playerCode: [],
        choose: {
          answers: []
        },
        keypad: [
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["*", "0", "#"]
        ],
        showTools: true,
        codeColors: {},

        // for step types 'geoloc' and 'locate-item-ar'
        geolocation: {
          active: false,
          distance: null, // target distance (can be changed by accelerometer for 'locate-item-ar')
          GPSdistance: null, // only given by GPS
          // direction
          direction: null,
          rawDirection: null, // in degrees
          waitForNextQuaternionRead: false,
          // object position relative to device
          position: { x: null, y: null },
          // player position (properties: latitude & longitude, from native call to navigator.geolocation.watchLocation())
          playerPosition: { coords: { longitude: 0, latitude: 0 }, marker: '' },
          //destinationPosition: { coords: { lat: 0, lng: 0 }, marker: '' },
          destinationPosition: [], // WARNING : Do not change !
          // for 'locate-item-ar'
          target: null,
          canSeeTarget: false,
          canTouchTarget: false,
          primaryColor: colors.getBrand('primary'),
          showCalibration: false,
          takeMobileVertically: false,
          gpsAccuracy: null, // in meters
          lowGpsAccuracyCeiling: 15, // in meters. below this value, we assume GPS accuracy is good enough
          lowGpsAccuracy: false,
          lowCompassAccuracy: false,
          persistentLowAccuracy: false, // helps to suggest player to skip current step
          persistentLowAccuracyTimeout: null,
          gpsAccuracyTimeout: null, // used for both compass & GPS
          showARHelp: false,
          playerTouchedArObject: false,
          currentIndex: 0,
          foundStep: false,
          mode: 'compass',
          colorIndicator: 'blue-2',
          closestDistance: 100,
          isCalibrationWatched: false
        },
        deviceMotion: {
          // device acceleration & velocity
          acceleration: {
            raw: { x: 0, y: 0, z: 0 },
            filtered: { x: 0, y: 0 },
            avgData: { x: [], y: [], z: [] },
            maxAvgItems: 5
          },
          velocity: { x: 0, y: 0 },
          dateLatestEvent: null,
          isTargetPositionUndefined: true,
          isAccelerationIdle: false,
          idleAccelerationInterval: null
        },
        deviceHasGyroscope: null,

        // for step type 'locate-marker'
        locateMarker: {
          markerControls: {},
          playerAnswer: '',
          flash: false,
          showHelp: false
        },

        // for step type 'write-text'
        writetext: {
          playerAnswer: ""
        },

        // for step type 'jigsaw puzzle'
        puzzle: {
          pieces: [],
          picture: 'statics/icons/game/card-back.png',
          dragSrcEl: null,
          element: {},
          colsByLevel: [1, 3, 4, 6, 5],
          mode: 'drag',
          clickModeSelected: null
        },

        // for step type 'memory'
        memory: {
          items: [],
          nbTry: 0,
          score: 0,
          selectedKey: null,
          disabled: false
        },
        imageOverFlow: {
          snapshot: ""
        },
        portrait: {
          face: { position: 1, number: 4 },
          eye: { position: 1, number: 16 },
          mouth: { position: 1, number: 1 },
          nose: { position: 1, number: 5 },
          hair: { position: 1, number: 26 },
          beard: { position: 1, number: 31 },
          glass: { position: 1, number: 5 },
          hat: { position: 1, number: 4 },
          type: "portrait-robot"
        },
        // for step type 'find-item'
        findItem: {
          nbItemsFound: 0,
          crossSize: 30,
          imageWidth: 900,
          imageHeight: 1200
        },
        useItem: {
          crossSize: 30,
          imageWidth: 900,
          imageHeight: 1200
        },
        readMoreNotif: null,
        // for step type 'use-item'
        itemUsedComputed: null,
        // for step types 'wait-for-event', 'trigger-event'
        mqttClient: null,
        bluetooth: {
          enabled: false,
          deviceId: null
        },
        iotObject: null,
        iot: {
          distance: null,
          pot1: null,
          pot2: null,
          pot3: null,
          keypadAnswer: null,
          axisX: null,
          axisY: null,
          chest: { disableActionButtons: false },
          relay: { disableActionButtons: false }
        },
        // for story/tutorial
        story: {
          step: null,
          data: null
        },
        enlargePicture: {
          show: false,
          url: ''
        },

        // for cleanup
        latestRequestAnimationId: null,

        pageReady: false,

        //timer
        countdowntimeleft: 0
        //,currentcountdown: null
      }
    },
    resetData () {
      const defaultVars = this.initialState()
      this.playerResult = defaultVars.playerResult
      this.stepPlayed = defaultVars.stepPlayed
      this.cameraStreamEnabled = defaultVars.cameraStreamEnabled
      this.imageCapture = defaultVars.imageCapture
      this.takingSnapshot = defaultVars.takingSnapshot
      this.nbTry = defaultVars.nbTry
      this.score = defaultVars.score
      this.reward = defaultVars.reward
      this.controlsAreDisplayed = defaultVars.controlsAreDisplayed
      this.isNetworkLow = defaultVars.isNetworkLow
      this.isTimeUp = defaultVars.isTimeUp
      this.displaySuccessIcon = defaultVars.displaySuccessIcon
      this.character = defaultVars.character
      this.playerCode = defaultVars.playerCode
      this.geolocation = defaultVars.geolocation
      this.deviceMotion = defaultVars.deviceMotion
      this.locateMarker = defaultVars.locateMarker
      this.writetext = defaultVars.writetext
      this.puzzle = defaultVars.puzzle
      this.choose = defaultVars.choose
      this.memory = defaultVars.memory
      this.portrait = defaultVars.portrait
      this.nbItemsFound = defaultVars.nbItemsFound
      this.readMoreNotif = defaultVars.readMoreNotif
      this.itemUsedComputed = defaultVars.itemUsedComputed
      this.mqttClient = defaultVars.mqttClient
      this.bluetooth = defaultVars.bluetooth
      this.iotObject = defaultVars.iotObject
      this.iot = defaultVars.iot
      this.story = defaultVars.story
      this.enlargePicture = defaultVars.enlargePicture
      this.latestRequestAnimationId = defaultVars.latestRequestAnimationId
      this.countdowntimeleft = defaultVars.countdowntimeleft
      this.pageReady = defaultVars.pageReady
      this.showTools = defaultVars.showTools
      this.rightAnswer = defaultVars.rightAnswer
      this.audio = defaultVars.audio
      this.showNonHybridQRReader = defaultVars.showNonHybridQRReader
      this.showGeolocationIssueMessage = defaultVars.showGeolocationIssueMessage
      //this.currentcountdown = defaultVars.currentcountdown
    },
    resetEvents () {
      // this is called every time step changes => cleanup all memory & CPU intensive tasks here

      // (camera streams, 3D animations, GPS trackings...)
      this.clearAllCameraStreams()

      // cancels recursive 'requestAnimationFrame()' calls
      // otherwise they continue in the background even when route changes
      this.stopLatestAnimation()

      window.removeEventListener('deviceorientation', this.checkPhoneVertically)
      window.removeEventListener("devicemotion", this.handleMotionEvent, true)

      if (this.deviceMotion.idleAccelerationInterval !== null) {
        clearInterval(this.deviceMotion.idleAccelerationInterval)
      }

      //utils.clearAllRunningProcesses() REMOVED BY EMA BECAUSE IT SHOULD BE MANAGED BY STEP.JS

      TWEEN.removeAll() // 3D animations

      // close MQTT connection & bluetooth (steps 'wait-for-event', 'trigger-event')
      if (this.mqttClient !== null) {
        let _this = this
        this.mqttClient.end(false, {}, () => {
          _this.mqttClient = null
        })
      }
      if (this.bluetooth.enabled) {
        this.bluetoothDisconnect(this.bluetooth.deviceId)
      }
      if (!this.step.countDownTime || !this.step.countDownTime.enabled) {
        this.stopcountdown()
      }

      if (['geolocation', 'locate-item-ar'].includes(this.step.type) && this.geolocation.isCalibrationWatched) {
        try {
          // can trigger an error in console which cannot be avoided
          cordova.plugins.headingcalibration.stopWatchCalibration();
          this.geolocation.isCalibrationWatched = false
        } catch (err) {}
      }
    },
    /*
     * get background image
     */
    getBackgroundImage () {
      if (!this.step.backgroundImage) {
        return ""
      }
      let backgroundImage = this.step.backgroundImage[this.lang] ? this.step.backgroundImage[this.lang] : this.step.backgroundImage[this.quest.mainLanguage]
      if (backgroundImage && backgroundImage[0] === "_") {
        return 'statics/images/quest/' + backgroundImage
      } else if (backgroundImage) {
        if (backgroundImage.indexOf('blob:') !== -1) {
          return backgroundImage
        } else {
          return this.serverUrl + '/upload/quest/' + this.step.questId + '/step/background/' + backgroundImage
        }
      }
      return ""
    },
    /*
     * reset background image between steps
     */
    async resetBackgroundImage () {
      let background = await document.getElementById('play-view')
      background.style.background = 'none'
      background.style.backgroundColor = 'transparent'
      let backgroundImage = await document.getElementById('background-image')
      if (backgroundImage) {
        backgroundImage.style.background = 'none'
        backgroundImage.style.backgroundImage = 'none'
        backgroundImage.style.backgroundColor = 'transparent'
      }
    },

    /*
     * Init the component data
     */
    async initData () {
      this.isPageInit = true
      this.resetEvents()
      this.resetData()
      await this.resetBackgroundImage()
      TWEEN.removeAll()
      // wait that DOM is loaded (required by steps involving camera)
      this.$nextTick(async () => {
        let background = document.getElementById('play-view')
        if (this.step.backgroundImage) {
          if (this.step.type === 'find-item' || this.step.type === 'use-item' || this.step.type === 'binocular' || this.step.type === 'phone-call') {
            background.style.background = 'none'
            background.style.backgroundColor = '#000'
            this.showControls()
          } else if (this.step.type === 'image-over-flow' || this.step.type === 'locate-marker' || this.step.id === 'sensor') {
            this.showControls()
            background.style.background = 'none'
            background.style.backgroundColor = 'transparent'
            document.body.style.backgroundColor = 'transparent'
          } else if (this.step.type === 'jigsaw-puzzle') {
            let backgroundUrl = this.getBackgroundImage()
            background.style.background = '#fff url("' + backgroundUrl + '") center/cover no-repeat'
            this.showControls()
          } else {
            // define if background image is a generic one or user defined one
            let backgroundUrl = this.getBackgroundImage()
            let backgroundImage = document.getElementById('background-image')
            //background.style.background = '#fff url("' + backgroundUrl + '") center/cover no-repeat'
            if (backgroundImage) {
              if (backgroundUrl) {
                backgroundImage.style.background = '#fff url("' + backgroundUrl + '") center/cover no-repeat'
              } else {
                backgroundImage.style.background = 'transparent'
              }
            }
            // display controls after some seconds to let user see background
            if (this.step.options && this.step.options.hasOwnProperty('initDuration')) {
              utils.setTimeout(this.showControls, parseInt(this.step.options.initDuration, 10) * 1000)
            } else {
              utils.setTimeout(this.showControls, 1000)
            }
          }
        } else {
          // no background on some steps to display camera stream
          if (this.step.type && this.step.type !== 'locate-item-ar' && this.step.type !== 'locate-marker' && this.step.id !== 'sensor' && this.step.type !== 'image-over-flow') {
            background.style.background = 'none'
            background.style.backgroundColor = '#fff'
            document.body.style.backgroundColor = '#323232'
          } else {
            background.style.background = 'none'
            background.style.backgroundColor = 'transparent'
            document.body.style.backgroundColor = 'transparent'
            if (this.step.type === 'locate-item-ar') {
              let backgroundImage = document.getElementById('background-image')
              if (backgroundImage) {
                backgroundImage.style.background = 'none'
                backgroundImage.style.backgroundColor = 'transparent'
              }
            }
          }
          this.showControls()
        }

        // start step audio
        this.getAudioSound()

        //this.startQuestCountDown()
        this.resetDrawDirectionInterval()
        
        this.resetSuccessIcon()

        var _this = this

        if (this.step.type === 'end-chapter' || this.step.type === 'increment-counter') {
          this.checkAnswer()
        }

        if (this.step.type === 'choose') {
          this.answerType = Array.isArray(this.step.options.items) && this.step.options.items[0].hasOwnProperty('imagePath') && this.step.options.items[0].imagePath !== null ? 'image' : 'text'
        }

        if (this.step.type === 'character') {
          if (this.step.text && this.step.text !== "") {
            this.character.bubbleText = this.step.text.split('|')
            this.character.numberOfBubble = this.character.bubbleText.length
            if (this.character.numberOfBubble === 1) {
              this.checkAnswer()
            }
            utils.setTimeout(this.checkIfTextIsHidden, 1500)
          } else {
            this.checkAnswer()
          }
        }

        if (this.step.type === 'code-keypad') {
          // for step type 'code-keypad', this.step.answers is a string in DB
          this.resetKeypadCode()
        }

        if (this.step.type === 'code-color') {
          if (this.step.options.colors) {
            this.codeColors = []
            for (var i = 0; i < this.step.options.colors.length; i++) {
              this.codeColors.push(this.step.options.colors[i].value)
            }
          } else {
            this.codeColors = colorsForCode
          }
          this.resetColorCode()
        }
        if (this.step.type === 'code-image') {
          this.resetImageCode()
        }

        if (this.step.type === 'find-item') {
          utils.setTimeout(this.initFindItemElements, 600)
        }
        if (this.step.type === 'use-item') {
          utils.setTimeout(this.initUseItemElements, 600)
        }

        if (this.step.type === 'new-item') {
          if (this.step.options.hasOwnProperty('addInventoryAndPass') && this.step.options.addInventoryAndPass) {
            await this.checkAnswer()
            utils.setTimeout(this.forceNextStep, 1000)
            this.step.type  = 'none' // do not display step
          }
          if (this.step.options.hasOwnProperty('pictures') && this.step.options.pictures[this.lang]) {
            this.step.options.picture = this.step.options.pictures[this.lang]
          }
          if (this.step.options.hasOwnProperty('titles') && this.step.options.titles[this.lang]) {
            this.step.options.title = this.step.options.titles[this.lang]
          }
          //await this.addItemToInventory(this.step.answers)
        }

        if (this.step.type === 'jigsaw-puzzle') {
          await this.initPuzzle()
          this.$emit('pass')
        }

        if (this.step.type === 'memory') {
          this.initMemory()
          this.$emit('pass')
        }

        if (this.step.type === 'binocular') {
          if (this.$q && this.$q.platform && this.$q.platform.is && this.$q.platform.is.desktop) {
            Notification(this.$t('label.YouMustTestThisStepOnMobile'), 'error')
          }
          this.$emit('pass')
        }

        if (this.step.type === 'phone-call') {
          if (this.$q && this.$q.platform && this.$q.platform.is && this.$q.platform.is.desktop) {
            Notification(this.$t('label.YouMustTestThisStepOnMobile'), 'error')
          }
          //this.$emit('hideButtons')
          //this.$emit('pass')
        }

        if (this.step.type === 'portrait-robot') {
          if (this.step.options && this.step.options.customize) {
            this.portrait = this.step.options.customize
          }
        }

        if (this.step.type === 'geolocation') {
          if (this.step.options.hasOwnProperty('mode') && ['compass', 'map'].includes(this.step.options.mode)) {
            this.geolocation.mode = this.step.options.mode
          } else {
            this.geolocation.mode = 'compass'
          }
          if (this.customization && this.customization.characterOnMap && this.customization.characterOnMap !== "") {
            this.geolocation.playerPosition.marker = this.customization.characterOnMap.indexOf('blob:') !== -1 ? this.customization.characterOnMap : this.serverUrl + '/upload/quest/' + this.customization.characterOnMap
          }
        }
        if (this.step.id === 'gpssensor') {
          if (this.step.visibles && this.step.visibles.length > 0) {
            this.geolocation.mode = 'map'
            for (var i = 0; i < this.step.visibles.length; i++) {
              this.geolocation.destinationPosition.push({marker: (this.step.visibles[i].marker.indexOf('blob:') !== -1 || this.step.visibles[i].marker === '') ? this.step.visibles[i].marker : this.serverUrl + '/upload/quest/' + this.step.questId + '/step/geolocation/' + this.step.visibles[i].marker, coords: this.step.visibles[i].coords})
            }
          } else {
            this.geolocation.mode = 'sensor'
          }
          if (this.customization && this.customization.characterOnMap && this.customization.characterOnMap !== "") {
            this.geolocation.playerPosition.marker = this.customization.characterOnMap.indexOf('blob:') !== -1 ? this.customization.characterOnMap : this.serverUrl + '/upload/quest/' + this.customization.characterOnMap
          }
        }

        // common process to 'geolocation' and 'locate-item-ar'
        if (this.step.type === 'geolocation' || this.step.type === 'locate-item-ar') {
          this.noSensorFound = this.$refs['orientation-component'].noSensorFound
          this.deviceHasGyroscope = this.$refs['orientation-component'].deviceHasGyroscope
          if (this.$q && this.$q.platform && this.$q.platform.is && this.$q.platform.is.desktop) {
            // if run as builder, get the remainingTrial
            if (this.runId === "0") {
              Notification(this.$t('label.YouMustTestThisStepOnMobile'), 'error')
              this.$emit('pass')
            } else {
              // user can pass
              this.$emit('pass')
              this.$emit('forceMoveNext')
            }
          } else {
            let requestPermissionResult

            // user can pass
            this.$emit('pass')

            // start devicemotion sensor (helps to check if phone is moving or not)
            if (this.deviceHasGyroscope) {
              window.addEventListener("devicemotion", this.handleMotionEvent, true)
            }

            if (this.step.type === 'geolocation' && this.isHybrid && !this.isIOs && !this.isSafari && !this.deviceHasGyroscope) {
              Notification(this.$t('label.PleaseHoldYourDeviceFlat'))
            }
            if (this.step.type === 'locate-item-ar') {
              // show help
              if (!this.isHybrid) {
                const call = await this.callPermissionsEvent()
                console.log(call)
              }
              
              this.geolocation.showARHelp = this.$refs['geolocation-component'].isActive

              // ask user to access to his device motion
              requestPermissionResult = await utils.requestDeviceMotionPermission()

              if (requestPermissionResult !== 'granted') {
                Notification(this.$t('label.PleaseAcceptDeviceMotionPermissionRequest'), 'error')
                return
              }

              if (!this.deviceHasGyroscope) {
                // only a warning because step can still be played
                Notification(this.$t('label.CouldNotEnableAR'), 'warning')
              }
            }
          }

          // must store object returned by setInterval() in Vue store instead of component properties,
          // otherwise it is reset when route changes & component is reloaded
          this.$store.dispatch('setDrawDirectionInterval', window.setInterval(this.drawDirectionArrow, 100))

          if (this.isHybrid && !this.isIOs) {
            try {
              // IOS is not tested for now, hence why we are not using it
              cordova.plugins.headingcalibration.watchCalibration(
                (accuracy) => {
                  this.geolocation.isCalibrationWatched = true
                  if (accuracy <= 1) {
                    _this.geolocation.lowCompassAccuracy = true
                    // start a timer when accuracy is low. after timer expired, if accuracy has not improved, show calibration animation
                    if (_this.geolocation.gpsAccuracyTimeout === null && !_this.geolocation.showCalibration && !_this.geolocation.persistentLowAccuracy) {
                      _this.geolocation.gpsAccuracyTimeout = utils.setTimeout(() => {
                        if (!_this.step.options || _this.step.options.hideAnimation !== true) {
                          _this.$refs.gpscal.askUserToCalibrateGPS()
                        }
                        if (_this.geolocation.gpsAccuracyTimeout !== null) {
                          clearTimeout(_this.geolocation.gpsAccuracyTimeout)
                          _this.geolocation.gpsAccuracyTimeout = null
                        }
                      }, 10000)
                    }
                    // persistent low accuracy: suggest the player to skip step
                    if (_this.geolocation.persistentLowAccuracyTimeout === null) {
                      _this.geolocation.persistentLowAccuracyTimeout = utils.setTimeout(() => {
                        _this.persistentLowAccuracy = true
                        _this.$emit('msg', 'suggestNext')
                        if (_this.geolocation.persistentLowAccuracyTimeout !== null) {
                          clearTimeout(_this.geolocation.persistentLowAccuracyTimeout)
                          _this.geolocation.persistentLowAccuracyTimeout = null
                        }
                      }, 20000)
                    }
                  } else {
                    _this.geolocation.lowCompassAccuracy = false
                    // Compass & GPS OK ? cancel timeouts
                    if (_this.geolocation.gpsAccuracyTimeout !== null && !_this.geolocation.lowGpsAccuracy) {
                      clearTimeout(_this.geolocation.gpsAccuracyTimeout);
                      _this.geolocation.gpsAccuracyTimeout = null;
                      clearTimeout(_this.geolocation.persistentLowAccuracyTimeout);
                      _this.geolocation.persistentLowAccuracyTimeout = null;
                      _this.geolocation.persistentLowAccuracy = false;
                    }
                  }
                },
                (err) => { console.error('watch calibration: failure', err) }
              );
            } catch (e) {
              console.log("calibration tests not working")
            }
          }
        }

        if (this.step.type === 'locate-item-ar' && !this.playerResult) {
          window.addEventListener('deviceorientation', this.checkPhoneVertically)
          if (this.deviceHasGyroscope || !this.step.backgroundImage) {
            // video stream for AR background
            if (this.isIOs && CameraPreview) {
              let options = {x: 0, y: 0, width: window.screen.width, height: window.screen.height, camera: CameraPreview.CAMERA_DIRECTION.BACK, toBack: true, tapPhoto: false, tapFocus: false, previewDrag: false}
              CameraPreview.startCamera(options)
              CameraPreview.show()
            } else {
              this.launchVideoStreamForAndroid('camera-stream-for-locate-item-ar', true)
            }
          }

          // Prepare scene to render
          // -----------------------

          let sceneCanvas = document.getElementById("target-canvas")

          this.geolocation.target = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(67, window.innerWidth / window.innerHeight, 0.001, 1000),
            renderer: new THREE.WebGLRenderer({ canvas: sceneCanvas, alpha: true, antialias: true }),
            size: null, // in meters
            // for animation
            mixers: [],
            clock: new THREE.Clock()
          }

          this.geolocation.target.renderer.setSize(window.innerWidth, window.innerHeight)

          let target = this.geolocation.target
          let scene = target.scene

          // --- Light ---

          this.addDefaultLightTo3DScene(scene)

          // --- specific parts for 2D/3D ---
          let object, animations
          if (this.step.options.is3D) {
            let data = await this.loadAndPrepare3DModel(this.step.options.customModel ? this.step.options.customModel : this.step.options.model, this.step.questId, this.step.options.customModel || false)
            object = data.object
            animations = data.animations

            // add offset to make 3D object "sit on the ground" by default (z = 0 at the bottom of the object)
            let box = new THREE.Box3().setFromObject(object)
            let onGroundOffset = (box.max.z - box.min.z) / 2
            object.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, onGroundOffset))

            // compute object size = max(length, width, depth)
            target.size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z)

            // animations ? play first animation
            if (animations.length > 0) {
              let mixer = new THREE.AnimationMixer(object)
              mixer.clipAction(animations[0]).play()
              this.geolocation.target.mixers.push(mixer)
            }

            // accurate colors for GLTF models, see https://stackoverflow.com/q/50331480/488666
            this.geolocation.target.renderer.outputEncoding = THREE.sRGBEncoding
          } else {
            // 2D plane with transparent image (user uploaded picture) as texture
            var itemImage = ''
            if (this.step.options.picture && this.step.options.picture.indexOf('blob:') !== -1) {
              itemImage = this.step.options.picture
            } else {
              itemImage = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/locate-item-ar/' + this.step.options.picture
            }

            this.$refs['item-image'].src = itemImage

            target.size = this.step.options.objectSize || 1
            let geometry = new THREE.PlaneGeometry(target.size, target.size)
            let texture
            try {
              texture = new THREE.TextureLoader().load(itemImage)
              // handling PNG transparency, see https://stackoverflow.com/a/26933541/488666
              texture.anisotropy = 0
              texture.magFilter = THREE.NearestFilter
              texture.minFilter = THREE.NearestFilter
            } catch (err) {
              console.error("Error while loading image:", err)
              Notification(this.$t('label.CouldNotDisplayObject'), 'error')
              return
            }
            let material = new THREE.MeshBasicMaterial({map: texture})
            material.transparent = true
            object = new THREE.Mesh(geometry, material)
            object.position.y = 0
          }

          object.name = "targetObject"
          object.up = new THREE.Vector3(0, 0, 1)
          object.visible = false
          scene.add(object)

          // default camera direction => look at positive y axis from origin
          this.geolocation.target.camera.up = new THREE.Vector3(0, 0, 1)
          this.geolocation.target.camera.lookAt(new THREE.Vector3(0, 1, 0))
          // handheld device will be nearly 1.50m above ground
          this.geolocation.target.camera.position.z = 1.5

          // animate & render
          this.animateTargetCanvas()
        }

        if (this.step.type === 'image-over-flow') {
          this.$emit('pass')
/*
          // video stream
          if (this.isIOs && CameraPreview) {
          //if (CameraPreview) {
            let options = {
              x: 0,
              y: 0,
              width: window.screen.width,
              height: window.screen.height,
              camera: CameraPreview.CAMERA_DIRECTION.BACK,
              toBack: true,
              tapPhoto: false,
              tapFocus: false,
              previewDrag: false
            }
            this.$q.loading.show()
            CameraPreview.startCamera(options)
            //CameraPreview.setColorEffect("redfilter")
            CameraPreview.show()
            setTimeout(function() { _this.$q.loading.hide() }, 5000)
          } else {
            this.launchVideoStreamForAndroid('camera-stream-for-image-over-flow', true)
          }*/
        }

        if ((this.step.type === 'locate-marker' || this.step.id === 'sensor') && !this.playerResult) {
          if (this.step.id === 'sensor') {
            this.step.options = { mode: 'scan', layerCode: 'magnifier' }
          } else {
            // user can pass
            this.$emit('pass')
          }

          //if (this.isHybrid) {
            this.initQRCodes()
          //}
        }

        if (this.step.type === 'wait-for-event' || this.step.type === 'trigger-event') {
          this.iotObject = this.getIotObjectFromCode(this.step.options.object)

          if (this.step.options.object === 'keypad') {
            this.iot.keypadAnswer = '_'.repeat(this.step.options.answer.length)
          }

          if (this.step.options.protocol === 'mqtt') {
            // TODO: adapt to match specs at https://github.com/Graaly/iot/blob/master/README.md

            this.mqttClient = mqtt.connect(process.env.MQTT_URL)

            this.mqttClient.on('connect', () => {
              console.log("Successfully connected to MQTT server " + process.env.MQTT_URL)
              if (_this.step.type === 'wait-for-event') {
                _this.mqttClient.subscribe(process.env.MQTT_TOPIC, function (err) {
                  if (err) {
                    console.error("Error when subscribing to topic " + process.env.MQTT_TOPIC + ":", err)
                  } else {
                    console.log("Successfully subscribed to MQTT topic " + process.env.MQTT_TOPIC)
                  }
                })
              }
            })

            this.mqttClient.on('error', (connack) => {
              console.error("Error connecting to MQTT server " + process.env.MQTT_URL, "connack=", connack)
            })

            if (_this.step.type === 'wait-for-event') {
              this.mqttClient.on('message', (topic, message) => {
                console.log("Received MQTT message (topic " + topic + "): ", message.toString())

                try {
                  message = JSON.parse(message)
                } catch (err) {
                  console.error("Could not read MQTT message. Error:", err)
                }

                if (message.macAddress === _this.step.options.boardMacAddress) {
                  console.log('*** MAC ADDRESSES MATCHED ***', _this.step.stepId)
                  console.log('matching codes?', message.code, _this.step.options.code)
                  if (message.code === _this.step.options.code) {
                    console.log('*** CODES MATCHED, CHECK ANSWER ***')
                    Notification(_this.step.options.successMessage, 'positive')
                    _this.checkAnswer()
                  }
                }
              })
            }
          } else if (this.step.options.protocol === 'bluetooth') {
            if (this.isHybrid) {
              ble.enable(this.bluetoothEnableSuccess, this.bluetoothEnableFailure);
            } else {
              console.warn('Webapp mode => no bluetooth support.')
            }
          } else {
            throw new Error('Unsupported IoT step protocol: ' + this.step.options.protocol)
          }

          // user can pass
          this.$emit('pass')
        } else {
          // other steps than IoT? disable MQTT & bluetooth if enabled
          if (this.mqttClient !== null) {
            this.mqttClient.end(false, {}, () => {
              _this.mqttClient = null
            })
          }
          if (this.bluetooth && this.bluetooth.enabled) {
            this.bluetoothDisconnect(this.bluetooth.deviceId)
          }
        }

        if (this.isTimerAvailable()) {
          await this.startCountdown()
          //this.currentcountdown = this.countdown()
        }
      })
    },
    /**
     * call device permissions event on iOS Fix for RA
     */
    callPermissionsEvent() {
      return new Promise((resolve, reject) => {
        if (typeof (DeviceMotionEvent) !== "undefined" && typeof (DeviceMotionEvent.requestPermission) === "function") {
          this.$q.dialog({
            title: this.$t('label.arDialogTitle'),
            message: this.$t('label.arDialogMessage'),
            persistent: true
          })
            .onOk(() => {
              DeviceMotionEvent.requestPermission()
                .then(response => {
                  console.log("devicePermissions", response)
                  resolve(response)
                })
                .catch((err) => reject(err))
            })
            .onCancel(() => {
              reject(new Error('User canceled authorization for device motion event'))
            })
            .onDismiss(() => {
              reject(new Error('User dismissed authorization for device motion event'))
            })
        } else {
          resolve()
        }
      })
    },
    reloadPage() {
      this.$router.go({
          path: this.$router.path,
          query: {
              t: new Date()
          }
      })
    },
    /*
    * Init QR Codes
    */
    initQRCodes() {
      for (var i = 1; i <= 60; i++) {
        let code = i.toString()
        code = code.padStart(3, "0")
        this.locateMarker.markerControls[code] = {detected: false}
      }
    },
    /*
    * start the scanner for hybrid app
    */
    startScanQRCode() {
      this.showNonHybridQRReader = true
    },
    closeQRCodeReader () {
      this.showNonHybridQRReader = false
    },
    /*
     * Show controls buttons
     */
    showControls () {
      this.controlsAreDisplayed = true // !this.controlsAreDisplayed
      // if transition step, next button is clickable when controls are displayed
      if (this.step.type === 'info-text' ||
        this.step.type === 'info-video' ||
        this.step.type === 'help' ||
        //this.step.type === 'character' ||
        this.step.type === 'image-over-flow' ||
        this.step.type === 'binocular' ||
        //this.step.type === 'phone-call' ||
        this.step.type === 'new-item' ||
        this.step.type === 'trigger-event') {
        this.checkAnswer()
      }
    },
    /*
     * Switch controls display
     */
    switchControls () {
      this.controlsAreDisplayed = !this.controlsAreDisplayed
    },
    resetSuccessIcon () {
      if (this.step.options && !this.step.options.successIcon) {
        this.step.options.successIcon = 'thumb_up'
      }
    },
    /*
     * If a bug occur and data are not init, force it !
     */
    checkIfDataAreInit() {
      if (!this.isPageInit) {
        this.initData()
      }
    },
    /*
     * Hide controls temporaly
     *
    hideControlsTemporaly () {
      this.controlsAreDisplayed = false
      utils.setTimeout(this.showControls, 4000)
    },*/
    /**
     * Send answer server side
     * @param   {String}    questId               Quest identifier
     * @param   {String}    stepId                Step identifier
     * @param   {String}    runId                 Run identifier
     * @param   {Object}    answerData            Answer object
     * @param   {Boolean}   displaySpinner        true => shows a spinner when checking answer using web API
     */
    async sendAnswer(questId, stepId, runId, answerData, displaySpinner) {
      if (!this.offline) {
        if (displaySpinner) {
          this.$q.loading.show()
        }

        // alert if the network is low
        var _this = this
        var lowNetworkTimeout = utils.setTimeout(function () { _this.isNetworkLow = true }, 8000)
        var response = await StepService.checkAnswer(questId, stepId, this.step.version, runId, answerData, this.player, { retries: 0 })

        // clear low network alerte if displayed
        clearTimeout(lowNetworkTimeout)
        this.isNetworkLow = false

        if (response && response.data) {
          if (displaySpinner) {
            this.$q.loading.hide()
          }
          let checkAnswerResult = response.data
          // if run as builder, get the remainingTrial
          if (this.runId === "0") {
            checkAnswerResult.remainingTrial = (this.step.nbTrial - this.nbTry - 1)
          }
          return checkAnswerResult
        } else {
          if (displaySpinner) {
            this.$q.loading.hide()
          }
          let offlineAnswer = await this.checkOfflineAnswer(answerData.answer)
          return offlineAnswer
        }
      } else { // offline mode
        // call web API (non blocking => no await) to attempt to update runs
        StepService.checkAnswer(questId, stepId, this.step.version, runId, answerData, this.player, { retries: 0 })
        
        let offlineAnswer = await this.checkOfflineAnswer(answerData.answer)
        return offlineAnswer
      }
    },
    /*
     * Check answer
     * @param   {Object}    answerData            Answer object
     */
    async checkOfflineAnswer(answer) {
      const type = this.step.type
      if (type === 'info-text' || type === 'info-video' || type === 'new-item' || type === 'character' || type === 'help' || type === 'image-over-flow' || type === 'binocular' || type === 'phone-call') {
        return { result: true, answer: true, score: 0, reward: 0, offline: true }
      } else if (type === 'geolocation' || type === 'locate-item-ar' || type === 'jigsaw-puzzle') {
        //TODO: find a way to check server side
        return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
      } else if (type === 'use-item') {
        if (this.isTimeUp === true) {
          return { result: false, answer: this.answer, score: 0, reward: 0, offline: true }
        }

        if (this.step.options && this.step.options.hasOwnProperty("touchLocation") && this.step.options.touchLocation === false) {
          if (this.answer.item === answer.item) {
            return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
          }
        } else {
          const ww = (answer && answer.windowWidth) ? answer.windowWidth : (this.getFindItemPictureSize() / 100)

          let answerPixelCoordinates = {
            left: Math.round(this.answer.coordinates.left / 100 * 100 * ww),
            top: Math.round(this.answer.coordinates.top / 100 * 133 * ww)
          }

          // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
          let solutionAreaRadius = Math.round(8 * answer.windowWidth)

          let distanceToSolution = Math.sqrt(Math.pow(answerPixelCoordinates.left - answer.posX, 2) + Math.pow(answerPixelCoordinates.top - answer.posY, 2))

          if (distanceToSolution <= solutionAreaRadius && this.answer.item === answer.item) {
            return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
          }
        }
      } else if (type === 'find-item') {
        if (this.isTimeUp === true) {
          return { result: false, answer: this.answer, score: 0, reward: 0, offline: true }
        }

        //if (this.step.options && this.step.options.coordinates && this.step.options.coordinates.length > 0) {
          //const checkIfFound = this.findItemIsFound()
          //if (checkIfFound.all) {
        return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
          //}
        //}
      } else if (type === 'write-text') {
        for (let i = 0; i < this.answer.length; i++) {
          if (utils.removeAccents(answer) === utils.removeAccents(this.answer[i])) {
            return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
          }
        }
      } else if (type === 'memory') {
        return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
      } else if (type === 'portrait-robot') {
        if (JSON.stringify(answer) === JSON.stringify(this.answer)) {
          return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
        }
      } else if (type === 'code-image') {
        if (this.step.options && this.step.options.orderIsNotImportant) {
          if (utils.orderCharactersOfString(answer) === utils.orderCharactersOfString(this.answer)) {
            return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
          }
        } else {
          if (answer === this.answer) {
            return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
          }
        }
      } else {
        if (answer == this.answer) { //keep == instead of === because sometime we compare string and numbers
          return { result: true, answer: this.answer, score: 1, reward: 0, offline: true }
        }
      }
      // answers not found
      // check if nb trials is met or not
      if (!this.isTimeUp && this.step.nbTrial && this.step.nbTrial > 0 && (this.nbTry + 1) < this.step.nbTrial) {
        return { result: false, remainingTrial: (this.step.nbTrial - this.nbTry - 1), offline: true }
      } else {
        return { result: false, answer: this.answer, score: 0, reward: 0, offline: true }
      }
    },
    /*
     * Check if the answer is correct
     * @param   {Object}    selectedAnswerKey            Answer object
     */
    async checkAnswer(answer) {
      var checkAnswerResult
      if (this.playerResult !== null) {
        if (this.step.type === 'locate-marker') {
          Notification(this.$t('label.qrCodeAlreadyGood'), 'info')
        }
        return
      }

      // if generic marker sensor
      if (this.step.id === 'sensor') {
        // all the QR code needs to be 3 digits long
        if (!this.locateMarker.markerControls[answer]) {
          Notification(this.$t('label.QRCodeIsNotPlayingOne'), 'error')
          return
        }
        if (!this.locateMarker.markerControls[answer].detected) {
          this.locateMarker.flash = false
          this.locateMarker.flash = true
          this.locateMarker.markerControls[answer].detected = true
          this.$emit('played', answer)
        }
        return
      }
      // if generic gps sensor
      if (this.step.id === 'gpssensor') {
        checkAnswerResult = await this.sendAnswer(this.step.questId, answer.stepId, this.runId, {answer: answer.position, isTimeUp: this.isTimeUp}, false)

        this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true, answer.position)
        return
      }

      switch (this.step.type) {
        case 'info-text':
        case 'info-video':
        case 'new-item':
        case 'help':
        case 'end-chapter':
        case 'increment-counter':
        case 'character':
        case 'image-over-flow':
        case 'binocular':
        case 'phone-call':
        case 'trigger-event':
          // save step automatic success
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {}, false)
          this.submitGoodAnswer(0, checkAnswerResult.offline, false)
          break

        case 'choose':
          answer = this.choose.answers.sort()
          let answerStr = answer.join("|")
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answerStr, isTimeUp: this.isTimeUp}, true)
          if (checkAnswerResult.result === true) {
            for (var i = 0; i < answer.length; i++) {
              let selectedAnswer = this.step.options.items[answer[i]]
              if (this.step.displayRightAnswer === false && (!this.step.options.rightAnswerMessage || !this.step.options.rightAnswerMessage[this.lang] || this.step.options.rightAnswerMessage[this.lang] === "")) {
                selectedAnswer.class = 'rightorwrong'
              } else {
                selectedAnswer.icon = 'done'
                selectedAnswer.class = 'right'
              }
              Vue.set(this.step.options.items, answer[i], selectedAnswer)
            }

            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer, answerStr)
          } else {
            if (!this.isTimeUp) {
              for (var i = 0; i < answer.length; i++) {
                let selectedAnswer = this.step.options.items[answer[i]]
                if (this.step.displayRightAnswer === false && (!this.step.options.rightAnswerMessage || !this.step.options.rightAnswerMessage[this.lang] || this.step.options.rightAnswerMessage[this.lang] === "")) {
                  selectedAnswer.class = 'rightorwrong'
                } else {
                  selectedAnswer.icon = 'clear' // "x" icon
                  selectedAnswer.class = 'wrong'
                }
                Vue.set(this.step.options.items, answer[i], selectedAnswer)
              }
            }

            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            if (this.step.displayRightAnswer === true) {
              // indicate the right answer
              if ((checkAnswerResult.answer || checkAnswerResult.answer === 0) && !checkAnswerResult.remainingTrial) {
                let returnedAnswers = (checkAnswerResult.answer + "").split("|")
                for (var i = 0; i < returnedAnswers.length; i++) {
                  let selectedAnswer = this.step.options.items[returnedAnswers[i]]
                  selectedAnswer.icon = 'done'
                  selectedAnswer.class = 'right'
                  Vue.set(this.step.options.items, returnedAnswers[i], selectedAnswer)
                }
              }
            }
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer, answerStr)
            }
          }
          break

        case 'geolocation':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, false)

          if (this.isTimeUp) {
            this.submitWrongAnswer(checkAnswerResult.offline, true, answer)
          } else if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true, answer)
          }
          break

        case 'code-keypad':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.playerCode.join(''), isTimeUp: this.isTimeUp}, true)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer, this.playerCode.join(''))
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            if (this.step.displayRightAnswer === true) {
              // indicate the right answer
              if ((checkAnswerResult.answer || checkAnswerResult.answer === 0) && !checkAnswerResult.remainingTrial) {
                this.rightAnswer = checkAnswerResult.answer
              }
            }

            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              // reset code
              this.resetKeypadCode()
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer, this.playerCode.join(''))
            }
          }
          break

        case 'code-color':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.playerCode.join('|'), isTimeUp: this.isTimeUp}, true)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer, this.playerCode.join('|'))
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            if (this.step.displayRightAnswer === true) {
              // indicate the right answer
              if ((checkAnswerResult.answer || checkAnswerResult.answer === 0) && !checkAnswerResult.remainingTrial) {
                this.rightAnswer = checkAnswerResult.answer.split('|')
              }
            }

            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer, this.playerCode.join('|'))
            }
          }
          break

        case 'code-image':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.playerCode.join('|'), isTimeUp: this.isTimeUp}, true)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer, this.playerCode.join('|'))
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            if (this.step.displayRightAnswer === true) {
              // indicate the right answer
              if ((checkAnswerResult.answer || checkAnswerResult.answer === 0) && !checkAnswerResult.remainingTrial) {
                this.rightAnswer = checkAnswerResult.answer.split('|')
              }
            }

            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer, this.playerCode.join('|'))
            }
          }
          break

        case 'jigsaw-puzzle':
          // MP 2019-10-15 since shuffle is done on client side, we always
          // consider that puzzle is solved when checkAnswer() is called.

          // call to sendAnswer() is required to get score & offline info
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: !(this.isTimeUp === true), isTimeUp: this.isTimeUp}, true)

          if (this.isTimeUp === true) {
            this.submitWrongAnswer(checkAnswerResult.offline, true)
          } else if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
          }
          break

        case 'memory':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: !(this.isTimeUp === true), isTimeUp: this.isTimeUp}, false)

          if (this.isTimeUp === true) {
            this.submitWrongAnswer(checkAnswerResult.offline, true)
          } else if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
          }
          break

        case 'portrait-robot':
          let portraitAnswer = {items: {type: 1, face: this.portrait.face ? this.portrait.face.position : 0, eye: this.portrait.eye ? this.portrait.eye.position : 0, mouth: this.portrait.mouth ? this.portrait.mouth.position : 0, nose: this.portrait.nose ? this.portrait.nose.position : 0, hair: this.portrait.hair ? this.portrait.hair.position : 0, beard: this.portrait.beard ? this.portrait.beard.position : 0, glass: this.portrait.glass ? this.portrait.glass.position : 0, hat: this.portrait.hat ? this.portrait.hat.position : 0}}
          
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: portraitAnswer, isTimeUp: this.isTimeUp}, false)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer, JSON.stringify(portraitAnswer))
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }

            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer, JSON.stringify(portraitAnswer))
            }
          }
          break

        case 'write-text':
          // remove the trailing space if ther is one
          // https://www.w3schools.com/jsref/jsref_trim_string.asp
          this.writetext.playerAnswer = this.writetext.playerAnswer.trim()

          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.writetext.playerAnswer, isTimeUp: this.isTimeUp}, true)
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer, this.writetext.playerAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            if (this.step.displayRightAnswer === true) {
              // indicate the right answer
              if ((checkAnswerResult.answer || checkAnswerResult.answer === 0) && !checkAnswerResult.remainingTrial) {
                this.rightAnswer = checkAnswerResult.answer[0]
              }
            }

            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              // reset field
              this.writetext.playerAnswer = ""
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer, this.writetext.playerAnswer)
            }
          }

          break

        case 'use-item':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, true)

          if (this.isTimeUp) {
            // automatically set selectedItem to the right one
            if (!this.inventory || !this.inventory.items || !Array.isArray(this.inventory.items)) {
              throw new Error("Could not retrieve inventory items. Inventory content: ", this.inventory)
            }
            // this.inventory.items is an Observer
            // https://stackoverflow.com/questions/47388040/how-can-i-loop-object-observer-on-vue-js-2
            Array.from(this.inventory.items).forEach(item => {
              let useItemAnswer = item.originalPicture ? item.originalPicture : item.picture
              if (useItemAnswer === checkAnswerResult.answer.item) {
                // cannot override property 'itemUsed'
                this.itemUsedComputed = item
              }
            })
          }

          if (checkAnswerResult.result === true) {
            if (this.step.displayRightAnswer) {
              this.showItemLocation(checkAnswerResult.answer.coordinates.left, checkAnswerResult.answer.coordinates.top)
            }
            // if alt picture
            if (this.step.options && this.step.options.altFile) {
              this.step.backgroundImage[this.lang] = this.step.options.altFile
            }

            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }

            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              Notification(this.$t('label.UseItemNothingHappens'), 'error')
            } else {
              if (this.step.displayRightAnswer) {
                this.showItemLocation(checkAnswerResult.answer.coordinates.left, checkAnswerResult.answer.coordinates.top)
              }

              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
            }
          }

          break

        case 'find-item':
          const checkIfFound = this.findItemIsFound(answer)
          if (checkIfFound.all) {
            checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: true, isTimeUp: this.isTimeUp}, true)

            /*if (this.step.displayRightAnswer) {
              this.showFoundLocation(checkAnswerResult.answer.left, checkAnswerResult.answer.top)
            }*/
            // if alt picture => Show it and hide find locations
            if (this.step.options && this.step.options.altFile) {
              this.step.backgroundImage[this.lang] = this.step.options.altFile
              this.hideAllFindItemLocation()
            }
            
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            const remainingTrial = this.isTimeUp ? 0 : (this.step.nbTrial - this.nbTry - 1)
            if (!checkIfFound.one) {
              this.nbTry++
              if (remainingTrial > 0) {
                if (this.step.options.wrongLocationMessage && this.step.options.wrongLocationMessage[this.lang] && this.step.options.wrongLocationMessage[this.lang] !== "") {
                  Notification(this.step.options.wrongLocationMessage[this.lang], 'error')
                } else {
                  Notification(this.$t('label.FindItemNothingHappens'), 'error')
                }
              } else {
                checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: false, isTimeUp: this.isTimeUp}, true)
                
                // show locations to click even if user fail
                if (this.step.options && this.step.options.altFile) {
                  this.step.backgroundImage[this.lang] = this.step.options.altFile
                  this.hideAllFindItemLocation()
                } else {
                  this.showAllFindItemLocation()
                }

                this.submitWrongAnswer(false, this.step.displayRightAnswer)
              }
            }
          }

          break

        case 'locate-item-ar':
        case 'locate-marker':
          if (this.step.type === 'locate-item-ar' || (this.step.type === 'locate-marker' && this.step.options && this.step.options.mode === 'touch')) {
            checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, false)
            if (checkAnswerResult && checkAnswerResult.hasOwnProperty('result')) {
              if (this.step.type === 'locate-item-ar') {
                // stop listening to motion events
                if (this.deviceHasGyroscope) {
                  window.removeEventListener("devicemotion", this.handleMotionEvent, true)
                }
                window.removeEventListener('deviceorientation', this.checkPhoneVertically)
              }

              // stop camera flow
              if (this.isIOs && CameraPreview) {
                //CameraPreview.hide()
                CameraPreview.stopCamera()
                CameraPreview.stopCamera() // calling twice is needed
              }

              TWEEN.removeAll() // clear all running animations

              // show found object when it's a 3D model
              if ((this.step.type === 'locate-item-ar' && this.step.options && this.step.options.is3D) || this.step.type === 'locate-marker') {
                let target
                if (this.step.type === 'locate-item-ar') {
                  target = this.geolocation.target
                } else {
                  target = this.locateMarker
                }
                let camera = target.camera
                let object = target.scene.getObjectByName('targetObject')
                object.visible = true

                let box = new THREE.Box3().setFromObject(object)
                let size = new THREE.Vector3()
                box.getSize(size)

                let cameraDistance = Math.max(size.x, size.y, size.z) * 2

                let startScale = Object.assign({}, object.scale) // copy the full Vector3 object, not a reference

                let disappearAnimation = new TWEEN.Tween(object.scale).to({ x: 0, y: 0, z: 0 }, 1000)
                  .easing(TWEEN.Easing.Back.In)
                  .onComplete(() => {
                    camera.position.set(0, 0, cameraDistance * 2 / 3)
                    camera.lookAt(new THREE.Vector3(0, cameraDistance, size.z / 2))
                    // reset object position/scale/rotation
                    object.scale.set(0, 0, 0)
                    object.position.set(0, cameraDistance, size.z / 2)
                    object.rotation.set(0, 0, 0)

                    if (checkAnswerResult.result === true) {
                      this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
                    } else {
                      this.submitWrongAnswer(checkAnswerResult.offline, true)
                    }
                  })

                let appearAnimation = new TWEEN.Tween(object.scale).to({ x: startScale.x, y: startScale.y, z: startScale.z }, 1000)
                  .easing(TWEEN.Easing.Back.Out)

                // https://stackoverflow.com/a/31766476/488666
                let rotationAnimation = new TWEEN.Tween(object.rotation)
                  .to({ z: "-" + Math.PI / 2 }, 2000) // relative animation
                  .repeat(Infinity)

                disappearAnimation.chain(appearAnimation, rotationAnimation).start()
              } else { // 2D image on plane
                if (checkAnswerResult.result === true) {
                  this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
                } else {
                  this.submitWrongAnswer(checkAnswerResult.offline, true)
                }
              }
            }
          } else { // locate-marker, mode scan
            var markerDetected = false
            //if (this.isHybrid) {
            //if (this.isIOs) {
              if (this.locateMarker.markerControls[answer] && !this.locateMarker.markerControls[answer].detected) {
                this.locateMarker.markerControls[answer].detected = true
                markerDetected = true
              } else {
                Notification(this.$t('label.qrCodeAlreadyScan'), 'info')
              }
            //}

            if (markerDetected) {
              checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, true)

              if (checkAnswerResult.result === true) {
                this.submitGoodAnswer(checkAnswerResult.score, checkAnswerResult.offline, true)
                this.locateMarker.playerAnswer = answer // for display
              } else {
                this.nbTry++
                if (this.nbTry === 2 || this.isTimeUp) {
                  this.submitWrongAnswer(checkAnswerResult.offline, true)
                } else {
                  this.submitRetry(1)
                }
              }
            }
          }
          break

        case 'wait-for-event':
          // otherwise, this.onBluetoothNotification() can still be called a lot of times while the call to this.sendAnswer() below is waiting for a reply from web API
          await this.stopBluetoothNotification()

          // call to sendAnswer() is required to get score & offline info
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: '', isTimeUp: this.isTimeUp}, true)

          if (this.isTimeUp) {
            this.submitWrongAnswer(checkAnswerResult.offline, true)
          } else {
            // reaching this line means that the correct event (code + mac address) has been retrieved from the IoT board

            // server should always return true, otherwise user may be cheating
            // TODO check on server side if same MQTT event has been retrieved
            if (checkAnswerResult.result === true) {
              this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
            } else {
              Notification(this.$t('label.TechnicalIssue'), 'error')
            }
          }

          // clear connection with IoT device
          if (this.step.options.protocol === 'mqtt') {
            let _this = this
            this.mqttClient.end(false, {}, () => {
              _this.mqttClient = null
            })
          } else if (this.step.options.protocol === 'bluetooth') {
            this.bluetoothDisconnect(this.bluetooth.deviceId)
          } else {
            throw new Error("Unknown IoT protocol '" + this.step.options.protocol + "'")
          }

          break

        default:
          console.log('checkAnswer(): Step type ' + this.step.type + ' not supported.')
      }

      // display score
      this.score = (checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0
      this.reward = (checkAnswerResult && checkAnswerResult.reward) ? checkAnswerResult.reward : 0
    },
    /*
     * Send answer without telling if it is true or false
     */
    submitAnswer(offlineMode) {
      this.stepPlayed = true
      this.$emit('played', null, offlineMode)

      this.displayReadMoreAlert()

      // advise user to move to next step
      utils.setTimeout(this.alertToPassToNextStep, 15000)
    },
    /*
     * Send good answer
     */
    submitGoodAnswer(score, offlineMode, showResult, answer) {
      /*if (showResult) {
        this.playerResult = true
      } else {
        this.playerResult = null
      }*/
      this.playerResult = true

      if (
        this.step.countDownTime !== undefined &&
        this.step.countDownTime !== null &&
        this.step.countDownTime.enabled === true)
      {
        let stepType = this.getStepType(this.step.type) // this.step.type contains step code

        // do not hide the timer on 'transition' steps because they automatically call 'submitGoodAnswer()' at loading
        if (stepType.category === 'enigma') {
          this.step.countDownTime.enabled = false
          this.stopcountdown()
        }
      }
      this.stepPlayed = true

      this.$emit('success', score, offlineMode, showResult, answer)
      this.$emit('played')

      if (showResult || (this.step.options && this.step.options.rightAnswerMessage && this.step.options.rightAnswerMessage[this.lang] && this.step.options.rightAnswerMessage[this.lang] !== "")) {
        switch (this.step.type) {
          case 'character':
          case 'new-item':
          case 'info-text':
          case 'help':
          case 'end-chapter':
          case 'increment-counter':
          case 'info-video':
          case 'image-over-flow':
          case 'binocular':
          case 'phone-call':

            break
          case 'choose':
          case 'code-keypad':
          case 'code-color':
          case 'code-image':
            this.displaySuccessMessage(true, this.$t('label.GoodAnswer'), true, false, true)
            break
          case 'write-text':
          case 'jigsaw-puzzle':
          case 'memory':
          case 'portrait-robot':
          case 'use-item':
          case 'find-item':
          case 'geolocation':
            this.displaySuccessMessage(true, this.$t('label.YouHaveFoundThePlace'), true, false, true)
            break
          case 'locate-item-ar':
          case 'locate-marker':
            if (this.step.type === 'locate-item-ar' || (this.step.type === 'locate-marker' && this.step.options && this.step.options.mode === 'touch')) {
              this.displaySuccessMessage(true, this.$t('label.YouHaveWinANewItem'), true, false, true)
            } else { // locate marker, mode scan
              this.displaySuccessMessage(true, this.$t('label.WellDone'), true, false, true)
            }
            break
          case 'wait-for-event':
            this.displaySuccessMessage(true, this.$t('label.WellDone'), true, false, true)
            break
        }
      }
      
      this.displayReadMoreAlert()

      // if no display of the answer move to next step
      if (this.step.displayRightAnswer === false && (!this.step.options.rightAnswerMessage || !this.step.options.rightAnswerMessage[this.lang] || this.step.options.rightAnswerMessage[this.lang] === "")) {
        this.forceNextStep()
      }
      if (this.step.options.moveToNextStepAutomatically) {
        if (this.step.options.moveToNextStepAutomaticallyDuration) {
          utils.setTimeout(this.forceNextStep, parseInt(this.step.options.moveToNextStepAutomaticallyDuration, 10) * 1000)
        } else {
          utils.setTimeout(this.forceNextStep, 3000)
        }
      }
      // advise user to move to next step
      //utils.setTimeout(this.alertToPassToNextStep, 15000)
    },
    /*
     * Send wrong answer
     */
    submitWrongAnswer(offlineMode, showResult, answer) {
      // remove timer
      if (this.step.countDownTime) {
        this.step.countDownTime.enabled = false
        this.stopcountdown()
      }

      /*if (showResult) {
        this.playerResult = false
      } else {
        this.playerResult = null
      }*/
      this.playerResult = false

      this.stepPlayed = true

      this.$emit('fail', offlineMode, showResult, answer)
      this.$emit('played')

      if (this.isTimeUp === true) {
        this.displaySuccessMessage(false, this.$t('label.CountDownPopupfail'), false, false, true)
      } else if (showResult || (this.step.options.wrongAnswerMessage && this.step.options.wrongAnswerMessage[this.lang] && this.step.options.wrongAnswerMessage[this.lang] !== "")) {
        this.displaySuccessMessage(false, this.$t('label.WrongAnswer'), true, false, true)
      }
      
      this.displayReadMoreAlert()

      // if no display of the answer move to next step
      if (this.step.displayRightAnswer === false && (!this.step.options.wrongAnswerMessage || !this.step.options.wrongAnswerMessage[this.lang] || this.step.options.wrongAnswerMessage[this.lang] === "")) {
        this.forceNextStep()
      } else if (this.step.options.moveToNextStepAutomatically) {
        utils.setTimeout(this.forceNextStep, 3000)
      } else {
        // advise user to move to next step
        utils.setTimeout(this.alertToPassToNextStep, 15000)
      }
    },
    alertToPassToNextStep() {
      this.displaySuccessMessage(true, this.$t('label.ClickOnArrowToMoveToNextStep'), false, false, false)
    },
    /*
     * Display the read more alert
     */
    displayReadMoreAlert() {
      if (this.step.extraText) {
        var actions = [
          {
            label: this.$t('label.ReadMore'),
            handler: () => {
              this.readMore()
            }
          }
        ]
        if (this.readMoreNotif === null) {
          this.readMoreNotif = Notification('', 'readMore', actions)
        }
      }
    },
    hideReadMoreAlert() {
      if (this.readMoreNotif !== null) {
        this.readMoreNotif()
      }
    },
    /*
     * Display retry message when wrong answer
     */
    submitRetry(nbRemainingTrials) {
      if (nbRemainingTrials > 40) {
        // do not display nb of try if infinite tries
        this.displaySuccessMessage(false, this.$t('label.WrongAnswer'), true, false, false)
      } else if (nbRemainingTrials === 1) {
        this.displaySuccessMessage(false, this.$t('label.SecondTryOnTry', {nb: nbRemainingTrials}), false, false, false)
      } else {
        this.displaySuccessMessage(false, this.$t('label.SecondTry', {nb: nbRemainingTrials}), false, false, false)
      }
    },

    ////////////////////////////////////////////// MANAGEMENT OF THE ENIGMA COMPONENTS /////////////////////////////////////////////

    forceNextStep() {
      this.$emit('forceMoveNext')
    },
    /*
     * Display next text
     */
    async nextCharacterBubbleText() {
      if (this.character.bubbleNumber < (this.character.numberOfBubble - 1)) {
        this.character.bubbleNumber++
        this.character.needToScroll = false
        utils.setTimeout(this.checkIfTextIsHidden, 500)
      }
      if (this.character.bubbleNumber >= (this.character.numberOfBubble - 1)) {
        if (!this.stepPlayed) {
          await this.checkAnswer()
        } else {
          this.forceNextStep()
        }
      }
    },
    async checkIfTextIsHidden() {
      if (!this.$refs.bubbleText) {
        return
      }

      // check if height > max size of the box
      const bubbleHeight = this.$refs.bubbleText ? this.$refs.bubbleText.clientHeight : 0
      const bubbleHTMLHeight = this.$refs.bubbleTextHtml ? this.$refs.bubbleTextHtml.clientHeight : 0
      const realBubbleHeight = Math.max(bubbleHeight, bubbleHTMLHeight)

      if (realBubbleHeight > '177') {
        this.character.needToScroll = true
      }
    },
    chooseSelectValue(key) {
      if (this.step.options && this.step.options && this.step.options.multipleAnswers) {
        if (this.choose.answers.indexOf(key) === -1) {
          Vue.set(this.step.options.items[key], "class", 'right')
          this.choose.answers.push(key)
        } else {
          Vue.set(this.step.options.items[key], "class", '')
          this.choose.answers.splice(this.choose.answers.indexOf(key), 1)
        }
      } else {
        this.choose.answers = [key]
        this.checkAnswer(key)
      }
    },
    /*
     * Reset the key pad
     */
    resetKeypadCode() {
      //this.playerCode = Array(this.step.answers.length).fill("")
      const length = ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4)
      this.playerCode = Array(length).fill("")
    },
    /*
     * Reset the color code pad
     */
    resetColorCode() {
      const length = ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4)
      this.playerCode = Array(length).fill(this.codeColors[0])
    },
    /*
     * Reset the image code pad
     */
    resetImageCode() {
      const length = ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4)
      this.playerCode = Array(length).fill(0)
      // MPA 2020-09-28 this shows the right answer
      /*this.playerCode.length = 0
      var imagePositionInCode = 0
      var nbImagePositionInCode = this.getNbImageUploadedForCode()
      for (var i = 0; i < ((this.step.options && this.step.options.codeLength && this.step.options.codeLength > 0) ? this.step.options.codeLength : 4); i++) {
        this.playerCode.push(imagePositionInCode)
        if (imagePositionInCode < nbImagePositionInCode - 1) {
          imagePositionInCode++
        } else {
          imagePositionInCode = 0
        }
        this.forceImageRefresh(i)
      }*/
    },
    /*
     * Display next image in the image code pad
     * @param   {Number}    key            index in the code list array
     */
    nextCodeAnswer(key) {
      this.playerCode[key]++
      var nbImagesUploaded = this.getNbImageUploadedForCode()
      if (this.playerCode[key] >= nbImagesUploaded) {
        this.playerCode[key] = 0
      }
      this.forceImageRefresh(key)
    },
    /*
     * Display the next image in the image code pad
     * @param   {Number}    key            Index in the code list array
     */
    previousCodeAnswer(key) {
      this.playerCode[key]--
      var nbImagesUploaded = this.getNbImageUploadedForCode()
      if (this.playerCode[key] < 0) {
        this.playerCode[key] = nbImagesUploaded - 1
      }
      this.forceImageRefresh(key)
    },
    /*
    * Force image refresh for image code
    * @param   {Number}    key            Index in the code list array
    */
    forceImageRefresh(key) {
      if (document.getElementById('image-code-' + key) !== null) {
        if (this.step.options.images[this.playerCode[key]].imagePath && this.step.options.images[this.playerCode[key]].imagePath.indexOf('blob:') !== -1) {
          document.getElementById('image-code-' + key).src = this.step.options.images[this.playerCode[key]].imagePath
        } else {
          document.getElementById('image-code-' + key).src = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/code-image/' + this.step.options.images[this.playerCode[key]].imagePath
        }
      }
    },
    /*
     * Get the number of images for the image code pad
     */
    getNbImageUploadedForCode() {
      var nbImagesUploaded = 0
      for (var i = 0; i < this.step.options.images.length; i++) {
        if (this.step.options.images[i] && this.step.options.images[i].imagePath) {
          nbImagesUploaded++
        }
      }
      return nbImagesUploaded
    },
    /*
     * Add a number in the pad
     * @param   {string}    char            Number to display
     */
    addCodeChar(char) {
      if (!this.playerCode) {
        return
      }
      // find next empty char in typed code
      let nextEmptyCharIndex = this.playerCode.indexOf('');

      if (nextEmptyCharIndex === -1) {
        return
      }

      Vue.set(this.playerCode, nextEmptyCharIndex, char)
    },
    /*
     * Clear the latest char in the pad
     */
    clearLastCodeChar() {
      if (!this.playerCode) {
        return
      }
      // find next non empty char in typed code
      let lastTypedCharIndex = this.playerCode.indexOf('')
      lastTypedCharIndex = (lastTypedCharIndex === -1 ? this.playerCode.length - 1 : lastTypedCharIndex - 1)

      if (lastTypedCharIndex < 0 || lastTypedCharIndex >= this.playerCode.length) {
        return
      }

      Vue.set(this.playerCode, lastTypedCharIndex, '')
    },
    /*
     * Change the color of a circle in the color pad
     * @param   {number}    index            Index in the colors array
     */
    changeColorForCode(index) {
      if (this.playerResult !== null || !this.codeColors) {
        return
      }
      let currentColorIndex = this.codeColors.indexOf(this.playerCode[index])
      let nextColorIndex = (currentColorIndex + 1) % this.codeColors.length
      this.$set(this.playerCode, index, this.codeColors[nextColorIndex])
    },
    /*
     * Change the image in the image code pad
     * @param   {number}    index            Index in the images array
     */
    changeImageForCode(index) {
      if (this.playerResult !== null || !this.codeColors) {
        return
      }
      let currentColorIndex = this.codeColors.indexOf(this.playerCode[index])
      let nextColorIndex = (currentColorIndex + 1) % this.codeColors.length
      this.$set(this.playerCode, index, this.codeColors[nextColorIndex])
    },

    launchVideoStreamForAndroid(container, initCapture, facingMode) {
      if (!facingMode) {
        facingMode = this.cameraUsed
      }
      let cameraStream = this.$refs[container]
      navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode }, audio: false })
        .then((stream) => {
          // Hacks for Safari iOS
          cameraStream.setAttribute("muted", true)
          cameraStream.setAttribute("playsinline", true)

          cameraStream.srcObject = stream
          cameraStream.play()
          this.cameraStreamEnabled = true
          this.$store.dispatch('addMediaStream', stream)

          if (initCapture) {
            // init video capturing
            const track = stream.getVideoTracks()[0];
            this.imageCapture = new ImageCapture(track);
          }
        })
        .catch((err) => {
          // TODO friendly behavior/message for user
          console.warn("No camera stream available")
          console.log(err)
        });
      return cameraStream
    },
    /*
     * Stop the video tracking
     */
    stopVideoTracks(cameraStreamElementRef) {
      if (this.$refs[cameraStreamElementRef] && this.$refs[cameraStreamElementRef].srcObject) {
        this.$refs[cameraStreamElementRef].srcObject.getVideoTracks().forEach(function(track) { track.stop() })
      }
      this.cameraStreamEnabled = false
    },
    /*
     * Draw direction arrows for geolocation
     */
    drawDirectionArrow() {
      if (document.querySelector('.direction-helper canvas') === null || !this.geolocation.active) {
        return
      }

      // shows a static arrow even if the user is on desktop (step creation from toolbox)
      if (this.geolocation.direction === null) {
        this.geolocation.direction = 0
      }

      // refresh arrow in canvas depending on direction
      let canvas = document.querySelector('.direction-helper canvas')
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight

      let ctx = canvas.getContext('2d')

      let w = canvas.width
      let h = canvas.height

      let arrowCenterX = Math.round(w / 2)
      let arrowCenterY = Math.round(h / 2)

      ctx.save()

      ctx.clearRect(0, 0, w, h)

      ctx.translate(arrowCenterX, arrowCenterY)

      ctx.shadowColor = "#000"
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.lineWidth = 1
      if (this.customization && this.customization.color && this.customization.color !== '') {
        ctx.fillStyle = this.customization.color
        ctx.strokeStyle = this.customization.color
      } else {
        ctx.fillStyle = this.geolocation.primaryColor
        ctx.strokeStyle = this.geolocation.primaryColor
      }

      // circle
      ctx.lineWidth = Math.round(this.directionHelperSize * 1.5)
      ctx.beginPath()

      if (h > 25) {
        ctx.arc(0, 0, Math.round(h / 2.5) - 10, 0, 2 * Math.PI)
      }
      ctx.stroke()

      ctx.rotate(utils.degreesToRadians(this.geolocation.direction))

      // arrow
      let arrowHalfWidth = Math.round(this.directionHelperSize * 0.8)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, -Math.round(h / 2.5) + 25)
      ctx.lineTo(-20, -Math.round(h / 2.5) + 45)
      ctx.lineTo(-arrowHalfWidth, -Math.round(h / 2.5) + 45)
      ctx.lineTo(-arrowHalfWidth, Math.round(h / 2.5) - 25)
      ctx.lineTo(arrowHalfWidth, Math.round(h / 2.5) - 25)
      ctx.lineTo(arrowHalfWidth, -Math.round(h / 2.5) + 45)
      ctx.lineTo(20, -Math.round(h / 2.5) + 45)
      ctx.stroke()
      ctx.fill()

      ctx.restore()
    },
    /*
     * Handle location tracking success
     * @param   {object}    pos            User position (from native call to navigator.geolocation.watchLocation())
     */
    async onNewUserPosition(pos) {
      if (this.step.id === 'gpssensor' || this.step.id === 'map') {
        // treat case when user can find one of several location to find
        this.geolocation.gpsAccuracy = pos.coords.accuracy
        this.geolocation.playerPosition.coords = pos.coords
        this.geolocation.active = true
        let current = pos.coords
        let closestDistance = 1000
        var limitDistance = 5
        // check if user is near one of the locations searched
        for (var i = 0; i < this.step.locations.length; i++) {
          let destinationPosition = { lat: this.step.locations[i].lat, lng: this.step.locations[i].lng }

          // compute distance between two coordinates
          this.geolocation.GPSdistance = utils.distanceInKmBetweenEarthCoordinates(destinationPosition.lat, destinationPosition.lng, current.latitude, current.longitude) * 1000 // meters
          closestDistance = Math.min(closestDistance, parseInt(this.geolocation.GPSdistance, 10))

          limitDistance = (this.step.locations[i].distance ? this.step.locations[i].distance : 5)
          if (this.geolocation.GPSdistance <= limitDistance) {
            //this.$refs['geolocation-component'].disabled = true
            this.geolocation.active = false
            await this.checkAnswer({stepId: this.step.steps[i], position: current})
          }
        }

        this.geolocation.closestDistance = closestDistance
        this.updateDistanceIndicatorColor(closestDistance)
      } else if ((this.step.type === 'geolocation' || this.step.type === 'locate-item-ar') && this.playerResult === null && !this.geolocation.playerTouchedArObject) {
        this.geolocation.gpsAccuracy = pos.coords.accuracy
        this.geolocation.active = true
        this.geolocation.playerPosition.coords = pos.coords
        let current = pos.coords

        // if lat and lng are not set, compute to have the object close to the current user position. frequently used for tests/demos.
        if (this.step.options.lat === 0 && parseInt(this.step.options.lng, 10) === this.step.options.lng) {
          if (this.step.options.lng === 0) {
            if (this.step.type === 'locate-item-ar') {
              this.step.options.lat = current.latitude + 0.00005
              this.step.options.lng = current.longitude
            } else {
              this.step.options.lat = current.latitude + 0.0005
              this.step.options.lng = current.longitude + 0.0005
            }
          } else {
            if (this.step.type === 'locate-item-ar') {
              this.step.options.lat = current.latitude + (0.00001 * this.step.options.lng)
              this.step.options.lng = current.longitude
            } else {
              this.step.options.lat = current.latitude + (0.0001 * this.step.options.lng)
              this.step.options.lng = current.longitude + (0.0001 * this.step.options.lng)
            }
          }
        }

        let options = this.step.options

        if (typeof options === 'undefined') {
          console.warn("variable 'options' is undefined. Could not get latitude & longitude of the target.")
          return
        }

        // show GPS calibration animation when GPS accuracy in meters is low
        // this is similar to what is done with compass accuracy (cordova plugin "heading calibration")
        if (this.geolocation.gpsAccuracy > this.geolocation.lowGpsAccuracyCeiling) {
          this.geolocation.lowGpsAccuracy = true
          // start a timer when accuracy is low. after timer expired, if accuracy has not improved, show calibration animation
          let _this = this
          if (this.geolocation.gpsAccuracyTimeout === null && !this.geolocation.showCalibration && !this.geolocation.persistentLowAccuracy) {
            this.geolocation.gpsAccuracyTimeout = utils.setTimeout(() => {
              if (!_this.step.options || _this.step.options.hideAnimation !== true) {
                _this.$refs.gpscal.askUserToCalibrateGPS()
              }
              if (_this.geolocation.gpsAccuracyTimeout !== null) {
                clearTimeout(_this.geolocation.gpsAccuracyTimeout)
                _this.geolocation.gpsAccuracyTimeout = null
              }
            }, 10000)
          }
          if (this.geolocation.persistentLowAccuracyTimeout === null) {
            this.geolocation.persistentLowAccuracyTimeout = utils.setTimeout(() => {
              this.geolocation.persistentLowAccuracy = true
              this.$emit('msg', 'suggestNext')
              if (this.geolocation.persistentLowAccuracyTimeout !== null) {
                clearTimeout(this.geolocation.persistentLowAccuracyTimeout)
                this.geolocation.persistentLowAccuracyTimeout = null
              }
            }, 20000)
          }
        } else {
          this.geolocation.lowGpsAccuracy = false
          // Compass & GPS OK ? cancel timeouts
          if (this.geolocation.gpsAccuracyTimeout !== null && !this.geolocation.lowCompassAccuracy) {
            clearTimeout(this.geolocation.gpsAccuracyTimeout) // cancel gps calibration animation
            this.geolocation.gpsAccuracyTimeout = null
            clearTimeout(this.geolocation.persistentLowAccuracyTimeout) // cancel "skip step" message in top panel
            this.geolocation.persistentLowAccuracyTimeout = null
            this.geolocation.persistentLowAccuracy = false
          }
        }

        //let previousGPSdistance = this.geolocation.GPSdistance

        let destinationPosition = { lat: options.lat, lng: options.lng }
        if (this.step.type === 'geolocation' && options.locations && options.locations.length > 0) {
          destinationPosition.lat = options.locations[this.geolocation.currentIndex].lat
          destinationPosition.lng = options.locations[this.geolocation.currentIndex].lng
        }

        this.geolocation.destinationPosition = {coords: destinationPosition}
        
        // set the marker
        if (this.step.options.locator && this.step.options.locator !== "") {
          this.geolocation.destinationPosition.marker = this.step.options.locator.indexOf('blob:') !== -1 ? this.step.options.locator : this.serverUrl + '/upload/quest/' + this.step.questId + '/step/geolocation/' + this.step.options.locator
        }

        // compute distance between two coordinates
        // note: current.accuracy contains the result accuracy in meters
        this.geolocation.GPSdistance = utils.distanceInKmBetweenEarthCoordinates(destinationPosition.lat, destinationPosition.lng, current.latitude, current.longitude) * 1000 // meters
        let rawDirection = utils.bearingBetweenEarthCoordinates(current.latitude, current.longitude, destinationPosition.lat, destinationPosition.lng)

        //Removed by EMA on 28/09/2021 because message sent to user was not relevant "The object is too far to be seen"
        /*if (this.geolocation.lowGpsAccuracy || this.geolocation.lowCompassAccuracy) {
          // avoid using an inaccurate position for the remaining of the process
          return
        }*/

        this.geolocation.rawDirection = rawDirection

        let finalDirection = utils.degreesToRadians(rawDirection)
        if (!this.deviceHasGyroscope) {
          // consider that the object to find is always in front of the device
          finalDirection = 0
          // avoid to be too close from the object, set minimal distance
          const minDistanceFromObject = 2 + (this.geolocation.target !== null ? this.geolocation.target.size : 0) // in meters
          this.geolocation.GPSdistance = Math.max(minDistanceFromObject, this.geolocation.GPSdistance)
        }

        // when device is moving enough,
        // compute new X/Y coordinates of the object (considering that camera is always at (0, 0))
        // note that those properties are also needed when accelerometer is used (method 'handleMotionEvent()')
        if (!this.deviceMotion.isAccelerationIdle) {
          this.geolocation.position.x = Math.sin(finalDirection) * this.geolocation.GPSdistance
          this.geolocation.position.y = Math.cos(finalDirection) * this.geolocation.GPSdistance
        }
        if (this.step.type === 'locate-item-ar' && this.geolocation.target !== null && this.geolocation.target.scene !== null) {
          let target = this.geolocation.target
          let scene = target.scene
          let object = scene.getObjectByName('targetObject')

          // if target size is 1m, consider that it can be seen at 40m
          // target size 50cm => seen at 20m, etc.
          this.geolocation.canSeeTarget = target.size === null || this.geolocation.GPSdistance < target.size * 40

          // object may not be loaded at first calls => skip part where 3D scene must be loaded
          if (typeof object === 'undefined') { return }

          if (!object.visible) {
            // initialize object position
            object.position.x = this.geolocation.position.x
            object.position.y = this.geolocation.position.y
            object.visible = true
          }

          // smooth position change
          new TWEEN.Tween(object.position)
            .to({ x: this.geolocation.position.x, y: this.geolocation.position.y }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()

          this.updatePlayerCanTouchTarget()
        }
        if (this.step.type === 'geolocation' && !this.stepPlayed && ((options.distance && this.geolocation.GPSdistance <= parseInt(options.distance, 10)) || (!options.distance && this.geolocation.GPSdistance <= 20))) {
          //check if other locations are defined
          if (options.locations && options.locations.length > 0 && this.geolocation.currentIndex + 1 < options.locations.length) {
            Notification(this.$t('label.CheckpointReached'), 'info')
            this.geolocation.foundStep = false
            this.geolocation.foundStep = true
            this.geolocation.currentIndex++
          } else {
            this.stepPlayed = true // avoids several calls can be made to this.checkAnswer() if slow network
            //this.$refs['geolocation-component'].disabled = true
            this.geolocation.active = false
            this.resetDrawDirectionInterval()
            await this.checkAnswer(current)
          }
        }
      }
    },
    /*
     * On user position error
     */
    onUserPositionError(ret) {
      console.error('UserPositionError', ret)
    },
    /*
     * Update color indicator for the distance
     */
    updateDistanceIndicatorColor(distance) {
      let color = this.getColorIndicator(10)
      if (distance < 100) {
        color = this.getColorIndicator(9)
      }
      if (distance < 50) {
        color = this.getColorIndicator(8)
      }
      if (distance < 40) {
        color = this.getColorIndicator(7)
      }
      if (distance < 30) {
        color = this.getColorIndicator(6)
      }
      if (distance < 20) {
        color = this.getColorIndicator(5)
      }
      if (distance < 17) {
        color = this.getColorIndicator(4)
      }
      if (distance < 15) {
        color = this.getColorIndicator(3)
      }
      if (distance < 13) {
        color = this.getColorIndicator(2)
      }
      if (distance < 10) {
        color = this.getColorIndicator(1)
      }
      this.geolocation.colorIndicator = color
    },
    getColorIndicator(level) {
      const colors = ['red-7', 'red-4', 'red-3', 'red-2', 'red-1', 'blue-1', 'blue-2', 'blue-3', 'blue-4', 'blue-5']
      return colors[level - 1]
    },
    /*
     * switch mode map/compass for geolocation step
     */
    switchModeForGeolocationStep() {
      if (this.geolocation.mode === 'compass') {
        this.geolocation.mode = 'map'
      } else {
        this.geolocation.mode = 'compass'
      }
    },
    /**
     * returns icon code for geolocation step "switch button",
     * depending on current mode (compass or map)
     */
    getGeolocationStepSwitchButtonIcon() {
      if (this.geolocation.mode === 'compass') {
        return 'map'
      } else {
        return 'explore'
      }
    },
    /*
     * Use an item
     * @param   {object}    ev            Event when user touch screen to get location
     */
    async checkUseItem(ev) {
      if (this.playerResult === true) {
        return
      }

      // if no item selected
      if (this.itemUsed === null) {
        Notification(this.$t('label.PleaseSelectAnItemFirst'), 'error')
        this.$emit('msg', 'suggestInventory')
        return
      }

      let vw = this.getUseItemPictureSize() / 100 // in px

      var data = {
        windowWidth: vw,
        item: this.itemUsed.originalPicture ? this.itemUsed.originalPicture : this.itemUsed.picture
      }
      if (ev) {
        data.posX = ev.offsetX
        data.posY = ev.offsetY
      }

      await this.checkAnswer(data)
    },
    /*
     * Show the item location after success / failure
     */
    async showItemLocation(posX, posY) {
      let vw = this.getUseItemPictureSize() / 100

      let answerPixelCoordinates = {
        left: Math.round(posX / 100 * 100 * vw),
        top: Math.round(posY / 100 * 133 * vw)
      }

      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = this.useItem.crossSize / 2
      // display the right solution
      var cross = document.getElementById('cross-play')
      cross.style.top = (answerPixelCoordinates.top - solutionAreaRadius) + "px"
      cross.style.left = (answerPixelCoordinates.left - solutionAreaRadius) + "px"
      cross.style.display = "block"
      var crossPicture = cross.src
      // this.itemUsedComputed is filled when timer is enabled and time is up
      // (could not override the 'prop' this.itemUsed, coming from step.vue or settings.vue)
      let itemUsed = this.itemUsedComputed !== null ? this.itemUsedComputed : this.itemUsed
      var self = this
      utils.setInterval(function() {
        if (cross.src === crossPicture && self.step.answers && self.step.answers.item) {
          if (itemUsed.pictures && itemUsed.pictures[self.lang] && itemUsed.pictures[self.lang] !== '') {
            cross.src = ((itemUsed.picture.indexOf('statics/') > -1 || itemUsed.picture.indexOf('blob:') !== -1) ? itemUsed.picture : self.serverUrl + '/upload/quest/' + self.step.questId + '/step/new-item/' + itemUsed.picture)
          } else {
            cross.src = ((self.step.answers.item.indexOf('statics/') > -1 || self.step.answers.item.indexOf('blob:') !== -1) ? self.step.answers.item : self.serverUrl + '/upload/quest/' + self.step.questId + '/step/new-item/' + self.step.answers.item)
          }
          cross.style.borderRadius = '50%'
        } else {
          cross.src = crossPicture
          cross.style.borderRadius = '0'
        }
      }, 1000);
    },
    initUseItemElements() {
      this.useItem.imageWidth = this.getUseItemPictureSize()
      this.useItem.crossSize = this.useItem.imageWidth / 8
      this.useItem.imageHeight = this.useItem.imageWidth * 4 / 3
    },
    getUseItemPictureSize() {
      const picture = this.$refs['useItemPicture']
      return picture.clientWidth
    },
    /*
     * Check if user find the item in the picture
     * @param   {object}    ev            Event when user touch the screen
     */
    async checkFindItem(ev) {
      if (this.playerResult === true) {
        return
      }

      let vw = this.getFindItemPictureSize() / 100 // in px

      var data = {
        windowWidth: vw,
        posX: ev.offsetX,
        posY: ev.offsetY
      }

      await this.checkAnswer(data)
    },
    initFindItemElements() {
      this.findItem.imageWidth = this.getFindItemPictureSize()
      this.findItem.crossSize = this.findItem.imageWidth / 8
      this.findItem.imageHeight = this.findItem.imageWidth * 4 / 3
    },
    getFindItemPictureSize() {
      const picture = this.$refs['findItemPicture']
      return picture.clientWidth
    },
    /*
     * prepare page before snapshot
     */
    async prepareSnapshot() {
      this.takingSnapshot = true
      this.$q.loading.show()
      this.$emit('hideButtons')
      let _this = this
      let image = document.getElementById('snapshotImage')
      let now = new Date()
      let nowAsStr = now.toISOString().substring(0, 19).replaceAll(':', '-')
      let snapshotFilename = `snapshot-${nowAsStr}.jpg`

      try {
        const vw = _this.getScreenWidth()
        const vh = _this.getScreenHeight()
        if (this.isIOs && CameraPreview) {
          Notification(_this.$t('label.SnapshotManualOnIOs'), 'error');
          this.$q.loading.hide()
          return false
          /*image.style.width = '100%'
          CameraPreview.takePicture({quality: 85}, function(base64PictureData) {
            const imageSrcData = 'data:image/jpeg;base64,' +base64PictureData
            var image = document.getElementById('snapshotImageIos')
            image.src = imageSrcData
            setTimeout(function () { _this.takeIOsSnapshot() }, 2000)
          });*/
        } else if (this.isSafari) {
          let tempCameraStream = _this.$refs['camera-stream-for-image-over-flow']
          let canvasStream = document.createElement('canvas')
          canvasStream.width = tempCameraStream.videoWidth
          canvasStream.height = tempCameraStream.videoHeight
          let streamContext = canvasStream.getContext('2d')
          streamContext.drawImage(tempCameraStream, 0, 0, tempCameraStream.videoWidth, tempCameraStream.videoHeight)

          canvasStream.toBlob(function (blob) {
            image.src = URL.createObjectURL(blob)
          }, 'image/png')
        } else { // android & webapp
          // generate a snapshot of the video flow
          let blob = await this.imageCapture.takePhoto()
          image.src = URL.createObjectURL(blob)
        }

        image.onload = async function() {
          _this.$q.loading.hide()

          // build image with camera capture + overlay in a canvas
          let c = document.createElement('canvas')
          let context = c.getContext('2d')
          c.height = vh
          c.width = vw
          c.style.display = 'none'
          // fit image to canvas, center horizontally & vertically & keep aspect ratio (like CSS 'cover')
          draw.drawImageProp(context, image)

          let imgOverflow = _this.$refs['imageOverflowForCapture']
          draw.drawImageProp(context, imgOverflow)

          let finalBlob

          // compatible file saving attempt (work in progress => to be moved to "utils" if it works on iOS)
          if (_this.isHybrid) {
            if (_this.isIOs && CameraPreview) {
              // already done above
            } else {
              console.log("Save picture in Android Library")
              // possible alternative to window.requestFileSystem() for iOS:
              // "window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) { ... }"
              // see https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-file/
              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                fs.root.getDirectory('Graaly', { create: true }, function (dirEntry) {
                  dirEntry.getFile(snapshotFilename, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(async (fileWriter) => {
                      finalBlob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg'))
                      fileWriter.onwriteend = async (ev) => {
                        c.remove()
                        await _this.saveSnapshotOnServer(finalBlob, snapshotFilename)
                      }
                      fileWriter.onerror = (err) => {
                        console.error("Failed file write: ", err);
                      }
                      fileWriter.write(finalBlob)
                    })
                  }, (err) => {
                    Notification(_this.$t('label.TechnicalIssue'), 'error')
                    console.error('Could not create snapshot file on device filesystem', err)
                  })
                }, (err) => {
                  Notification(_this.$t('label.TechnicalIssue'), 'error')
                  console.error('Could not access Graaly directory on device filesystem', err)
                })
              }, (err) => {
                Notification(_this.$t('label.TechnicalIssue'), 'error')
                console.error('Could not access to device filesystem', err)
              })
            }
          } else { // webapp
            finalBlob = await new Promise(resolve => c.toBlob(resolve, 'image/jpeg'))

            _this.$q.dialog({
              component: snapshotDialogComponent,
              parent: _this,
              // props forwarded to component
              snapshotFilename: snapshotFilename,
              canvas: c,
              blob: finalBlob
            }).onCancel(async () => {
              _this.$emit('showButtons')
              _this.takingSnapshot = false
              await _this.saveSnapshotOnServer(finalBlob, snapshotFilename)
              c.remove()
            })
          }
        }
      } catch (err) {
        Notification(_this.$t('label.SnapshotTakenIssue'), 'error');
        console.error(err)
        console.log(err.stack)
        this.$q.loading.hide()
        this.$emit('showButtons')
      }
    },
    takeIOsSnapshot() {
      var _this = this
      this.$q.loading.hide()
      navigator.screenshot.save(function (error, res) {
        if (error) {
          console.error(error)
          Notification(_this.$t('label.ErrorTakingSnapshot'), 'info')
        } else {
          var permissions = cordova.plugins.permissions
          permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, function(status) {
            if (status.hasPermission) {
              _this.saveIOsSnapshot(res)
            } else {
              Notification(_this.$t('label.ErrorTakingSnapshot'), 'info')
            }
          }, alert)
        }
        _this.takingSnapshot = false
        _this.$emit('showButtons')
      })
    },
    async saveIOsSnapshot(mediaFile) {
      try {
        const fileEntry = await new Promise(resolve =>
          window.resolveLocalFileSystemURL('file://' + mediaFile.filePath, resolve, function(err) { console.log('Error '  + err) })
        );
        const fileBinary = await new Promise((resolve, reject) =>
          fileEntry.file(function (file) {
            var reader = new FileReader()
            reader.onloadend = function(e) {
              resolve(reader.result)
            }
            reader.readAsArrayBuffer(file)
          })
        )
        // convert binary to blob of the image content
        const picture = new Blob([new Uint8Array(fileBinary)], { type: "image/jpg" })
        var data = new FormData()
        data.append('image', picture)
        //var _this = this
        await StepService.uploadSnapshot(this.step.questId, data)
        /*StepService.uploadSnapshot(this.step.questId, data, function(err, result) {
          if (err) {
            Notification(this.$t('label.ErrorTakingSnapshot'), 'error')
          } else {
            Notification(_this.$t('label.SnapshotTaken'), 'info')
          }
        })*/
      } catch (error) {
        Notification(this.$t('label.ErrorTakingSnapshot'), 'error')
        console.log("Error: " + error)
      }
    },
    /**
     * This is a feature for players (selfies...) from steps image-over-flow, not authors
     * Saves snapshot on web API server if quest config setting "saveSelfieOnServer" is enabled
     * @param {Buffer} blob     Binary array of file data to save on server
     * @param {String} filename Name of the file to upload
     */
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
      } else {
        //Notification(this.$t('label.SnapshotTaken'), 'info') // Pas de messages si c'est pas enregistrer
      }
      this.takingSnapshot = false
      this.$emit('showButtons')
    },
    /* switchCamera() {
      if (this.cameraUsed === 'environment') {
        this.cameraUsed = 'user'
      } else {
        this.cameraUsed = 'environment'
      }
      if (this.isIOs && CameraPreview) {
        CameraPreview.switchCamera()
      } else {
        this.clearAllCameraStreams()
        this.launchVideoStreamForAndroid('camera-stream-for-image-over-flow', true)
      }
    },
    takeVideoSnapShot() {
      var _this = this
      CameraPreview.takePicture({ quality: 85 }, function(base64PictureData) {
        _this.imageOverFlow.snapshot = 'data:image/jpeg;base64,' + base64PictureData
        setTimeout(function () { _this.cancelTakeVideoSnapShot() }, 5000)
      })
    },
    cancelTakeVideoSnapShot() {
      this.imageOverFlow.snapshot = ""
    },*/
    /*
     * get the translation for main text
     */
    getTranslatedText() {
      let defaultText = ""
      if (this.step.type === 'new-item') {
        defaultText = this.$t('label.YouHaveWinANewItem')
      }
      let translation = this.step.text ? this.step.text : defaultText

      // replace variables
      let date = new Date()
      translation = translation.replace('%id%', this.$store.state.user.id)
      translation = translation.replace('%name%', this.$store.state.user.name)
      translation = translation.replace('%date%', (date.getMonth() + 1) + '.' + date.getFullYear())

      return translation
    },
    getScreenWidth() {
      let vw = window.innerWidth
      //if desktop, limit window size to 500px
      //if (!this.isHybrid && vw > 500) {
      //  vw = 500
      //}
      return vw
    },
    getScreenHeight() {
      const vh = window.innerHeight
      return vh
    },
    /*
     * Show the item location after success / failure
     */
    async showFoundLocation(posX, posY) {
      let vw = this.getFindItemPictureSize() / 100
      let answerPixelCoordinates = {
        left: Math.round(posX / 100 * 100 * vw),
        top: Math.round(posY / 100 * 133 * vw)
      }

      // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
      let solutionAreaRadius = this.findItem.crossSize / 2

      var cross = document.getElementById('cross-play')
      cross.style.top = (answerPixelCoordinates.top - solutionAreaRadius) + "px"
      cross.style.left = (answerPixelCoordinates.left - solutionAreaRadius) + "px"
      cross.style.display = "block"
    },

    /*
     * Check if the puzzle is correct
     */
    async checkPuzzle() {
      let result = this.comparePuzzlePiecePositions()
      if (result) {
        // no answer (server considers that puzzle is solved when called)
        this.checkAnswer()
      }
      return result
    },
    comparePuzzlePiecePositions() {
      for (let i = 0; i < this.puzzle.pieces.length; i++) {
        if (this.puzzle.pieces[i].pos !== i) {
          return false
        }
      }
      return true
    },
    /*
     * Initialize puzzle, re-order pieces
     */
    async initPuzzle() {
      let languagePicture = (this.step.options.picture && this.step.options.picture[this.lang]) ? this.step.options.picture[this.lang] : this.step.options.picture[this.quest.mainLanguage]

      let picture
      if (languagePicture && languagePicture.indexOf('blob:') !== -1) {
        picture = languagePicture
      } else if (languagePicture && languagePicture.indexOf('upload/') === -1) {
        picture = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/jigsaw-puzzle/' + languagePicture
      } else {
        picture = this.serverUrl + languagePicture
      }

      // ensure that puzzle image is loaded before doing the remaining tasks
      await utils.loadImage(picture)

      this.puzzle.picture = picture

      // Puzzle sizes
      let level = parseInt((this.step.options.level || 2), 10) // 1=easy, 2=medium, 3=very hard, 4=hard
      let puzzleSize = this.puzzle.colsByLevel[level]
      let puzzleNbPieces = Math.pow(puzzleSize, 2)
      let puzzleWidth = document.getElementById('pieces').clientWidth - 1
      let puzzleHeight = puzzleWidth
      let pieceHeight = Math.floor(puzzleHeight / puzzleSize)
      let pieceWidth = Math.floor(puzzleWidth / puzzleSize)

      // Build pieces
      for (let i = 0; i < puzzleNbPieces; i++) {
        let xPos = (pieceWidth * (i % puzzleSize)) + 'px';
        let yPos = (pieceHeight * Math.floor(i / puzzleSize)) + 'px';
        this.puzzle.pieces[i] = { pos: i, backSize: (puzzleSize * 100), backXPos: xPos, backYPos: yPos, width: pieceWidth, height: pieceHeight, classes: 'piece' }
      }

      //Shuffle & check that after shuffle the piece are correctly shuffled
      let ordered = true
      while (ordered) {
        this.puzzle.pieces = this.shuffle(this.puzzle.pieces)
        ordered = this.comparePuzzlePiecePositions()
      }

      return true
    },
    // https://stackoverflow.com/a/6274381/488666
    shuffle(array) {
      for (let i = array.length -1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let k = array[i]
        array[i] = array[j]
        array[j] = k
      }
      return array
    },
    /*
     * Handle puzzle piece move
     * @param   {object}    e            Event when user touch puzzle piece
     */
    handleDragStart(e) {
      if (this.puzzle && this.puzzle.mode === 'drag') {
        if (e.target.className && e.target.className.indexOf('piece') !== -1) {
          this.puzzle.dragSrcEl = e.target
        }
        return true
      } else {
        this.puzzle.dragSrcEl = null
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    },
    /*
     * Handle puzzle piece move over
     * @param   {object}    e            Event when user move puzzle piece over
     */
    handleDragOver(e) {
      if (this.puzzle && this.puzzle.mode === 'drag') {
        if (this.puzzle.dragSrcEl) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }
    },
    /*
     * Handle puzzle piece move end
     * @param   {object}    e            Event when user stop moving puzzle piece
     */
    handleDragEnd(e) {
      if (this.puzzle && this.puzzle.mode === 'drag') {
        this.puzzle.dragSrcEl = null
        var cols = document.querySelectorAll('#pieces .piece');
        [].forEach.call(cols, function (col) {
          col.style.opacity = ''
          col.classList.remove('over')
        })
        return true
      }
    },
    /*
     * Handle puzzle piece drop
     * @param   {object}    e            Event when user drop puzzle piece
     */
    handleDrop(e) {
      if (this.puzzle && this.puzzle.mode === 'drag') {
        if (this.puzzle.dragSrcEl && e.cancelable) {
          e.stopPropagation()
          e.stopImmediatePropagation()
          e.preventDefault()
          // if the target is defined & a piece is moved
          if (e.target.parentNode.id && this.puzzle.dragSrcEl.id) {
            // get id of piece moved and piece destination
            let destId = parseInt(e.target.parentNode.id.replace('piece-', ''), 10)
            let sourceId = parseInt(this.puzzle.dragSrcEl.id.replace('piece-', ''), 10)
            this.switchPieces(sourceId, destId)
          }
        }
        return true
      }
    },
    /*
     * Switch 2 pieces in puzzle
     */
    switchPieces(sourceId, destId) {
      let destIdPos = 0, sourceIdPos = 0

      // if the piece is moved
      if (destId !== sourceId) {
        // get the places in the arrays
        for (let i = 0; i < this.puzzle.pieces.length; i++) {
          if (this.puzzle.pieces[i].pos === destId) {
            destIdPos = i
          }
          if (this.puzzle.pieces[i].pos === sourceId) {
            sourceIdPos = i
          }
        }

        // move the places in the arrays
        let oldPlace = this.puzzle.pieces[destIdPos]
        Vue.set(this.puzzle.pieces, destIdPos, this.puzzle.pieces[sourceIdPos])
        Vue.set(this.puzzle.pieces, sourceIdPos, oldPlace)
        // check if the puzzle is finished
        this.checkPuzzle()
      }
    },
    /*
     * Change the piece move mode for puzzle
     */
    changePuzzleMode() {
      if (this.puzzle && this.puzzle.mode === 'drag') {
        this.puzzle.mode = 'click'
      } else {
        this.puzzle.mode = 'drag'
      }
    },
    /*
     * Move puzzle pieces with click
     */
    movePieceWithClick(pos) {
      this.puzzle.dragSrcEl = null
      if (this.puzzle && this.puzzle.mode === 'click') {
        if (this.puzzle.clickModeSelected === null) {
          for (let i = 0; i < this.puzzle.pieces.length; i++) {
            if (this.puzzle.pieces[i].pos === pos) {
              this.puzzle.pieces[i].classes = 'piece border-red'
              this.puzzle.clickModeSelected = pos
              let piece = this.puzzle.pieces[i]
              // force properties changes
              Vue.set(this.puzzle.pieces, i, piece)
            }
          }
        } else {
          // sometimes click is doubled
          if (this.puzzle.clickModeSelected === pos) {
            return
          }
          for (let i = 0; i < this.puzzle.pieces.length; i++) {
            this.puzzle.pieces[i].classes = 'piece'
          }
          this.switchPieces(this.puzzle.clickModeSelected, pos)
          this.puzzle.clickModeSelected = null
        }
      }
    },
    /*
     * Init the memory game
     */
    initMemory() {
      var items = []
      for (var i = 0; i < (this.step.options.items.length * 2); i++) {
        let tileUsed = (i < this.step.options.items.length ? this.step.options.items[i] : this.step.options.items[i - this.step.options.items.length])
        // tile is not displayed twice if single
        if (!tileUsed.single || i < this.step.options.items.length) {
          items[i] = {imagePath: tileUsed.imagePath, isClicked: false, isFound: false, isUnique: tileUsed.single}
        }
      }

      this.memory.items = this.shuffle(items)
    },
    /*
     * Handle selection of the memory card
     * @param   {Number}    key            index of the memory pieces array selected
     */
    selectMemoryCard(key) {
      if (this.memory.disabled) {
        return
      }
      if (this.memory.nbTry >= 1 && key === this.memory.selectedKey) {
        return
      }
      var _self = this
      this.memory.items[key].isClicked = true
      Vue.set(this.memory.items, key, this.memory.items[key])
      if (this.memory.nbTry >= 1) {
        if (this.memory.items[this.memory.selectedKey].imagePath === this.memory.items[key].imagePath) {
          this.memory.score++;
          if (this.memory.score === Math.floor(this.memory.items.length / 2)) {
            if (this.step.options.lastIsSingle) {
              this.memory.disabled = true
              // display only the unique item
              for (var i = 0; i < this.memory.items.length; i++) {
                if (this.memory.items[i].isUnique) {
                  this.memory.items[i].isClicked = true
                  _self.memory.items[i].isFound = true
                } else {
                  this.memory.items[i].isClicked = false
                  _self.memory.items[i].isFound = false
                }
                Vue.set(this.memory.items, i, this.memory.items[i])
              }
              //Vue.set(this.memory.items, this.memory.items.length - 1, this.memory.items[this.memory.items.length - 1])
            } else {
              // uncover all tiles
              for (let i = 0; i < this.memory.items.length; i++) {
                if (!this.memory.items[i].isFound) {
                  this.memory.items[i].isClicked = true
                  _self.memory.items[_self.memory.selectedKey].isFound = true
                  _self.memory.items[key].isFound = true
                  Vue.set(this.memory.items, i, this.memory.items[i])
                }
              }
            }
            this.checkAnswer()
          } else {
            _self.memory.items[_self.memory.selectedKey].isFound = true
            _self.memory.items[key].isFound = true
            Vue.set(_self.memory.items, _self.memory.selectedKey, _self.memory.items[_self.memory.selectedKey])
            Vue.set(_self.memory.items, key, _self.memory.items[key])
          }
        } else {
          this.memory.disabled = true
          utils.setTimeout(function() {
            _self.memory.items[_self.memory.selectedKey].isClicked = false
            _self.memory.items[key].isClicked = false
            Vue.set(_self.memory.items, _self.memory.selectedKey, _self.memory.items[_self.memory.selectedKey])
            Vue.set(_self.memory.items, key, _self.memory.items[key])
            _self.memory.disabled = false
          }, 1500)
        }

        this.memory.nbTry = 0
      } else {
        this.memory.nbTry++
        this.memory.selectedKey = key
      }
    },
    /*
     * change item in portrait robot
     * @param   {String}    type    type of item to change
     */
    changePortraitPart: function(type) {
      Vue.set(this.portrait[type], "position", this.portrait[type].position + 1)
      if (this.portrait[type].position > this.portrait[type].number) {
        Vue.set(this.portrait[type], "position", 1)
      }
    },
    /*
     * call a number
     * @param   {String}    type    type of item to change
     */
    async phoneCall() {
      let number = this.step.options.number
      cordova.plugins.phonedialer.dial(
        number,
        function(success) { console.log('Dialing succeeded') },
        function(err) {
          if (err === "empty") console.log("Unknown phone number")
          else console.log("Dialer Error:" + err)
        },
        false
       )
       this.checkAnswer()
    },
    async cancelPhoneCall() {
      await this.checkAnswer()
      this.forceNextStep()
    },

    /*
    * Animate canvas showing item (target) to find, for step type "locate-item-ar"
    */
    animateTargetCanvas() {
      let target = this.geolocation.target
      let mixers = target.mixers
      let targetObject = target.scene.getObjectByName('targetObject')

      // 2D object: plane must always face camera
      if (this.step.options && !this.step.options.is3D) {
        targetObject.lookAt(target.camera.position)
      }
      // animation
      if (mixers.length > 0) {
        for (let i = 0; i < mixers.length; i++) {
          mixers[i].update(target.clock.getDelta());
        }
      }
      if (this.deviceHasGyroscope === false) {
        target.camera.lookAt(targetObject.position)
      }
      target.renderer.render(target.scene, target.camera)
      TWEEN.update()
      this.latestRequestAnimationId = requestAnimationFrame(this.animateTargetCanvas)
    },
    /*
    * stop latest animation
    */
    stopLatestAnimation() {
      cancelAnimationFrame(this.latestRequestAnimationId)
      this.latestRequestAnimationId = null
    },
    /**
     * Read new device orientation event
     * @param {Object} event orientation event
     */
    onNewDeviceOrientation(event) {
      if (event.activated === false) {
        console.warn('sensor is not activated')
        return
      }

      if (this.deviceHasGyroscope) {
        // if event has quaternion (= device has a gyroscope), update camera rotation so it matches device orientation
        let quaternion = new THREE.Quaternion().fromArray(event.quaternion)

        if (this.step.type === 'locate-item-ar' && this.geolocation.target !== null && this.deviceHasGyroscope && !this.geolocation.playerTouchedArObject) {
          this.geolocation.target.camera.quaternion = quaternion
        }

        // every 100ms, update geolocation direction (for drawing the arrow)
        if (!this.geolocation.waitForNextQuaternionRead) {
          let rotationZXY = new THREE.Euler().setFromQuaternion(quaternion, 'ZXY')
          let rotationXZY = new THREE.Euler().setFromQuaternion(quaternion, 'XZY')
          let tmpAlpha = (rotationZXY.x < Math.PI / 4 ? rotationZXY.z : rotationXZY.y)
          let newAlpha = JSON.stringify((360 - utils.radiansToDegrees(tmpAlpha)) % 360)
          this.geolocation.direction = (this.geolocation.rawDirection - newAlpha + 360) % 360
          this.geolocation.waitForNextQuaternionRead = true
          utils.setTimeout(() => { this.geolocation.waitForNextQuaternionRead = false }, 100)
        }
      } else {
        // no gyroscope available => no quaternion property to get device's 3D orientation

        // => for RA steps, fallback is to use only distance

        // => for geolocation steps, only use event property "alpha" to update arrow direction & tell players to hold their device flat/horizontal
        this.geolocation.direction = (this.geolocation.rawDirection + event.alpha) % 360
      }
    },
    onDeviceOrientationError(event) {
      Notification(this.$t('label.CouldNotEnableAR'), 'warning')
    },
    /*
    * Detect object touch
    * used by steps 'locate-item-ar' and 'touch-object-on-marker'
    */
    onTargetCanvasClick(event) {
      // handle touch only for specific steps & modes
      if (!(this.step.type === 'locate-item-ar' || (this.step.type === 'locate-marker' && this.step.options && this.step.options.mode === 'touch'))) {
        return
      }

      if (this.playerResult !== null && this.step.type === 'locate-item-ar') {
        this.geolocation.canTouchTarget = false
        return
      }

      event.preventDefault()

      let target // this object must contain at least properties scene, renderer & camera
      if (this.step.type === 'locate-item-ar') {
        target = this.geolocation.target
      } else {
        target = this.locateMarker
      }
      let object = target.scene.getObjectByName('targetObject')

      let touchPos = new THREE.Vector2()
      touchPos.x = (event.clientX / target.renderer.domElement.clientWidth) * 2 - 1
      touchPos.y = -(event.clientY / target.renderer.domElement.clientHeight) * 2 + 1

      let raycaster = new THREE.Raycaster()

      raycaster.setFromCamera(touchPos, target.camera)

      // second parameter set to true so that intersectObject() traverses recursively the object
      // and its children geometries
      let intersects = raycaster.intersectObject(object, true)

      let canTouchTarget = (this.step.type === 'locate-item-ar' && this.geolocation.canTouchTarget) ||
        (this.step.type === 'locate-marker' && this.locateMarker.arSmoothedControls.object3d.visible)

      if (intersects.length > 0 && canTouchTarget) {
        if (this.step.type === 'locate-item-ar') {
          this.resetDrawDirectionInterval()
          // stop location watching
          //this.$refs['geolocation-component'].disabled = true
          this.geolocation.active = false
          // stop updating object position
          this.geolocation.playerTouchedArObject = true
        }
        // stop camera streams
        let cameraStreamRef = (this.step.type === 'locate-item-ar' ? 'camera-stream-for-locate-item-ar' : 'camera-stream-for-locate-marker')
        this.stopVideoTracks(cameraStreamRef)
        this.checkAnswer(this.step.answers) // currently, answer checking cannot be done on server side. step type 'locate-marker' requires a valid marker number.
      }
    },
    /*
    * detect objects when user is "panning" (moving fingertip on screen, then touching a part of the object)
    * => simulate a "touch/click" event at each panning position
    */
    handlePanOnTargetCanvas(event) {
      this.onTargetCanvasClick({ clientX: event.position.left, clientY: event.position.top, preventDefault: function() {} })
    },

    /*
    * loads GLTF data, puts object origin at center, sets position of 3D model according to its settings in 3DModels.json
    * @param     modelCode     code of the 3D model, for example "lamp"
    * @param     questId       Id of the quest
    * @param     isCustom      true if the 3D model is a custom model
    * @return    object        { object: <3D object>, animations: <animations from GLTF data> }
    */
    async loadAndPrepare3DModel(modelCode, questId, isCustom) {
      let scaleFactor = 4 // make objects four times bigger than their "real" size, for better usability
      let objectInit = modelsList[modelCode]
      let gltfData
      try {
        gltfData = await this.ModelLoaderAsync(modelCode, questId, isCustom)
      } catch (err) {
        console.error("Error while loading 3D model:", err)
        Notification(this.$t('label.CouldNotDisplayObject'), 'error')
        return
      }

      let object = gltfData.scene

      if (objectInit) {
        // apply user-defined rotation
        objectInit.rotation = objectInit.rotation || {}
        if (objectInit.rotation.hasOwnProperty('x')) { object.rotateX(utils.degreesToRadians(objectInit.rotation.x)) }
        if (objectInit.rotation.hasOwnProperty('y')) { object.rotateY(utils.degreesToRadians(objectInit.rotation.y)) }
        if (objectInit.rotation.hasOwnProperty('z')) { object.rotateZ(utils.degreesToRadians(objectInit.rotation.z)) }

        // apply user-defined scaling
        let scale = (objectInit.scale || 1) * scaleFactor
        object.scale.set(scale, scale, scale)
      }

      // set object origin at center
      let objBbox = new THREE.Box3().setFromObject(object)

      let pivot = objBbox.getCenter(new THREE.Vector3())
      pivot.multiplyScalar(-1)

      let pivotObj = new THREE.Object3D();
      object.applyMatrix4(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
      pivotObj.add(object)
      pivotObj.up = new THREE.Vector3(0, 0, 1)
      object = pivotObj

      if (objectInit)
      {
        // apply user-defined translation
        if (objectInit.translation && this.step.type === 'locate-item-ar') {
          if (objectInit.translation.hasOwnProperty('x')) { object.position.x += objectInit.translation.x * scaleFactor }
          if (objectInit.translation.hasOwnProperty('y')) { object.position.y += objectInit.translation.y * scaleFactor }
          if (objectInit.translation.hasOwnProperty('z')) { object.position.z += objectInit.translation.z * scaleFactor }
        }
      }

      return { object, animations: gltfData.animations }
    },
    /*
    * Loads material file and object file into a 3D Model for Three.js
    * Supports only GLB format
    * Returns a Promise, usable with async/await
    */
    async ModelLoaderAsync(objName, questId, isCustom) {
      let progress = console.log

      // Load GLTF packed as binary (blob)
      const offlineObject = await utils.readBinaryFile(questId, objName + '.glb')
      return new Promise((resolve, reject) => {
        let gltfLoader = new GLTFLoader()
        // loads automatically .bin and textures files if necessary
        if (objName && objName.indexOf('blob:') !== -1) {
          gltfLoader.load(objName, resolve, progress, reject)
        } else {
          if (offlineObject) {
            gltfLoader.load(offlineObject, resolve, progress, reject)
          } else {
            if (isCustom) {
              gltfLoader.load(this.serverUrl + '/upload/quest/' + questId + '/step/3dobject/' + objName + '.glb', resolve, progress, reject)
            } else {
              gltfLoader.load(this.serverUrl + '/statics/3d-models/' + objName + '.glb', resolve, progress, reject)
            }
          }
        }
      })
    },
    /*
    * Adds a point light & ambient light to 3D scene.
    * Common for steps 'locate-item-ar' and 'locate-marker'
    */
    addDefaultLightTo3DScene(scene) {
      // create a point light from top
      // TODO maybe a directional light would cost less CPU
      let light = new THREE.DirectionalLight(0xdddddd)
      light.position.set(0, 1, 1).normalize()
      scene.add(light)

      // soft ambient light
      scene.add(new THREE.AmbientLight(0xb0b0b0))
    },
    /*
    * Display the success message
    */
    displaySuccessMessage (success, genericMessage, allowCustomMessage, actions, showNextArrow) {
      let message = ""
      let customColor
      let duration = false
      this.displaySuccessIcon = true
      if (success) {
        if (allowCustomMessage && this.step.options && this.step.options.rightAnswerMessage && this.step.options.rightAnswerMessage[this.lang] && this.step.options.rightAnswerMessage[this.lang] !== "") {
          message = this.step.options.rightAnswerMessage[this.lang]
          if (message.length > 40) {
            duration = 20000
          }
        } else {
          message = genericMessage
        }
        customColor = this.step.options.rightAnswerColor
      } else {
        if (allowCustomMessage && this.step.options && this.step.options.wrongAnswerMessage && this.step.options.wrongAnswerMessage[this.lang] && this.step.options.wrongAnswerMessage[this.lang] !== "") {
          message = this.step.options.wrongAnswerMessage[this.lang]
          if (message.length > 40) {
            duration = 20000
          }
        } else {
          message = genericMessage
        }
        customColor = this.step.options.wrongAnswerColor
      }
      if ((!actions || actions === "") && showNextArrow) {
        actions = [{icon: "arrow_forward", handler: () => { this.forceNextStep() }}]
      }
      Notification(message, (success ? 'rightAnswer' : 'wrongAnswer'), actions, duration, customColor)
    },
    /*
    * Display read more text
    */
    readMore() {
      if (this.step.extraText) {
        this.story.step = 6
        this.story.data = {
          readMore: utils.replaceBreakByBR(this.step.extraText),
          character: (this.customization && this.customization.character && this.customization.character !== '') ? (this.customization.character.indexOf('blob:') === -1 ? this.serverUrl + '/upload/quest/' + this.customization.character : this.customization.character) : "2"
        }
      }
    },
    /*
    * clear all camera streams
    */
    clearAllCameraStreams() {
      if (this.isIOs && CameraPreview) {
        CameraPreview.stopCamera()
      } else {
        this.$store.dispatch('clearMediaStreams')
      }
    },
    /*
    * reset draw direction "interval" (created with setInterval())
    */
    resetDrawDirectionInterval() {
      // always reset drawDirectionInterval (used for geolocation steps)
      let drawDirectionInterval = this.$store.state.questSteps.geolocation.drawDirectionInterval
      if (drawDirectionInterval !== null) {
        window.clearInterval(drawDirectionInterval)
      }
      this.$store.dispatch('setDrawDirectionInterval', null)
    },
    /*
    * handle motion event only used by steps 'locate-item-ar'
    */
    handleMotionEvent (event) {
      let dm = this.deviceMotion
      let canProcess = true // can this method be entierely run? is all required data available?

      // save resources: do nothing with device motion while user GPS position is too far, or distance is unknown (first distance value must be computed by GPS)
      if (!this.deviceHasGyroscope || this.geolocation.GPSdistance === null || isNaN(this.geolocation.position.x) || isNaN(this.geolocation.position.y)) {
        canProcess = false
      }

      if (!canProcess) {
        dm.acceleration.avgData = { x: [], y: [], z: [] }
        dm.velocity = { x: 0, y: 0 }
        dm.dateLatestEvent = null
        return
      }

      // every second default: acceleration is considered as idle
      if (dm.idleAccelerationInterval === null) {
        dm.idleAccelerationInterval = utils.setInterval(() => { dm.isAccelerationIdle = true }, 1000)
      }

      let accel = event.acceleration
      let accelerationVector = new THREE.Vector3(accel.x, accel.y, accel.z)

      dm.acceleration.raw = accelerationVector

      // using "moving average" for acceleration sensors noise reduction
      // (tried kalman filters, but result is much less convincing)
      dm.acceleration.avgData.x.push(dm.acceleration.raw.x)
      dm.acceleration.avgData.y.push(dm.acceleration.raw.y)
      dm.acceleration.avgData.z.push(dm.acceleration.raw.z)

      if (dm.acceleration.avgData.x.length > dm.acceleration.maxAvgItems) {
        dm.acceleration.avgData.x.shift()
      }
      if (dm.acceleration.avgData.y.length > dm.acceleration.maxAvgItems) {
        dm.acceleration.avgData.y.shift()
      }
      if (dm.acceleration.avgData.z.length > dm.acceleration.maxAvgItems) {
        dm.acceleration.avgData.z.shift()
      }

      dm.acceleration.filtered.x = utils.arrayAverage(dm.acceleration.avgData.x)
      dm.acceleration.filtered.y = utils.arrayAverage(dm.acceleration.avgData.y)
      dm.acceleration.filtered.z = utils.arrayAverage(dm.acceleration.avgData.z)

      // Switch 'isAccelerationIdle' to false as soon as enough movement is detected,
      // and keep it false for 1 second or less (until next occurrence of the 'interval' idleAccelerationInterval)
      dm.isAccelerationIdle = dm.isAccelerationIdle && ((Math.pow(dm.acceleration.filtered.x, 2) + Math.pow(dm.acceleration.filtered.y, 2) + Math.pow(dm.acceleration.filtered.z, 2)) < 0.5)
    },
    /**
     * checkPhoneVertically
     * @params: (event)
     **/
    checkPhoneVertically(event) {
      if (this.$refs && this.$refs.raVerticallyDialog && this.$refs['geolocation-component'].isActive) {
        if (event.beta < 50 || event.beta > 130) {
          this.$refs.raVerticallyDialog.show()
        } else {
          this.$refs.raVerticallyDialog.hide()
        }
      }
    },
    /*
    * updates property this.geolocation.canTouchTarget, given this.geolocation.distance
    */
    updatePlayerCanTouchTarget () {
      // tell player to touch object + detect touch as soon as device is below a certain distance from the object coordinates

      let touchDistance = 10 // default

      if (this.step.options.hasOwnProperty('touchDistance') && typeof this.step.options.touchDistance === 'number' && this.step.options.touchDistance > 0) {
        touchDistance = this.step.options.touchDistance
      }

      if (!this.geolocation.canTouchTarget && this.geolocation.GPSdistance <= touchDistance) {
        this.geolocation.canTouchTarget = true
      }
    },
    /*
     * Enlarge the picture
     * @param   {string}    pictureUrl            picture URL
     */
    enlargeThePicture (index) {
      if (!this.step.options || !this.step.options.hideEnlargeMessage) {
        this.enlargePicture.show = true
        var pictureUrl = this.step.options.images[this.playerCode[index]].imagePath
        this.enlargePicture.url = (pictureUrl && pictureUrl.indexOf('blob:') !== -1) ? pictureUrl : this.serverUrl + '/upload/quest/' + this.step.questId + '/step/code-image/' + pictureUrl
      }
    },
    /**
     * Triggers an IoT event
     * @param {String} data    optional - data to send to box
     */
    async triggerIotEvent (data) {
      if (this.step.options.protocol === "mqtt") {
        // TODO adapt to have same behavior as bluetooth
        this.mqttClient.publish(process.env.MQTT_TOPIC, JSON.stringify({macAddress: this.step.options.boardMacAddress, code: this.step.options.code}))
      } else if (this.step.options.protocol === "bluetooth") {
        let finalData
        switch (this.step.options.object) {
          case 'lcd':
            finalData = this.step.options.message
            break;
          case 'buzzer':
            finalData = this.step.options.duration + ',' + this.step.options.frequency
            break;
          case 'chest':
            this.iot.chest.disableActionButtons = true
            finalData = data
            break;
          case 'relay':
            this.iot.relay.disableActionButtons = true
            finalData = data
            break;
          default:
            throw new Error("Object '" + this.step.options.object + "' not supported")
        }
        this.sendMessageToBluetoothServer(this.step.options.object + ':' + finalData)
        if (this.step.options.object === 'chest') {
          await utils.sleep(2000)
          this.iot.chest.disableActionButtons = false
        }
        if (this.step.options.object === 'relay') {
          await utils.sleep(2000)
          this.iot.relay.disableActionButtons = false
        }
      } else {
        throw new Error('IoT protocol not supported: ' + this.step.options.protocol)
      }
    },

    bluetoothEnableSuccess: function() {
      console.log("Bluetooth is enabled")
      this.bluetooth.enabled = true
      this.searchForBluetoothPeripheral()
    },
    bluetoothDisconnect: function(deviceId) {
      if (!this.isHybrid) {
        return
      }
      console.log("Disconnecting BLE")
      let _this = this
      ble.disconnect(deviceId, () => {
        _this.bluetooth.enabled = false
        _this.bluetooth.deviceId = null
      })
    },
    bluetoothEnableFailure: function() {
      console.log("The user did *not* enable Bluetooth")
      Notification("Bluetooth could not be enabled", "error")
    },
    searchForBluetoothPeripheral: function() {
      console.log("Searching for BT peripherals...")
      ble.startScan([], this.bluetoothScanResult)
    },
    bluetoothScanResult: async function(data) {
      console.log("Device discovered", data)
      console.log(this.step.options.deviceid)
      if (data.name === this.step.options.deviceid) {
        await this.stopBluetoothScan()
        console.log("Graaly IoT BT device discovered")
        this.bluetooth.deviceId = data.id;
        ble.connect(data.id, this.bluetoothDeviceConnected, this.bluetoothDeviceDisonnected)
      }
    },
    bluetoothDeviceConnected: async function(data) {
      console.log("BT device connected", data);

      await this.sendMessageToBluetoothServer("cm:" + this.step.options.object)

      if (this.step.type === 'wait-for-event') {
        console.log("Start notification listening")
        ble.startNotification(
          data.id,
          this.iotObject.bleServiceId,
          this.iotObject.bleCharacteristicId,
          this.onBluetoothNotification,
          err => console.error(err))
      }

      if (this.step.type === 'trigger-event' && (!this.step.options.triggerMode || this.step.options.triggerMode === 'auto')) {
        if (this.step.options.object === 'chest' || this.step.options.object === 'relay') {
          // Todo : chest and relay by default sends open
          this.triggerIotEvent('open')
        }
        else {
          this.triggerIotEvent('')
        }
      }
    },
    bluetoothDeviceDisonnected: function(err) {
      console.log("BT device disconnected", err);
    },
    onBluetoothNotification: async function(buffer) {
      const data = utils.bytesToString(buffer)
      let correctRanges
      console.log("Received BT notification: " + data)
      this.lastReceivedValue = data

      // no reaction if player answer is detected as correct or wrong
      if (this.playerResult !== null) { return }

      switch (this.step.options.object) {
        case 'keypad':
          if (data.length < 8) {
            throw new Error('Invalid data retrieved from IoT device (keypad mode): ' + data)
          }
          this.iot.keypadAnswer = utils.replaceStringAt(this.iot.keypadAnswer, this.iot.keypadAnswer.indexOf('_'), data.charAt(7))
          if (this.iot.keypadAnswer.indexOf('_') === -1) {
            if (this.iot.keypadAnswer === this.step.options.answer) {
              this.checkAnswer() // server returns always success
            } else {
              // wrong answer behavior: horizontal shake animation
              this.playerResult = false
              await utils.sleep(1000) // wait for shake animation
              this.iot.keypadAnswer = '_'.repeat(this.step.options.answer.length)
              this.playerResult = null
            }
          }
          break
        case 'joystick':
          let axisValues = data.match(new RegExp('(\\d+)', 'g'))
          correctRanges = true
          if (axisValues.length !== 2) {
            throw new Error("Invalid length for array 'axisValues'")
          }
          axisValues = {
            X: axisValues[1],
            Y: axisValues[0]
          }
          for (let axis of ['X', 'Y']) {
            let axisValue = parseInt(axisValues[axis], 10)
            this.iot['axis' + axis] = axisValue / 255
            if (axisValue < this.step.options['range' + axis].min || axisValue > this.step.options['range' + axis].max) {
              correctRanges = false
            }
          }
          if (correctRanges) {
            this.checkAnswer()
          }
          break
        case 'distance':
          this.iot.distance = parseInt(data.substring(9), 10)
          if (this.iot.distance >= this.step.options.range.min && this.iot.distance <= this.step.options.range.max) {
            this.checkAnswer()
          }
          break
        case 'pot':
          let potValues = data.match(new RegExp('(\\d+)', 'g'))
          correctRanges = true
          if (potValues.length !== 3) {
            throw new Error("Invalid length for array 'potValues'")
          }
          for (let i = 0; i < 3; i++) {
            let potValue = parseInt(potValues[i], 10)
            this.iot['pot' + (i+1)] = potValue / 255
            if (potValue < this.step.options['range' + (i+1)].min || potValue > this.step.options['range' + (i+1)].max) {
              correctRanges = false
            }
          }
          if (correctRanges) {
            this.checkAnswer()
          }
          break
        case 'button':
          if (data.length < 8) {
            throw new Error('Invalid data retrieved from IoT device (button mode): ' + data)
          }
          let buttonAction = data.substring(7)
          if (buttonAction === 'pressed') {
            this.checkAnswer()
          }
          break
        case 'escapebox':
          break
        default:
          throw new Error("Unknown IoT object code '" + this.step.options.object + "'")
      }
    },
    sendMessageToBluetoothServer: function(stringToSend) {
      let _this = this
      return new Promise(function (resolve, reject) {
        if (!_this.bluetooth.enabled || _this.bluetooth.deviceId === null) {
          reject(new Error('Bluetooth device not connected'))
          return
        }
        console.log("sendMessageToBluetoothServer: " + stringToSend)
        ble.writeWithoutResponse(
          _this.bluetooth.deviceId,
          iotOptions.baseServiceID,
          _this.createIotCara(_this.bluetooth.deviceId),
          utils.stringToBytes(stringToSend),
          data => {
            console.log("BLE write success", data)
            resolve()
          },
          err => {
            console.log("BLE write failure", err)
            reject(err)
          }
        );
      })
    },
    stopBluetoothScan: async function() {
      await ble.stopScan(
        () => {
          console.log("BT Scan stopped");
        },
        err => {
          console.log("Could not stop BT scan", err);
        }
      );
    },
    stopBluetoothNotification: function() {
      if (!this.isHybrid) {
        return
      }
      let _this = this
      return new Promise((resolve, reject) => {
        ble.stopNotification(
          _this.bluetooth.deviceId,
          iotOptions.baseServiceID,
          _this.createIotCara(_this.bluetooth.deviceId),
          () => { resolve() },
          (err) => { reject(new Error("Could not stop bluetooth notifications. error: " + err)) })
      })
    },
    getIotObjectFromCode (code) {
      for (let object of iotObjectsList) {
        if (object.code === code) {
          return object
        }
      }
      throw new Error("Unknown object code '" + code + "'")
    },
    /**
     * Transform a normal mac A2:B4:F5...
     * into a single string a2b4f5...
     */
    createIotCara(mac) {
      let p = iotOptions.baseCara + mac.toLowerCase().replaceAll(':', '')
      return p
    },
    //Timer & countdown
    isTimerAvailable() {
      if (this.step &&
      this.step.countDownTime !== undefined &&
      this.step.countDownTime !== null &&
      this.step.countDownTime.enabled === true &&
      utils.timeStringToSeconds(this.step.countDownTime.time) > 0) {
        return true
      } else {
        return false
      }
    },
    async startCountdown() {
      try {
        if (this.isTimerAvailable() === true) {
          var seconds = 0
          // Get remaining time from the cookies
          var n = TimerStorageService.getTimeLeft(this.runId, this.step._id)
          if (n === null) {
            // no time in storage
            seconds = utils.timeStringToSeconds(this.step.countDownTime.time)
          } else {
            seconds = n
          }

          //var countdown
          if (seconds < 0 && this.step.countDownTime) {
            this.step.countDownTime.enabled = false
          } else {
            /*
            //set up the seconds to the initial value
            countdown = setInterval(async function() {
              if (seconds <= 0) {
                await _this.handleTimeUp()
              } else {
                seconds--;
                _this.countdowntimeleft = seconds
                if (seconds % 2 === 0 && _this.runId !== '0') { // runId is set to 0 when step is played as "single step test" from builder
                  //this is for performace, save it every 2 second not every seconds
                  TimerStorageService.storeTimeLeft(_this.runId, _this.step._id, seconds)
                }
                //console.log(_this.countdowntimeleft);
              }
            }, 1000)*/
            await this.manageCountDown(seconds, this.step._id)
          }

          //return countdown
        }
      }
      catch (e) {
        console.error('error in countdown()', e)
      }
    },
    async manageCountDown(seconds, stepId) {
      var _this = this;
      if (this.step.countDownTime && this.step.countDownTime.enabled && stepId === this.step._id) {
        setTimeout(async function() {
          if (seconds <= 0) {
            await _this.handleTimeUp()
          } else {
            seconds--;
            _this.countdowntimeleft = seconds
            if (seconds % 2 === 0 && _this.runId !== '0') { // runId is set to 0 when step is played as "single step test" from builder
              //this is for performace, save it every 2 second not every seconds
              TimerStorageService.storeTimeLeft(_this.runId, _this.step._id, seconds)
            }
            await _this.manageCountDown(seconds, stepId)
          }
        }, 1000)
      }
    },
    async handleTimeUp() {
      this.isTimeUp = true
      this.stopcountdown()
      if (this.step.countDownTime) {
        this.step.countDownTime.enabled = false
      }
      let stepType = this.getStepType(this.step.type)
      this.$emit('closeAllPanels')
      if (stepType.category === 'enigma') {
        // checkAnswer() has a specific behavior when this.isTimeUp has been set to true
        // in particular, submitWrongAnswer() show a specific message in its notification
        // for step types 'transition' (code 'info-text', etc.) checkAnswer() is already done at loading
        await this.checkAnswer()
      }
    },
    /**
     * Stops current countdown
     */
    stopcountdown() {
      if (this.step.countDownTime) {
        this.step.countDownTime.enabled = false
      }
    },
    /**
     * used by timer's <q-linear-progress> component
     */
    map(x, inMin, inMax, outMin, outMax) {
      var l = utils.map(x, inMin, utils.timeStringToSeconds(inMax), outMin, outMax)
      return l
    },
    /**
     * Get step type (enigma or transition) from step code
     */
    getStepType(code) {
      for (let stepType of stepTypes) {
        if (stepType.code === code) {
          return stepType
        }
      }
      console.warn("Could not retrieve step type from code '" + code + "'")
      return null
    },
    /**
     * check if all find item areas are found
     */
    findItemIsFound(data) {
      var notAllFound = false
      var oneFound = false
      const ww = (data && data.windowWidth) ? data.windowWidth : (this.getFindItemPictureSize() / 100)
      for (var i = 0; i < this.step.options.coordinates.length; i++) {
        if (!this.step.options.coordinates[i].found) {
          let answerPixelCoordinates = {
            left: Math.round(this.step.options.coordinates[i].left / 100 * 100 * ww),
            top: Math.round(this.step.options.coordinates[i].top / 100 * 133 * ww)
          }

          // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
          let solutionAreaRadius = Math.round(8 * ww)

          let distanceToSolution = data ? Math.sqrt(Math.pow(answerPixelCoordinates.left - data.posX, 2) + Math.pow(answerPixelCoordinates.top - data.posY, 2)) : 100

          if (distanceToSolution <= solutionAreaRadius) {
            this.step.options.coordinates[i].found = true
            oneFound = true
            document.getElementById("cross-play" + i).style.left = answerPixelCoordinates.left - solutionAreaRadius + "px"
            document.getElementById("cross-play" + i).style.top = answerPixelCoordinates.top - solutionAreaRadius + "px"
            document.getElementById("cross-play" + i).style.display = 'block'
          } else {
            notAllFound = true
          }
        }
      }
      return {all: !notAllFound, one: oneFound}
    },
    /*
     * get audio sound
     */
    getAudioSound () {
      let mainLang = this.quest.mainLanguage
      let finalLang = this.lang
      let hasAudioForCurrentLang = (this.step.audioStream && this.step.audioStream[this.lang] && this.step.audioStream[this.lang] !== '')
      let hasAudioForMainLang = (this.step.audioStream && this.step.audioStream[mainLang] && this.step.audioStream[mainLang] !== '')

      if (hasAudioForCurrentLang || hasAudioForMainLang) { // some audio is available
        if (!hasAudioForCurrentLang && hasAudioForMainLang && mainLang !== this.lang) { // no audio in current lang ? take main lang audio
          finalLang = mainLang
        }

        if (this.step.audioStream[finalLang].indexOf('blob:') !== -1) {
          this.audio.file = this.step.audioStream[finalLang]
        } else {
          this.audio.file = this.serverUrl + '/upload/quest/' + this.step.questId + '/audio/' + this.step.audioStream[finalLang]
        }
      } else {
        this.audio.file = null
      }
    },
    switchAudioSound() {
      var audio = document.getElementById("step-music")
      if (audio) {
        if (this.audio.play) {
          audio.pause()
          this.audio.play = false
        } else {
          audio.play()
          this.audio.play = true
        }
      }
    },
    replayAudioSound() {
      var audio = document.getElementById("step-music")
      if (audio) {
        audio.currentTime = 0
        audio.play()
        this.audio.play = true
      }
    },
    openInventory(object) {
      this.$emit('openInventory', object)
    },
    showAllFindItemLocation() {
      const ww = this.getFindItemPictureSize() / 100
      for (var i = 0; i < this.step.options.coordinates.length; i++) {
        let answerPixelCoordinates = {
          left: Math.round(this.step.options.coordinates[i].left / 100 * 100 * ww),
          top: Math.round(this.step.options.coordinates[i].top / 100 * 133 * ww)
        }
        // solution area radius depends on viewport width (8vw), to get something as consistent as possible across devices. image width is always 90% in settings & playing
        let solutionAreaRadius = this.useItem.crossSize / 2
        // display the right solution
        let cross = document.getElementById('cross-play' + i)
        cross.style.top = (answerPixelCoordinates.top - solutionAreaRadius) + "px"
        cross.style.left = (answerPixelCoordinates.left - solutionAreaRadius) + "px"
        cross.style.display = "block"
      }
    },
    hideAllFindItemLocation() {
      for (var i = 0; i < 5; i++) {
        let cross = document.getElementById('cross-play' + i)
        cross.style.display = "none"
      }
    }
  }
}
</script>

<style scoped>

  .inventory-items div { float: left; margin-right: 15px; width: 100px; height: 175px; overflow: hidden; text-align: center;}
  .inventory-items div img { width: 100px; height: 100px; }

  #play-view { padding: 0rem; height: inherit; min-height: inherit; }

  #play-view > div { height: inherit; min-height: inherit; display: flex; flex-flow: column nowrap; /*padding-bottom: 4rem;*/ }
  #play-view > div > div.find-item, #play-view > div > div.use-item { padding: 0px }
  #play-view > div > div.locate-item-ar { padding-bottom: 1rem; }

  #play-view div.info,
  #play-view div.new-item,
  #play-view div.geolocation {
    padding-bottom: 1rem;
  }
  #play-view div.find-item,
  #play-view div.use-item {
    padding-bottom: 3rem;
    position: relative;
  }

  .carrier-return {
    white-space: pre-wrap;
    text-align: justify;
  }
  .help-text {
    background-color: transparent;
  }

  #controls {
    display: none
  }

  .q-btn, /*audio,*/ .video video { box-shadow: 0px 0.1rem 0.4rem 0.2rem rgba(20, 20, 20, 0.6); }

  .q-btn { margin-top: 1rem; }

  /* info specific */

  .video { margin: auto; flex-grow: 1; display: flex; align-items: center; position: relative; }

  .character {
    text-align: right;
  }

  /* text/image choice specific */

  .answers-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; padding: 0 1rem; }
  .answers-text .q-btn { margin: 0.75rem; font-weight: bold; font-size: 1.2rem; text-transform: none; }

  .answers-images { flex-grow: 1; text-align: center; display: flex; flex-flow: column nowrap; justify-content: center; }

  .images-block { display: flex; flex-flow: row wrap; justify-content: center; align-items: center; }
  .images-block > div { border-radius: 1rem; padding: 0.5rem; position: relative; width: 45%;}
  .images-block img { width: 100%; border-radius: 0.5rem; }

  /* keypad specific (code) */
  .code { overflow: auto; }
  .typed-code { text-align: center; margin: 1rem auto; position: relative; }
  .typed-code table { margin: auto; border-collapse: collapse; background-color: rgba(255, 255, 255, 0.6); }
  .typed-code td { width: 2rem; height: 3rem; border: 1px solid black; vertical-align: middle; text-align: center; line-height: 3rem; }
  .typed-code td.typed { font-weight: bold; font-size: 1.7rem; }

  .keypad { flex-flow: column nowrap; justify-content: center; text-align: center; }
  .keypad .q-btn { margin: 0.5rem; width: 20%; height: 15%; font-weight: bold; font-size: 1.3rem; }

  /* color code specific */

  .code-color .color-bubbles { display: flex; flex-flow: row nowrap; justify-content: center; position: relative; }
  .code-color .color-bubbles div { display: block; width: 4rem; height: 4rem; border: 4px solid black; border-radius: 2rem; margin: 0.3rem; transition: background-color 0.3s; }

  /* image code specific */
  .code-image { position: relative; }
  .code-image table { width: 100% }
  .code-image td img { width: 100% }
  .code-image td .q-icon { font-size: 2em }

  /* geolocation specific */
  .geolocation .text { margin-bottom: 0.5rem; /*position: relative; z-index: 10;*/ } /* MPA 2022-06-21 z-index removed, otherwise translucent background of <div> geolocation-issue is not fully applied, seems to have no impact */
  .geolocation #mode-switch { position: absolute; bottom: 6rem; right: 2.6rem; }
  .geolocation-step-map { position: absolute; opacity: 1; top: 0; left: 0; width: 100%; height: 100%; background-color: yellow; }
  .geolocation .q-btn { box-shadow: none; }
  .low-gps-accuracy-warning { z-index: 200; position: absolute; top: 0; left: 0; right: 0; }
  .geolocation .mapmode { position: absolute; z-index: 5000; }
  /* make something like <q-dialog> but without being "modal" (e.g. does not prevent clicking on navigation buttons) */
  .geolocation-issue { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color:rgba(255, 255, 255, 0.75); }
  .geolocation-issue > div { z-index: 1900; margin: 6rem 2rem 2rem 2rem; border: 1px solid black; background: white; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); }
  .geolocation-issue > div > p.bg-warning { color: white; }
  .geolocation-issue > div > p { padding: 1rem; margin: 0; }

  /* jigsaw puzzle specific */

  .puzzle {
    position: relative;
  }
  #pieces {
    padding: 0;
    margin: 0;
    width: 99vw;
    background: #ddd;
    display: block;
  }
  #pieces .piece {
    display: inline-block;
    vertical-align: top;
    margin: 0px;
    box-shadow: inset 0 0 3px #666;
    text-align: center;
    cursor: move;
    background-repeat: none;
  }
  #pieces .piece.border-red {
    -webkit-box-shadow:inset 0px 0px 0px 6px #f00;
    -moz-box-shadow:inset 0px 0px 0px 3px #f00;
    box-shadow:inset 0px 0px 0px 3px #f00;
  }

  /* write-text specific */

  .answer-text { flex-grow: 1; display: flex; flex-flow: column nowrap; justify-content: center; }
  .answer-text input { opacity: 0.7; font-family: arial; height: 38px; line-height: 1.5em; background-color: #fff; border-radius: 0.5rem; box-shadow: 0px 0px 0.1rem 0.1rem #fff;}

  /* new-item specific */

  .new-item .item { text-align: center; position: relative;}
  .new-item .item p span { font-size: 2rem; background-color: rgba(255, 255, 255, 0.5); border-radius: 8px; padding: 2px 8px 12px 8px; }

  /* locate-item-ar specific */

  .locate-item-ar { background: transparent; }
  .locate-item-ar video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .locate-item-ar .target-view { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .locate-item-ar #target-canvas { position: relative; width: 100%; height: 100%; z-index: 20; }
  .locate-item-ar .text { z-index: 50; position: relative; } /* positioning is required to have z-index working */
  .locate-item-ar img { margin: 30vw auto; z-index: 20; position: relative; } /* 2D result image */

  /* image-over-flow specific */

  .image-over-flow { background: transparent; padding: 0px !important; }
  .image-over-flow video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .image-over-flow .text { z-index: 5000; position: relative; } /* positioning is required to have z-index working */
  .image-over-flow .image { z-index: 50; position: relative; } /* positioning is required to have z-index working */

  /* locate-marker specific */

  .locate-marker { position: relative; }
  .locate-marker video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .locate-marker img.locate-marker-answer { width: 60vw; margin: 30vw auto; }
  .locate-marker .q-btn { margin-bottom: 17vw; z-index: 50; }
  .locate-marker .q-btn span { font-size: 36px; }

  /* memory specific */

  /*.memory {
    justify-content: space-around;
    align-items: center;
  }*/

  .memory .card {
    background-size: 100%;
    color: #ffffff;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 5px 2px 20px 0 rgba(46, 61, 73, 0.5);
    width: 100%;
    padding-top: 100%;
    position: relative;
  }
  .memory .card.closed img {
    opacity: 0;
    width: 100%;
    height: 100%;
  }
  .memory .card.open img {
    cursor: default;
    animation-name: fadein;
    animation-duration: .75s;
    border-radius: 5px;
    width: 100%;
    height: 100%;
  }
  .memory .card.disabled {
    pointer-events: none;
    opacity: 0.9;
  }
  .memory .card.disabled img {
    opacity: 1;
  }

  /*.memory .card.match {
    cursor: default;
    border-color: #EC6608;
    font-size: 33px;
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-duration: .75s;
  }

  .memory .card.unmatched {
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-duration: .75s;
    background: #e2043b;
  }*/

  /* IoT steps */

  .trigger-event { display: flex; flex-direction: column; height: 100%; margin-bottom: 25vw; }

  .iot-keypad { text-align: center; font-family: Courier; font-weight: bold; font-size: 2rem; }

  .shake {
    animation: shake 1s cubic-bezier(.36,.07,.19,.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }

  /* right/wrong styles */

  .right, .q-btn.right { color: #0a0; background-color: #cfc; box-shadow: 0px 0px 0.3rem 0.3rem #9f9; }
  .wrong, .q-btn.wrong { color: #c22; background-color: #fcc; box-shadow: 0px 0px 0.3rem 0.3rem #f99; }
  .rightorwrong, .q-btn.rightorwrong { color: #fff; background-color: #ccc; box-shadow: 0px 0px 0.3rem 0.3rem #ccc; }
  .images-block > div.right,
  .images-block > div.wrong {
    box-shadow: none; background-color: transparent;
  }
  .images-block > div .q-btn {
    margin: 0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    visibility: hidden;
  }
  .images-block > div .q-btn.right,
  .images-block > div .q-btn.wrong {
    visibility: visible;
  }

  .disabled, [disabled] {
    opacity: 0.9 !important;
  }

  .actions > div { display: flex; flex-flow: row nowrap; }
  .actions > div > .q-btn { flex-grow: 1; }
  .actions > div > .q-btn:not(:first-child) { flex-grow: 1; margin-left: 1rem; }

  .inventory-btn { position: fixed; bottom: 60px; left: 0.7rem; z-index: 1; color: #fff; }

  [draggable] {
    user-select: none;
  }

  .play .buttons-bottom {
    position: fixed;
    bottom: 70px;
    left: 10px;
    right: 10px;
  }

  /*
  * direction helper: width and height are computed properties (depending on the current step type)
  */
  .direction-helper { position: absolute; bottom: 20vw; left: 0; right: 0; margin-left: auto; margin-right: auto; z-index: 30; min-height: initial !important; pointer-events: none; width: 100vw; height: auto !important; }
  .direction-helper canvas { margin: auto; }

</style>
