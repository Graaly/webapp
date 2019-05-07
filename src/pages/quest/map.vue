<template>
  <div class="column" ref="div-column">
    
    <!--====================== MAP PAGE =================================-->
    
    <div class="row fullscreen" ref="map" v-if="!offline.active && user.position !== null">
      
      <gmap-map
        v-if="isMounted"
        :center="map.center"
        :zoom="map.zoom"
        map-type-id="roadmap"
        class="map"
        ref="mapRef"
        :options="{disableDefaultUI:true}"
        @center_changed="updateCenter($event)"
        @dragend="dragEnd($event)"
        @click="closeInfoWindows()"
      >
        <!-- quest markers -->
        <gmap-marker v-for="(quest, index) in questList" :key="quest._id" :position="{ lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }" :icon="setMapIcon(quest)" @click="openQuestSummary(quest, index)" />
        <!-- user markers -->
        <gmap-marker v-if="map.loaded" :position="{ lng: user.position.longitude, lat: user.position.latitude }" :icon="setMapIcon()" @click="openDiscoveryQuest()" />
        <!-- markers tooltips -->
        <gmap-info-window :options="map.infoWindow.options" :position="map.infoWindow.location" :opened="map.infoWindow.isOpen" @closeclick="map.infoWindow.isOpen=false">
          <div class="infoWindow" v-if="!this.$store.state.user.story || this.$store.state.user.story.step > 3">
            <p class="title" v-html="getQuestTitle(currentQuest, true)"></p>
            <p class="subtitle">
              <span v-if="currentQuest && currentQuest.level === 1">{{ $t('label.Easy') }}</span>
              <span v-if="currentQuest && currentQuest.level === 2">{{ $t('label.Normal') }}</span>
              <span v-if="currentQuest && currentQuest.level === 3">{{ $t('label.Hard') }}</span>
              <span v-if="currentQuest && currentQuest.level" class="text-blue-grey-2"> | </span>
              <span v-if="currentQuest && currentQuest.duration">{{ currentQuest.duration }} {{ $t('label.min') }}</span>
              <span v-if="currentQuest && currentQuest.duration" class="text-blue-grey-2"> | </span>
              <span v-if="currentQuest && currentQuest.availablePoints">{{ currentQuest.availablePoints }} {{ $t('label.pts') }}</span>
            </p>
            <q-btn v-if="currentQuest && currentQuest.authorUserId !== $store.state.user._id" @click="playQuest(currentQuest ? currentQuest.questId : '')" color="primary">{{ $t('label.Play') }}</q-btn>
            <q-btn v-if="currentQuest && currentQuest.authorUserId === $store.state.user._id" @click="modifyQuest(currentQuest ? currentQuest.questId : '')" color="primary">{{ $t('label.Modify') }}</q-btn>
            <div class="q-pa-md" v-if="offline.available && currentQuest && currentQuest.authorUserId !== $store.state.user._id && !offline.show"><a @click="downloadQuest(currentQuest)" color="primary">{{ $t('label.DownloadForOfflineUse') }}</a></div>
          </div>
          <div class="infoWindow" v-if="this.$store.state.user.story && this.$store.state.user.story.step <= 3">
            <p>{{ $t('label.ClickHereToStartDiscoveryQuest') }}</p>
            <q-btn @click="openDiscoveryQuest()" color="primary">{{ $t('label.Start') }}</q-btn>
          </div>
        </gmap-info-window>
      </gmap-map>
    </div>
    <div class="q-px-md" v-if="offline.active">
      <div class="search-from-map scroll">
        <div class="q-my-md">{{ $t('label.YouAreOfflineYourQuestsList') }}</div>
        <q-card v-for="(item, index) in questList" :key="index" class="q-mb-md" @click.native="$router.push('/quest/play/' + item.questId)">
          <q-img :src="item.picture">
            <div class="absolute-top text-center">
              {{ getQuestTitle(item, true) }}
              <q-rating slot="subtitle" v-if="item.rating && item.rating.rounded" v-model="item.rating.rounded" color="primary" :max="5" />
            </div>
          </q-img>
        </q-card>
      </div>
    </div>
    
    <!------------------ GEOLOCATION COMPONENT ------------------------>
    
    <geolocation ref="geolocation-component" @success="onNewUserPosition($event)" @error="onUserPositionError()" />
    
    <!------------------ SCORE AREA ------------------------>
    
    <div class="score-box q-mr-md" v-if="$store.state.user && !offline.active" @click="openRanking">
      <div class="q-px-md q-pt-md score-text centered" :class="{'bouncing': warnings.score}">{{ $store.state.user.score }}<!--<q-icon name="fas fa-trophy" />--></div>
      <div style="width: 100px">
        <div class="centered bg-primary text-white level-box" style="margin-bottom: 1px">{{ $t('label.Level') }} {{ $store.state.user.level }}</div>
        <q-linear-progress :value="profile.level.progress" stripe style="height: 6px" animate color="primary"></q-linear-progress>
      </div>
    </div>
    <!--<div class="coin-box">
      <div class="q-pa-md score-text">
        <q-icon name="fas fa-bolt" /> {{ $store.state.user.coins }} 
        <q-icon name="add_circle" v-if="$store.state.user.coins < 200" @click.native="buyCoins()" color="primary" />
      </div>
    </div>-->
    <div class="invitations-box" v-if="invitations.length > 0">
      <q-expansion-item
        expand-separator
        icon="email"
        :label="$t('label.YouHaveInvitations', {nb: invitations.length})"
        header-class="text-primary bg-white"
      >
        <q-list>
          <q-item clickable v-ripple class="bg-white" v-for="invitation in invitations" :key="invitation._id" @click="playQuest(invitation.questId)">
            <q-item-section>
              <q-item-label>{{ invitation.title.fr }}</q-item-label>
              <q-item-label caption>{{ invitation.author }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </div>
    
    <!--====================== SUCCESS PAGE =================================-->
    
    <q-drawer class="over-map" side="left" v-model="showSuccess" :width="innerWidth" test-id="quests-pane">
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs v-model="questsTab" class="bg-accent text-white">
        <q-tab name="built" icon="add_box" :label="$t('label.QuestsCreated')" />
        <q-tab name="played" icon="play_circle_filled" :label="$t('label.QuestsSuccessful')" />
      </q-tabs>
      
      <q-separator />
      
      <q-tab-panels v-model="questsTab" animated>
      
        <!------------------ LIST OF QUESTS BUILT TAB ------------------------>
        
        <q-tab-panel name="built">
        
          <!------------------ ADD A QUEST BUTTON AREA ------------------------>
          <div class="centered q-pa-md" v-if="success.quests.built.tovalidate && success.quests.built.tovalidate.length === 0 && success.quests.built.rejected.length === 0 && success.quests.built.published.length === 0 && success.quests.built.draft.length === 0 && !warnings.listCreatedQuestsMissing">
            {{ $t('label.NoQuestCreated') }}
          </div>            
          <q-btn link class="full-width" @click="$router.push('/quest/create/welcome')" color="secondary">{{ $t('label.CreateANewQuest') }}</q-btn>
          
          <!------------------ LIST OF QUESTS BUILT AREA ------------------------>
          
          <div class="centered bg-warning q-pa-sm" v-if="warnings.listCreatedQuestsMissing" @click="listCreatedQuests($store.state.user._id)">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>

          <q-list highlight v-if="success.quests.built.tovalidate && success.quests.built.tovalidate.length > 0">
            <q-item-label header>{{ $t('label.YourUnderValidationQuests') }}</q-item-label>
            <q-item v-for="quest in success.quests.built.tovalidate" :key="quest._id">
              <q-item-section avatar>
                <q-avatar>
                  <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getQuestTitle(quest, false) }} (v{{ quest.version }})</q-item-label>
                <q-item-label caption>
                  {{ $t('label.PublicationRequested') }} ...
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-list highlight v-if="success.quests.built.rejected && success.quests.built.rejected.length > 0">
            <q-item-label header>{{ $t('label.YourRejectedQuests') }}</q-item-label>
            <q-item v-for="quest in success.quests.built.rejected" :key="quest._id" @click.native="modifyQuest(quest.questId)">
              <q-item-section avatar>
                <q-avatar>
                  <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getQuestTitle(quest, false) }} (v{{ quest.version }})</q-item-label>
                <q-item-label caption style="color: #f00">
                  {{ $t('label.PublicationRejected') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-list highlight v-if="success.quests.built.draft && success.quests.built.draft.length > 0">
            <q-item-label header>{{ $t('label.YourDraftQuests') }}</q-item-label>
            <q-item v-for="quest in success.quests.built.draft" :key="quest._id" @click.native="modifyQuest(quest.questId)">
              <q-item-section avatar>
                <q-avatar>
                  <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getQuestTitle(quest, false) }} (v{{ quest.version }})</q-item-label>
                <q-item-label caption>
                  {{ $t('label.Unpublished') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-list highlight v-if="success.quests.built.published && success.quests.built.published.length > 0">
            <q-item-label header>{{ $t('label.YourPublishedQuests') }}</q-item-label>
            <q-item v-for="quest in success.quests.built.published" :key="quest._id" @click.native="modifyQuest(quest.questId)">
              <q-item-section avatar>
                <q-avatar>
                  <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getQuestTitle(quest, false) }} (v{{ quest.version }})</q-item-label>
                <q-item-label caption v-if="quest.status === 'published'">
                  <q-rating readonly v-if="quest.rating && quest.rating.rounded" v-model="quest.rating.rounded" color="primary" :max="5" size="1rem" />
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate($store.state.user.language)}}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="!success.quests.built.tovalidate && !warnings.listCreatedQuestsMissing">
            {{ $t('label.Loading') }}
          </div>
        </q-tab-panel>
        
        <!------------------ LIST OF QUESTS PLAYED TAB ------------------------>
        
        <q-tab-panel name="played">
          <div class="centered bg-warning q-pa-sm" v-if="warnings.listPlayedQuestsMissing" @click="listPlayedQuests($store.state.user._id)">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
          <q-list highlight v-if="success.quests.played && success.quests.played.length > 0">
          <q-item v-for="quest in success.quests.played" :key="quest._id" @click.native="playQuest(quest.questId)">
            <q-item-section avatar>
              <q-avatar>
                <img v-if="quest.questData && quest.questData.thumb" :src="((quest.questData.thumb && quest.questData.thumb[0] === '_') ? 'statics/images/quest/' + quest.questData.thumb : serverUrl + '/upload/quest/' + quest.questData.thumb)" />
                <img v-if="quest.questData && !quest.questData.thumb && quest.questData.picture" :src="((quest.questData.picture && quest.questData.picture[0] === '_') ? 'statics/images/quest/' + quest.questData.picture : serverUrl + '/upload/quest/' + quest.questData.picture)" />
                <img v-if="!quest.questData || (!quest.questData.picture && !quest.questData.thumb)" src="statics/profiles/noprofile.png" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ getQuestTitle(quest.questData, false) }} {{ quest.type }}</q-item-label>
              <q-item-label caption v-if="quest.dateCreated && quest.status == 'finished' && !quest.score">
                {{ $t('label.PlayedOn') }} {{quest.dateCreated | formatDate($store.state.user.language)}}
              </q-item-label>
              <q-item-label caption v-if="quest.dateCreated && quest.status == 'finished' && quest.score">
                {{ $t('label.Succeeded') }} {{quest.dateCreated | formatDate($store.state.user.language)}}
              </q-item-label>
              <q-item-label caption v-if="!quest.dateCreated">
                {{ $t('label.Succeeded') }}
              </q-item-label>
              <q-item-label caption v-if="quest.dateCreated && quest.status == 'finished' && quest.score">
                {{ $t('label.MyScore') }}: {{ quest.score }} <!--<q-icon name="fas fa-trophy" />-->
              </q-item-label>
              <q-item-label caption v-if="quest.status == 'in-progress'">
                {{ $t('label.ContinueThisQuest') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-item-label class="score" v-if="quest.status == 'finished' && (!quest.questData.type || quest.questData.type === 'quest')">
                <q-icon color="warning" name="fas fa-award" />
                <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="quest.stars > 1" />
                <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="quest.stars > 2" />
              </q-item-label>
              <q-item-label class="score" v-if="quest.questData.type && quest.questData.type !== 'quest'">{{ quest.reward }} <q-icon name="fas fa-bolt" /></q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="success.quests.played.length === 0 && !warnings.listPlayedQuestsMissing">
            <q-item-label>{{ $t('label.NoQuestPlayedLong') }}</q-item-label>
          </q-item>
        </q-list>
        </q-tab-panel>
        
      </q-tab-panels>

    </q-drawer>
    
    <!--====================== PROFILE PAGE =================================-->
    
    <q-drawer class="over-map" side="right" v-model="showProfile" :width="innerWidth" test-id="profile-pane">
    
      <!------------------ HEADER AREA ------------------------>
        
      <div class="header row">
        <div class="col-4">
          <div class="big-avatar">
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
            <div v-if="!$store.state.user.picture" :style="'background-image: url(statics/icons/game/profile-small.png); background-color: #fff;'"></div>
            <label for="picturefile" @click="$refs['uploadfile'].click()">{{ $t('label.Edit') }}</label>
            <input @change="uploadImage" ref="uploadfile" name="picturefile" id="picturefile" type="file" accept="image/*" hidden />
          </div>
        </div>
        <div class="col">
          <div class="title">{{ $store.state.user.name }}</div>
          <q-btn :label="$t('label.SignOut')" icon="power_settings_new" @click.native="disconnect()" flat test-id="btn-signout" />
        </div>
      </div>
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs v-model="profileTab" class="bg-accent text-white">
        <q-tab name="profile" icon="face" :label="$t('label.MyProfile')" />
        <q-tab name="friends" icon="supervised_user_circle" :label="$t('label.Friends')" />
        <q-tab name="news" icon="notifications" :label="$t('label.News')" />
        <q-tab name="pro" icon="store" :label="$t('label.Pro')" />
      </q-tabs>
      
      <q-separator />
      
      <q-tab-panels v-model="profileTab" animated>
      
        <!------------------ PROFILE TAB ------------------------>
        
        <q-tab-panel name="profile">
          <form @submit.prevent="submitProfileChanges()">
            <q-item>
              <q-item-section side top>
                <q-icon name="account_circle" class="left-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('label.EditYourInformations') }}</q-item-label>

                <q-input
                  v-model="profile.form.name"
                  :label="$t('label.YourName')"
                  placeholder="John Doe"
                  @focus="hideMenu()"
                  @blur="showMenu();$v.profile.form.name.$touch"
                  maxlength="30"
                  bottom-slots
                  :error="$v.profile.form.name.$error"
                  :error-message="$t('label.PleaseEnterYourName')"
                  />
                
                <q-input
                  v-if="profile.userCanChangeEmail"
                  v-model="profile.form.email"
                  :label="$t('label.YourEmail')"
                  :placeholder="$t('label.emailExample')"
                  @focus="hideMenu()"
                  @blur="showMenu();$v.profile.form.email.$touch"
                  bottom-slots
                  :error="$v.profile.form.email.$error"
                  :error-message="profile.form.email.required ? $t('label.PleaseEnterYourEmailAddress') : $t('label.PleaseEnterAValidEmailAddress')"
                  />
                
                <q-input
                  v-if="profile.userCanChangePhone"
                  v-model="profile.form.phone"
                  :label="$t('label.YourPhoneNumber')"
                  :placeholder="$t('label.phoneExample')"
                  @focus="hideMenu()"
                  @blur="showMenu();$v.profile.form.phone.$touch"
                  bottom-slots
                  :error="$v.profile.form.phone.$error"
                  :error-message="$t('label.InvalidPhoneNumber')"
                  />
                
                <q-select
                  :label="$t('label.YourCountry')"
                  v-model="profile.form.country"
                  :options="profile.countries"
                  emit-value
                  map-options
                  @focus="hideMenu()"
                  @blur="showMenu()"
                  bottom-slots
                  :error="$v.profile.form.country.$error"
                  :error-message="$t('label.PleaseSelectYourCountry')"
                  />
                
                <q-input
                  v-model="profile.form.zipCode"
                  :label="$t('label.YourZipCode')"
                  placeholder="38500"
                  @focus="hideMenu()"
                  @blur="showMenu()"
                  bottom-slots
                  :error="$v.profile.form.zipCode.$error"
                  :error-message="$t('label.PleaseEnterYourZipCode')"
                  />
                  
                <q-select :label="$t('label.YourLanguage')" v-model="profile.form.language" :options="languages" emit-value map-options @input="changeLanguage" @focus="hideMenu()" @blur="showMenu()" />
                
                <q-btn color="primary" class="full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
              </q-item-section>
            </q-item>
            
            <q-item v-if="profile.userCanChangePassword">
              <q-item-section side top>
                <q-icon name="lock" class="left-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('label.ChangeYourPassword') }}</q-item-label>
                
                <q-input type="password" v-model="profile.form.oldPassword" :label="$t('label.CurrentPassword')" @focus="hideMenu()" @blur="showMenu()" />
                
                <q-input type="password" v-model="profile.form.newPassword" :label="$t('label.NewPassword')" @focus="hideMenu()" @blur="showMenu()" />
                
                <q-btn color="primary" class="full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section side top>
                <q-icon name="help" class="left-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('label.Tutorial') }}</q-item-label>
                <q-btn class="q-my-md" color="primary" :label="$t('label.IWantToRestartTutorial')" @click="restartTutorial()" />
              </q-item-section>
            </q-item>
            
            <q-item>
              <q-item-section side top>
                <q-icon name="remove_circle" class="left-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('label.RemoveYourAccount') }}</q-item-label>
                <p>{{ $t('label.RemoveYourAccountDesc') }}</p>
                <q-btn class="q-my-md" color="primary" :label="$t('label.IConfirmIWantToRemoveMyAccount')" @click="removeAccount()" />
              </q-item-section>
            </q-item>
            
            <div class="centered" v-html="$t('label.TermsAndConditionsLink')"></div>
            <div class="centered q-mb-xl" v-html="$t('label.PrivacyPolicyLink')"></div>
          </form>
        </q-tab-panel>
        
        <!------------------ FRIENDS TAB ------------------------>
        
        <q-tab-panel name="friends">
          
          <!------------------ ADD FRIENDS BUTTON AREA ------------------------>
          <q-btn link class="full-width" @click="openAddFriendsModal()" color="secondary">{{ $t('label.AddFriends') }}</q-btn>
          
          <div class="centered bg-warning q-pa-sm" v-if="warnings.listFriendsMissing" @click="loadFriends">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
          <q-list highlight>
            <q-item v-for="friend in friends.list" :key="friend.friendId">
              <q-item-section avatar @click.native="openFriendCard(friend.friendId)">
                <q-avatar>
                  <img v-if="friend.picture && friend.picture !== '' && friend.picture.indexOf('http') !== -1" :src="friend.picture" />
                  <img v-if="friend.picture && friend.picture !== '' && friend.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + friend.picture" />
                  <img v-if="!friend.picture || friend.picture === ''" src="statics/icons/game/profile-small.png" />
                </q-avatar>
              </q-item-section>
              <q-item-section @click.native="openFriendCard(friend.friendId)">
                {{ friend.name }}
              </q-item-section>
              <q-item-section side>
                <q-btn icon="close" @click="removeFriend(friend.friendId)" />
              </q-item-section>
            </q-item>
            <q-item v-if="friends.list.length === 0 && !warnings.listFriendsMissing">
              <q-item-label>{{ $t('label.NoFriend') }}</q-item-label>
            </q-item>
          </q-list>
        </q-tab-panel>
        
        <!------------------ NEWS TAB ------------------------>
        
        <q-tab-panel name="news">
          <q-infinite-scroll @load="loadNews">
            <q-list highlight>
              <q-item v-for="(item, index) in friends.news.items" :key="item._id">
                <q-item-section avatar>
                  <q-avatar>
                    <img v-if="item.data.picture && item.data.picture.indexOf('http') !== -1" :src="item.data.picture" />
                    <img v-if="item.data.picture && item.data.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + item.data.picture" />
                    <img v-if="!item.data.picture" src="statics/icons/game/profile-small.png" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label v-if="item.data && item.data.userId"><strong>{{ item.data.name }}</strong></q-item-label>
                  <q-item-label v-if="item.type === 'standard'">
                    {{ item.title }}
                  </q-item-label>
                  <q-item-label v-if="item.type !== 'standard'">
                    <span v-html="$t('news.' + item.type, item.data)"></span>
                    <span v-if="item.type === 'challengeWon'">{{ $t('challenge.' + item.data.name) }}</span>
                  </q-item-label>
                  <q-item-label caption>
                    <span v-if="item.data.stars">
                      <q-icon color="warning" name="fas fa-award" />
                      <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="item.data.stars > 1" />
                      <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="item.data.stars > 2" />
                    </span>
                    {{item.creation.date | formatDate($store.state.user.language)}}
                    <span v-if="item.destination === 'friends'">
                      - 
                      <a style="color: #000" v-if="!isLiked(item)" v-on:click="like(index)">{{ $t('label.Like') }}</a>
                      <a v-if="isLiked(item)" v-on:click="unlike(index)">{{ $t('label.Like') }}</a>
                      <span v-if="item.likes.length > 0">({{ item.likes.length }})</span>
                    </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="friends.news.items.length === 0">
                <q-item-label>{{ $t('label.NoNews') }}</q-item-label>
              </q-item>
            </q-list>
            <div slot="message" class="row justify-center" style="margin-bottom: 50px;">
              <q-spinner-dots :size="5" />
            </div>
          </q-infinite-scroll>
        </q-tab-panel>
        
        <!------------------ PRO TAB ------------------------>
        
        <q-tab-panel name="pro">
          <div v-if="!pro.showContact">
            <q-card class="q-mb-md" @click.native="pro.showContact = true">
              <q-img src="statics/icons/game/storekeeper.jpg">
                <div class="absolute-bottom">
                  <div class="text-h6">{{ $t('label.Storekeeper') }}</div>
                  <div class="text-subtitle2">{{ $t('label.StorekeeperDesc') }}</div>
                </div>
              </q-img>
            </q-card>
            
            <q-card @click.native="pro.showContact = true">
              <q-img src="statics/icons/game/tourism.jpg">
                <div class="absolute-bottom">
                  <div class="text-h6">{{ $t('label.TourismProfessional') }}</div>
                  <div class="text-subtitle2">{{ $t('label.TourismProfessionalDesc') }}</div>
                </div>
              </q-img>
            </q-card>
          </div>
          <div v-if="pro.showContact">
            <span v-html="$t('label.contactUsPro')" />
          </div>
        </q-tab-panel>
        
      </q-tab-panels>

    </q-drawer>
    
    <!--====================== SEARCH PAGE =================================-->
    
    <q-dialog v-model="showSearch" full-width full-height>
      <div class="column search-from-map" ref="div-column">
        <div>
          <q-input
            class="q-pa-md"
            v-model="search.text"
            debounce="500"
            :placeholder="$t('label.Search')"
            @input="findQuests()"
          >
            <template v-slot:append>
              <q-icon name="close" @click="closeSearch()" />
            </template>
          </q-input>
        </div>
        
        <q-card v-for="item in search.quests" :key="item._id" class="q-ma-sm" @click.native="$router.push(item.authorUserId === $store.state.user._id ? '/quest/builder/' + item.questId : '/quest/play/' + item.questId)">
          <q-img :src="serverUrl + '/upload/quest/' + item.picture">
            <div class="absolute-top text-center">
              {{ getQuestTitle(item, true) }}
              <q-rating slot="subtitle" v-if="item.rating && item.rating.rounded" v-model="item.rating.rounded" color="primary" :max="5" />
              <span slot="right" class="row items-center text-white" v-if="item.distance && item.distance > 0 && item.distance <= 99">
                <q-icon color="white" name="place" /> {{ item.distance }} {{ $t('label.km') }}
              </span>
              <span slot="right" class="row items-center text-white" v-if="item.distance === 0">
                <q-icon color="white" name="place" /> &lt;1 {{ $t('label.km') }}
              </span>
              <span slot="right" class="row items-center text-white" v-if="item.distance > 99">
                <q-icon color="white" name="place" /> &gt;99 {{ $t('label.km') }}
              </span>
            </div>
          </q-img>
        </q-card>
        <q-item v-show="search.text.length > 0 && search.quests.length == 0" @click.native="$router.push('/quest/create')">
          <q-item-section avatar>
            <q-icon name="explore" size="2rem" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t('label.NoQuestForThisSearch') }}</q-item-label>
            <q-item-label caption>
              <a @click="$router.push('/quest/create')">{{ $t('label.WhyDontYouCreateAQuest') }}</a>
            </q-item-label>
          </q-item-section>
        </q-item>
        
      </div>
    </q-dialog>
    
    <!--====================== FRIEND PAGE =================================-->
    
    <q-dialog v-model="friends.show" class="over-map">
       <div class="panel-bottom q-pa-md">
        <a class="float-right no-underline close-btn" color="grey" @click="friends.show = false"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ friends.selected.name }}</h1>
        <q-tabs v-model="friendsTab" class="bg-accent text-white">
          <!--<q-tab name="friendranking" icon="star" :label="$t('label.Ranking')" default />-->
          <q-tab name="friendbuilt" icon="add_box" :label="$t('label.QuestsCreated')" default />
          <q-tab name="friendplayed" icon="play_circle_filled" :label="$t('label.QuestsSuccessful')" />
        </q-tabs>
        
        <q-separator />
        
        <q-tab-panels v-model="friendsTab" animated>
        
          <q-tab-panel name="friendranking">  
          </q-tab-panel>
          
          <q-tab-panel name="friendbuilt">
            <q-list highlight>
              <q-item v-for="quest in friends.selected.built" :key="quest._id" @click.native="playQuest(quest.questId)">
                <q-item-section v-if="quest.picture" avatar><img :src="serverUrl + '/upload/quest/' + quest.picture" /></q-item-section>
                <q-item-section v-if="!quest.picture" avatar><img src="statics/profiles/noprofile.png" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ getQuestTitle(quest, false) }}</q-item-label>
                  <q-item-label caption v-if="quest.status === 'published'">
                    <q-rating readonly v-if="quest.rating && quest.rating.rounded" v-model="quest.rating.rounded" color="primary" :max="5" size="1rem" />
                    {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate($store.state.user.language)}}
                  </q-item-label>
                  
                  <q-item-label caption v-if="quest.status == 'unpublished'">
                    {{ $t('label.Unpublished') }}
                  </q-item-label>
                  <q-item-label caption v-if="quest.status == 'tovalidate'">
                    {{ $t('label.PublicationRequested') }} ...
                  </q-item-label>
                  <q-item-label caption v-if="quest.status == 'rejected'" style="color: #f00">
                    {{ $t('label.PublicationRejected') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="friends.selected.built.length === 0">
                <q-item-label>{{ $t('label.NoQuestCreated') }}</q-item-label>
              </q-item>
            </q-list>
          </q-tab-panel>
          
          <q-tab-panel name="friendplayed">
            <q-list highlight v-if="friends.selected.played && friends.selected.played.length > 0">
              <q-item v-for="quest in friends.selected.played" :key="quest._id" @click.native="playQuest(quest.questId)">
                <q-item-section v-if="quest.questData && quest.questData.picture"><img :src="((quest.questData.picture && quest.questData.picture[0] === '_') ? 'statics/images/quest/' + quest.questData.picture : serverUrl + '/upload/quest/' + quest.questData.picture)" /></q-item-section>
                <q-item-section v-if="!quest.questData || !quest.questData.picture"><img src="statics/profiles/noprofile.png" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ getQuestTitle(quest.questData, false) }} {{ quest.type }}</q-item-label>
                  <q-item-label caption v-if="!quest.dateCreated">
                    {{ $t('label.Succeeded') }}
                  </q-item-label>
                  <q-item-label caption v-if="quest.score">
                    {{ $t('label.Score') }}: {{ quest.score }} <!--<q-icon name="fas fa-trophy" />-->
                  </q-item-label>
                </q-item-section>
                <q-item-section side class="score" v-if="!quest.questData.type || quest.questData.type === 'quest'">
                  <q-icon color="warning" name="fas fa-award" />
                  <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="quest.stars > 1" />
                  <q-icon color="warning" class="q-ml-xs" name="fas fa-award" v-if="quest.stars > 2" />
                </q-item-section>
                <q-item-section side class="score" v-if="quest.questData.type && quest.questData.type !== 'quest'">
                  {{ quest.reward }} <q-icon name="fas fa-bolt" />
                </q-item-section>
              </q-item>
              <q-item v-if="friends.selected.played.length === 0">
                <q-item-label>{{ $t('label.NoQuestPlayed') }}</q-item-label>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-dialog>
    
    <!--====================== ADD FRIEND PAGE =================================-->
    
    <q-dialog v-model="friends.new.show" class="over-map">
      <q-card>
        <q-card-section class="row items-center">
          <h1 class="size-3 q-pl-md">{{ $t('label.AddFriends') }}</h1>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeAddFriends" />
        </q-card-section>
        
        <q-card-section>
          <newfriend :load="friends.new.show" @close="closeAddFriends" @friendadded="updateFriendsActivity"></newfriend>
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!--====================== SHOP PAGE =================================-->
    
    <q-dialog v-model="shop.show" class="over-map">
      <a class="float-right no-underline close-btn" color="grey" @click="closeShop"><q-icon name="close" class="medium-icon" /></a>
      <h1 class="size-3 q-pl-md">{{ $t('label.Shop') }}</h1>
      <shop @close="closeShop"></shop>
    </q-dialog>
    
    <!--====================== RANKING PAGE =================================-->
    
    <q-dialog maximized v-model="ranking.show" class="over-map">
      <q-card>
        <q-card-section class="row items-center">
          <h1 class="size-3 q-pl-md">{{ $t('label.YourRanking') }}</h1>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeRanking" />
        </q-card-section>
        <q-card-section class="centered bg-warning q-pa-sm" v-if="warnings.rankingMissing" @click="getRanking">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item-label header>{{ $t("label.Level") }}</q-item-label>
            <q-item multiline>
              <q-item-section avatar><q-icon name="trending_up" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('label.MyLevel') }}: {{ $store.state.user.level }}</q-item-label>
                <q-linear-progress class="q-my-sm" rounded :value="profile.level.progress" color="primary" style="height: 18px;" />
                <q-item-label caption>{{ $t('label.ReachScoreOf', {score: profile.level.max}) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-list v-if="$store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings">
            <q-item-label header>{{ $t("label.Rankings") }}</q-item-label>
            <q-item>
              <q-item-section avatar><q-icon name="public" color="primary" /></q-item-section>
              <q-item-label>
                {{ $t('label.YourWorldRanking') }} : 
                <span v-if="$store.state.user.statistics.rankings.world">{{ $store.state.user.statistics.rankings.world }}</span>
                <span v-if="!$store.state.user.statistics.rankings.world">{{ $t('label.AvailableTomorrow') }}</span>
              </q-item-label>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="home" color="primary" /></q-item-section>
              <q-item-label>
                {{ $t('label.YourCityRanking') }} :
                <span v-if="$store.state.user.statistics.rankings.town">{{ $store.state.user.statistics.rankings.town }}</span>
                <span v-if="!$store.state.user.statistics.rankings.town">{{ $t('label.AvailableTomorrow') }}</span>
                </q-item-label>
            </q-item>
          </q-list>
          <q-list v-if="success.ranking && success.ranking.length > 0">
            <q-item-label header>{{ $t("label.TerritoriesWon") }}</q-item-label>
            <q-item v-for="(item, index) in success.ranking" :key="index">
              <q-item-section avatar>
                <q-icon v-if="item.playedNb < item.totalNb" name="flag" size="2rem" color="grey" />
                <q-icon v-if="item.playedNb >= item.totalNb" name="flag" size="2rem" color="primary" />
              </q-item-section>
              <q-item-label>
                {{ item.town }}
                <q-linear-progress class="q-mt-sm" v-if="item.playedNb < item.totalNb" :value="item.playedNb / item.totalNb" color="primary" style="height: 10px;" />
              </q-item-label>
            </q-item>
            <q-item>
            {{ $t("label.PlayAllQuestsInACityToWin") }}
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-if="!($store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings) && !(success.ranking && success.ranking.length > 0)">
          {{ $t("label.NoRankingYet") }}
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!--====================== BOTTOM BAR =================================-->
    
    <div class="fixed-bottom over-map" v-if="menu.show && !offline.active">
      <div class="menu-background"></div>
      <div class="menu row" v-touch-swipe.horizontal="swipeMenu">
        <div class="col-4 centered" @click="openSuccessPage()" test-id="btn-quests-pane">
          <q-btn icon="playlist_add_check" round color="primary" :class="{'bouncing': warnings.questButton}" />
        </div>
        <div class="col-4 centered" @click="openBottomMenu()" test-id="btn-bottom-menu">
          <img src="statics/icons/game/menu-main.png" :class="{'bouncing': warnings.mainButton}" />
        </div>
        <div class="col-4 centered" @click="openProfilePage()" test-id="btn-profile-pane">
          <q-btn icon="group" round color="primary" :class="{'bouncing': warnings.networkButton}" />
          <!--<div class="mid-avatar">
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
            <div v-if="!$store.state.user.picture" :style="'background-image: url(statics/icons/game/profile-small.png);background-color: #fff;'"></div>
          </div>-->
        </div>
      </div>
      <div class="centered bg-warning q-pa-sm" v-if="warnings.noLocation">
        <q-spinner-puff class="on-left" /> {{ $t('label.WarningNoLocation') }}
      </div>
      <div class="centered bg-warning q-pa-sm" v-if="warnings.lowBattery">
        <q-icon name="battery_alert" /> {{ $t('label.WarningLowBattery') }}
      </div>
      <div v-if="warnings.noNetwork || warnings.noServerReponse">
        <div class="centered bg-warning q-pa-sm" v-if="warnings.noNetwork">
          <q-spinner-radio class="on-left" /> {{ $t('label.WarningNoNetwork') }}
        </div>
        <div class="centered bg-warning q-pa-sm" v-if="!warnings.noNetwork && warnings.noServerReponse" @click="reloadMap">
          <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
        </div>
      </div>
      <div v-if="offline.show">
        <offlineLoader :quest="offline.quest" :design="'download'" @end="offline.show = false"></offlineLoader>
      </div>
    </div>
    
    <!--====================== BOTTOM MENU =================================-->
    
    <q-dialog v-model="showBottomMenu" position="bottom" test-id="bottom-menu">
      <q-list class="bg-white">
        <q-item @click.native="centerOnUserPosition()">
          <q-item-section avatar>
            <q-icon color="primary" name="gps_fixed" />
          </q-item-section>
          <q-item-section>{{ $t('label.CenterOnYourPosition') }}</q-item-section>
        </q-item>
        
        <q-item @click.native="$router.push('/quest/create')" test-id="btn-create-quest">
          <q-item-section avatar>
            <q-icon color="primary" name="add_location" />
          </q-item-section>
          <q-item-section>{{ $t('label.BuildAQuestHere') }}</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item @click.native="getQuests('all')" v-if="map.filter === 'best' || map.filter === 'easy'">
          <q-item-section avatar>
            <q-icon color="primary" name="place" />
          </q-item-section>
          <q-item-section>{{ $t('label.DisplayAllQuests') }}</q-item-section>
        </q-item>
        
        <q-item @click.native="getQuests('best')" v-if="map.filter !== 'best'">
          <q-item-section avatar>
            <q-icon color="primary" name="favorite" />
          </q-item-section>
          <q-item-section>{{ $t('label.BestQuests') }}</q-item-section>
        </q-item>
        
        <q-item @click.native="getQuests('easy')" v-if="map.filter !== 'easy'">
          <q-item-section avatar>
            <q-icon color="primary" name="child_care" />
          </q-item-section>
          <q-item-section>{{ $t('label.OnlyEasy') }}</q-item-section>
        </q-item>
        
        <q-item @click.native="openSearch()">
          <q-item-section avatar>
            <q-icon color="primary" name="search" />
          </q-item-section>
          <q-item-section>{{ $t('label.SearchForAQuest') }}</q-item-section>
        </q-item>
        
        <q-item @click.native="openAdminPage()" v-if="$store.state.user.isAdmin">
          <q-item-section avatar>
            <q-icon color="primary" name="settings" />
          </q-item-section>
          <q-item-section>{{ $t('label.Administrate') }}</q-item-section>
        </q-item>
      </q-list>
    </q-dialog>
    
    <!--====================== STORY =================================-->
    
    <div class="fixed-bottom story-container fit" v-if="story.step !== null">
      <story :step="story.step" :data="story.data" @next="endStory"></story>
    </div>
       
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import AuthService from 'services/AuthService'
import UserService from 'services/UserService'

import geolocation from 'components/geolocation'
import newfriend from 'components/newfriend'
import shop from 'components/shop'
import story from 'components/story'
import offlineLoader from 'components/offlineLoader'

import utils from 'src/includes/utils'
import { required, email } from 'vuelidate/lib/validators'
import checkPhone from 'boot/CheckPhone'
import { QSpinnerDots, QInfiniteScroll } from 'quasar'
import { gmapApi } from 'vue2-google-maps'

import Notification from 'boot/NotifyHelper'
import LevelCompute from 'boot/LevelCompute'

import questLevels from 'data/questLevels.json'
import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'
import languages from 'data/languages.json'

export default {
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    geolocation,
    newfriend,
    shop,
    story,
    offlineLoader
  },
  data () {
    return {
      map: {
        filter: 'all',
        zoom: 14,
        center: { lat: 0, lng: 0 },
        centerTmp: { lat: 0, lng: 0 },
        // for smooth 'panTo()' transition between marker clicks
        pan: {
          path: [],
          queue: [],
          steps: 20,
          duration: 700 // in milliseconds
        },
        infoWindow: {
          content: '',
          location: { lat: 0, lng: 0 },
          isOpen: false,
          options: { pixelOffset: { width: 0, height: -35 } }
        },
        loaded: false
      },
      search: {
        quests: [],
        text: ''
      },
      user: {
        position: null
      },
      friends: {
        list: [],
        news: {
          limit: 20,
          skip: 0,
          items: []
        },
        show: false,
        selected: {
          name: '',
          played: [],
          built: []
        },
        new: {
          show: false
        }
      },
      shop: {
        show: false
      },
      pro: {
        showContact: false
      },
      currentQuestIndex: null,
      currentQuest: null,
      searchText: '',
      questList: [],
      serverUrl: process.env.SERVER_URL,
      showSuccess: false,
      showProfile: false,
      showSearch: false,
      showBottomMenu: false,
      menu: {
        show: true
      },
      warnings: {
        lowBattery: false,
        noLocation: false,
        noNetwork: false,
        noServerReponse: false,
        rankingMissing: false,
        listCreatedQuestsMissing: false,
        listPlayedQuestsMissing: false,
        listFriendsMissing: false,
        score: false,
        questButton: false,
        networkButton: false,
        mainButton: false
      },
      success: {
        quests: {
          played: [],
          built: {}
        },
        ranking: []
      },
      profile: {
        level: {},
        progress: 0.1,
        form: {
          name: "--", 
          picture: "", 
          email: "", 
          phone: "",
          zipCode: "", 
          country: "", 
          oldPassword: "", 
          newPassword: "", 
          language: "en"
        },
        countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
        userCanChangeEmail: true,
        userCanChangePhone: true,
        userCanChangePassword: true
      },
      story: {
        step: null,
        data: null
      },
      offline: {
        available: window.cordova,
        show: false,
        active: false,
        quest: null
      },
      ranking: {
        show: false
      },
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      isMounted: false,
      innerWidth: window.innerWidth,
      questsTab: "built",
      profileTab: "news",
      friendsTab: "friendbuilt",
      invitations: []
    }
  },
  computed: {
    google: gmapApi
  },
  created () {
    document.addEventListener("backbutton", this.trackCallBackFunction, false);
  },
  mounted() {
    if (!this.$store || !this.$store.state || !this.$store.state.user || !this.$store.state.user.name) {
      this.backToLogin()
    } else {
      this.initPage()
    
      this.$nextTick(() => {
        this.isMounted = true
      })
    }
  },
  methods: {
    async initPage () {
      // check if profile is complete
      this.checkIfProfileIsComplete()
      // clear all running process
      utils.clearAllRunningProcesses()
      // check if battery is enough charged to play
      window.addEventListener("batterylow", this.checkBattery, false);
      // check if user has network
      this.checkNetwork()
      // check if story steps need to be played
      this.startStory()
      // check if user has received invitations to private quests
      this.checkInvitations()
      // get current level of user
      this.profile.level = LevelCompute(this.$store.state.user.score)
    },
    /*
     * Check if user profile is enough completed to have Graaly work
     */
    checkIfProfileIsComplete() {
      if (!this.$store.state.user.name || this.$store.state.user.name === '' || 
        //!this.$store.state.user.sex || this.$store.state.user.sex === '' || 
        //!this.$store.state.user.age || this.$store.state.user.age === '' || 
        !this.$store.state.user.location || 
        !this.$store.state.user.location.postalCode || this.$store.state.user.location.postalCode === '' || 
        !this.$store.state.user.location.country || this.$store.state.user.location.country === '') {
        this.$router.push('/user/updateprofile')
      }
    },
    closeInfoWindows() {
      this.map.infoWindow.isOpen = false
    },
    async onNewUserPosition(position) {
      //let positionNeedsUpdate = (this.user.position === null || this.questList.length === 0)
      this.$set(this.user, 'position', position.coords)

      //if (positionNeedsUpdate) {
      if (!this.map.loaded && !this.offline.active) {
        await this.reloadMap()
      }
    },
    centerOnUserPosition() {
      this.CenterMapOnPosition(this.user.position.latitude, this.user.position.longitude)
      this.map.zoom = 15
      this.showBottomMenu = false
    },
    /*
     * Check battery level
     */
    checkBattery(status) {
      if (status.level < 30) {
        this.warnings.lowBattery = true
      } else {
        this.warnings.lowBattery = false
      }
    },
    /*
     * start the story
     */
    startStory() {
      if (this.$store.state.user.story) {
        if (this.$store.state.user.story.step === 0) {
          this.story.step = 0
        }
        if (this.$store.state.user.story.step === 10) {
          this.warnings.score = true
          this.story.data = {
            score: this.$store.state.user.score
          }
          this.story.step = 10
        }
      }
    },
    /*
     * Check network
     */
    getClosestQuestUnplayed() {
      var distance = 100000
      var questSelected = null
      // get the closest quest
      for (var i = 0; i < this.questList.length; i++) {
        // get only the quest unplayed
        if (this.questList[i].authorUserId !== this.$store.state.user._id && this.questList[i].status !== 'played' && this.questList[i].type === 'quest') {
          // compute the min distance
          let newDistance = Math.sqrt(Math.pow(Math.abs(this.user.position.longitude - this.questList[i].location.coordinates[0]), 2) + Math.pow(Math.abs(this.user.position.latitude - this.questList[i].location.coordinates[1]), 2))
          if (newDistance < distance) {
            distance = newDistance
            questSelected = this.questList[i]
          }
        }
      }
      return questSelected
    },
    /*
     * Check network
     */
    checkNetwork() {
      if (navigator.connection && navigator.connection.type && typeof Connection !== 'undefined') {
        if (navigator.connection.type === Connection.NONE) {
          this.warnings.noNetwork = true
        } else {
          this.warnings.noNetwork = false
        }
      } else {
        this.warnings.noNetwork = false
      }
      utils.setTimeout(this.checkNetwork, 20000)
    },
    CenterMapOnPosition(lat, lng) {
      this.$data.map.center = {lat: lat, lng: lng}
    },
    
    /*
     * Open the summary box on quest click on the map
     * @param   {object}    quest           quest data
     * @param   {string}    idx             uniq index
     */
    openQuestSummary(quest, idx) {
      let infoWindow = this.map.infoWindow
      let questCoordinates = { lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }
      this.map.infoWindow.location = questCoordinates
      
      //check if its the same marker that was selected if yes toggle
      if (this.currentQuestIndex === idx) {
        infoWindow.isOpen = !infoWindow.isOpen
      }
      //if different marker, set infowindow to open and reset current marker index
      else {
        this.currentQuestIndex = idx
        this.currentQuest = this.questList[idx]
        infoWindow.isOpen = true
        // center map on last clicked quest
        this.panTo(questCoordinates)
      }
    },
    /*
     * Open the summary box for the discovery quest
     */
    openDiscoveryQuestSummary() {
      let infoWindow = this.map.infoWindow
      let questCoordinates = { lng: this.user.position.longitude, lat: this.user.position.latitude }
      this.map.infoWindow.location = questCoordinates
      infoWindow.isOpen = true
    },
    /*
     * reload the map
     */
    async reloadMap() {
      this.warnings.noServerReponse = false
      this.$q.loading.show()
      // get quests only if tutorial is advanced
      if (this.$store.state.user.story.step > 3) {
        await this.getQuests()
      } else {
        this.openDiscoveryQuestSummary()
      }
      
      if (this.$refs.mapRef) {
        // adjust zoom / pan to nearest quests, or current user location
        if (this.questList.length > 0) {
          // fix found on https://teunohooijer.com/tag/vue2-google-maps/ to use google library
          this.$refs.mapRef.$mapPromise.then((map) => {
            const bounds = new google.maps.LatLngBounds()
            for (let q of this.questList) {
              bounds.extend({ lng: q.location.coordinates[0], lat: q.location.coordinates[1] })
            }
            // add user position
            bounds.extend({ lng: this.user.position.longitude, lat: this.user.position.latitude })

            map.fitBounds(bounds)
          });
        } else {
          this.centerOnUserPosition()
        }
        this.map.loaded = true
      }
      
      this.$q.loading.hide()
    },
     /*
     * Get the list of quests near the location of the user
     */
    async getQuests(type) {
      this.showBottomMenu = false
      if (!type) {
        this.map.filter = 'all'
      } else {
        this.map.filter = type
      }
      
      this.$q.loading.show()
      let response = await QuestService.listNearest({ lng: this.user.position.longitude, lat: this.user.position.latitude }, this.map.filter)
      this.$q.loading.hide()
      if (response && response.data) {
        this.questList = response.data
        
        // if no quest, enlarge to all quests
        if (this.questList.length === 0) {
          this.map.filter = 'world'
          return getQuest(type)
        }

        if (this.$store.state.user.story.step === 16) {
          // get the closest quest not already played
          var closestQuest = this.getClosestQuestUnplayed()

          if (closestQuest !== null) {
            this.story.data = {
              questId: closestQuest.questId,
              quest: this.getQuestTitle(closestQuest, false)
            }
          } else {
            this.story.data = null
          }
          
          this.story.step = 16
        }
      } else {
        // check if quests are available offline
        const offlineQuestsFile = await utils.readFile('', 'quests.json')
        
        if (offlineQuestsFile) {
          const offlineQuestsData = JSON.parse(offlineQuestsFile)
          if (offlineQuestsData && offlineQuestsData.list) {
            var tempQuestList = offlineQuestsData.list
            
            // get pictures
            for (var i = 0; i < tempQuestList.length; i++) {
              var pictureUrl = await utils.readBinaryFile(tempQuestList[i].questId, tempQuestList[i].picture)
              if (pictureUrl) {
                tempQuestList[i].picture = pictureUrl
              } else {
                tempQuestList[i].picture = '_default-quest-picture.png'
              }
            }
            this.questList = tempQuestList
            
            this.offline.active = true
          }
        } else {
          this.warnings.noServerReponse = true
        }
      }
    },
     /*
     * Get user invitation to private quests
     */
    async checkInvitations() {
      let response = await QuestService.getInvitations()

      if (response && response.data) {
        this.invitations = response.data
      }
    },
    
    /*
     * Get the level of each quest in the map
     */
    getQuestLevelName(id) {
      let level = utils.getById(questLevels, id)
      return level === null ? '' : level.name
    },
    
    // ------------- Map manipulation functions ----------------
    
    // from https://stackoverflow.com/a/3817835/488666
    panTo (position) {      
      // do not name <gmap-map> reference as 'map', otherwise $mapObject becomes undefined (!)
      this.$refs.mapRef.$mapObject.panTo(position)
    },
    
    updateCenter (ev) {
      let newLat = ev.lat();
      let newLng = ev.lng();
      if (this.map.center.lat !== newLat || this.map.center.lng !== newLng) {
        this.map.centerTmp = { lng: newLng, lat: newLat }
      }
    },
    
    dragEnd(ev) {
      // mapCenter is not automatically updated by <gmap-map>
      // new center coordinates are not available in event data
      // => use mapCenterTmp values saved by 'update_center' event
      this.map.center = this.map.centerTmp
    },
    
    /*
     * Open the bottom menu
     */
    openBottomMenu() {
      if (this.showSuccess) {
        this.showSuccess = false
      } else if (this.showProfile) {
        this.showProfile = false
      } else {
        this.showBottomMenu = true
      }
    },
    /*
     * Open the success page
     */
    openSuccessPage() {
      this.$q.loading.show()
      if (!this.showSuccess) {
        this.listCreatedQuests(this.$store.state.user._id)
        this.listPlayedQuests(this.$store.state.user._id)
      }
      this.$q.loading.hide()
      this.showSuccess = !this.showSuccess
      // story
      if (this.$store.state.user.story.step === 15) {
        this.story.step = 15
      }
    },
    /*
     * Get current user ranking data
     */
    async getRanking() {
      this.warnings.rankingMissing = false
      this.$q.loading.show()
      let response = await UserService.getRanking()
      this.$q.loading.hide()
      if (response && response.data) {
        this.success.ranking = response.data
      } else {
        this.warnings.rankingMissing = true
      }
    },
    /*
     * Get the list of the quests created by the user
     * @param   {string}    id            ID of the user
     */
    async listCreatedQuests(id) {
      if (!id) {
        id = this.$store.state.user._id
      }
      this.warnings.listCreatedQuestsMissing = false
      let response = await QuestService.ListCreatedByAUser(id)
      this.success.quests.built = {
        rejected: [],
        tovalidate: [],
        draft: [],
        published: []
      }
      if (response && response.data) {
        for (var i = 0; i < response.data.length; i++) {
          var quest = response.data[i]
          if (quest.status === 'published') {
            this.success.quests.built['published'].push(quest)
          } else if (quest.status === 'rejected') {
            this.success.quests.built['rejected'].push(quest)
          } else if (quest.status === 'tovalidate') {
            this.success.quests.built['tovalidate'].push(quest)
          } else {
            this.success.quests.built['draft'].push(quest)
          }
        }
      } else {
        this.warnings.listCreatedQuestsMissing = true
      }
    },
    /*
     * Get the list of the quests played by the user
     * @param   {string}    id            ID of the user
     */
    async listPlayedQuests(id) {
      if (!id) {
        id = this.$store.state.user._id
      }
      this.warnings.listPlayedQuestsMissing = false
      let response = await QuestService.ListPlayedByAUser(id)
      if (response && response.data) {
        this.success.quests.played = response.data
      } else {
        this.warnings.listPlayedQuestsMissing = true
      }
    },
    /*
     * Open the profile page
     */
    async openProfilePage() {
      this.warnings.networkButton = false
      this.$q.loading.show()
      this.showProfile = !this.showProfile
      this.getProfileChangeData(this.$store.state.user._id)
      
      await this.loadFriends()
      //await this.loadNews()
      this.$q.loading.hide()
      
      if (this.$store.state.user.story.step === 14) {
        this.story.step = 14
      }
    },
    /*
     * List friends
     */
    async loadFriends() {
      this.warnings.listFriendsMissing = false
      let response = await UserService.listFriends()
      
      if (response && response.data) {
        this.friends.list = response.data
      } else {
        this.warnings.listFriendsMissing = true
      }
    },    
    /*
     * List news
     */
    loadNews(index, done) {
      var self = this
      // get the team news list
      UserService.listNews(this.friends.news.limit, this.friends.news.skip, function(err, response) {
        self.friends.news.skip += self.friends.news.limit
        if (err) {
          done(err)
        }
        if (response && response.data && response.data.length > 0) {
          self.friends.news.items = self.friends.news.items.concat(response.data)
          done()
        }
      })
    },  
    /*
     * Like news
     */
    async like (index) {
      this.$q.loading.show()
      this.friends.news.items[index].likes.push({userId: this.$store.state.user._id, date: new Date()})
      await UserService.likeNews(this.friends.news.items[index]._id)
      this.$q.loading.hide()
    },
    /*
     * Unlike news
     */
    async unlike (index) {
      this.$q.loading.show()
      for (var i = 0; i < this.friends.news.items[index].likes.length; i++) {
        if (this.friends.news.items[index].likes[i].userId === this.$store.state.user._id) {
          this.friends.news.items[index].likes.splice(i, 1)
        }
      }
      await UserService.unlikeNews(this.friends.news.items[index]._id)
      this.$q.loading.hide()
    },
    // return true if the current user has liked the news
    isLiked (item) {
      if (item.likes) {
        for (var i = 0; i < item.likes.length; i++) {
          if (item.likes[i].userId === this.$store.state.user._id) {
            return true;
          }
        }
      }
      return false;
    },
    /*
     * Open the friend card
     * @param   {string}    id            ID of the friend
     */
    async openFriendCard(id) {
      this.$q.loading.show()
      var allDataLoaded = true
      // load user data
      let friend = await UserService.getFriend(id)
      
      if (friend && friend.data) {
        this.friends.selected.name = friend.data.name
      
        // load user played quests
        let played = await QuestService.ListPlayedByAUser(id)
        if (played && played.data) {
          this.friends.selected.played = played.data
        } else {
          allDataLoaded = false
        }
        
        // load user build quests
        let built = await QuestService.ListCreatedByAUser(id)
        if (played && played.data) {
          this.friends.selected.built = built.data
        } else {
          allDataLoaded = false
        }
      } else {
        allDataLoaded = false
      }
      
      this.$q.loading.hide()
      
      if (allDataLoaded) {
        // display user page
        this.friends.show = true
      } else {
        this.displayNetworkIssueMessage()
      }
    },
    displayNetworkIssueMessage() {
      this.$q.dialog({
        title: this.$t('label.TechnicalProblem'),
        message: this.$t('label.TechnicalProblemNetworkIssue')
      })
    },
    /*
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getProfileChangeData(id) {
      this.profile.form = {
        name: this.$store.state.user.name,
        email: this.$store.state.user.email,
        phone: this.$store.state.user.phone ? this.$store.state.user.phone : '',
        picture: this.$store.state.user.picture,
        zipCode: this.$store.state.user.location.postalCode,
        country: this.$store.state.user.location.country,
        language: this.$store.state.user.language
      }
      
      // check if user can change his email
      if (this.$store.state.user.provider && this.$store.state.user.provider.name !== 'graaly') {
        this.profile.userCanChangeEmail = false
        this.profile.userCanChangePassword = false
      }
    },
    /*
     * Submit account changes
     */
    async submitProfileChanges() {      
      if (!this.profile.form.$error) {
        // TODO keep the original route which required authentification
        // & redirect user to it when he clicks on the 'verify' link in email
        let modifications = {
          name: this.profile.form.name,
          email: this.profile.form.email,
          phone: this.profile.form.phone ? this.profile.form.phone : "",
          oldPassword: this.profile.form.oldPassword,
          newPassword: this.profile.form.newPassword,
          zipCode: this.profile.form.zipCode,
          country: this.profile.form.country,
          language: this.profile.form.language
        }
        this.$q.loading.show()
        let modificationStatus = await AuthService.modifyAccount(modifications)
        this.$q.loading.hide()
        
        if (modificationStatus.status >= 300 && modificationStatus.data && modificationStatus.data.message) {
          Notification(modificationStatus.data.message, 'warning')
        } else {
          Notification(this.$t('label.AccountModifiedLong'), 'positive')
        }
      }
    },
    /*
     * Change interface language dynamically
     */
    changeLanguage() {        
      this.$i18n.locale = this.profile.form.language
    },
    /*
     * upload a profile image
     */
    async uploadImage(e) {
      var files = e.target.files
      if (!files[0]) {
        return
      }
      var data = new FormData()
      data.append('image', files[0])
      // MP 2018-02-12 should not be necessary because picture info is now updated in user session data
      // remove the commented lines below after a while if no problem occurs with user picture "refreshing" when a new picture is uploaded
      /*var reader = new FileReader()
      reader.onload = (e) => {
        this.form.picture = e.target.result;
      };*/
      this.$q.loading.show()
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture) {
        this.$store.state.user.picture = uploadPicture.data.file
      } else {
        this.displayNetworkIssueMessage()
      }
      this.$q.loading.hide()
    },
    /*
     * Disconnection
     */
    disconnect() {
      this.$router.push('/user/logout')
    },
    openAdminPage() {
      this.$router.push('/admin')
    },
    /*
     * Open How to popup
     */
    openHowTo() {
      this.$q.dialog({
        //title: 'Positioned',
        message: 'to complete',
        position: 'top'
      })
    },
    /*
     * Display title based on language
     * @param   {object}    quest            quest data
     * @param   {Boolean}   showLanguage     define if the map is displayed if the quest is not translated in the user language
     */
    getQuestTitle(quest, showLanguage) {
      if (!quest || !quest.title) {
        return this.$t('label.NoTitle')
      }
      if (this.$store.state.user.language && quest.title[this.$store.state.user.language]) {
        return quest.title[this.$store.state.user.language]
      } else if (quest.title[quest.mainLanguage] && quest.title[quest.mainLanguage] !== '') {
        return quest.title[quest.mainLanguage] + (showLanguage ? ' <img class="image-and-text-aligned" src="statics/icons/game/flag-' + Object.keys(quest.title)[0] + '.png" />' : '')
      } else {
        return this.$t('label.NoTitle')
      }
    },
    /*
     * Back to the map
     */
    backToMap() {
      this.showProfile = false
      this.showSuccess = false
    },
    /*
     * Back to the login page
     */
    backToLogin() {
      this.$router.push('/user/login')
    },
    setMapIcon(quest) {
      var marker = {
        url: 'statics/icons/game/pointer-done-undefined.png',
        size: {width: 40, height: 40, f: 'px', b: 'px'},
        scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 20, y: 40}
      }
      if (quest) {
        if (quest.authorUserId === this.$store.state.user._id) {
          marker.url = 'statics/icons/game/pointer-mine-' + quest.category + '.png'
        } else {
          if (quest.status !== 'played') {
            if (quest.type === 'quest') {
              marker.url = 'statics/icons/game/pointer-done-' + quest.category + '.png'
            } else {
              marker.url = 'statics/icons/game/pointer-' + quest.editorMode + '-' + quest.category + '.png'
            }
          }
        }
      } else {
        marker.url = 'statics/icons/game/pointer-me.png'
      }
      
      return marker
    },
    /*
     * Menu swipe tracking
     */
    swipeMenu (obj) {
      if (obj.direction === 'right') {
        this.openSuccessPage()
      }
      if (obj.direction === 'left') {
        this.openProfilePage()
      }
    },
    /*
     * Show search page
     */
    openSearch() {
      this.showSearch = true
      this.showBottomMenu = false
    },
    /*
     * Hide search page
     */
    closeSearch() {
      this.showSearch = false
    },
    /*
     * Search for quests
     */
    async findQuests() {
      try {
        if (this.search.text.length > 3) {
          // show loading animation
          this.$q.loading.show()

          // Get quests for the search
          var userPosition = this.user.position
          let response = await QuestService.find(this.search.text, userPosition)
          if (response && response.data) {
            this.search.quests = response.data
         
            // compute distance
            if (this.user.position.isSupported) {
              this.search.quests = this.search.quests.map(function(quest) {
                const R = 6378.137
                let dLat = quest.location.coordinates[1] * Math.PI / 180 - userPosition.latitude * Math.PI / 180
                let dLon = quest.location.coordinates[0] * Math.PI / 180 - userPosition.longitude * Math.PI / 180
                let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userPosition.latitude * Math.PI / 180) * Math.cos(quest.location.coordinates[1] * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
                quest.distance = Math.floor(R * c)

                return quest
              });
            }
          } else {
            this.displayNetworkIssueMessage()
          }
        }
        this.$q.loading.hide()
      } catch (e) {
        this.$q.loading.hide()
      }
    },
    /*
     * Open shop
     */
    buyCoins () {
      this.shop.show = true
    },
    /*
     * End a story step
     */
    endStory (nextStep) {
      this.story.step = null
      this.$store.state.user.story.step = nextStep
      // if skip tutorial
      if (nextStep === 17) {
        this.reloadMap()
      }
    },
    /*
     * Close shop
     */
    closeShop () {
      this.shop.show = false
    },
    /*
     * Open new friends page
     */
    openAddFriendsModal () {
      this.friends.new.show = true
    },
    /*
     * Close new friends page
     */
    async closeAddFriends () {
      this.friends.new.show = false
      // reload friend list
      await this.loadFriends()
    },
    async removeFriend (friendId) {    
      this.$q.dialog({
        message: this.$t('label.AreYouSureYouWantToRemoveThisFriend'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        await UserService.removeFriend(friendId)
        // TODO: manage network issue with removeFriend
        await this.loadFriends()
        await this.updateFriendsActivity()
      })
    },
    /*
     * Reset the friends' activity list
     */
    async updateFriendsActivity() {
      this.friends.news.skip = 0
      this.friends.news.items = []
      this.friends.news.items.length = 0
    },
    /*
     * Remove user account
     */
    async removeAccount() {
      var _this = this; // workaround for closure scope quirks
      
      this.$q.dialog({
        message: this.$t('label.AreYouSureYouWantToRemoveYourAccount'),
        ok: true,
        cancel: true
      }).onOk(async () => {
        const removeAccountStatus = await AuthService.removeAccount()

        if (removeAccountStatus) {
          Notification(_this.$t('label.YourAccountIsRemoved'), 'info')
          await _this.disconnect()
        } else {
          Notification(_this.$t('label.ErrorStandardMessage'), 'error')
        }
      })
    },
    /*
     * Open the ranking page
     */
    openRanking () {
      this.warnings.score = false
      this.getRanking()
      this.ranking.show = true
      // story
      if (this.$store.state.user.story.step === 11) {
        this.story.step = 11
      }
    },
    /*
     * close the ranking page
     */
    closeRanking () {
      this.ranking.show = false
      // story
      if (this.$store.state.user.story.step === 13) {
        this.warnings.networkButton = true
        this.story.step = 13
      }
    },
    /*
     * Open the discovery quest
     */
    openDiscoveryQuest () {
      // story
      if (this.$store.state.user.story.step === 3) {
        this.story.step = 3
      }
    },
    /*
     * Restart tutorial
     */
    async restartTutorial () {
      await UserService.nextStoryStep(0)
      this.$store.state.user.story.step = 0
      this.backToMap()
      
      await this.initPage()
    },
    /*
     * Show main menu
     */
    async showMenu () {
      this.menu.show = true
    },
    /*
     * Hide main menu
     */
    async hideMenu () {
      var _this = this
      utils.setTimeout(function() { _this.menu.show = false }, 500)
    },
    /*
     * Prevent mobile player to use back button here
     */
    trackCallBackFunction() {
      return false
    },
    onUserPositionError() {
      this.user.position = null
    },
    /*
     * Launch a quest
     */
    playQuest(questId) {
      this.$router.push('/quest/play/' + questId)
    },
    /*
     * Download a quest
     */
    downloadQuest(quest) {
      if (!this.offline.show) {
        this.offline.quest = quest
        this.offline.show = true
      }
    },
    /*
     * Modify a quest
     */
    modifyQuest(questId) {
      this.$router.push('/quest/builder/' + questId)
    }
  },
  validations: {
    profile: {
      form: {
        email: { required, email },
        name: { required },
        country: { required },
        zipCode: { required },
        phone: { checkPhone }
      }
    }
  }
}
</script>

<style>
.q-item-label > p { padding: 0; margin: 0; }
</style>
