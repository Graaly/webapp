<template>
  <div class="scroll" :class="(multiplayer.showScanner || shop.showScanner) ? 'bg-transparent' : 'background-dark'">
    <div v-if="multiplayer.showScanner">
      <!--====================== QR CODE READER FOR MULTIPLAYER =================================-->
      <div class="text-white bg-primary q-pt-xl q-pl-md q-pb-sm">
        <div class="float-right no-underline close-btn q-pa-sm" @click="closeMultiplayerQRCodeReader"><q-icon name="close" class="subtitle1" /></div>
        {{ $t('label.PassTheQRCodeInFrontOfYourCamera') }}
      </div>

      <qr-code-stream
        v-on:QrCodeResult="checkTeamCode"
      />
    </div>
    <div v-if="shop.showScanner">
      <!--====================== QR CODE READER FOR TIER PAIMENT =================================-->
      <div class="text-white bg-primary q-pt-xl q-pl-md q-pb-sm">
        <div class="float-right no-underline close-btn q-pa-sm" @click="closeTierPaymentQRCode"><q-icon name="close" class="subtitle1" /></div>
        {{ $t('label.PassTheQRCodeInFrontOfYourCamera') }}
      </div>

      <qr-code-stream
        v-on:QrCodeResult="checkTierPaymentCode"
      />
    </div>
    <div id="teaser" v-if="!shop.showScanner && !multiplayer.showScanner" class="reduce-window-size-desktop" :class="{'loaded': pageReady}">
      <!------------------ MAIN INFORMATION AREA ------------------------>
      
      <div v-if="(!quest || !quest.status) && !warning.questNotLoaded" class="centered q-pa-lg">
        {{ $t('label.Loading')}}
        <div class="q-pa-md">
          <q-btn @click="backToTheMap()" color="primary" class="glossy large-button">{{ $t('label.BackToTheMap') }}</q-btn>
        </div>
      </div>
      <div v-if="warning.questNotLoaded" class="centered q-pa-lg">
        {{ $t('label.QuestNeedNetwork')}}
        <div>
          <q-btn @click="initQuest()" color="primary" class="glossy large-button">{{ $t('label.ReloadQuest') }}</q-btn>
        </div>
      </div>
      <!-- =========================== PICTURE & AUTHOR ========================== -->
      <div v-if="quest && quest.status" class="relative-position image-banner">
        <div class="effect-kenburns limit-size-desktop" :style="'background: url(' + getBackgroundImage() + ' ) center center / cover no-repeat ;'"></div>
        <div class="q-py-sm q-px-md dark-banner fixed-top">
          <q-btn flat icon="arrow_back" @click="backToTheMap()" />
        </div>
        <div class="q-py-sm dark-banner absolute-bottom limit-size-desktop">
          <q-item clickable v-ripple @click="openProfile(quest.authorUserId)">
            <q-item-section side>
              <q-avatar size="50px" v-if="!quest.customization || !quest.customization.logo || quest.customization.logo === ''">
                <img v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.picture" :src="serverUrl + '/upload/profile/' + quest.author.picture" />
                <img v-if="typeof quest.author === 'undefined' || !quest.author || !quest.author.picture" src="statics/profiles/noprofile.png" />
              </q-avatar>
              <q-avatar size="50px" v-if="quest.customization && quest.customization.logo && quest.customization.logo !== ''">
                <img v-if="typeof quest.author !== 'undefined' && quest.author && quest.author.picture" :src="serverUrl + '/upload/quest/' + quest.customization.logo" />
              </q-avatar>
            </q-item-section>
            <q-item-section style="padding-right: 84px">
              <q-item-label class="subtitle5" v-if="(!quest.customization || !quest.customization.authorName || quest.customization.authorName === '') && typeof quest.author !== 'undefined' && quest.author && quest.author.name">{{ quest.author.name }}</q-item-label>
              <q-item-label class="subtitle5" v-if="quest.customization && quest.customization.authorName && quest.customization.authorName !== ''">{{ quest.customization.authorName }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div v-if="quest && quest.status" class="q-pa-md quest-description text-white" style="padding-bottom: -50px;">
        <div class="float-right quest-score" v-if="quest.availablePoints && quest.availablePoints.maxPts && (!quest.customization || !quest.customization.removeScoring)" @click="showRewards">
          <img src="statics/images/icon/point.png" />
          <div class="absolute">
            +{{ quest.availablePoints.maxPts }}
          </div>
        </div>
        <div class="bg-warning q-pa-sm" v-if="warning.lowBattery">
          <q-icon name="battery_alert" /> {{ $t('label.WarningLowBattery') }}
        </div>
        <div class="bg-warning q-pa-sm" v-if="warning.tooMuchUsers">
          <q-icon name="warning" /> {{ $t('label.TooMuchUsersCurrently') }}
        </div>
        <div v-if="quest.status !== 'published'" class="bg-primary centered q-pa-sm q-mb-md">
          {{ $t('label.' + (quest.type === 'quest' ? 'QuestDraftVersion' : 'PageDraftVersion')) }}
        </div>
        <!-- =========================== TITLE ========================== -->
        <div class="text-h5">
          {{ quest.title === "" ?  $t('label.NoTitle') : quest.title }} 
          &nbsp;<img v-if="getLanguage() !== $store.state.user.language" class="image-and-text-aligned" :src="'statics/icons/game/flag-' + getLanguage() + '.png'" />
        </div>
        <!-- =========================== PROPERTIES ========================== -->
        <div class="row q-pt-md text-subtitle1 properties-bar">
          <div class="q-mr-lg">
            <img src="statics/images/icon/difficulty.svg" class="medium-icon" />{{ $t('label.Difficulty' + quest.level) }}
          </div>
          <div v-if="quest.duration && quest.duration < 999" class="q-mr-lg">
            <img src="statics/images/icon/duration.svg" class="medium-icon" />
            <span v-if="quest.duration && quest.duration < 60">{{ quest.duration }}{{ $t('label.minutesSimplified') }}</span>
            <span v-if="quest.duration && quest.duration >= 60">{{ quest.duration / 60 }}{{ $t('label.hoursSimplified') }}</span>
          </div>
          <div v-if="quest.type === 'quest'" class="q-mr-lg">
            <span v-if="!quest.premiumPrice.tier && shop.premiumQuest.priceCode === 'free' && quest.type === 'quest'">
              <img src="statics/images/icon/cost.svg" class="medium-icon" />
              <span v-if="!shop.premiumQuest.alreadyPayed">{{ $t('label.Free') }}</span>
              <span v-if="shop.premiumQuest.alreadyPayed">{{ $t('label.AlreadyPaied') }}</span>
            </span>
            <span v-if="shop.premiumQuest.priceCode !== 'free' && quest.type === 'quest'">
              <img src="statics/images/icon/cost.svg" class="medium-icon" />
              <span>{{ shop.premiumQuest.priceValue === '0' ? ((quest.premiumPrice && quest.premiumPrice.prices && quest.premiumPrice.prices.fr) ? quest.premiumPrice.prices.fr : '...') : shop.premiumQuest.priceValue }}</span>
            </span>
          </div>
          <div>
            <q-rating v-if="quest.rating && quest.rating.rounded" readonly v-model="quest.rating.rounded" color="yellow-8" :max="5" size="0.8em" />
          </div>
        </div>
        <div v-if="quest.type === 'room' && quest.premiumPrice.manual">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span>{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>
        <div v-if="quest.premiumPrice.tier && quest.type === 'quest' && quest.premiumPrice.manual && shop.premiumQuest.priceCode === 'free'">
          <img src="statics/images/icon/cost.svg" class="medium-icon" />
          <span>{{ $t('label.FromPricePerPlayer', {price: quest.premiumPrice.manual}) }}</span>
        </div>
        
        <!-- =========================== LOCATION ========================== -->
        
        <div v-if="quest.location && quest.location.address" class="text-subtitle1 q-mt-sm quest-location" @click="goToLocationWithMaps(quest.location.coordinates[0],quest.location.coordinates[1])">
         <u> {{ quest.location.address }}</u> 
        </div>
        
        <!-- =========================== WARNING ========================== -->
        
        <div v-if="quest.warning" class="text-subtitle1 q-mt-sm quest-warning" @click="openWarningLink()">
          <q-icon color="secondary" name="warning" /> <u>{{ getTranslatedData(quest.warning) }}</u>
        </div>
        <div v-if="quest.playersNumber && quest.playersNumber > 1" class="text-subtitle1 q-mt-sm quest-warning">
          <q-icon color="secondary" name="group" /> {{ $t('label.YouNeedToBeXPlayers', {nb: quest.playersNumber}) }}
        </div>
        
        <!-- =========================== RANKING ========================== -->
        
        <div class="text-subtitle1 q-mt-sm quest-ranking">
          <a class="concertone" @click="$router.push('/user/ranking/ranking/' + quest.questId)">{{ $t('label.Ranking') }}</a>
        </div>
      </div>
      
      <!-- =========================== PLAY BUTTON ========================== -->
      <div class="quest-home-button">
        <div class="text-center q-pt-md">
          <p v-if="canReplay === 'yes'">
            <!--<q-btn-dropdown class="glossy large-btn" v-if="!(quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier)) && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && getAllLanguages().length > 1" color="primary" :label="$t('label.SolveThisQuest')">
              <q-list link>
                <q-item 
                  v-for="lang in getAllLanguages()" :key="lang.lang" 
                  v-show="lang.published" 
                  @click.native="playQuest(quest.questId, lang.lang)"
                >
                  <q-item-label>
                    <img style="vertical-align: middle; margin-left: 8px" :src="'statics/icons/game/flag-' + lang.lang + '.png'" />
                    {{ $t('language.' + lang.lang) }}
                  </q-item-label>
                </q-item>
              </q-list>
            </q-<btn-dropdown>-->
            <q-btn v-if="isQuestOpen.status && quest.type === 'quest' && !(quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier)) && !(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && getAllLanguages() && !isAdmin" @click="playQuest(quest.questId, getLanguage())" color="primary" class="glossy large-btn">
              <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
              <span v-if="!continueQuest && isRunFinished">{{ $t('label.SolveAgainThisQuest') }}</span>
              <span v-if="!continueQuest && !isRunFinished">{{ $t('label.SolveThisQuest') }}</span>
            </q-btn>
            <q-btn v-if="continueQuest" @click="restartGame" flat color="primary" class="q-mt-md large-btn">
              <span>{{ $t('label.SolveAgainThisQuest') }}</span>
            </q-btn>
            <q-btn v-if="quest.type === 'room' && quest.readMoreLink && quest.readMoreLink !== ''" @click="openReadMoreLink" color="primary" class="glossy large-btn">
              <span>{{ $t('label.Book') }}</span>
            </q-btn>
            <!--
            <button class="q-btn q-btn-item q-btn-rectange bg-primary" v-if="!(this.isUserTooFar && !quest.allowRemotePlay) && isRunPlayable && !(isOwner || isAdmin || isRunStarted || isRunFinished) && getAllLanguages() && getAllLanguages().length === 1" @click="playQuest(quest.questId, getLanguage())" color="primary">
              <span v-if="!continueQuest">{{ $t('label.SolveThisQuest') }}</span>
              <span v-if="continueQuest">{{ $t('label.ContinueTheQuest') }}</span>
              <br /><span v-if="quest.price && quest.price > 0">{{ quest.price }} <q-icon name="fas fa-bolt" /></span>
            </button>
            -->
            <q-btn v-if="isQuestOpen.status && !isRunPlayable && !(this.isUserTooFar && !quest.allowRemotePlay)" @click="buyCoins()" color="primary" class="glossy large-btn"><span>{{ $t('label.BuyCoinsToPlay') }}</span></q-btn>
            <q-btn v-if="isQuestOpen.status && this.isUserTooFar && !quest.allowRemotePlay" disabled color="primary" class="glossy large-btn"><span>{{ $t('label.GetCloserToStartingPoint') }} ({{ distance > 1000 ? (Math.round(distance / 1000)) + "km" : distance + "m" }})</span></q-btn>
            <q-btn
             v-if="isAdmin || (isQuestOpen.status && quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier) && shop.premiumQuest.priceCode !== 'notplayableonweb' && !(this.isUserTooFar && !quest.allowRemotePlay))"
              @click="playQuest(quest.questId, getLanguage())" 
              color="primary"
               class="glossy large-btn">
               <span>{{ $t('label.SolveThisQuest') }}</span>
               </q-btn>
            <q-btn 
              v-if="isQuestOpen.status && shop.premiumQuest.priceCode === 'notplayableonweb' && !isAdmin && !isOwner" 
              disabled 
              color="primary" 
              class="glossy large-btn">
              <span>{{ $t('label.QuestPlayableOnMobile') }}</span>
            </q-btn>
            <q-btn 
              v-if="isQuestOpen.status && shop.premiumQuest.priceCode === 'notplayableonweb' && (isAdmin || isOwner)" 
              @click="playQuest(quest.questId, getLanguage())"
              color="primary" 
              class="glossy large-btn">
              <span>{{ $t('label.TestYourQuest') }}</span>
            </q-btn>
            <span v-if="!isQuestOpen.status" >
              <q-btn 
                color="primary" 
                @click="isQuestOpen.displayHours = true"
                class="glossy large-btn">
                <span>{{ $t('label.OpeningHours') }}</span>
              </q-btn>
              <div>{{ $t('label.QuestIsNotPlayableNow') }}</div>
            </span>
          </p>
          <p v-if="canReplay !== 'yes'">
            <q-btn 
              v-if="canReplay === 'no'" 
              disabled 
              color="primary" 
              class="glossy large-btn">
              <span>{{ $t('label.YouCanNotPlayAgainThisGame') }}</span>
            </q-btn>
            <q-btn 
              v-if="canReplay === 'nottoday'" 
              disabled 
              color="primary" 
              class="glossy large-btn">
              <span>{{ $t('label.YouCanNotPlayAgainThisGameToday') }}</span>
            </q-btn>
          </p>
        </div>
      </div>

      <!------------------ GAME DESCRIPTION ------------------------>
      
      <div class="q-pa-md">
        <div class="text-subtitle1 arial" v-html="this.quest.description"></div>
        <div v-if="isUserTooFar && !quest.allowRemotePlay" class="q-pt-md">
          <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.QuestIsFarFromUser')" />
        </div>
      </div>
      <div v-if="isOwner || isAdmin" class="q-pa-md subtitle5 centered">
        <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.YouAreQuestOwnerDesc')" />
        &nbsp;<q-btn flat color="secondary" :label="$t('label.Modify')" @click="modifyQuest()" />
      </div>
      <div v-if="quest.type === 'room'" class="q-pa-md subtitle5">
        {{ $t('label.RoomDataWarning') }}
      </div>
      <div class="centered text-grey text-subtitle1 arial q-mt-xl q-mb-md">
        {{ $t('label.Version') + " " + quest.version }}
      </div>
      
      <!------------------ SNAPSHOTS ------------------------>
      
      <div v-if="quest.snapshots && quest.snapshots.length > 0">
        <div class="row">
          <div class="col-4 centered q-pa-sm" v-if="quest.snapshots.length > 0">
            <img style="width: 100%" :src="serverUrl + '/upload/quest/' + quest.questId + '/snapshot/' + quest.snapshots[0]" />
          </div>
          <div class="col-4 centered q-pa-sm" v-if="quest.snapshots.length > 1">
            <img style="width: 100%" :src="serverUrl + '/upload/quest/' + quest.questId + '/snapshot/' + quest.snapshots[1]" />
          </div>
          <div class="col-4 centered q-pa-sm" v-if="quest.snapshots.length > 2">
            <img style="width: 100%" :src="serverUrl + '/upload/quest/' + quest.questId + '/snapshot/' + quest.snapshots[2]" />
          </div>
        </div>
      </div>
    </div>
    
    <!------------------ LOADER AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom background-dark" v-show="showPreloaderPopup">
        <div class="reduce-window-size-desktop">
          <div class="centered q-pa-lg title2 text-primary background-lighter">
            <div class="q-pa-lg text-uppercase">{{ $t('label.InProgressPreparation') }}</div>
            <img src="statics/images/animation/map.gif" class="full-width q-mb-lg" />
          </div>
          <div class="centered" v-if="offline.show">
            <offlineLoader 
              :quest="this.quest"
              :design="'prepare'"
              :lang="getLanguage()"
              @end="showCalibrationAndStartQuest()">
            </offlineLoader>
          </div>
          <div>
            <div class="q-px-lg q-pb-lg q-pt-md centered subtitle2">
              {{ $t('label.Warnings') }}
            </div>
            <div class="q-pa-md subtitle5">
              <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.GeneralWarning')" />
            </div>
            <div v-if="isRunFinished" class="q-pa-md subtitle5">
              <q-icon color="secondary" name="warning" />&nbsp; <span v-html="$t('label.YouAlreadyDidThisQuest')" />
            </div>
          </div>
          <gpscalibration
            ref="gpscal"
            @end="startQuest(quest.questId, getLanguage())">
          </gpscalibration>
        </div>
      </div>
    </transition>
    
    <!------------------ MULTIPLAYER AREA ------------------------>
    
    <transition name="slideInBottom">
      <div class="panel-bottom background-dark" v-show="multiplayer.show">
        <div class="reduce-window-size-desktop">
          <div class="bottom-margin-for-keypad">
            <div class="q-pa-lg centered subtitle2">
              {{ $t('label.ThisIsAMultiplayerGame') }}
            </div>
            <div class="q-pa-md">
              <q-card class="my-card">
                <q-card-section class="bg-primary text-white centered text-uppercase">
                  <div class="text-h6">{{ $t('label.JoinATeam') }}</div>
                </q-card-section>
                <q-card-section class="bg-primary subtitle5 q-pa-md centered">
                  <q-btn class="glossy large-button text-primary bg-white" @click="scanMultiplayerQRCode"><span>{{ $t('label.ScanTheLeaderQRCode') }}</span></q-btn>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="centered">
              -
              <span>{{ $t('label.Or') }}</span>
              -
            </div>
            
            <div class="q-pa-md">
              <q-card class="my-card">
                <q-card-section class="bg-primary text-white centered text-uppercase">
                  <div class="text-h6">{{ $t('label.CreateATeam') }}</div>
                </q-card-section>
                <q-card-section class="bg-primary subtitle5 q-pa-md centered">
                  <div v-if="multiplayer.qrcode === ''" class="centered">
                    <q-input
                      dark
                      type="text"
                      :label="$t('label.TeamName')"
                      v-model="multiplayer.team"
                      bottom-slots
                      counter
                      maxlength="20"
                      />
                    <q-btn class="glossy large-button text-primary bg-white" @click="createTeam"><span>{{ $t('label.CreateTeam') }}</span></q-btn>
                  </div>
                  <div v-if="multiplayer.qrcode !== ''" class="centered">
                    <div>{{ $t('label.OtherPlayersMustScanThisQRCode') }}</div>
                    <div class="q-pa-md">
                      <img :src="serverUrl + '/upload/teams/' + multiplayer.qrcode + '.png'" />
                    </div>
                    <div><q-btn class="glossy large-button text-primary bg-white" @click="checkTeamAndStart"><span>{{ $t('label.MyTeamIsCompleteLetsGo') }}</span></q-btn></div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!--====================== SHOP PAGE =================================-->
    
    <transition name="slideInBottom">
      <div class="panel-bottom background-dark" v-show="shop.show">
        <div class="reduce-window-size-desktop">
          <a class="float-right no-underline close-btn" color="grey" @click="closeShop"><q-icon name="close" /></a>
          <div class="q-pa-lg centered subtitle2">
            {{ $t('label.BuyThisQuest') }}
          </div>
          <!--<div class="q-pa-md" v-if="quest.premiumPrice && quest.premiumPrice.tier && !isIOs">-->
          <div class="q-pa-md" v-if="quest.premiumPrice && quest.premiumPrice.tier">
            <q-card class="my-card">
              <q-card-section class="bg-primary text-white centered text-uppercase">
                <div class="text-h6">{{ $t('label.YouHaveReceivedAQrCodeFrom', {author: quest.author.name}) }}</div>
              </q-card-section>
              <q-card-section class="bg-primary subtitle5 q-pa-md centered">
                <q-btn class="glossy large-button text-primary bg-white" @click="scanTierPaymentQRCode"><span>{{ $t('label.ScanTheUniqueQRCode') }}</span></q-btn>
              </q-card-section>
            </q-card>
          </div>
          
          <!--<div class="centered" v-if="quest.premiumPrice && quest.premiumPrice.tier && quest.premiumPrice.active && !isIOs">-->
          <div class="centered" v-if="quest.premiumPrice && quest.premiumPrice.tier && quest.premiumPrice.active">
            -
            <span>{{ $t('label.Or') }}</span>
            -
          </div>
          
          <div class="q-pa-md" v-if="quest.premiumPrice && quest.premiumPrice.active">
            <q-card class="my-card">
              <q-card-section class="bg-primary text-white centered text-uppercase">
                <div class="text-h6">{{ $t('label.BuyInOneClick') }}</div>
              </q-card-section>
              <q-card-section class="bg-primary subtitle5 q-pa-md centered">
                <q-btn @click="buyQuest()" class="glossy large-button text-primary bg-white" v-if="quest.premiumPrice && (quest.premiumPrice.active || quest.premiumPrice.tier) && shop.premiumQuest.priceCode !== 'notplayableonweb' && !(this.isUserTooFar && !quest.allowRemotePlay)" :disabled="!shop.premiumQuest.buyable"><span>{{ $t('label.Buy') }} ({{ shop.premiumQuest.priceValue === '0' ? ((quest.premiumPrice && quest.premiumPrice.prices && quest.premiumPrice.prices.fr) ? quest.premiumPrice.prices.fr : '...') : shop.premiumQuest.priceValue }})</span></q-btn>
              </q-card-section>
            </q-card>
          </div>
          <div class="centered">
            <q-btn flat color="primary" @click="closeShop">{{ $t('label.Cancel') }}</q-btn>
          </div>
          <!--<shop></shop>-->
        </div>
      </div>
    </transition>
    
    <!------------------ REWARDS POPUP ------------------------>
    
    <q-dialog v-model="showRewardsPopup">
      <q-card>
        <q-card-section class="popup-header centered">
          {{ $t('label.ScoreAndBadges') }}
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
          <!--<div class="centered popup-over-header">
            <img src="statics/images/other/popup-rewards.svg" />
          </div>-->
        </q-card-section>

        <q-separator />
        
        <q-card-section class="subtitle5">
          {{ $t('label.OnThisEscapeGameYouCanWin') }}
          <ul>
            <li v-if="quest.availablePoints && quest.availablePoints.minPts && quest.availablePoints.maxPts">{{ $t('label.ScoreRange', {min: quest.availablePoints.minPts, max: quest.availablePoints.maxPts}) }}</li>
            <li v-if="quest.rewardPicture && quest.rewardPicture !== ''">{{ $t('label.OneBadge') }}</li>
          </ul>
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!------------------ OPENING HOURS POPUP ------------------------>
    
    <q-dialog v-model="isQuestOpen.displayHours">
      <q-card>
        <q-card-section class="popup-header centered">
          {{ $t('label.OpeningHours') }}
          <q-btn class="float-right" icon="close" flat round dense v-close-popup />
          <!--<div class="centered popup-over-header">
            <img src="statics/images/other/popup-rewards.svg" />
          </div>-->
        </q-card-section>

        <q-separator />
        
        <q-card-section class="subtitle5">
          <div v-if="quest.scheduling && quest.scheduling.length > 0">
            <div class="centered q-pb-md">{{ $t('label.SchedulingDescription') }}</div>
            <div class="row" v-for="(schedule, index) in quest.scheduling" :key="index">
              <div class="col">{{ $t('days.day' + index) }}</div>
              <div class="col">
                {{ $t('label.From') }} {{ schedule[0] }}h
              </div>
              <div class="col">
                {{ $t('label.To') }} {{ schedule[1] }}h
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="fixed-bottom over-map" v-if="!geolocationIsSupported">
      <div class="centered bg-warning q-pa-sm">
        <q-spinner-puff class="on-left" /> {{ $t('label.WarningNoLocation') }}
      </div>
    </div>
  </div>
</template>

<script>

import AuthService from 'services/AuthService'
import QuestService from 'services/QuestService'
import RunService from 'services/RunService'
import shop from 'components/shop'
import offlineLoader from 'components/offlineLoader'
import { openURL } from 'quasar'
import utils from 'src/includes/utils'
import Notification from 'boot/NotifyHelper'
import gpscalibration from 'components/gpsCalibration'
import debounce from 'lodash/debounce'
import qrCodeStream from "../../../components/qrCodeStream";

export default {
  components: {
    shop,
    qrCodeStream,
    offlineLoader,
    gpscalibration
  },
  data () {
    return {
      quest: {},
      ranking: {
        show: false,
        items: []
      },
      playStep: 0,
      shop: {
        show: false,
        showScanner: false,
        premiumQuest: {
          priceCode: 'free',
          priceValue: '0',
          buyable: false,
          alreadyPayed: false
        }
      },
      offline: {
        active: false,
        show: false
      },
      warning: {
        questNotLoaded: false,
        lowBattery: false,
        tooMuchUsers: false
      },
      serverUrl: process.env.SERVER_URL,
      isRunFinished: false,
      isRunStarted: false,
      isRunPlayable: true,
      isQuestOpen: {
        status: true,
        displayHours: false
      },
      isSharedWithPartners: false,
      isOwner: false,
      isAdmin: false,
      showRewardsPopup: false,
      showPreloaderPopup: false,
      multiplayer: {
        showScanner: false,
        show: false,
        team: '',
        qrcode: ''
      },
      geolocationIsSupported: navigator.geolocation,
      isUserTooFar: false,
      continueQuest: false,
      continueQuestId: "",
      canReplay: "yes",
      distanceFromStart: 0,
      pageReady: false,
      isHybrid: window.cordova,
      isIOs: utils.isIOS()
    }
  },
  async mounted() {
    utils.clearAllRunningProcesses()
    
    // check if battery is enough charged to play
    window.addEventListener("batterystatus", this.checkBattery, false);

    await this.initQuest()
    
    // reset user history
    this.$store.state.history = {items: [], index: 0}
    this.$store.commit('setNetworkMode', 'online')
    this.$store.commit('setForceOnline', false)
  },
  updated: debounce(function () {
    this.$nextTick(() => {
      this.pageReady = true
    })
  }, 250),
  methods: {
    /*
     * Check if the user is next to the starting point
     */
    checkUserIsCloseFromStartingPoint() {
      //check if location tracking is turned on
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          //compare quest starting point with user localisation (1km distance)
          if (this.quest.location && this.quest.location.coordinates && this.quest.location.coordinates.length > 1 && position.coords && position.coords.latitude) {
            this.distance = Math.round(utils.distanceInKmBetweenEarthCoordinates(this.quest.location.coordinates[1], this.quest.location.coordinates[0], position.coords.latitude, position.coords.longitude) * 1000) // meters
            if (this.distance > 50) {
              this.isUserTooFar = true
            }
          }
          // check again in 15 seconds
          utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 15000)
          this.geolocationIsSupported = true
        }, () => {
          this.geolocationIsSupported = false
          utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 5000)
        }, { timeout: 10000, maximumAge: 0 });
      } else {
        this.geolocationIsSupported = false
        utils.setTimeout(this.checkUserIsCloseFromStartingPoint, 5000)
      }
    },
    /*
     * Check if quest is currently closed
     */
    checkIfQuestIsOpened() {
      if (this.quest.scheduling && this.quest.scheduling.length > 0 && !this.isAdmin && !this.isOwner) {
        const today = new Date()
        const currentDay = today.getDay()
        if (this.quest.scheduling[currentDay] && this.quest.scheduling[currentDay].length === 2) {
          const currentHour = today.getHours()
          if (this.quest.scheduling[currentDay][0] <= currentHour &&  this.quest.scheduling[currentDay][1] > currentHour) {
            this.isQuestOpen.status = true
          } else {
            this.isQuestOpen.status = false
          }
        }
      }
    },
    /*
     * Init quest data
     */
    async initQuest() {
      // get quest information
      const response = await QuestService.getByIdOnline(this.$route.params.id)
      this.quest = response.data

      // update 'forceOnline' state property according to current quest
      this.$store.commit('setForceOnline', this.quest.hasOwnProperty('customization') && this.quest.customization.hasOwnProperty('forceOnline') ? this.quest.customization.forceOnline : false)
      
      // retrieve author detailed info
      if (typeof this.quest.authorUserId !== 'undefined') {
        let response = await AuthService.getAccount(this.quest.authorUserId)
        if (response && response.data) {
          this.$set(this.quest, 'author', response.data)
        }
      }
      
      // Fix EMA on 18/12/2019 - products in store remains if I open several paying quests
      if (window.cordova && this.quest.premiumPrice && this.quest.premiumPrice.androidId && store.products.length > 0) {
        this.$router.go(0)
      }
      
      // check if user is close from starting point
      this.checkUserIsCloseFromStartingPoint()
          
      // check user access rights
      if (this.$store.state.user.isAdmin) {
        this.isAdmin = true
      }
      // check if the user is one of the authors of the quest
      if (this.quest.editorsUserId) {
        for (var i = 0; i < this.quest.editorsUserId.length; i++) {
          if (this.quest.editorsUserId[i] === this.$store.state.user._id) {
            this.isOwner = true
          }
        }
      } else {
        if (this.$store.state.user._id === this.quest.authorUserId) {
          this.isOwner = true
        }
      }
      
      // check if quest is open (opening hours)
      this.checkIfQuestIsOpened()
      
      // if the user is the author => force network play
      if (this.isOwner || this.isAdmin) {
        this.$store.commit('setForceOnline', true)
      }
      
      // get user runs for this quest
      await this.getRun()
      
      // check if user can play this quest
      await this.checkUserCanPlay()
      
      // check if user must pay to play this quest
      await this.initPay()
      
      // get rankings this quest
      //await this.getRanking()
      
      // check number of simultaneous users
      await this.checkSimultaneousPlayers()
    },
    /**
     * Show the calibration gif (if the quest has at least one geolocationn (or AR) step)
     * then start the quest
     */
    showCalibrationAndStartQuest() {
      if (this.quest.hasGeolocationSteps) {
        this.$refs.gpscal.askUserToCalibrateGPS()
      } else {
        this.startQuest(this.quest.questId, this.getLanguage())
      }
    },
    /*
     * Get the connected user information about previous runs for this quest
     */
    async getRun() {
      // List all run for this quest for current user
      var runs = await RunService.listForAQuest(this.quest.questId)
      
      if (runs && runs.data && runs.data.length > 0) {
        for (var i = 0; i < runs.data.length; i++) {
          if (runs.data[i].status === 'finished') {
            this.isRunFinished = true
            // check if user can replay
            if (this.quest.customization && this.quest.customization.userReplay && this.quest.customization.userReplay === 'no') {
              this.canReplay = 'no'
            }
            if (this.quest.customization && this.quest.customization.userReplay && this.quest.customization.userReplay === 'onceaday') {
              let date = new Date()
              let dateCreated = new Date(runs.data[i].dateCreated)
              if (utils.getFullDate(dateCreated) === utils.getFullDate(date)) {
                this.canReplay = 'nottoday'
              }
            } 
          }
          if (runs.data[i].status === 'in-progress' && runs.data[i].currentStep) {
            this.isRunStarted = true
            this.continueQuestId = runs.data[i]._id;
          }
        }
        if (this.isRunStarted) {
          this.continueQuest = true
          // check if quest data are loaded offline
          let checkIfOfflineDataExists = await utils.checkIfFileExists(this.quest.questId, "quest_" + this.quest.questId + ".json")

          if (!this.isOwner && checkIfOfflineDataExists) {            
            this.startQuest(this.quest.questId, this.$route.params.lang)
          }
        }
      } else {
        // check if an offline run is already started
        let checkIfRunIsAlreadyStarted = await QuestService.isCached(this.quest.questId)   

        if (checkIfRunIsAlreadyStarted) {
          this.continueQuest = true
        }
      }
    },
    /*
     * Get number of simultaneous users
     */
    async checkSimultaneousPlayers() {
      if (this.quest.limitNumberOfPlayer) {
        const nbOfPlayers = await RunService.checkNumberOfPlayers(this.quest.questId)
        if (nbOfPlayers && nbOfPlayers.data && parseInt(nbOfPlayers.data, 10) >= this.quest.limitNumberOfPlayer) {
          this.warning.tooMuchUsers = true
        }
      }
      
      // remove run offline data
      await utils.writeInFile(this.quest.questId, 'run_' + this.quest.questId + '.json', JSON.stringify({}), false)
    },
    /*
     * Check battery level
     */
    checkBattery(status) {
      if (status.level < 50) {
        this.warning.lowBattery = true
      } else {
        this.warning.lowBattery = false
      }
    },
    /*
     * Check if user can play this quest
     */
    async checkUserCanPlay() {
      if (this.isRunStarted || this.isRunFinished) {
        return true
      }
      if (this.quest.price > this.$store.state.user.coins && !this.isAdmin && !this.isOwner) {
        this.isRunPlayable = false
        return false
      }
      return true
    },
    /*
     * Check if user must pay to play this quest
     */
    async initPay() {
      if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId) {
        return 'free'
      } 
      // if game is free
      if (!this.quest.premiumPrice.active) {
        return 'free'
      }
      // admin and owners do not pay
      /*if (this.isAdmin || this.isOwner) {
        return 'free'
      }*/
      // if game is already started or played, do not pay
      /*if (this.isRunStarted || this.isRunFinished) {
        return 'free'
      }*/
      // init Store pay
      //if (!window.store) {
      if (!window.cordova) {
        if (!this.isAdmin && !this.isOwner) {
          Notification(this.$t('label.YouMustPlayThisKindOfQuestOnAMobileDevice'), 'error')
        }
        this.shop.premiumQuest.priceCode = 'notplayableonweb'
        return
      }
      if (!this.quest.premiumPrice || !this.quest.premiumPrice.androidId) {
        Notification(this.$t('label.ErrorStandardMessage'), 'error')
        return
      }
      // check if player has already paied
      const isPayed = await QuestService.hasPayed(this.quest.questId)
      if (isPayed && isPayed.data && isPayed.data.status && isPayed.data.status === 'paied') {
        this.shop.premiumQuest.priceCode = 'free'
        this.shop.premiumQuest.alreadyPayed = true
        return "free"
      }
      this.shop.premiumQuest.priceCode = this.quest.premiumPrice.androidId
      
      store.register({
        id: this.quest.premiumPrice.androidId,
        alias: this.quest.premiumPrice.androidId,
        type: store.CONSUMABLE
      })

      store.error(function(error) {
        Notification(error.message + '(code: ' + error.code + ')', 'error')
      })

      store.when(this.quest.premiumPrice.androidId).updated(this.displayPrice)

      store.when(this.quest.premiumPrice.androidId).approved(function(product) {
        product.verify()
      });

      store.when(this.quest.premiumPrice.androidId).verified(async(product) => {
        // save the product purchase
        const purchaseStatus = await this.savePurchase(product)

        if (purchaseStatus) {
          product.finish()
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      });

      store.refresh()
    },
    displayPrice(product) {
      // check if product is orderable
      this.shop.premiumQuest.priceValue = product.price
      if (product.canPurchase) {
        this.shop.premiumQuest.buyable = true
      }
    },
    /*
     * Save a purchase
     */
    async savePurchase (product) {
      const purchaseStatus = await QuestService.purchasePremium(this.quest.questId, product)
      
      if (purchaseStatus && purchaseStatus.data && purchaseStatus.data.status && purchaseStatus.data.status === 'ok') {
        // activate play button
        this.playStep = 1
        this.playQuest(this.quest.questId, this.$route.params.lang)
        //this.shop.premiumQuest.priceCode = 'free'
        return true
      }
      return false
    },
    /*
     * Buy the quest
     */
    async buyQuest () {
      store.order(this.quest.premiumPrice.androidId)
    },
    /*
     * Add a new friend
     * MPA 2021-01-28 seems not used
    async addFriend(friendId) {
      this.$q.loading.show()
      var newFriend = await UserService.addFriend(friendId)
      this.$q.loading.hide()
      
      // hide add friend button for user concerned
      if (newFriend) {
        for (var i = 0; i < this.ranking.items.length; i++) {
          if (this.ranking.items[i].id === friendId) {
            this.ranking.items[i].isFriend = true
          }
        }
      }
    },*/
    /*
     * Sort based on the score
     * MPA 2021-01-28 seems not used
    compareScore(a, b) {
      if (a.score > b.score) {
        return -1
      }
      if (a.score < b.score) {
        return 1
      }
      return 0
    },*/
    /*
     * Get the default language for this quest
     * @param   {object}    quest            quest data
     */
    getLanguage(quest) {
      if (!quest) {
        quest = this.quest
      }
      // check that at least a language is set
      if (!quest.languages || quest.languages.length === 0) {
        return false
      }
      // get only published languages
      var publishedLanguages
      if (this.isOwner || this.isAdmin) {
        publishedLanguages = quest.languages
      } else {
        publishedLanguages = quest.languages.filter(language => language.published)
      }
      if (publishedLanguages && publishedLanguages.length > 0) {
        // check if the user language is set => default language
        var defaultLanguage = ''
        for (var i = 0; i < publishedLanguages.length; i++) {
          if (publishedLanguages[i].lang === this.$store.state.user.language) {
            defaultLanguage = this.$store.state.user.language
          }
        }
        if (defaultLanguage === '' && publishedLanguages.length > 0) {
          defaultLanguage = publishedLanguages[0].lang
        }
      } else if (quest.languages.length > 0) {
        defaultLanguage = quest.languages[0].lang
      }
      return defaultLanguage
    },
    /*
     * Return data translated based on default language
     * @param   {object}    data            object containing translated data
     */
    getTranslatedData(data) {
      let lang = this.getLanguage()
      if (data[lang]) {
        return data[lang]
      } else {
        this.quest.warning = null
        return ""
      }
    },
    /*
     * Open the warning link
     */
    openWarningLink() {
      if (this.quest && this.quest.warning && this.quest.warning.link) {
        utils.openExternalLink(this.quest.warning.link)
      }
    },
    /*
     * open in google maps
     */
    goToLocationWithMaps(lat, lon) {
      openURL(`https://maps.google.com/?daddr=${lon},${lat}`)
    },
    /*
     * Get all the published language for this quest
     * @param   {object}    quest            quest data
     */
    getAllLanguages(quest) {
      if (!quest) {
        quest = this.quest
      }
      // check that at least a language is set
      if (!quest || !quest.languages || quest.languages.length === 0) {
        return false
      }
      // get only published languages
      var publishedLanguages = quest.languages.filter(language => language.published)
      
      // when testing, no language published => Provide one
      if (publishedLanguages && publishedLanguages.length === 0 && quest.languages.length > 0) {
        publishedLanguages.push(quest.languages[0])
      }
      
      return publishedLanguages
    },
    /*
     * Restart the game
     */
    async restartGame() {
      var self = this
      this.$q.dialog({
        dark: true,
        message: this.$t('label.AreYouSureToRestartThisQuest'),
        ok: this.$t('label.Restart'),
        cancel: this.$t('label.Cancel')
      }).onOk(() => {
        self.cancelRun()
      }).onCancel(() => {
        // do nothing
      })
    },
    /*
     * Cancel a run
     */
    async cancelRun() {
      if (this.continueQuestId !== "") {
        await RunService.endRun(this.continueQuestId, null, this.quest.questId, this.quest.version, this.$route.params.lang)
      }
      // remove run offline data
      await utils.removeDirectory(this.quest.questId)
      //await this.removeQuestFromOfflineList(this.quest.questId)

      this.playQuest(this.quest.questId, this.$route.params.lang);
    },
    /*
     * Launch a quest
     * @param   {String}    questId            ID of the quest
     * @param   {String}    lang               lang of the quest
     */
    async playQuest(questId, lang) {
      //check if user must create his account
      if (this.quest.forcePlayerToHaveAccount && this.$store.state.user.name === '-') {
        this.$q.dialog({
          message: this.$t('label.YouNeedToCreateYourAccountToPlay'),
          ok: this.$t('label.Ok'),
          cancel: this.$t('label.Cancel')
        }).onOk(() => {
          this.$router.push('/profile/' + this.$store.state.user.id)
        }).onCancel(() => {
          return false
        })
        return false
      }
      if (this.quest.shareUserDataWithCreator && this.$store.state.user.name !== '-' && !this.isSharedWithPartners) {
        this.$q.dialog({
          message: this.$t('label.PartnerAskForYouData'),
          options: {
            type: 'checkbox',
            model: [],
            items: [
              { label: this.$t('label.ShareDataWithPartner'), value: 'ok' }
            ]
          },
          ok: this.$t('label.Ok'),
          cancel: this.$t('label.Cancel')
        }).onOk(data => {        
          if (data.length > 0 && data[0] === 'ok') {
            this.isSharedWithPartners = true
          }
          this.playQuestLaunch(questId, lang)
        }).onCancel(() => {
          return false
        })
      } else {
        await this.playQuestLaunch(questId, lang)
      }
    },
    /*
     * Launch a quest
     * @param   {String}    questId            ID of the quest
     * @param   {String}    lang               lang of the quest
     */
    async playQuestLaunch(questId, lang) {
      // check if offline data are existing
      //let checkIfOfflineDataExists = utils.checkIfFileExists(questId, "quest_" + questId + ".json")
      // Check if your must pay
      if (this.playStep === 0 && this.quest.premiumPrice && (this.quest.premiumPrice.tier || this.quest.premiumPrice.active) && !this.isAdmin && !this.isOwner && !this.isRunFinished && !this.isRunStarted) {
        // if tier paiement, check first that user has not already payed
        if (this.quest.premiumPrice.tier) {
          const isPayed = await QuestService.checkTierPayment(questId)
          if (isPayed.status === 200) {
            this.startPreloader()
          } else {
            this.shop.show = true
          }
        } else {
          // ask to pay only if quest is not free and not already purchased
          this.shop.show = true
        }
      } else if (this.playStep <= 1 && this.quest.playersNumber > 1 && !this.continueQuest) {
        this.shop.show = false
        this.multiplayer.show = true
      } else {
        this.startPreloader()
      }
    },
    startPreloader() {
      this.shop.show = false
      this.multiplayer.show = false
      this.showPreloaderPopup = true
      if (this.isHybrid && (!this.quest.customization || !this.quest.customization.forceOnline)) {
        this.offline.show = true
      } else {
        var _this = this;
        setTimeout(function() { 
         _this.showCalibrationAndStartQuest()
        }, 3000)
      }
    },
    /*
     * Open a user profile
     */
    openProfile(id) {
      this.$router.push('/profile/' + id)
    },
    /*
     * Scan a QR Code to join a team
     */
    scanMultiplayerQRCode() {
      this.multiplayer.showScanner = true
      this.multiplayer.show = false
      /*var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              if (result.text.indexOf('team_') === -1) {
                Notification(_this.$t('label.ThisIsNotATeamQRCodeValid'), 'error')
              } else {
                _this.checkTeamCode(result.text)
              }
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
      }*/
    },
    closeMultiplayerQRCodeReader() {
      this.multiplayer.showScanner = false
    },
    /*
     * Scan a QR Code to buy a quest using tier QR code
     */
    scanTierPaymentQRCode() {
      this.shop.showScanner = true
      this.shop.show = false
      /*var _this = this
      if (this.isHybrid) {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result && result.text) {
              _this.checkTierPaymentCode(result.text)
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
      }*/
    },
    closeTierPaymentQRCode() {
      this.shop.showScanner = false
    },
    /*
     * Check a team code
     */
    async checkTeamCode(code) {
      let res = await RunService.addTeamPlayer(code)
      if (res.status === 200) {
        this.playStep = 2
        this.playQuest(this.quest.questId, this.$route.params.lang)
      } else {
        Notification(this.$t('label.ErrorMessageForNewTeamMember'), 'error')
      }
    },
    /*
     * Check a tier payment code
     */
    async checkTierPaymentCode(code) {
      let res = await QuestService.useTierPaymentCode(this.quest.questId, code)
      if (res.status === 200) {
        this.playStep = 1
        this.playQuest(this.quest.questId, this.$route.params.lang)
      } else {
        Notification(this.$t('label.TechnicalIssueOrCodeAlreadyUsed'), 'error')
      }
    },
    /*
     * Create a team
     */
    async createTeam() {
      if (this.multiplayer.team && this.multiplayer.team !== '') {
        let res = await RunService.init(this.quest.questId, this.quest.version, this.$route.params.lang, this.isUserTooFar, this.multiplayer.team, this.isSharedWithPartners)
        if (res.status === 200 && res.data && res.data._id) {
          //Vue.set(this.multiplayer, qrcode, res.data._id)
          this.multiplayer.runId = res.data._id
          this.multiplayer.qrcode = res.data._id
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      } else {
        Notification(this.$t('label.PleaseEnterYourTeamName'), 'error')
      }
    },
    /*
     * Check that team is ready
     */
    async checkTeamAndStart() {
      let res = await RunService.checkTeamIsReady(this.multiplayer.runId)
      if (res.status === 200) {
        this.playStep = 2
        this.playQuest(this.quest.questId, this.$route.params.lang)
      } else {
        if (res.data && res.data.members && res.data.members.length > 0) {
          let members = res.data.members.join(', ')
          Notification(this.$t('label.YouNeedMoreMembersToPlay', {nb: this.quest.playersNumber, members: members}), 'warning')
        } else {
          Notification(this.$t('label.ErrorStandardMessage'), 'error')
        }
      }
    },
    
    /*
     * Open booking link
     */
    openReadMoreLink() {
      utils.openExternalLink(this.quest.readMoreLink)
    },
    startQuest(questId, lang) {
      this.$router.push('/quest/play/' + questId + '/version/' + this.quest.version + '/step/0/' + lang + '?remoteplay=' + this.isUserTooFar + '&sharepartner=' + this.isSharedWithPartners)
    },
    /*
     * Show rewards for this quest
     */
    showRewards () {
      this.showRewardsPopup = true
    },
    /*
     * Manage back to the map button
     */
    backToTheMap () {
      this.$router.push('/home')
      //this.$router.back()
    },
    /*
     * Manage back to the map button
     */
    modifyQuest () {
      this.$router.push('/quest/builder/' + this.quest.questId)
    },
    /*
     * Open shop
     *
    buyCoins () {
      this.shop.show = true
    },
    /*
     * Close shop
     */
    closeShop () {
      this.shop.show = false
    },
    /*
     * get background image
     */
    getBackgroundImage () {
      const currentLanguage = this.getLanguage()
      let picture
      if (this.quest.picture) {
        if (this.quest.picture[currentLanguage]) {
          picture = this.quest.picture[currentLanguage]
        } else if (this.quest.picture[this.quest.mainLanguage]) {
          picture = this.quest.picture[this.quest.mainLanguage]
        }
      }
      if (picture && picture[0] === '_') {
        return 'statics/images/quest/' + picture
      } else if (picture && picture.indexOf('blob:') !== -1) {
        return picture
      } else if (picture) {
        return this.serverUrl + '/upload/quest/' + picture
      } else {
        return 'statics/images/quest/default-quest-picture.jpg'
      }
    }
  }
}
</script>
<style>
#teaser .text-subtitle1 {
  white-space: pre-line;
}
</style>