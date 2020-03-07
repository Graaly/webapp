<template>
  <div class="wrapper background-dark">
    <div class="page-content">
      
      <!--====================== MAIN QUEST =================================-->
      
      <mainQuest :quest="bestQuest" @end="questLoadedInCache()"></mainQuest>
      
      <!--====================== INVITATION QUEST =================================-->
      
      <div v-if="invitationQuests && invitationQuests.length > 0">
        <titleBar :title="{text: $t('label.AroundYou'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMore"></titleBar>

        <questsList :quests="invitationQuests"></questsList>
      </div>
      
      <!--====================== OTHER QUEST =================================-->
      
      <titleBar :title="{text: $t('label.AroundYou'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMore"></titleBar>

      <questsList format="small" :quests="nearestQuests"></questsList>
      
      <!--====================== QUEST CREATED BY GRAALY =================================-->
      
      <titleBar :title="{text: $t('label.CreatedByGraaly'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMore"></titleBar>
      
      <!--====================== QUEST PLAYED OR CREATED BY GRAALY =================================-->
      
      <titleBar format="small" :title="{text: $t('label.FriendsQuests'), type: 'key'}" :link="{text: $t('label.SeeMore')}" @click="readMore"></titleBar>
      
      <!--====================== CREATORS =================================-->
      
      <titleBar :title="{text: $t('label.Designers'), type: 'puzzle'}" :link="{text: $t('label.SeeMore')}"></titleBar>
      
      <usersList format="scroll" :users="users"></usersList>
      
      <!--====================== CREATE QUEST BUTTON =================================-->
      
      <div class="q-ma-md relative-position creator-button" @click="buildQuest">
        <img src="statics/images/other/creator.jpg" class="full-width" />
        <div class="bg-accent subtitle2 q-pa-md full-width" style="bottom: 0px; position: absolute;">
          <div class="float-right"><img src="statics/images/icon/puzzle-big.svg" style="width: 32px" /></div>
          <span>Devenir créateur ?</span>
        </div>
      </div>
      
      <!--====================== HEADER =================================-->
      
      <div class="fixed-top">
        <div class="home-header row no-wrap">
          <img src="statics/images/logo/logo-header.png" class="logo" />
          <q-space />
          <img src="statics/images/icon/search.svg" class="header-button q-mr-md" @click="openSearch" />
          <img :src="'statics/images/icon/level' + $store.state.user.level + '.svg'" class="header-button q-mr-md" @click="openRanking" />
          <q-avatar @click="openProfile()">
            <img :src="getProfileImage()" />
          </q-avatar>
        </div>
      </div>
      
      <!------------------ GEOLOCATION COMPONENT ------------------------>
      
      <geolocation v-if="!offline.active" ref="geolocation-component" @success="onLocationSuccess($event)" @error="onLocationError()" />
      
      <!------------------ SCORE AREA ------------------------>
      <!--<div class="centered q-pa-xl" style="width: 100%; position: absolute; top: 100px; z-index: 7000" v-if="loadingMap">
        <q-spinner color="primary" size="3em" /><br />
        {{ $t('label.QuestMapIsLoading') }}
      </div>
      <div class="score-box q-mr-md" v-if="$store.state.user && !offline.active && !loadingMap" @click="openRanking">
        <div class="q-px-md q-pt-md score-text centered" :class="{'bouncing': warnings.score}">{{ $store.state.user.score }}</div>
        <div style="width: 100px">
          <div class="centered bg-primary text-white level-box" style="margin-bottom: 1px">{{ $t('label.Level') }} {{ $store.state.user.level }}</div>
          <q-linear-progress :value="profile.level.progress" stripe style="height: 6px" animate color="primary"></q-linear-progress>
        </div>
      </div>
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
      </div>-->
      
      <!--====================== SUCCESS PAGE =================================-->
      <!--
      <q-drawer class="over-map" side="left" v-model="showSuccess" :width="innerWidth" test-id="quests-pane">
        
        <!------------------ TABS AREA ------------------------
        
        <q-tabs v-model="questsTab" class="bg-accent text-white">
          <q-tab name="built" icon="add_box" :label="$t('label.QuestsCreated')" />
          <q-tab name="played" icon="play_circle_filled" :label="$t('label.QuestsSuccessful')" />
        </q-tabs>
        
        <q-separator />
        
        <!------------------ LIST OF QUESTS BUILT TAB ------------------------
        
        <div v-if="questsTab === 'built'" class="q-pa-md q-pb-xl tab-content-80">
          
          <q-btn link class="full-width" @click="buildQuest" color="secondary">{{ $t('label.CreateANewQuest') }}</q-btn>
          <q-btn outline class="full-width q-mt-sm" @click="menu.suggestQuest.show = true" color="secondary">{{ $t('label.SuggestAQuest') }}</q-btn>
          <div class="centered bg-warning q-pa-sm" v-if="warnings.listCreatedQuestsMissing" @click="listCreatedQuests($store.state.user._id)">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
          <q-expansion-item :label="$t('label.YourUnderValidationQuests')" default-opened v-if="success.quests.built.tovalidate && success.quests.built.tovalidate.length > 0">
            <q-list>
              <q-item v-for="quest in success.quests.built.tovalidate" :key="quest._id">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                    <q-badge floating color="black" v-if="quest.access === 'private'">
                      <q-icon name="lock" color="white" />
                    </q-badge>
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
          </q-expansion-item>
          <q-expansion-item :label="$t('label.YourRejectedQuests')" default-opened v-if="success.quests.built.rejected && success.quests.built.rejected.length > 0">
            <q-list>
              <q-item v-for="quest in success.quests.built.rejected" :key="quest._id" @click.native="modifyQuest(quest.questId)">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                    <q-badge floating color="black" v-if="quest.access === 'private'">
                      <q-icon name="lock" color="white" />
                    </q-badge>
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
          </q-expansion-item>
          <q-expansion-item :label="$t('label.YourDraftQuests')" default-opened v-if="success.quests.built.draft && success.quests.built.draft.length > 0">
            <q-list>
              <q-item v-for="quest in success.quests.built.draft" :key="quest._id" @click.native="modifyQuest(quest.questId)">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                    <q-badge floating color="black" v-if="quest.access === 'private'">
                      <q-icon name="lock" color="white" />
                    </q-badge>
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
          </q-expansion-item>
          <q-expansion-item :label="$t('label.YourPublishedQuests')" default-opened v-if="success.quests.built.published && success.quests.built.published.length > 0">
            <q-list>
              <q-item v-for="quest in success.quests.built.published" :key="quest._id" @click.native="modifyQuest(quest.questId)">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                    <q-badge floating color="black" v-if="quest.access === 'private'">
                      <q-icon name="lock" color="white" />
                    </q-badge>
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
          </q-expansion-item>
          <div v-if="!success.quests.built.tovalidate && !warnings.listCreatedQuestsMissing">
            {{ $t('label.Loading') }}
          </div>
        </div>
        
        <------------------ LIST OF QUESTS PLAYED TAB ------------------------
        
        <div v-if="questsTab === 'played'" class="q-pa-md q-pb-xl tab-content-80">
          <div class="centered bg-warning q-pa-sm" v-if="warnings.listPlayedQuestsMissing" @click="listPlayedQuests($store.state.user._id)">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
          <q-list v-if="success.quests.played && success.quests.played.length > 0">
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
                  {{ $t('label.MyScore') }}: {{ quest.score }} <!--<q-icon name="fas fa-trophy" />--
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
          </q-list>
          <q-list v-if="!success.quests.played || success.quests.played.length === 0">      
            <q-item v-if="success.quests.played.length === 0 && !warnings.listPlayedQuestsMissing">
              <q-item-label>{{ $t('label.NoQuestPlayedLong') }}</q-item-label>
            </q-item>
          </q-list>
        </div>

      </q-drawer>
      -->
      <!--====================== PROFILE PAGE =================================-->
      <!--
      <q-drawer class="over-map" side="right" v-model="showProfile" :width="innerWidth" test-id="profile-pane">
        
        <div  v-if="$store.state.user.name !== '-'">
          <!------------------ HEADER AREA ------------------------
            
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
          
          <!------------------ TABS AREA ------------------------
          
          <q-tabs v-model="profileTab" class="bg-accent text-white">
            <q-tab name="profile" icon="face" :label="$t('label.MyProfile')" />
            <q-tab name="friends" icon="supervised_user_circle" :label="$t('label.Friends')" />
            <q-tab name="news" icon="notifications" :label="$t('label.News')" />
            <q-tab name="pro" icon="store" :label="$t('label.Pro')" />
          </q-tabs>
          
          <q-separator />
          
          <!------------------ PROFILE TAB ------------------------>
          <!--
          <div v-if="profileTab === 'profile'" class="q-pa-md tab-content-180">
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
                    
                  <q-select 
                    :label="$t('label.YourLanguage')" 
                    v-model="profile.form.language" 
                    :options="languages" 
                    emit-value 
                    map-options 
                    @input="changeLanguage" 
                    @focus="hideMenu()" 
                    @blur="showMenu()" />
                  
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
            </form>
          </div>
          ->
          <!------------------ FRIENDS TAB ------------------------>
          <!--
          <div v-if="profileTab === 'friends'" class="q-pa-md tab-content-180">
            
            <!------------------ ADD FRIENDS BUTTON AREA ------------------------
            <q-btn link class="full-width" @click="openAddFriendsModal()" color="secondary">{{ $t('label.AddFriends') }}</q-btn>
            
            <div class="centered bg-warning q-pa-sm" v-if="warnings.listFriendsMissing" @click="loadFriends">
              <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
            </div>
            <q-list>
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
          </div>
          
          <!------------------ NEWS TAB ------------------------
          
          <div v-if="profileTab === 'news'" class="q-pa-md tab-content-180">
            <q-infinite-scroll @load="loadNews">
              <q-list>
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
          </div>
          
          <!------------------ PRO TAB ------------------------
          
          <div v-if="profileTab === 'pro'" class="q-pa-md tab-content-180">
            <div v-if="!$store.state.user.organizationId">
              <div>
                <q-card class="q-mb-md">
                  <q-img src="statics/icons/game/storekeeper.jpg">
                    <div class="absolute-bottom">
                      <div class="text-h6">{{ $t('label.Storekeeper') }}</div>
                      <div class="text-subtitle2">{{ $t('label.StorekeeperDesc') }}</div>
                    </div>
                  </q-img>
                </q-card>
              </div>
              <div>
                <span v-html="$t('label.contactUsPro')" />
              </div>
            </div>
            <div v-if="$store.state.user.organizationId && profile.organization.organization">
              <p class="text-weight-bold">{{ $t('label.YourOrganizationSubscribeAProAccount', {name: profile.organization.organization.name}) }}</p>
              <p v-if="profile.organization.quests && profile.organization.quests.length > 0">
                {{ $t('label.MembersOfYourOrganizationCreatedPremiumQuests') }}
                <q-list class="shadow-2 rounded-borders">
                  <q-item v-for="premiumQuest in profile.organization.quests" :key="premiumQuest.questId" @click.native="playQuest(premiumQuest.questId)">
                    <q-item-section>{{ getQuestTitle(premiumQuest) }} (statut{{ $t('label.colons') }}{{ $t('status.' + premiumQuest.status) }})</q-item-section>
                  </q-item>
                </q-list>
              </p>
              <p v-if="profile.organization.organization.premiumQuestsNb && profile.organization.organization.premiumQuestsNb > 0">{{ $t('label.YouCanCreateNbPremiumQuests', {nb: profile.organization.organization.premiumQuestsNb}) }}</p>
              <p v-if="!profile.organization.organization.premiumQuestsNb || profile.organization.organization.premiumQuestsNb === 0"><span v-html="$t('label.YouCanNotCreateNewQuests')" /></p>
            </div>
          </div>
        </div>
        
        <div class="centered q-pa-xl" v-if="$store.state.user.name === '-'">
          <div class="text-h5">{{ $t('label.CreateYourAccountMsg') }}</div>
          <div class="q-mt-xl">
            <q-btn @click="openUpdateProfilePage()" color="primary">{{ $t('label.CreateMyAccount') }}</q-btn>
          </div>
          <div class="q-mt-lg">
            <q-btn @click="disconnect()" flat color="primary">{{ $t('label.IAlreadyHaveAnAccount') }}</q-btn>
          </div>
        </div>

      </q-drawer>
      
      <!--====================== FRIEND PAGE =================================-->
      <!--
      <q-dialog v-model="friends.show" class="over-map">
         <div class="panel-bottom q-pa-md">
          <a class="float-right no-underline close-btn" color="grey" @click="friends.show = false"><q-icon name="close" class="medium-icon" /></a>
          <h1 class="size-3 q-pl-md">{{ friends.selected.name }}</h1>
          <q-tabs v-model="friendsTab" class="bg-accent text-white">

            <q-tab name="friendbuilt" icon="add_box" :label="$t('label.QuestsCreated')" default />
            <q-tab name="friendplayed" icon="play_circle_filled" :label="$t('label.QuestsSuccessful')" />
          </q-tabs>
          
          <q-separator />
          
          <q-tab-panels v-model="friendsTab" animated>
            
            <q-tab-panel name="friendbuilt">
              <q-list>
                <q-item v-for="quest in friends.selected.built" :key="quest._id" @click.native="playQuest(quest.questId)">
                  <q-item-section avatar>
                    <q-avatar>
                      <img :src="quest.thumb ? serverUrl + '/upload/quest/' + quest.thumb : 'statics/profiles/noprofile.png'" />
                    </q-avatar>
                  </q-item-section>
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
              <q-list v-if="friends.selected.played && friends.selected.played.length > 0">
                <q-item v-for="quest in friends.selected.played" :key="quest._id" @click.native="playQuest(quest.questId)">
                  <q-item-section avatar>
                    <q-avatar>
                      <img v-if="quest.questData && quest.questData.thumb" :src="((quest.questData.thumb && quest.questData.thumb[0] === '_') ? 'statics/images/quest/' + quest.questData.thumb : serverUrl + '/upload/quest/' + quest.questData.thumb)" />
                      <img v-if="quest.questData && !quest.questData.thumb && quest.questData.picture" :src="((quest.questData.picture && quest.questData.picture[0] === '_') ? 'statics/images/quest/' + quest.questData.picture : serverUrl + '/upload/quest/' + quest.questData.picture)" />
                      <img v-if="!quest.questData || (!quest.questData.picture && !quest.questData.thumb)" src="statics/profiles/noprofile.png" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ getQuestTitle(quest.questData, false) }} {{ quest.type }}</q-item-label>
                    <q-item-label caption v-if="!quest.dateCreated">
                      {{ $t('label.Succeeded') }}
                    </q-item-label>
                    <q-item-label caption v-if="quest.score">
                      {{ $t('label.Score') }}: {{ quest.score }} <!--<q-icon name="fas fa-trophy" />--
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
      -->
      <!--====================== ADD FRIEND PAGE =================================-->
      <!--
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
      -->
      <!--====================== SHOP PAGE =================================-->
      <!--
      <q-dialog maximized v-model="shop.show" class="over-map">
        <a class="float-right no-underline close-btn" color="grey" @click="closeShop"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ $t('label.Shop') }}</h1>
        <shop @close="closeShop"></shop>
      </q-dialog>
      -->
      <!--====================== RANKING PAGE =================================-->
      
      <q-dialog maximized v-model="ranking.show" class="over-map">
        <q-card>
          <q-card-section class="row items-center">
            <h1 class="size-3 q-pl-md">{{ $t('label.YourRanking') }}</h1>
            <q-space />
            <q-btn icon="close" flat round dense />
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
                  <q-item-label>{{ $t('label.MyLevel') }}: {{ $store.state.user.level }} ({{ $store.state.user.score}} {{ $t('label.points') }})</q-item-label>
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
            <div v-if="success.ranking && success.ranking.length > 0">
              <h1 class="size-3 q-pl-md">{{ $t('label.Rewards') }}</h1>
              <q-list v-for="(item, index) in success.ranking" :key="index">
                <q-item-label header>{{ item.city }}</q-item-label>
                <q-item style="flex-wrap: wrap">
                  <img v-for="(reward, index2) in item.rewards" :class="{'reward': true, 'disabled': !reward.won}" :key="index2" :src="serverUrl + '/upload/quest/' + reward.image" />
                </q-item>
              </q-list>
              {{ $t("label.PlayAllQuestsInACityToWin") }}
            </div>
          </q-card-section>
          <q-card-section v-if="!($store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings) && !(success.ranking && success.ranking.length > 0)">
            {{ $t("label.NoRankingYet") }}
          </q-card-section>
        </q-card>
      </q-dialog>
      
      <!--====================== BOTTOM BAR =================================-->
      
      <div class="fixed-bottom over-map" v-if="!offline.active">
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
          <div class="centered bg-warning q-pa-sm" v-if="!warnings.noNetwork && warnings.noServerReponse">
            <q-icon name="refresh" /> {{ $t('label.TechnicalErrorReloadPage') }}
          </div>
        </div>
        <div v-if="offline.show">
          <offlineLoader :quest="offline.quest" :design="'download'" @end="questLoadedInCache()"></offlineLoader>
        </div>
      </div>
      
      <!--====================== BOTTOM MENU =================================-->
      <!--
      <q-dialog v-model="showBottomMenu" position="bottom" test-id="bottom-menu">
        <q-list class="bg-white">
          <q-item v-if="isHybrid" @click.native="startScanQRCode()">
            <q-item-section avatar>
              <q-icon color="primary" name="aspect_ratio" />
            </q-item-section>
            <q-item-section>{{ $t('label.ScanQRCodeToStartQuest') }}</q-item-section>
          </q-item>
          
          <q-item @click.native="menu.suggestQuest.show = true">
            <q-item-section avatar>
              <q-icon color="primary" name="emoji_objects" />
            </q-item-section>
            <q-item-section>{{ $t('label.SuggestAQuest') }}</q-item-section>
          </q-item>
          
          <q-item @click.native="$router.push('/quest/create')" test-id="btn-create-quest">
            <q-item-section avatar>
              <q-icon color="primary" name="add_location" />
            </q-item-section>
            <q-item-section>{{ $t('label.BuildAQuestHere') }}</q-item-section>
          </q-item>
          
          <q-separator />
          
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
          
          <q-item v-if="$store.state.user.isAdmin && shop.inAppPurchase.activated">
            <q-item-section avatar>
              <q-icon color="green" name="check" />
            </q-item-section>
            <q-item-section>In-app purchase</q-item-section>
          </q-item>
          <q-item v-if="$store.state.user.isAdmin && !shop.inAppPurchase.activated">
            <q-item-section avatar>
              <q-icon color="red" name="close" />
            </q-item-section>
            <q-item-section>In-app purchase</q-item-section>
          </q-item>
        </q-list>
      </q-dialog>
      -->
      <!--====================== SUGGEST A QUEST =================================-->
      <!--
      <q-dialog maximized v-model="menu.suggestQuest.show" class="over-map bg-white">
        <suggest @close="menu.suggestQuest.show = false"></suggest>
      </q-dialog>
      -->
    </div>
  </div>
