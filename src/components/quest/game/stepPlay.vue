<template>

  <div id="play-view" class="fit" :class="{'bg-black': (step.type === 'locate-marker' || step.id === 'sensor'), 'loaded': pageReady}">
    <div id="background-image" v-show="step.type !== 'image-over-flow' && step.type !== 'locate-item-ar' && step.type !== 'locate-marker'" class="step-background" :class="{'effect-kenburns': (step.options && step.options.kenBurnsEffect)}">
    </div>
    <div :class="controlsAreDisplayed ? 'fadeIn' : 'hidden'">
      <q-linear-progress 
        v-if="step.countDownTime !== null && 
          step.countDownTime !== undefined && 
          step.countDownTime.enabled === true"
        class="timer-progress-bar"
        :class="{ 'with-camera-stream' : step.type === 'locate-marker' || step.type === 'locate-item-ar' }"
        :value="map(this.countdowntimeleft,0,this.step.countDownTime.time,0,1)"
        :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : 'white'"
        :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" 
        :instant-feedback = true
      />
      <!--   <div class="absolute-full flex flex-center">
          <q-badge color="white" text-color="accent" :label="this.countdowntimeleft" />
        </div>
      </q-linear-progress>   -->
      <!------------------ COMPONENT TO KEEP THE SCREEN ON ----------------------
      <video v-if="step.type === 'geolocation'" id="keep-screen-on" autoplay loop style="width: 0px; height: 0px;">
        <source src="statics/videos/empty.mp4" type="video/mp4" />
      </video>
      -->
      
      <div class="bg-accent text-white q-pa-md" v-if="isNetworkLow">{{ $t('label.WarningLowNetwork') }}</div>
    
      <!------------------ TRANSITION AREA ------------------------>

      <div class="info" v-if="step.type == 'info-text' || step.type == 'info-video' || step.type == 'help'">
        <div v-if="showTools && getTranslatedText() != ''" id="info-clickable" :class="{ grow: !step.videoStream }">
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && step.options && step.options.html" v-html="getTranslatedText()"></p>
          <div v-if="step.type !== 'help' && step.type !== 'info-video'" class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
        <div class="video" v-if="step.videoStream">
          <video class="full-width" controls controlsList="nodownload" autoplay>
            <source :src="(step.videoStream && step.videoStream.indexOf('blob:') !== -1) ? step.videoStream : serverUrl + '/upload/quest/' + step.questId + '/step/video/' + step.videoStream" type="video/mp4" />
          </video>
        </div>
        <!--
        <audio controls controlsList="nodownload" autoplay v-if="step.audioStream" class="full-width">
          <source :src="step.audioStream" type="audio/mpeg" />
        </audio>
        -->
      </div>
      <div v-if="step.type == 'help'" style="overflow: auto; margin-bottom: 80px;">
        <p class="text" v-html="$t('label.HelpStepMessage')"></p>
        <p v-if="step.options && step.options.helpNext" class="text" v-html="$t('label.HelpStepMessageNextMessage')"></p>
        <p v-if="step.options && step.options.helpPrevious" class="text" v-html="$t('label.HelpStepMessagePreviousMessage')"></p>
        <p v-if="step.options && step.options.helpInventory" class="text" v-html="$t('label.HelpStepMessageInventoryMessage')"></p>
        <p v-if="step.options && step.options.helpHint" class="text" v-html="$t('label.HelpStepMessageHintMessage')"></p>
        <p class="text" v-html="$t('label.HelpStepMessageEnd')"></p>
      </div>
      
      <!------------------ WIN ITEM STEP AREA ------------------------>
      
      <div class="new-item" v-if="step.type == 'new-item'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div class="item">
          <img style="width: 80%" :src="((step.options.picture.indexOf('statics/') > -1 || step.options.picture.indexOf('blob:') !== -1) ? step.options.picture : serverUrl + '/upload/quest/' + step.questId + '/step/new-item/' + step.options.picture)" />
          <p><span>{{ step.options.title }}</span></p>
        </div>
      </div>
            
      <!------------------ END OF CHAPTER AREA ------------------------>
      
      <div class="end-of-chapter" v-if="step.type == 'end-chapter'">
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
            <p ref="bubbleText" class="carrier-return" :class="'font-' + customization.font" v-if="character.bubbleText.length > 0 && character.bubbleText[character.bubbleNumber] != '' && !(step.options && step.options.html)">{{ character.bubbleText[character.bubbleNumber] }}</p>
            <p ref="bubbleTextHtml" class="text" :class="'font-' + customization.font" v-if="character.bubbleText.length > 0 && character.bubbleText[character.bubbleNumber] != '' && step.options && step.options.html" v-html="character.bubbleText[character.bubbleNumber]"></p>
            <p class="text text-grey" v-if="character.bubbleNumber < (character.numberOfBubble - 1)">{{ $t('label.ReadNext') }}</p>
          </div>
          <div class="bubble-bottom"><img src="statics/icons/story/sticker-bottom.png" /></div>
          <div class="character">
            <img style="vertical-align:bottom" v-if="step.options.character.length < 3" :src="'statics/icons/story/character' + step.options.character + '_attitude1.png'" />
            <img style="max-width: 100%; max-height: 200px; vertical-align:bottom;" v-if="step.options.character.length > 2 && step.options.character !== 'usequestcharacter'" :src="step.options.character.indexOf('blob:') !== -1 ? step.options.character : serverUrl + '/upload/quest/' + step.questId + '/step/character/' + step.options.character" />
            <img style="max-width: 100%; max-height: 200px; vertical-align:bottom;" v-if="step.options.character === 'usequestcharacter'" :src="customization.character.indexOf('blob:') === -1 ? serverUrl + '/upload/quest/' + customization.character : customization.character" />
          </div>
          <div class="full-width bg-black" style="height: 70px">
          </div>
        </div>
      </div>
        
      <!------------------ CHOOSE STEP AREA ------------------------>
      
      <div class="choose" v-if="step.type == 'choose'" style="overflow: auto; margin-bottom: 80px;">
        <div v-if="showTools">
          <div @click="hideControlsTemporaly">
             <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
             <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="answers-text" v-if="answerType === 'text'">
            <q-btn v-for="(option, key) in step.options.items" :key="key" class="full-width shadowed" :class="option.class" :icon="option.icon" @click="checkAnswer(key)" :disabled="playerResult !== null" :test-id="'answer-text-' + key">
              <span :class="'font-' + customization.font" v-if="!option.textLanguage || !option.textLanguage[lang]">{{ option.text }}</span>
              <span :class="'font-' + customization.font" v-if="option.textLanguage && option.textLanguage[lang]">{{ option.textLanguage[lang] }}</span>
            </q-btn>
          </div>
          <div class="answers-images" v-if="answerType === 'image'">
            <div class="images-block">
              <div v-for="(option, key) in step.options.items" :key="key" :class="option.class" @click="checkAnswer(key)" :test-id="'answer-image-' + key">
                <img :src="option.imagePath.indexOf('blob:') !== -1 ? option.imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/choose-image/' + option.imagePath" :class="option.class" />
                <q-btn v-if="option.class !== null" round :class="option.class" :icon="option.icon" disable />
              </div>
            </div>
          </div>
          <div class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>
      
      <!------------------ KEYPAD STEP AREA ------------------------>
      
      <div class="code" v-if="step.type == 'code-keypad'">
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
          <div class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>
      
      <!------------------ CODE COLOR STEP AREA ------------------------>
      
      <div class="code code-color" v-if="step.type == 'code-color'">
        <div v-if="showTools">
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="color-bubbles">
            <div v-for="(color, index) in playerCode" :key="index" :style="'background-color: ' + playerCode[index]" @click="changeColorForCode(index)" class="shadow-8" :class="{right: playerResult === true, wrong: playerResult === false}" :test-id="'color-code-' + index">&nbsp;</div>
          </div>
          
          <div class="actions q-mt-lg q-mx-md" v-show="playerResult === null">
            <div>
              <q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" @click="checkAnswer()" test-id="btn-check-color-code"><div>{{ $t('label.Confirm') }}</div></q-btn>
            </div>
          </div>
          <div class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>
      
      <!------------------ IMAGE CODE STEP AREA ------------------------>
      
      <div class="code code-image" v-if="step.type == 'code-image'">
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
                <img :id="'image-code-' + index" @click="enlargeThePicture(index)" :src="step.options.images[code].imagePath.indexOf('blob:') !== -1 ? step.options.images[code].imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/code-image/' + step.options.images[code].imagePath" />
              </td>
            </tr>
            <tr>
              <td v-for="(code, index) in playerCode" :key="index" class="text-center">
                <q-btn :disabled="stepPlayed" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" round icon="keyboard_arrow_down" @click="nextCodeAnswer(index)" :test-id="'next-image-' + index" />
              </td>
            </tr>
          </table>
          <div class="centered text-grey q-py-md">{{ $t('label.ClickToEnlargePictures') }}</div>
          
          <div class="actions q-mt-lg q-mx-md" v-show="playerResult === null">
            <div>
              <q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" icon="done" @click="checkAnswer()" test-id="btn-check-image-code"><div>{{ $t('label.Confirm') }}</div></q-btn>
            </div>
          </div>
          <div class="centered" style="padding-bottom: 100px">
            <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_less" :label="$t('label.Hide')" @click="showTools = false" />
          </div>
        </div>
        <div v-if="!showTools" class="centered">
          <q-btn flat class="no-box-shadow hide-button text-black" icon="expand_more" :label="$t('label.Show')" @click="showTools = true" />
        </div>
      </div>
      
      <!------------------ GEOLOCALISATION STEP AREA ------------------------>
      
      <div class="geolocation" v-if="step.type == 'geolocation'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          <p class="text" :class="'font-' + customization.font" v-if="step.showDistanceToTarget && geolocation.active">{{ $t('label.DistanceInMeters', { distance: Math.round(geolocation.distance) }) }}</p>
        </div>
      </div>
      
      <!------------------ SIMPLE TEXT INPUT STEP AREA ------------------------>
      
      <div class="write-text" v-if="step.type == 'write-text'">
        <div v-if="showTools">
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div class="answer-text q-pa-md">
            <!-- could not use v-model here, see https://github.com/vuejs/vue/issues/8231 -->
            <input 
              class="subtitle6" 
              v-bind:value="writetext.playerAnswer" 
              v-on:input="writetext.playerAnswer = $event.target.value" 
              :placeholder="$t('label.YourAnswer')" 
              :class="{right: playerResult === true, wrong: playerResult === false}" 
              :disabled="stepPlayed" />
            <q-btn class="glossy large-button" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" :disabled="writetext.playerAnswer === '' || stepPlayed" @click="checkAnswer()" test-id="btn-check-text-answer"><div>{{ $t('label.ConfirmTheAnswer') }}</div></q-btn>
          </div>
          <div class="centered" style="padding-bottom: 100px">
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
        <div class="q-mt-lg background-lighter4 q-pa-md">
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
      
      <div class="puzzle" v-if="step.type === 'memory'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <ul class="memory" id="card-deck">
          <li 
            v-for="(item, key) in memory.items" 
            :key="key" 
            class="card" 
            :class="{ open: item.isClicked, show: item.isClicked, disabled: item.isFound || stepPlayed, match: item.isFound }" 
            @click="selectMemoryCard(key)"
          >
            <img v-if="item.imagePath" :src="item.imagePath.indexOf('blob:') !== -1 ? item.imagePath : serverUrl + '/upload/quest/' + step.questId + '/step/memory/' + item.imagePath" />
          </li>
        </ul>
      </div>
      
      <!------------------ COMPOSITE DRAWING STEP AREA ------------------------>
      
      <div class="portrait-robot" v-if="step.type === 'portrait-robot'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div class="relative-position">
          <div>
            <img :src="'statics/portrait-robot/face-' + portrait.face.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/eye-' + portrait.eye.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/mouth-' + portrait.mouth.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/nose-' + portrait.nose.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/hair-' + portrait.hair.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/beard-' + portrait.beard.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/glass-' + portrait.glass.position + '.png'" />
          </div>
          <div class="absolute">
            <img :src="'statics/portrait-robot/hat-' + portrait.hat.position + '.png'" />
          </div>
        </div>
        <table class="portrait-parts relative-position">
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
        <div class="actions q-mt-lg q-mx-md" v-show="playerResult === null">
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
            <img class="no-mouse-event" style="width: 100%; " src="statics/icons/game/binoculars.png">
          </div>
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
            <q-btn class="float-right" round color="negative" icon="call_end" @click="forceNextStep()" />
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
      
      <div class="find-item" v-if="step.type == 'find-item'">
        <div>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
          <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
        </div>
        <div ref="findItemPicture" @click="checkFindItem($event)" :style="'position: relative; overflow: hidden; background-image: url(' + getBackgroundImage() + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100%; height: ' + findItem.imageHeight + 'px;'" test-id="find-item-picture">
          <img id="cross-play0" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play1" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play2" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
          <img id="cross-play3" :style="'position: absolute; z-index: 500; width: ' + findItem.crossSize + 'px; height: ' + findItem.crossSize + 'px; display: none;'" src="statics/icons/game/find-item-locator.png" />
        </div>
      </div>
      
      <!------------------ LOCATE ITEM IN AUGMENTED REALITY STEP AREA ------------------------>
      
      <div class="locate-item-ar" v-if="step.type == 'locate-item-ar'">
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <video ref="camera-stream-for-locate-item-ar" v-show="cameraStreamEnabled && playerResult === null && geolocation.active"></video>
        </transition>
        <div v-show="playerResult === null && this.geolocation.active">
          <div class="text" :class="'font-' + customization.font">
            <p v-if="!(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p v-if="step.options && step.options.html" v-html="getTranslatedText()" />
            <p v-if="step.showDistanceToTarget && geolocation.active">{{ $t('label.DistanceInMeters', { distance: Math.round(geolocation.distance) }) }}</p>
            <p v-if="!geolocation.canSeeTarget && geolocation.active">{{ $t('label.ObjectIsTooFar') }}</p>
            <p v-if="geolocation.canTouchTarget && geolocation.active">{{ $t('label.TouchTheObject') }}</p>
            <p v-if="geolocation.canSeeTarget && !geolocation.canTouchTarget && geolocation.active">{{ $t('label.MoveCloserToTheObject') }}</p>
          </div>
        </div>
        <div class="target-view" v-show="(playerResult === null) || (playerResult !== null && step.options && step.options.is3D)">
          <canvas id="target-canvas" @click="onTargetCanvasClick" v-touch-pan="handlePanOnTargetCanvas"></canvas>
        </div>
        <img ref="item-image" v-show="playerResult && step.options && !step.options.is3D" />
      </div>
      
      <!------------------ SUPERIMPOSE IMAGE AND CAMERA STEP AREA ------------------------>
      
      <div class="image-over-flow" v-if="step.type == 'image-over-flow'">
        <!--<transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">-->
          <video ref="camera-stream-for-image-over-flow" v-show="cameraStreamEnabled"></video>
        <!--</transition>-->
        <div>
          <div v-if="isHybrid && !takingSnapshot" style="position: absolute; top: 8px; right: 8px;z-index: 1990;">
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
          <img id="snapshotImage" v-if="!isIOs && takingSnapshot" style="position: absolute; top: 0; left: 0; height: 100%; width: auto; z-index: 1980;" />
          <img id="snapshotImageIos" v-if="isIOs && takingSnapshot" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1980" />
          <div>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && !(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p class="text" :class="'font-' + customization.font" v-if="getTranslatedText() != '' && (step.options && step.options.html)" v-html="getTranslatedText()" />
          </div>
          <div v-if="!step.options || (!step.options.fullWidthPicture && !step.options.redFilter)" class="image" ref="ImageOverFlowPicture" :style="'overflow: hidden; background-image: url(' + getBackgroundImage() + '); background-position: center; background-size: 100% 100%; background-repeat: no-repeat; width: 100vw; height: 133vw; z-index: 1985;'">
          </div>
          <img v-if="step.options && step.options.fullWidthPicture && !step.options.redFilter" :src="getBackgroundImage()" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; z-index: 1985;" />
          <img v-if="step.options && step.options.redFilter" src="statics/images/background/red.png" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; z-index: 1985; mix-blend-mode: multiply; opacity: 0.8;" />
        </div>
      </div>
      
      <!------------------ LOCATE A 2D MARKER / TOUCH OBJECT ON MARKER ------------------------>
      
      <div class="locate-marker" v-if="step.type == 'locate-marker' || step.id == 'sensor'">
        <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
          <video ref="camera-stream-for-locate-marker"  webkit-playsinline playsinline src="" autoplay v-show="cameraStreamEnabled && playerResult === null"></video>
        </transition>
        
        <div v-show="playerResult === null">
          <div class="text" :class="'font-' + customization.font" v-show="getTranslatedText() != ''">
            <p v-if="!(step.options && step.options.html)">{{ getTranslatedText() }}</p>
            <p v-if="step.options && step.options.html" v-html="getTranslatedText()" />
            <p v-if="!isHybrid">{{ $t('label.ThisStepOnlyWorkOnMobile') }}</p>
          </div>
        </div>
        
        <!-- HELP -->
        <q-btn round size="lg" v-if="playerResult === null && !isHybrid" :color="(customization && (!customization.color || customization.color === 'primary')) ? 'primary' : ''" :style="(customization && (!customization.color || customization.color === 'primary')) ? '' : 'background-color: ' + customization.color" @click="locateMarker.showHelp = true"><span>?</span></q-btn>
        <div v-if="playerResult === null && isHybrid" class="text-white centered q-mt-md">
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
        <div v-if="step.options.object === 'chest' || step.options.object === 'relay'">
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
            <!--<div class="q-pa-md centered">
              <q-btn flat icon="refresh"><span>{{ $t('label.CheckIfICanMoveFoward') }}</span></q-btn>
            </div>-->
          </div>
        </div>
      </transition>
      
    </div>
    
    <!------------------ COMMON COMPONENTS ------------------>
    
    <div class="direction-helper" v-show="(step.type == 'geolocation' || step.type == 'locate-item-ar') && step.showDirectionToTarget && playerResult === null && geolocation.active">
      <canvas id="direction-canvas" :style="{ width: directionHelperSize + 'rem', height: directionHelperSize + 'rem' }"></canvas>
    </div>
    
    <geolocation ref="geolocation-component" v-if="step.type == 'geolocation' || step.type == 'locate-item-ar'" @success="onNewUserPosition($event)" @error="onUserPositionError($event)" :withNavBar="true" />
    
    <!--====================== WIN POINTS ANIMATION =================================-->
    
    <!--<div v-show="playerResult === true && score >= 1" class="fadein-message">+{{ score }}</div>-->
    <div v-show="playerResult === true && displaySuccessIcon" class="fadein-message" style="padding-left: 40%"><q-icon color="white" name="thumb_up" /></div>
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
<!--:geolocationshowCalibration="false"-->
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

import colorsForCode from 'data/colorsForCode.json'
import modelsList from 'data/3DModels.json'
import iotObjectsList from 'data/iotObjects.json'
import iotOptions from 'data/iotOptions.json'
import stepTypes from 'data/stepTypes.json'

import Notification from 'boot/NotifyHelper'

import geolocation from 'components/geolocation'
import gpscalibration from 'components/gpsCalibration'
import holdphonevertically from 'components/holdPhoneVertically'
import story from 'components/story'

import Vue from 'vue'
import debounce from 'lodash/debounce'

// required for step 'locate-item-ar'
import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import GLTFLoader from 'three-gltf-loader'

// required for steps 'wait-for-event' and 'trigger-event' (IoT):
import * as mqtt from 'mqtt'

export default {
  /*
   * Properties used on component call
   * step : step data (mandatory)
   * runId : Id of the run (0 = simulation mode)
   * reload : set to true if data must be reload
   * itemUsed : item of the inventory used
   * lang : language of the step (fr, en, ...)
   */
  props: ['step', 'runId', 'reload', 'itemUsed', 'lang', 'answer', 'customization', 'player', 'inventory'],
  components: {
    holdphonevertically,
    gpscalibration,
    geolocation,
    story
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
        isIOs: utils.isIOS(),
        isPageInit: false,
        isNetworkLow: false,
        isTimeUp: false,
        displaySuccessIcon: false,
        
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
          // for 'locate-item-ar'
          absoluteOrientationSensor: null,
          initialBearingAngle: null,
          target: null,
          canSeeTarget: false,
          canTouchTarget: false,
          primaryColor: colors.getBrand('primary'),
          showCalibration: false,
          takeMobileVertically: false,
          gyroscopeDetectionCounter: 0,
          lowCompassAccuracy: false,
          compassAccuracyTimeout: null,
          showARHelp: false,
          currentIndex: 0,
          foundStep: false
        },
        deviceMotion: {
          // device acceleration & velocity
          acceleration: {
            raw: { x: 0, y: 0, z: 0 },
            filtered: { x: 0, y: 0 },
            avgData: { x: [], y: [], z: [] },
            maxAvgItems: 4
          },
          velocity: { x: 0, y: 0 },
          dateLatestEvent: null,
          isTargetPositionUndefined: true,
          isAccelerationIdle: false,
          idleAccelerationCounter: 1
        },
        minDistanceForGPS: 20, // in meters
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
          picture: 'statics/icons/game/medal.png',
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
        portrait: {
          face: { position: 1, number: 4 },
          eye: { position: 1, number: 16 },
          mouth: { position: 1, number: 1 },
          nose: { position: 1, number: 5 },
          hair: { position: 1, number: 26 },
          beard: { position: 1, number: 31 },
          glass: { position: 1, number: 5 },
          hat: { position: 1, number: 4 }
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
      //this.currentcountdown = defaultVars.currentcountdown
    },
    resetEvents () {
      // this is called every time step changes => cleanup all memory & CPU intensive tasks here
      
      // (camera streams, 3D animations, GPS trackings...)
      this.clearAllCameraStreams()
      
      // cancels recursive 'requestAnimationFrame()' calls
      // otherwise they continue in the background even when route changes
      this.stopLatestAnimation()
      
      if (this.geolocation.absoluteOrientationSensor !== null) {
        this.geolocation.absoluteOrientationSensor.stop()
      }
      
      window.removeEventListener("devicemotion", this.handleMotionEvent, true)
      
      utils.clearAllRunningProcesses()
      
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
      
      if (['geolocation', 'locate-item-ar'].includes(this.step.type)) {
        try {
          // can trigger an error in console which cannot be avoided
          cordova.plugins.headingcalibration.stopWatchCalibration();
        } catch (err) {}
      }
    },
    /*
     * get background image
     */
    getBackgroundImage () {
      if (this.step.backgroundImage && this.step.backgroundImage[0] === "_") {
        return 'statics/images/quest/' + this.step.backgroundImage
      } else if (this.step.backgroundImage && this.step.backgroundImage.indexOf('blob:') !== -1) {
        return this.step.backgroundImage
      } else {
        return this.serverUrl + '/upload/quest/' + this.step.questId + '/step/background/' + this.step.backgroundImage
      }
    },
    /*
     * reset background image between steps
     */
    resetBackgroundImage () {
      let background = document.getElementById('play-view')
      background.style.background = 'none'
      background.style.backgroundColor = 'transparent'
      let backgroundImage = document.getElementById('background-image')
      if (backgroundImage) {
        backgroundImage.style.background = 'none'
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
      this.resetBackgroundImage()
      TWEEN.removeAll()
      // wait that DOM is loaded (required by steps involving camera)
      this.$nextTick(async () => {
        let background = document.getElementById('play-view')
        if (this.step.backgroundImage) {
          if (this.step.type === 'find-item' || this.step.type === 'use-item' || this.step.type === 'binocular' || this.step.type === 'phone-call') {
            background.style.background = 'none'
            background.style.backgroundColor = '#000'
            this.showControls()
          } else if (this.step.type === 'image-over-flow') {
            this.showControls()
            background.style.background = 'none'
            background.style.backgroundColor = 'transparent'
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
              backgroundImage.style.background = '#fff url("' + backgroundUrl + '") center/cover no-repeat'
            }
            // all background clickable for transitions
            //if ((["info-text", "geolocation", "choose", "write-text", "code-keypad", "code-color"]).indexOf(this.step.type) > -1) {
              //let clickable = document.getElementById('info-clickable')
              //let clickable = document.getElementById('main-view')
              //clickable.addEventListener("click", this.showControls, false);
            //}
            
            // display controls after some seconds to let user see background
            if (this.step.options && this.step.options.hasOwnProperty('initDuration')) {
              utils.setTimeout(this.showControls, parseInt(this.step.options.initDuration, 10) * 1000)
            } else {
              utils.setTimeout(this.showControls, 1000)
            }
          }
        } else {
          // no background on some steps to display camera stream
          if (this.step.type && this.step.type !== 'locate-item-ar' && this.step.type !== 'locate-marker' && this.step.id !== 'sensor') {        
            background.style.background = 'none'
            background.style.backgroundColor = '#fff'
          } else {
            background.style.background = 'none'
            background.style.backgroundColor = 'transparent'
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
        
        this.resetDrawDirectionInterval()

        //iOS Hack : all iphone have gyroscope
        if (this.isIOs) {
          this.deviceHasGyroscope = true
        }
        
        if (this.step.type === 'end-chapter') {
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
          utils.setTimeout(this.initFindItemElements, 2000)
        }
        if (this.step.type === 'use-item') {
          utils.setTimeout(this.initUseItemElements, 2000)
        }
        
        if (this.step.type === 'new-item') {
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
          this.$emit('pass')
        }
        
        // common process to 'geolocation' and 'locate-item-ar'
        if (this.step.type === 'geolocation' || this.step.type === 'locate-item-ar') {
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
            // Start absolute orientation sensor
            // ---------------------------------
            // Required to make camera orientation follow device orientation 
            // It is different from 'deviceorientationabsolute' listener whose values are not
            // reliable when device is held vertically
            try {
              if ("AbsoluteOrientationSensor" in window) {
                // Android
                let sensor = new AbsoluteOrientationSensor({ frequency: 30 })
                sensor.onerror = event => console.error(event.error.name, event.error.message)
                sensor.onreading = this.onAbsoluteOrientationSensorReading
                sensor.start()
                this.geolocation.absoluteOrientationSensor = sensor
              } else {
                // iOS
                this.geolocation.absoluteOrientationSensor = {
                  stop: this.stopAlternateAbsoluteOrientationSensor
                }
                
                // ask user to access to his device orientation
                requestPermissionResult = await utils.requestDeviceOrientationPermission()
                
                if (requestPermissionResult !== 'granted') {
                  Notification(this.$t('label.PleaseAcceptDeviceOrientationPermissionRequest'), 'error')
                  return
                }
                window.addEventListener('deviceorientation', this.eventAlternateAbsoluteOrientationSensor, false)
              }
            } catch (error) {
              console.error(error)
            }
            
            if (this.step.type === 'locate-item-ar') {
              // show help
              this.geolocation.showARHelp = true
              
              // ask user to access to his device motion
              requestPermissionResult = await utils.requestDeviceMotionPermission()
              
              if (requestPermissionResult !== 'granted') {
                Notification(this.$t('label.PleaseAcceptDeviceMotionPermissionRequest'), 'error')
                return
              }
              
              // start accelerometer sensor
              window.addEventListener("devicemotion", this.handleMotionEvent, true)
            
              await this.waitForGyroscopeDetection()
            
              if (!this.deviceHasGyroscope) {
                // only a warning because step can still be played
                Notification(this.$t('label.CouldNotEnableAR'), 'warning')
              }
            }
          }
          
          // must store object returned by setInterval() in Vue store instead of component properties,
          // otherwise it is reset when route changes & component is reloaded
          this.$store.dispatch('setDrawDirectionInterval', window.setInterval(this.drawDirectionArrow, 100))
          
          if (this.isHybrid && !this.isIOS) {
            let _this = this
            // IOS is not tested for now, hence why we are not using it 
            cordova.plugins.headingcalibration.watchCalibration(
              (accuracy) => {
                if (accuracy <= 1) {
                  _this.geolocation.lowCompassAccuracy = true
                  // start a timer when accuracy is low. after timer expired, if accuracy has not improved, show calibration animation
                  if (_this.geolocation.compassAccuracyTimeout === null && !_this.geolocation.showCalibration) {
                    _this.geolocation.compassAccuracyTimeout = utils.setTimeout(() => {
                      _this.$refs.gpscal.askUserToCalibrateGPS();
                      if (_this.geolocation.compassAccuracyTimeout !== null) {
                        clearTimeout(_this.geolocation.compassAccuracyTimeout);
                        _this.geolocation.compassAccuracyTimeout = null;
                      }
                    }, 10000)
                  }
                } else {
                  _this.geolocation.lowCompassAccuracy = false
                  if (_this.geolocation.compassAccuracyTimeout !== null) {
                    clearTimeout(_this.geolocation.compassAccuracyTimeout);
                    _this.geolocation.compassAccuracyTimeout = null;
                  }
                }
              },
              (err) => { console.error('watch calibration: failure', err) }
            );
          }
        }
        
        if (this.step.type === 'locate-item-ar'  && !this.playerResult) {
          if (this.deviceHasGyroscope || !this.step.backgroundImage) {
            // video stream for AR background
            if (this.isIOs && CameraPreview) {
              let options = {x: 0, y: 0, width: window.screen.width, height: window.screen.height, camera: CameraPreview.CAMERA_DIRECTION.BACK, toBack: true, tapPhoto: false, tapFocus: false, previewDrag: false} 
              CameraPreview.startCamera(options)
              CameraPreview.show()
            } else {
              this.launchVideoStreamForAndroid('camera-stream-for-locate-item-ar')
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
            object.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, onGroundOffset))
            
            // compute object size = max(length, width, depth)
            target.size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z)
            
            // animations ? play first animation
            if (animations.length > 0) {
              let mixer = new THREE.AnimationMixer(object)
              mixer.clipAction(animations[0]).play()
              this.geolocation.target.mixers.push(mixer)
            }
            
            // accurate colors for GLTF models, see https://stackoverflow.com/q/50331480/488666
            this.geolocation.target.renderer.gammaOutput = true
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
          
          // video stream
          if (this.isIOs && CameraPreview) {
          //if (CameraPreview) {
            let options = {x: 0, y: 0, width: window.screen.width, height: window.screen.height, camera: CameraPreview.CAMERA_DIRECTION.BACK, toBack: true, tapPhoto: false, tapFocus: false, previewDrag: false} 
            CameraPreview.startCamera(options)
            //CameraPreview.setColorEffect("redfilter")
            CameraPreview.show()
          } else {
            this.launchVideoStreamForAndroid('camera-stream-for-image-over-flow', true)
          }
        }
        
        // enable geoloc only when 3D scene is fully loaded
        if (this.step.type === 'geolocation' || this.step.type === 'locate-item-ar') {
          this.$refs['geolocation-component'].disabled = false
        }
        
        if ((this.step.type === 'locate-marker' || this.step.id === 'sensor') && !this.playerResult) {
          if (this.step.id === 'sensor') {
            this.step.options = { mode: 'scan', layerCode: 'magnifier' }
          } else {
            // user can pass
            this.$emit('pass')
          }
          
          if (this.isHybrid) {
            this.initQRCodes()
          }
        }
        
        if (this.step.type === 'wait-for-event' || this.step.type === 'trigger-event') {
          this.iotObject = this.getIotObjectFromCode(this.step.options.object)
          
          if (this.step.options.object === 'keypad') {
            this.iot.keypadAnswer = '_'.repeat(this.step.options.answer.length)
          }
          
          if (this.step.options.protocol === 'mqtt') {
            // TODO: adapt to match specs at https://github.com/Graaly/iot/blob/master/README.md
            let _this = this
            
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
            let _this = this
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
     * handles deviceorientation event on iOS
     */
    eventAlternateAbsoluteOrientationSensor(e) {
      if (this.geolocation.initialBearingAngle === null && e.webkitCompassHeading !== 0) {
        this.geolocation.initialBearingAngle = (-e.webkitCompassHeading - e.alpha + 720) % 360
      }

      const alpha = e.webkitCompassHeading != null ? (this.geolocation.initialBearingAngle + e.alpha) % 360 : e.alpha
      const beta     = e.beta
      const gamma    = e.gamma
      const degtorad = Math.PI / 180
     
      var _x = beta  ? beta  * degtorad : 0 // beta value
      var _y = gamma ? gamma * degtorad : 0 // gamma value
      var _z = alpha ? alpha * degtorad : 0 // alpha value
      var cX = Math.cos(_x/2)
      var cY = Math.cos(_y/2)
      var cZ = Math.cos(_z/2)
      var sX = Math.sin(_x/2)
      var sY = Math.sin(_y/2)
      var sZ = Math.sin(_z/2)

      // ZXY quaternion construction.
      var w = cX * cY * cZ - sX * sY * sZ
      var x = sX * cY * cZ - cX * sY * sZ
      var y = cX * sY * cZ + sX * cY * sZ
      var z = cX * cY * sZ + sX * sY * cZ

      this.geolocation.absoluteOrientationSensor.quaternion = [ x, y, z, w ]
      
      this.onAbsoluteOrientationSensorReading() // same process as Android
    },
    stopAlternateAbsoluteOrientationSensor() {
      window.removeEventListener('deviceorientation', this.eventAlternateAbsoluteOrientationSensor, false)
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
      var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              _this.checkAnswer(result.text)
            }
          },
          function (error) {
            console.log("Scanning failed: " + error)
          },
          {
            preferFrontCamera: false, // iOS and Android
            showFlipCameraButton: false, // iOS and Android
            showTorchButton: true, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt: "", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
            orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false // iOS and Android
          }
        )
      }
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
        this.step.type === 'phone-call' || 
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
    checkIfDataAreInit() {
      console.log("check if data must be loaded")
      if (!this.isPageInit) {
        console.log("Reload all data")
        this.initData()
      }
    },
    /*
     * Hide controls temporaly
     */
    hideControlsTemporaly () {
      this.controlsAreDisplayed = false
      utils.setTimeout(this.showControls, 4000)
    },
    /*
     * Send answer server side 
     * @param   {Object}    selectedAnswerKey            Answer object
     */
    async sendAnswer(questId, stepId, runId, answerData, displaySpinner) {
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
        
        let offlineAnswer = this.checkOfflineAnswer(answerData.answer)
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
      } else {
        if (answer === this.answer) {
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
        return
      }
      
      // if generic marker sensor
      if (this.step.id === 'sensor') {
        if (!this.locateMarker.markerControls[answer].detected) {
          this.locateMarker.flash = false
          this.locateMarker.flash = true
          this.locateMarker.markerControls[answer].detected = true
          this.$emit('played', answer)
        }
        return 
      }
      
      switch (this.step.type) {
        case 'info-text':
        case 'info-video':
        case 'new-item':
        case 'help':
        case 'end-chapter':
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
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, true)
          if (checkAnswerResult.result === true) {
            let selectedAnswer = this.step.options.items[answer]
            if (this.step.displayRightAnswer === false) {
              selectedAnswer.class = 'rightorwrong'
            } else {
              selectedAnswer.icon = 'done'
              selectedAnswer.class = 'right'
            }
            Vue.set(this.step.options.items, answer, selectedAnswer)
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (!this.isTimeUp) {
              let selectedAnswer = this.step.options.items[answer]
              if (this.step.displayRightAnswer === false) {
                selectedAnswer.class = 'rightorwrong'
              } else {
                selectedAnswer.icon = 'clear' // "x" icon
                selectedAnswer.class = 'wrong'
              }
              Vue.set(this.step.options.items, answer, selectedAnswer)
            }
            
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            if (this.step.displayRightAnswer === true) {
              // indicate the right answer
              if ((checkAnswerResult.answer || checkAnswerResult.answer === 0) && !checkAnswerResult.remainingTrial) {
                let selectedAnswer = this.step.options.items[checkAnswerResult.answer]
                selectedAnswer.icon = 'done'
                selectedAnswer.class = 'right'
                Vue.set(this.step.options.items, checkAnswerResult.answer, selectedAnswer)
              }
            }
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
            }
          }
          break
        
        case 'geolocation':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, false)

          if (this.isTimeUp) {
            this.submitWrongAnswer(checkAnswerResult.offline, true)
          } else if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
          }
          break
          
        case 'code-keypad':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.playerCode.join(''), isTimeUp: this.isTimeUp}, true)

          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              // reset code
              this.resetKeypadCode()
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
            }
          }
          break
        
        case 'code-color':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.playerCode.join('|'), isTimeUp: this.isTimeUp}, true)
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
            }
          }
          break
          
        case 'code-image':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.playerCode.join('|'), isTimeUp: this.isTimeUp}, true)
          
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
            }
          }
          break
        
        case 'jigsaw-puzzle':
          // MP 2019-10-15 since shuffle is done on client side, we always
          // consider that puzzle is solved when checkAnswer() is called.
          
          // call to sendAnswer() is required to get score & offline info
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: '', isTimeUp: this.isTimeUp}, true)
          
          if (this.isTimeUp === true) {
            this.submitWrongAnswer(checkAnswerResult.offline, true)
          } else if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
          }
          break
          
        case 'memory':
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {isTimeUp: this.isTimeUp}, false)
                    
          if (this.isTimeUp === true) {
            this.submitWrongAnswer(checkAnswerResult.offline, true)
          } else if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, true)
          }
          break
        
        case 'portrait-robot':
          let portraitAnswer = {items: {type: 1, face: this.portrait.face.position, eye: this.portrait.eye.position, mouth: this.portrait.mouth.position, nose: this.portrait.nose.position, hair: this.portrait.hair.position, beard: this.portrait.beard.position, glass: this.portrait.glass.position, hat: this.portrait.hat.position}}
          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: portraitAnswer, isTimeUp: this.isTimeUp}, false)
                    
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
            }
          }
          break
        
        case 'write-text':
          // remove the trailing space if ther is one 
          // https://www.w3schools.com/jsref/jsref_trim_string.asp
          this.writetext.playerAnswer = this.writetext.playerAnswer.trim()

          checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: this.writetext.playerAnswer, isTimeUp: this.isTimeUp}, true)
          if (checkAnswerResult.result === true) {
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            if (this.isTimeUp) {
              checkAnswerResult.remainingTrial = 0
            }
            
            this.nbTry++
            if (checkAnswerResult.remainingTrial > 0) {
              // reset field
              this.writetext.playerAnswer = ""
              this.submitRetry(checkAnswerResult.remainingTrial)
            } else {
              this.submitWrongAnswer(checkAnswerResult.offline, this.step.displayRightAnswer)
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
              this.step.backgroundImage = this.step.options.altFile
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
            checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, true)
            
            /*if (this.step.displayRightAnswer) {
              this.showFoundLocation(checkAnswerResult.answer.left, checkAnswerResult.answer.top)
            }*/
            // if alt picture
            if (this.step.options && this.step.options.altFile) {
              this.step.backgroundImage = this.step.options.altFile
            }
            this.submitGoodAnswer((checkAnswerResult && checkAnswerResult.score) ? checkAnswerResult.score : 0, checkAnswerResult.offline, this.step.displayRightAnswer)
          } else {
            const remainingTrial = this.isTimeUp ? 0 : (this.step.nbTrial - this.nbTry - 1)
            if (!checkIfFound.one) {
              this.nbTry++
              if (remainingTrial > 0) {
                Notification(this.$t('label.FindItemNothingHappens'), 'error')
              } else {
                checkAnswerResult = await this.sendAnswer(this.step.questId, this.step.stepId, this.runId, {answer: answer, isTimeUp: this.isTimeUp}, true)
                
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
                window.removeEventListener("devicemotion", this.handleMotionEvent, true)

                // stop moving camera when device moves
                this.geolocation.absoluteOrientationSensor.stop()
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
                  target.arToolkitContext = null // otherwise ending animation is 'erased' by AR.js behavior: 3D object disappears because camera stream is removed and markers are not found anymore !
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
                    if (this.step.type === 'locate-marker') {
                      // detach 3D object (target to find) from arSmoothedControl and attach it directly at scene root, for hassle free manipulation of the 3D object
                      utils.detachObject3D(object, object.parent, target.scene)
                      utils.attachObject3D(object, target.scene, target.scene)
                    }
                    
                    camera.position.set(0, 0,  cameraDistance * 2 / 3)
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
            if (this.isHybrid) {
            //if (this.isIOs) {
              if (this.locateMarker.markerControls[answer] && !this.locateMarker.markerControls[answer].detected) {
                this.locateMarker.markerControls[answer].detected = true
                markerDetected = true
              }
            }
            
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
    submitGoodAnswer(score, offlineMode, showResult) {
      if (showResult) {
        this.playerResult = true
      } else {
        this.playerResult = null
      }
      
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
      
      this.$emit('success', score, offlineMode, showResult)
      this.$emit('played')
      
      this.displayReadMoreAlert()
      
      if (showResult) {
        switch (this.step.type) {
          case 'character': 
          case 'new-item': 
          case 'info-text': 
          case 'help': 
          case 'end-chapter': 
          case 'info-video': 
          case 'image-over-flow': 
          case 'binocular': 
          case 'phone-call': 
            
            break
          case 'choose':
            break
          case 'code-keypad':
          case 'code-color':
          case 'code-image':
            this.displaySuccessMessage(true, this.$t('label.GoodAnswer'))
            break
          case 'write-text':
          case 'jigsaw-puzzle':
          case 'memory':
          case 'portrait-robot':
          case 'use-item':
          case 'find-item':
          case 'geolocation':
            this.displaySuccessMessage(true, this.$t('label.YouHaveFoundThePlace'))
            break
          case 'locate-item-ar':
          case 'locate-marker':
            if (this.step.type === 'locate-item-ar' || (this.step.type === 'locate-marker' && this.step.options && this.step.options.mode === 'touch')) {
              this.displaySuccessMessage(true, this.$t('label.YouHaveWinANewItem'))
            } else { // locate marker, mode scan
              this.displaySuccessMessage(true, this.$t('label.WellDone'))
            }
            break
          case 'wait-for-event':
            this.displaySuccessMessage(true, this.$t('label.WellDone'))
            break
        }
      }
      // advise user to move to next step
      //utils.setTimeout(this.alertToPassToNextStep, 15000)
    },
    /*
     * Send wrong answer 
     */
    submitWrongAnswer(offlineMode, showResult) {
      // remove timer
      if (this.step.countDownTime !== null) {
        this.step.countDownTime.enabled = false
        this.stopcountdown()
      }
      
      if (showResult) {
        this.playerResult = false
      } else {
        this.playerResult = null
      }
      this.stepPlayed = true
      
      this.$emit('fail', offlineMode, showResult)
      this.$emit('played')
      
      this.displayReadMoreAlert()
      
      if (this.isTimeUp === true) {
        this.displaySuccessMessage(false, this.$t('label.CountDownPopupfail'))
      } else if (showResult) {
        this.displaySuccessMessage(false, this.$t('label.WrongAnswer'))
      }
      
      // if no display of the answer move to next step
      if (this.step.displayRightAnswer === true) {
        // advise user to move to next step
        utils.setTimeout(this.alertToPassToNextStep, 15000)
      }
    },
    alertToPassToNextStep() {
      this.displaySuccessMessage(true, this.$t('label.ClickOnArrowToMoveToNextStep'))
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
      this.displaySuccessMessage(false, this.$t('label.SecondTry', {nb: nbRemainingTrials}))
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
      ctx.fillStyle = this.geolocation.primaryColor
      ctx.strokeStyle = this.geolocation.primaryColor
      
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
      this.geolocation.active = true
      let current = pos.coords
      
      // if lat and lng are not set, compute to have the object close to the current user position
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
      
      let previousGPSdistance = this.geolocation.GPSdistance
      
      let destinationPosition = { lat: options.lat, lng: options.lng }
      if (this.step.type === 'geolocation' && options.locations && options.locations.length > 0) {
        destinationPosition.lat = options.locations[this.geolocation.currentIndex].lat
        destinationPosition.lng = options.locations[this.geolocation.currentIndex].lng
      }

      // compute distance between two coordinates
      // note: current.accuracy contains the result accuracy in meters
      this.geolocation.GPSdistance = utils.distanceInKmBetweenEarthCoordinates(destinationPosition.lat, destinationPosition.lng, current.latitude, current.longitude) * 1000 // meters
      let rawDirection = utils.bearingBetweenEarthCoordinates(current.latitude, current.longitude, destinationPosition.lat, destinationPosition.lng)
      if (this.geolocation.distance === null || (this.step.type === 'locate-item-ar' && ((previousGPSdistance !== null && previousGPSdistance > this.minDistanceForGPS) || !this.deviceHasGyroscope)) || this.step.type !== 'locate-item-ar') {
        // avoid to change distance too much
        if (!this.geolocation.distance || this.geolocation.GPSdistance < this.geolocation.distance || this.geolocation.GPSdistance > (this.geolocation.distance + 4)) {
          this.geolocation.distance = this.geolocation.GPSdistance
        }
        this.geolocation.rawDirection = rawDirection
      }
      
      let finalDirection = utils.degreesToRadians(rawDirection)
      if (!this.deviceHasGyroscope) {
        // consider that the object to find is always in front of the device 
        finalDirection = 0
        // avoid to be too close from the object, set minimal distance
        const minDistanceFromObject = 2 + (this.geolocation.target !== null ? this.geolocation.target.size : 0) // in meters
        this.geolocation.GPSdistance = Math.max(minDistanceFromObject, this.geolocation.GPSdistance)
      }
      
      // compute new X/Y coordinates of the object (considering that camera is always at (0, 0))
      // note that those properties are also needed when accelerometer is used (method 'handleMotionEvent()')
      this.geolocation.position.x = Math.sin(finalDirection) * this.geolocation.GPSdistance
      this.geolocation.position.y = Math.cos(finalDirection) * this.geolocation.GPSdistance
      
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
        
        // if GPS distance to object is greater than value of this.minDistanceForGPS, update target object position only given GPS position. Otherwise, accelerometer is used to track device position for better user experience (avoids object "drifts").
        if ((previousGPSdistance !== null && previousGPSdistance > this.minDistanceForGPS) || this.deviceHasGyroscope === false) {
          // smooth position change
          new TWEEN.Tween(object.position)
            .to({ x: this.geolocation.position.x, y: this.geolocation.position.y }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        }
        
        this.updatePlayerCanTouchTarget()
      }
      
      if (this.step.type === 'geolocation' && ((options.distance && this.geolocation.distance <= parseInt(options.distance, 10)) || this.geolocation.distance <= 20)) {
        //check if other locations are defined
        this.geolocation.currentIndex++
        if (options.locations && options.locations.length > 0 && this.geolocation.currentIndex < options.locations.length) {
          this.geolocation.foundStep = false
          this.geolocation.foundStep = true
        } else {
          this.$refs['geolocation-component'].disabled = true
          this.geolocation.active = false
          this.resetDrawDirectionInterval()
          await this.checkAnswer(current)
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
            cross.src = ((self.step.answers.item.indexOf('statics/') > -1 || self.step.answers.item.indexOf('blob:') !== -1) ? itemUsed.picture : self.serverUrl + '/upload/quest/' + self.step.questId + '/step/new-item/' + itemUsed.picture)
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
    prepareSnapshot() {
      this.takingSnapshot = true
      this.$q.loading.show()
      this.$emit('hideButtons')
      var _this = this
      if (this.isIOs && CameraPreview) {
        CameraPreview.takePicture({quality: 85}, function(base64PictureData) {
          const imageSrcData = 'data:image/jpeg;base64,' +base64PictureData
          var image = document.getElementById('snapshotImageIos')
          image.src = imageSrcData
          setTimeout(function () { _this.takeSnapshot() }, 2000)
        });
      } else {
        // generate a snapshot of the video flow
        this.imageCapture.takePhoto()
          .then(blob => {
            var image = document.getElementById('snapshotImage')
            image.src = URL.createObjectURL(blob)
            image.onload = function() {
              const width = image.width
              const height = image.height
              // check if picture has to be rotated
              if (width > height) {
                image.style.transform = 'rotate(90deg)'
              }
              // keep image ratio
              const vw = _this.getScreenWidth()
              const vh = _this.getScreenHeight()
              image.style.height = vh + "px"
              image.style.width = ((height / vh) * width) + "px"
              image.style.left = ((vw - parseInt(image.style.width, 10)) / 2) + "px"
  
              // rotate image (exif issue)
              /*
              image.style.width = height + "px"
              image.style.height = width + "px"
              image.style.top = ((height - width) / 2) + "px"
              image.style.left = ((width - height) / 2) + "px"*/
              
              setTimeout(function () { _this.takeSnapshot() }, 2000)
            }
          })
          .catch(err => { 
            Notification(_this.$t('label.SnapshotTakenIssue'), 'info'); console.log(err) 
            _this.$q.loading.hide()
            _this.$emit('showButtons')
          })
      }
    },
    switchCamera() {
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
    /*
     * take a snapshot of the screen
     */
    takeSnapshot() {
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
              _this.saveSnapshot(res)
            } else {
              Notification(_this.$t('label.ErrorTakingSnapshot'), 'info')
            }
          }, alert)
        }
        _this.takingSnapshot = false
        _this.$emit('showButtons')
      })
    },
    async saveSnapshot(mediaFile) {
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
        var _this = this
        StepService.uploadSnapshot(this.step.questId, data, function(err, result) {
          if (err) {
            Notification(this.$t('label.ErrorTakingSnapshot'), 'error')
          } else {
            Notification(_this.$t('label.SnapshotTaken'), 'info')
          }
        })
      } catch (error) {
        Notification(this.$t('label.ErrorTakingSnapshot'), 'error')
        console.log("Error: " + error)
      }
    },
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
      if (!this.isHybrid && vw > 500) {
        vw = 500
      }
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
      let picture
      if (this.step.options.picture && this.step.options.picture.indexOf('blob:') !== -1) {
        picture = this.step.options.picture
      } else if (this.step.options.picture && this.step.options.picture.indexOf('upload/') === -1) {
        picture = this.serverUrl + '/upload/quest/' + this.step.questId + '/step/jigsaw-puzzle/' + this.step.options.picture
      } else {
        picture = this.serverUrl + this.step.options.picture
      }
      
      // ensure that puzzle image is loaded before doing the remaining tasks
      await utils.loadImage(picture)
      
      this.puzzle.picture = picture
      
      // Puzzle sizes
      let level = parseInt((this.step.options.level || 2), 10) // 1=easy, 2=medium, 3=very hard, 4=hard
      let puzzleSize = this.puzzle.colsByLevel[level]
      let puzzleNbPieces = Math.pow(puzzleSize, 2)
      let puzzleWidth = document.getElementById('pieces').clientWidth
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
          items[i] = {imagePath: tileUsed.imagePath, isClicked: false, isFound: false}
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
            // uncover all tiles
            for (var i = 0; i < this.memory.items.length; i++) {
              if (!this.memory.items[i].isFound) {
                this.memory.items[i].isClicked = true
                _self.memory.items[_self.memory.selectedKey].isFound = true
                _self.memory.items[key].isFound = true
                Vue.set(this.memory.items, i, this.memory.items[i])
              }
            }
            this.checkAnswer(true)
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
    phoneCall: function() {
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
    /*
    * when reading a new value from AbsoluteOrientationSensor, update camera rotation so it matches device orientation
    */
    onAbsoluteOrientationSensorReading() {      
      if (this.geolocation.absoluteOrientationSensor.activated === false) {
        console.warn('sensor is not activated')
        return
      }
      
      let quaternion = new THREE.Quaternion().fromArray(this.geolocation.absoluteOrientationSensor.quaternion)

      if (this.step.type === 'locate-item-ar' && this.geolocation.target !== null && this.deviceHasGyroscope) {
        this.geolocation.target.camera.quaternion = quaternion
      }
      
      // every 100ms, update geolocation direction
      if (!this.geolocation.waitForNextQuaternionRead) {
        let rotationZXY = new THREE.Euler().setFromQuaternion(quaternion, 'ZXY')
        let rotationXZY = new THREE.Euler().setFromQuaternion(quaternion, 'XZY')
        let tmpAlpha = (rotationZXY.x < Math.PI / 4 ? rotationZXY.z : rotationXZY.y)
        let newAlpha = JSON.stringify((360 - utils.radiansToDegrees(tmpAlpha)) % 360)
        this.geolocation.direction = (this.geolocation.rawDirection - newAlpha + 360) % 360 
        this.geolocation.waitForNextQuaternionRead = true
        utils.setTimeout(() => { this.geolocation.waitForNextQuaternionRead = false }, 100)
      }
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
          this.$refs['geolocation-component'].disabled = true
          this.geolocation.active = false
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
      object.applyMatrix(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
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
    displaySuccessMessage (success, message, actions) {
      this.displaySuccessIcon = true
      Notification(message, (success ? 'rightAnswer' : 'wrongAnswer'), actions)
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
    * handle motion event (used by step 'locate-item-ar')
    */
    handleMotionEvent (event) {
      let dm = this.deviceMotion
      let object
      let canProcess = true // can this method be entierely run? is all required data available?
      
      // detect if device has gyroscope
      // inspired from https://stackoverflow.com/a/33843234/488666
      if (this.deviceHasGyroscope === null && !this.isIOs) {
        this.deviceHasGyroscope = ("rotationRate" in event && "alpha" in event.rotationRate && event.rotationRate.alpha !== null)
      }
      
      // save resources: do nothing with device motion while user GPS position is too far, or distance is unknown (first distance value must be computed by GPS)
      if (!this.deviceHasGyroscope || this.geolocation.distance === null || this.geolocation.GPSdistance === null || this.geolocation.GPSdistance > this.minDistanceForGPS || this.geolocation.absoluteOrientationSensor === null || !this.geolocation.absoluteOrientationSensor.quaternion || isNaN(this.geolocation.position.x) || isNaN(this.geolocation.position.y)) {
        canProcess = false
      }
      
      if (this.geolocation.target  && this.geolocation.target.scene) {
        object = this.geolocation.target.scene.getObjectByName('targetObject')
        canProcess = canProcess && typeof object !== 'undefined' && TWEEN.getAll().length === 0
      } else {
        canProcess = false
      }
      
      if (!canProcess) {
        dm.acceleration.avgData = { x: [], y: [], z: [] }
        dm.velocity = { x: 0, y: 0 }
        dm.dateLatestEvent = null
        return
      }
      
      let accel = event.acceleration
      let accelerationVector = new THREE.Vector3(accel.x, accel.y, accel.z)
      
      // "cancel" device rotation on acceleration vector
      let quaternion = new THREE.Quaternion().fromArray(this.geolocation.absoluteOrientationSensor.quaternion)
      accelerationVector.applyQuaternion(quaternion)
      
      dm.acceleration.raw = accelerationVector
      
      // save current time to calculate velocity & position at next motion event
      let currentTime = new Date()
      if (dm.dateLatestEvent !== null) {
        // get time difference in milliseconds
        let timeDiff = (currentTime.getTime() - dm.dateLatestEvent.getTime()) / 1000
        
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
        
        dm.isAccelerationIdle = (Math.pow(dm.acceleration.filtered.x, 2) + Math.pow(dm.acceleration.filtered.y, 2) + Math.pow(dm.acceleration.filtered.z, 2)) < 0.08
        
        // fix acceleration errors / inaccuracies:
        let accelBoost = 1.4 // when not idle & same sign as velocity
        let accelReduction = 0.3 // when acceleration sign & velocity sign are different (otherwise, velocity goes too much beyond the "other side" of 0)
        if (dm.velocity.x * dm.acceleration.filtered.x < 0) {
          dm.acceleration.filtered.x *= accelReduction
        } else if (!dm.isAccelerationIdle) {
          dm.acceleration.filtered.x *= accelBoost
        }
        if (dm.velocity.y * dm.acceleration.filtered.y < 0) {
          dm.acceleration.filtered.y *= accelReduction
        } else if (!dm.isAccelerationIdle) {
          dm.acceleration.filtered.y *= accelBoost
        }
        
        // get velocity from acceleration
        dm.velocity.x += dm.acceleration.filtered.x * timeDiff
        dm.velocity.y += dm.acceleration.filtered.y * timeDiff
        
        // we consider that the device is hand held by a person, so when acceleration is nearly idle, quickly decrease velocity to avoid position drifting
        if (dm.isAccelerationIdle) {
          dm.velocity.x *= 0.99 / Math.pow(dm.idleAccelerationCounter, 2)
          dm.velocity.y *= 0.99 / Math.pow(dm.idleAccelerationCounter, 2)
          dm.idleAccelerationCounter = Math.max(100, dm.idleAccelerationCounter + 1) // avoid too high values for the counter
        } else {
          dm.idleAccelerationCounter = 1
        }
        
        // normalize velocity under 5km/h to avoid excessive drift when walking for a long time
        let maxVelocity = 5 * 1000 / 3600 // in m/s
        let velocityVectorLength = Math.sqrt(Math.pow(dm.velocity.x, 2) + Math.pow(dm.velocity.y, 2))
        if (velocityVectorLength > maxVelocity) {
          dm.velocity.x = dm.velocity.x * maxVelocity / velocityVectorLength
          dm.velocity.y = dm.velocity.y * maxVelocity / velocityVectorLength
        }
        
        // get object position from velocity
        // relatively to the device, the position variations of the object to find are reversed (positive device velocity on an axis => negative position change of object on that axis, given that the objet is at a fixed position)
        let currentObjectPosition = { x: object.position.x, y: object.position.y }
        let deltaFromAccelerometer = {
          x: -dm.velocity.x * timeDiff,
          y: -dm.velocity.y * timeDiff
        }
        // if we are not in "idle" state, to avoid potential big object jumps in case GPS must be used again (object becomes too far), make a slight move towards the "real" GPS position at each "devicemotion" call
        let deltaFromGeolocation
        if (!dm.isAccelerationIdle) {
          deltaFromGeolocation = {
            // the "/ 600" factor guarantees that the object won't move faster than about 1.5m/s if its real position is 20m away from current position.
            x: (this.geolocation.position.x - currentObjectPosition.x) / 600,
            y: (this.geolocation.position.y - currentObjectPosition.y) / 600
          }
        } else {
          deltaFromGeolocation = { x: 0, y: 0 }
        }
        
        if (this.geolocation.GPSdistance <= this.minDistanceForGPS) {
          // update object position
          object.position.x = currentObjectPosition.x + deltaFromAccelerometer.x + deltaFromGeolocation.x
          object.position.y = currentObjectPosition.y + deltaFromAccelerometer.y + deltaFromGeolocation.y
          
          // update object distance shown to user
          this.geolocation.distance = Math.sqrt(Math.pow(object.position.x, 2) + Math.pow(object.position.y, 2))
          
          // update direction arrow angle
          this.geolocation.rawDirection = (utils.radiansToDegrees(-Math.atan2(object.position.y, object.position.x)) + 90) % 360
          
          this.updatePlayerCanTouchTarget()
        }
      }
      dm.dateLatestEvent = currentTime
    },
    /*
    * updates property this.geolocation.canTouchTarget, given this.geolocation.distance
    */
    updatePlayerCanTouchTarget () {
      // tell player to touch object + detect touch as soon as device is below a certain distance from the object coordinates
      if (!this.geolocation.canTouchTarget && this.geolocation.distance <= 10) {
        this.geolocation.canTouchTarget = true
      }
    },
    /**
     * Checks that property this.deviceHasGyroscope is either set to true or false
     * Otherwise, tries again until it becomes not null
     * @returns a promise
     */
    async waitForGyroscopeDetection () {
      var self = this
      return new Promise((resolve, reject) => {
        if (this.deviceHasGyroscope !== null) {
          resolve()
        } else {
          if (this.geolocation.gyroscopeDetectionCounter > 100) {
            resolve()
          } else {
            this.geolocation.gyroscopeDetectionCounter++
            utils.setTimeout(async () => {
              await self.waitForGyroscopeDetection()
              resolve()
            }, 250)
          }
        }
      })
    },
    /*
     * Enlarge the picture
     * @param   {string}    pictureUrl            picture URL
     */
    enlargeThePicture (index) {
      this.enlargePicture.show = true
      var pictureUrl = this.step.options.images[this.playerCode[index]].imagePath
      this.enlargePicture.url = (pictureUrl && pictureUrl.indexOf('blob:') !== -1) ? pictureUrl : this.serverUrl + '/upload/quest/' + this.step.questId + '/step/code-image/' + pictureUrl
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
    bluetoothScanResult: function(data) {
      console.log("Device discovered", data)
      console.log(this.step.options.deviceid)
      if (data.name === this.step.options.deviceid) {
        this.stopBluetoothScan()
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
  
  .text,
  .answers-text .q-btn {
    opacity: 0.9;
    background-color: #fff;
    padding: 0.5rem;
    margin: 0;
  }
  .text { 
    white-space: pre-wrap; 
    text-align: justify;
  }
  .text p { padding: 0.25rem 0; margin: 0; }
  .carrier-return {
    white-space: pre-wrap; 
    text-align: justify;
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
  
  .code-color .color-bubbles { margin-top: 5rem; display: flex; flex-flow: row nowrap; justify-content: center; position: relative; }
  .code-color .color-bubbles div { display: block; width: 4rem; height: 4rem; border: 4px solid black; border-radius: 2rem; margin: 0.3rem; transition: background-color 0.3s; }
  
  /* image code specific */
  .code-image { position: relative; }
  .code-image td { width: 20% }
  .code-image td img { width: 100% }
  .code-image td .q-icon { font-size: 2em }
  
  /* geolocation specific */
  .geolocation .text { margin-bottom: 0.5rem; }
  
  /* jigsaw puzzle specific */
  
  .puzzle {
    position: relative;
  }
  #pieces { 
    padding: 0; 
    margin: 0; 
    width: 100%; 
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
  .answer-text input { opacity: 0.7; font-family: arial; font-size: 1.5em; font-weight: bold; height: 1.5em; background-color: #fff; border-radius: 0.5rem; box-shadow: 0px 0px 0.1rem 0.1rem #fff;}
    
  /* new-item specific */
  
  .new-item .item { text-align: center; position: relative;}
  .new-item .item p span { font-size: 2rem; background-color: rgba(255, 255, 255, 0.5); border-radius: 8px; padding: 4px 8px; }
  
  /* locate-item-ar specific */
  
  .locate-item-ar { background: transparent; }
  .locate-item-ar video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .locate-item-ar .target-view { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
  .locate-item-ar #target-canvas { position: relative; width: 100%; height: 100%; z-index: 20; }
  .locate-item-ar .text { z-index: 50; position: relative; } /* positioning is required to have z-index working */
  .locate-item-ar img { margin: 30vw auto; } /* 2D result image */

  /* image-over-flow specific */
  
  .image-over-flow { background: transparent; padding: 0px !important; }
  .image-over-flow video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .image-over-flow .text { z-index: 5000; position: relative; } /* positioning is required to have z-index working */
  .image-over-flow .image { z-index: 50; position: relative; } /* positioning is required to have z-index working */
  
  /* locate-marker specific */
  
  .locate-marker { position: relative; }
  .locate-marker video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .locate-marker img.locate-marker-answer { width: 60vw; margin: 30vw auto; }
  .locate-marker .q-btn { margin-bottom: 17vw; margin-left: 4vw; z-index: 50; }
  .locate-marker .q-btn span { font-size: 36px; }
  
  /* memory specific */
  
  .memory {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    margin: 0 0 3em;
    list-style-type: none;
  }

  .memory .card {
    height: 20vw;
    width: 20vw;
    max-width: 60px;
    max-height: 60px;
    margin: 10px;
    background: url(/statics/icons/game/card-back.png) no-repeat;
    background-size: 100%;
    color: #ffffff;
    border-radius: 5px;
    border: 3px solid #07275A;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 5px 2px 20px 0 rgba(46, 61, 73, 0.5);
  }
  .memory .card img {
    width: 0;
    height: 0;
  }
  .memory .card.open img {
    transform: rotateY(0);
    cursor: default;
    animation-name: flipInY;
    -webkit-backface-visibility: visible !important;
    backface-visibility: visible !important;
    animation-duration: .75s;
  }
  .memory .card.show img {
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background: none;
  }
  .memory .card.disabled {
    pointer-events: none;
    opacity: 0.9;
  }

  .memory .card.match {
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
  }
  
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
  
  /* timer */
  .timer-progress-bar { height: 15px !important; padding: 0 !important; }
  .timer-progress-bar.with-camera-stream { top: 0; left: 0; width:100vw; z-index: 30; }
  .timer-progress-bar > .q-linear-progress__track, .timer-progress-bar > .q-linear-progress__model { all: reset; height: 15px !important; line-height: 15px !important; }
  
</style>