</template>

<script>
import QuestService from 'services/QuestService'
import UserService from 'services/UserService'

import geolocation from 'components/geolocation'
//import newfriend from 'components/newfriend'
import shop from 'components/shop'
import suggest from 'components/quest/suggest'
import titleBar from 'components/titleBar'
import mainQuest from 'components/quest/mainQuest'
import questsList from 'components/quest/questsList'
import usersList from 'components/user/usersList'
//import offlineLoader from 'components/offlineLoader'

import utils from 'src/includes/utils'
//import { required, email } from 'vuelidate/lib/validators'
//import checkPhone from 'boot/CheckPhone'
import { QSpinnerDots, QInfiniteScroll } from 'quasar'

import Notification from 'boot/NotifyHelper'
import LevelCompute from 'boot/LevelCompute'

export default {
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    geolocation,
    //newfriend,
    shop,
    suggest,
    //offlineLoader,
    mainQuest,
    titleBar,
    questsList,
    usersList
  },
  data () {
    return {
      bestQuest: null,
      nearestQuests: null,
      invitationQuests: null,
      users: null,
      search: {
        quests: [],
        text: ''
      },
      user: {
        position: null,
        proposeAQuest: true
      },
      shop: {
        show: false,
        inAppPurchase: {
          activated: window.store
        }
      },
      currentQuestIndex: null,
      currentQuest: null,
      searchText: '',
      questList: [],
      serverUrl: process.env.SERVER_URL,
      //showSuccess: false,
      //showProfile: false,
      showSearch: false,
      //showBottomMenu: false,
      warnings: {
        lowBattery: false,
        noLocation: false,
        noNetwork: false,
        noServerReponse: false,
        rankingMissing: false,
        score: false,
        questButton: false,
        networkButton: false,
        mainButton: false
      },
      success: {
        ranking: []
      },
      profile: {
        level: {},
        organization: {},
        progress: 0.1,
        /*form: {
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
        countries: [],*/
        userCanChangeEmail: true,
        userCanChangePhone: true,
        userCanChangePassword: true
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
      //languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      isMounted: false,
      isHybrid: window.cordova,
      isQuestsLoaded: false,
      innerWidth: window.innerWidth//,
      //questsTab: "built",
      //profileTab: "news",
      //friendsTab: "friendbuilt",
      //invitations: [],
      //QuestService // to have getBackgroundImage() method available in template
    }
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
      await this.checkNetwork()
      // check if user has received invitations to private quests
      //this.checkInvitations()
      // get current level of user
      this.profile.level = LevelCompute(this.$store.state.user.score)
    },
    /*
     * Check if user profile is enough completed to have Graaly work
     */
    checkIfProfileIsComplete() {
      if (this.$store.state.user.story.step === 18 && (!this.$store.state.user.name || this.$store.state.user.name === '' || 
        this.$store.state.user.email === 'providersignin' || 
        //!this.$store.state.user.sex || this.$store.state.user.sex === '' || 
        //!this.$store.state.user.age || this.$store.state.user.age === '' || 
        !this.$store.state.user.location || 
        !this.$store.state.user.location.postalCode || this.$store.state.user.location.postalCode === '' || 
        !this.$store.state.user.location.country || this.$store.state.user.location.country === '')) {
        this.openUpdateProfilePage()
      }
    },
    openUpdateProfilePage() {
      this.$router.push('/user/updateprofile')
    },
    async onLocationSuccess(position) {
      //let positionNeedsUpdate = (this.user.position === null || this.questList.length === 0)
      this.$set(this.user, 'position', position.coords)
      
      if (this.isQuestsLoaded === false && !this.offline.active) {
        await this.loadQuests()
      }

      await this.getCreators()
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
              _this.playQuest(result.text)
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
     *
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
     * Quest the quests that are 
     *
    getClosestQuestUnplayed() {
      var distance = 300 // 200 meters
      var questSelected = null
      // get the closest quest
      for (var i = 0; i < this.questList.length; i++) {
        // get only the quest unplayed (and which the user is not the owner)
        if (this.questList[i].authorUserId !== this.$store.state.user._id && this.questList[i].status !== 'played' && this.questList[i].type === 'quest') {
          // compute the min distance
          let newDistance = 111320 * Math.sqrt(Math.pow(Math.abs(this.user.position.longitude - this.questList[i].location.coordinates[0]), 2) + Math.pow(Math.abs(this.user.position.latitude - this.questList[i].location.coordinates[1]), 2))
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
    async checkNetwork() {
      // TODO on hybrid, maybe use events "offline" and "online" to get realtime network status
      // see https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/#offline
console.log(this.offline)
      let previousOfflineValue = this.offline.active
      let isNetworkAvailable = utils.isNetworkAvailable()
      this.warnings.noNetwork = !isNetworkAvailable
      this.offline.active = !isNetworkAvailable
      if (previousOfflineValue !== this.offline.active) {
        this.questList = []
      }
      
      utils.setTimeout(this.checkNetwork, 5000)
    },
    
    /*
     * Open the summary box on quest click on the map
     * @param   {object}    quest           quest data
     * @param   {string}    idx             uniq index
     *
    openQuestSummary(quest, idx) {
      let infoWindow = this.map.infoWindow
      let questCoordinates = { lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }
      this.map.infoWindow.location = questCoordinates
      
      if (!(this.currentQuestIndex === idx && infoWindow.isOpen)) {
        // bounce marker animation
        let markerObject = this.$refs.questMarkers[idx].$markerObject
        markerObject.setAnimation(google.maps.Animation.BOUNCE)
        utils.setTimeout(() => { markerObject.setAnimation(null) }, 700) // found at https://stackoverflow.com/a/18411125/488666
      }
      
      //check if its the same marker that was selected if yes toggle
      if (this.currentQuestIndex === idx) {
        infoWindow.isOpen = !infoWindow.isOpen
      }
      //if different marker, set infowindow to open and reset current marker index
      else {
        this.currentQuestIndex = idx
        this.currentQuest = this.questList[idx]
        this.currentQuest.displayPrice = ''
        infoWindow.isOpen = true
        // center map on last clicked quest
        this.panTo(questCoordinates)
      }
      
      // get Quest price from store
      if (!quest.premiumPrice || !quest.premiumPrice.androidId || quest.premiumPrice.androidId === 'free') {
        this.currentQuest.displayPrice = this.$t('label.Free')
      } else {
        if (!window.store) {
          this.currentQuest.displayPrice = this.$t('label.QuestPlayableOnMobile')
        } else {
          // updated EMA => Connection to store to get prices impact prices display in home.vue page
          let prices = {
            'premiumprice1': "0,99 €",
            'premiumprice2': "1,99 €",
            'premiumprice3': "2,99 €",
            'premiumprice5': "4,99 €",
            'premiumprice10': "9,99 €",
            'premiumprice20': "19,99 €"
          }
          this.currentQuest.displayPrice = prices[quest.premiumPrice.androidId]
        }
      }
    },
    /*
     * Open the summary box for the discovery quest
     *
    openDiscoveryQuestSummary() {
      let infoWindow = this.map.infoWindow
      let questCoordinates = { lng: this.user.position.longitude, lat: this.user.position.latitude }
      this.map.infoWindow.location = questCoordinates
      infoWindow.isOpen = true
    },
    /*
     * reload the map
     */
    async loadQuests() {
      this.warnings.noServerReponse = false
      await this.getQuests()
    },
    /*
     * Get the list of quests near the location of the user
     */
    async getQuests() {
      this.isQuestsLoaded = null // to prevent multiple call of reload map if onNewUserPosition is called too often
      this.showBottomMenu = false
      if (!this.offline.active) {
        if (this.user.position === null) {
          Notification(this.$t('label.LocationSearching'), 'warning')
          this.isQuestsLoaded = false
          return
        }
        
        let response = await QuestService.listHomeQuests({ lng: this.user.position.longitude, lat: this.user.position.latitude })
        
        if (!response || !response.data) {
          Notification(this.$t('label.TechnicalIssue'), 'error')
          this.isQuestsLoaded = false
          return
        }
        this.isQuestsLoaded = true
        
        if (!response.data.message || response.data.message !== 'No quest') {
          if (response.data.best) {
            this.bestQuest = response.data.best
          }
          if (response.data.nearests) {
            this.nearestQuests = response.data.nearests
          }
          if (response.data.invitations) {
            this.invitationQuests = response.data.invitations
          }
        }
        
        /*if ((this.$store.state.user.story.step === 16 ||  this.$store.state.user.story.step >= 23) && this.user.proposeAQuest) {
          // Alert if the user is very close to a quest
          var closestQuest = this.getClosestQuestUnplayed()

          if (closestQuest !== null) {
            this.story.data = {
              questId: closestQuest.questId,
              quest: this.getQuestTitle(closestQuest, false)
            }
            this.story.step = 16
          } else {
            this.story.data = null
          }
          
          // avoid the notification to appear when user filter on quests
          this.user.proposeAQuest = false
        }*/
      } else {
        // check if quests are available offline
        const offlineQuestsFile = await utils.readFile('', 'quests.json')
        
        if (offlineQuestsFile) {
          const offlineQuestsData = JSON.parse(offlineQuestsFile)
          if (offlineQuestsData && offlineQuestsData.list) {
            var tempQuestList = offlineQuestsData.list
            
            if (tempQuestList.length > 0) {
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
            } else {
              // if no quest available in quests.json
              this.warnings.noServerReponse = true
              this.isQuestsLoaded = false
            }
          }
        } else {
          // if quests.json is not accessable
          this.warnings.noServerReponse = true
          this.isQuestsLoaded = false
        }
      }
    },
    /*
     * Get the list of creators near the location of the user
     */
    async getCreators() {      
      let response = await UserService.listNearCreators({ lng: this.user.position.longitude, lat: this.user.position.latitude }, 10)
      
      if (!response || !response.data) {
        Notification(this.$t('label.TechnicalIssue'), 'error')
        return
      }
      
      if (!response.data.message || response.data.message !== 'No users') {
        this.users = response.data
      }
    },
     /*
     * Get user invitation to private quests
     *
    async checkInvitations() {
      let response = await QuestService.getInvitations()

      if (response && response.data) {
        this.invitations = response.data
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
    
    displayNetworkIssueMessage() {
      this.$q.dialog({
        title: this.$t('label.TechnicalProblem'),
        message: this.$t('label.TechnicalProblemNetworkIssue')
      })
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
      return quest.title
    },
    /*
     * Back to the login page
     */
    backToLogin() {
      this.$router.push('/user/login')
    },
    /*
     * Open shop
     */
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
    /*
     * Reset the friends' activity list
     */
    async updateFriendsActivity() {
      this.friends.news.skip = 0
      this.friends.news.items = []
      this.friends.news.items.length = 0
    },
    /*
     * Restart tutorial
     *
    async restartTutorial () {
      await UserService.nextStoryStep(0)
      this.$store.state.user.story.step = 0
      this.backToMap()
      
      await this.initPage()
    },
    /*
     * Prevent mobile player to use back button here
     */
    trackCallBackFunction() {
      return false
    },
    onLocationError(ret) {
      // reset position only if localization never worked, else keep current location
      if (ret) {
        this.user.position = null
      }
    },
    /*
     * Launch a quest
     */
    playQuest(questId) {
      this.$router.push('/quest/play/' + questId)
    },
    buildQuest() {
      if (this.userIsConnected()) {
        this.$router.push('/quest/create/welcome')
      } else {
        var _this = this; // workaround for closure scope quirks
      
        this.$q.dialog({
          message: this.$t('label.DoYouWantToCreateAnAccount'),
          ok: true,
          cancel: true
        }).onOk(async () => {
          _this.openUpdateProfilePage()
        })
      }
    },
    userIsConnected() {
      if (this.$store.state.user.name === '-') {
        return false
      } else {
        return true
      }
    },
    /*
     * Modify a quest
     */
    modifyQuest(questId) {
      this.$router.push('/quest/builder/' + questId)
    },
    /*
     * Read more links
     */
    readMore() {
      Notification(this.$t('label.QuestDownloadFinished'), 'positive')
    },
    /*
     * Open a user profile
     */
    openProfile(id) {
      if (!id) {
        id = this.$store.state.user.id
      }
      this.$router.push('/profile/' + id)
    },
    /*
     * Open search page
     */
    openSearch() {
      this.$router.push('/search')
    },
    /*
     * Open ranking page
     */
    openRanking() {
      this.$router.push('/user/ranking')
    },
    /*
     * get profile image
     */
    getProfileImage () {
      if (this.user.picture && this.user.picture.indexOf('http') !== -1) {
        return this.user.picture
      } else if (this.user.picture) {
        return this.serverUrl + '/upload/profile/' + this.user.picture
      } else {
        return 'statics/images/icon/profile-small.png'
      }
    }
  }/*,
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
  }*/
}
</script>

<style>
.q-item-label > p { padding: 0; margin: 0; }

.no-internet-connection {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}
.no-internet-connection .q-icon {
  font-size: 3rem;
  margin-right: 1rem;
}
.no-internet-connection p {
  font-size: 1.5rem;
  margin: 0;
}
.reward {
  width: 50%
}
.reward.disabled {
  filter: brightness(0);
  -webkit-filter: brightness(0);
  -moz-filter: brightness(0);
}
.tab-content-80 {
  overflow: auto;
  height: 100%;
  height: -webkit-calc(100% - 80px);
  height: -moz-calc(100% - 80px);
  height: calc(100% - 80px);
  padding-bottom: 130px;
}
.tab-content-180 {
  overflow: auto;
  height: 100%;
  height: -webkit-calc(100% - 180px);
  height: -moz-calc(100% - 180px);
  height: calc(100% - 180px);
  padding-bottom: 130px;
}
</style>
