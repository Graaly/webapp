<template>
  <div class="column" ref="div-column">
    
    <!--====================== MAP PAGE =================================-->
    
    <div class="row fullscreen" ref="map" v-if="geolocationIsSupported">
      
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
        <gmap-marker :position="{ lng: user.position.longitude, lat: user.position.latitude }" :icon="setMapIcon()" @click="openDiscoveryQuest()" />
        
        <gmap-marker v-for="(quest, index) in questList" :key="quest._id" :position="{ lng: quest.location.coordinates[0], lat: quest.location.coordinates[1] }" :icon="setMapIcon(quest)"
          @click="openQuestSummary(quest, index)" />
        
        <gmap-info-window :options="map.infoWindow.options" :position="map.infoWindow.location" :opened="map.infoWindow.isOpen" @closeclick="map.infoWindow.isOpen=false">
          <div class="infoWindow">
            <p class="title" v-html="getQuestTitle(currentQuest, true)"></p>
            <p>{{ $t('label.Difficulty') }} : <img class="image-and-text-aligned" src="statics/icons/game/magnifying-red.png" /><img class="image-and-text-aligned" :src="'statics/icons/game/magnifying-' + ((currentQuest && currentQuest.level === 1) ? 'grey' : 'red') + '.png'" /><img class="image-and-text-aligned" :src="'statics/icons/game/magnifying-' + ((currentQuest && currentQuest.level === 3) ? 'red' : 'grey') + '.png'" /></p>
            <q-btn v-if="currentQuest && currentQuest.authorUserId !== $store.state.user._id" @click="$router.push('/quest/play/' + (currentQuest ? currentQuest._id : ''))" color="primary">{{ $t('label.Play') }}</q-btn>
            <q-btn v-if="currentQuest && currentQuest.authorUserId === $store.state.user._id" @click="$router.push('/quest/settings/' + (currentQuest ? currentQuest._id : ''))" color="primary">{{ $t('label.Modify') }}</q-btn>
          </div>
        </gmap-info-window>
      </gmap-map>
    </div>
    
    <!------------------ NO GEOLOCATION AREA ------------------------>
    
    <div class="row enable-geolocation fixed-center centered" v-if="!geolocationIsSupported">
      <div class="col-12">
        <p class="text-primary">{{ $t('label.PleaseActivateGeolocation') }}</p>
        <div v-if="nativeSettingsIsEnabled">
          <q-btn color="primary" @click="openLocationSettings">{{ $t('label.PressHere') }}</q-btn>
        </div>
        <div v-if="!nativeSettingsIsEnabled">
          <div v-if="isChrome">
            <p v-html="$t('label.HowToActivateGeolocationOnChrome')"></p>
          </div>
          <div v-if="!isChrome">
            <p v-html="$t('label.HowToActivateGeolocationOnIOs')"></p>
          </div>
          <p>
            {{ $t('label.OnceGeolocationEnabled') }}
            <router-link :to="$route.path + '?_=' + (new Date).getTime()">{{ $t('label.PressHere') }}</router-link>.
          </p>
        </div>
      </div>
    </div>
    
    <!------------------ SCORE AREA ------------------------>
    
    <div class="score-box" @click="openRanking">
      <div class="q-px-md q-pt-md score-text">{{ $store.state.user.score }} <q-icon name="fas fa-trophy" /></div>
      <div style="width: 100px">
        <div class="centered bg-primary text-white" style="height: 12px; font-size: 10px; text-shadow: none;">{{ $t('label.MyLevel') }}: {{ $store.state.user.level }}</div>
        <q-progress :percentage="profile.level.progress" stripe height="10px" animate color="primary"></q-progress>
      </div>
    </div>
    <div class="coin-box">
      <div class="q-pa-md score-text">
        <q-icon name="fas fa-bolt" /> {{ $store.state.user.coins }} 
        <q-icon name="add_circle" v-if="$store.state.user.coins < 200" @click.native="buyCoins()" color="primary" />
      </div>
    </div>
    
    <!--====================== SUCCESS PAGE =================================-->
    
    <q-layout-drawer class="over-map" side="left" v-model="showSuccess">
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs two-lines>
        <q-tab slot="title" name="built" icon="add_box" :label="$t('label.QuestsCreated')" default />
        <q-tab slot="title" name="played" icon="play_circle_filled" :label="$t('label.QuestsSuccessful')" />
      
        <!------------------ LIST OF QUESTS BUILT TAB ------------------------>
        
        <q-tab-pane name="built">
        
          <!------------------ ADD A QUEST BUTTON AREA ------------------------>
            
          <q-btn link class="full-width" @click="$router.push('/quest/create/welcome')" color="tertiary">{{ $t('label.CreateANewQuest') }}</q-btn>
          
          <!------------------ LIST OF QUESTS BUILT AREA ------------------------>
          
          <q-list highlight>
            <q-item v-for="quest in success.quests.built" :key="quest._id" @click.native="$router.push('/quest/settings/' + quest._id)">
              <q-item-side v-if="quest.picture" :avatar="serverUrl + '/upload/quest/' + quest.picture" />
              <q-item-side v-if="!quest.picture" :avatar="'statics/profiles/noprofile.png'" />
              <q-item-main>
                <q-item-tile label>{{ getQuestTitle(quest, false) }}</q-item-tile>
                <q-item-tile sublabel v-if="quest.status === 'published'">
                  <q-rating readonly :value="(quest.rating && quest.rating.rounded) ? quest.rating.rounded : null" color="primary" :max="5" size="1rem" />
                  {{ $t('label.PublishedSince') }} {{quest.dateCreated | formatDate}}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'unpublished'">
                  {{ $t('label.Unpublished') }}
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'tovalidate'">
                  {{ $t('label.PublicationRequested') }} ...
                </q-item-tile>
                <q-item-tile sublabel v-if="quest.status == 'rejected'" style="color: #f00">
                  {{ $t('label.PublicationRejected') }}
                </q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-if="success.quests.built.length === 0">
              <q-item-main>
                <q-item-tile label>{{ $t('label.NoQuestCreated') }}</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-tab-pane>
        
        <!------------------ LIST OF QUESTS PLAYED TAB ------------------------>
        
        <q-tab-pane name="played">
          <q-list highlight>
          <q-item v-if="success.quests.played && success.quests.played.length > 0" v-for="quest in success.quests.played" :key="quest._id" @click.native="$router.push('/quest/play/'+quest.questId)">
            <q-item-side v-if="quest.questData && quest.questData.picture" :avatar="((quest.questData.picture && quest.questData.picture[0] === '_') ? 'statics/images/quest/' + quest.questData.picture : serverUrl + '/upload/quest/' + quest.questData.picture)" />
            <q-item-side v-if="!quest.questData || !quest.questData.picture" :avatar="'statics/profiles/noprofile.png'" />
            <q-item-main>
              <q-item-tile label>{{ getQuestTitle(quest.questData, false) }} {{ quest.type }}</q-item-tile>
              <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && !quest.score">
                {{ $t('label.PlayedOn') }} {{quest.dateCreated | formatDate}}
              </q-item-tile>
              <q-item-tile sublabel v-if="quest.dateCreated && quest.status == 'finished' && quest.score">
                {{ $t('label.Succeeded') }} {{quest.dateCreated | formatDate}}
              </q-item-tile>
              <q-item-tile sublabel v-if="!quest.dateCreated">
                {{ $t('label.Succeeded') }}
              </q-item-tile>
              <q-item-tile sublabel v-if="quest.status == 'in-progress'">
                {{ $t('label.ContinueThisQuest') }}
              </q-item-tile>
            </q-item-main>
            <q-item-side right class="score" v-if="!quest.questData.type || quest.questData.type === 'quest'">
              {{ quest.score }} <q-icon name="fas fa-trophy" />
            </q-item-side>
            <q-item-side right class="score" v-if="quest.questData.type && quest.questData.type !== 'quest'">
              {{ quest.reward }} <q-icon name="fas fa-bolt" />
            </q-item-side>
          </q-item>
          <q-item v-if="success.quests.played.length === 0">
            <q-item-main>
              <q-item-tile label>{{ $t('label.NoQuestPlayed') }}</q-item-tile>
            </q-item-main>
          </q-item>
        </q-list>
        </q-tab-pane>
        
      </q-tabs>

    </q-layout-drawer>
    
    <!--====================== PROFILE PAGE =================================-->
    
    <q-layout-drawer class="over-map" side="right" v-model="showProfile" :width="innerWidth">
    
      <!------------------ HEADER AREA ------------------------>
        
      <div class="header row">
        <div class="col-4">
          <div class="big-avatar">
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') !== -1" :style="'background-image: url(' + $store.state.user.picture + ');'"></div>
            <div v-if="$store.state.user.picture && $store.state.user.picture.indexOf('http') === -1" :style="'background-image: url(' + serverUrl + '/upload/profile/' + $store.state.user.picture + ');'"></div>
            <div v-if="!$store.state.user.picture" :style="'background-image: url(statics/icons/game/profile-small.png); background-color: #fff;'"></div>
            <label for="picturefile">{{ $t('label.Edit') }}</label>
            <input @change="uploadImage" name="picturefile" id="picturefile" type="file" accept="image/*" style="width: 0.1px;height: 0.1px;opacity: 0;overflow: hidden;position: absolute;z-index: -1;">
          </div>
        </div>
        <div class="col">
          <div class="title">{{ $store.state.user.name }}</div>
          <q-btn :label="$t('label.SignOut')" icon="power_settings_new" @click.native="Disconnect()" flat />
        </div>
      </div>
      
      <!------------------ TABS AREA ------------------------>
      
      <q-tabs>
        <q-tab slot="title" name="profile" icon="face" :label="$t('label.MyProfile')" />
        <q-tab slot="title" name="friends" icon="supervised_user_circle" :label="$t('label.Friends')" />
        <q-tab slot="title" name="news" icon="notifications" :label="$t('label.News')" default />
      
        <!------------------ PROFILE TAB ------------------------>
        
        <q-tab-pane name="profile">
          <form @submit.prevent="submitProfileChanges()">
            <q-field icon="account circle" :label="$t('label.EditYourInformations')" class="padding-medium">
              <q-field :error="$v.profile.form.name.$error">
                <q-input v-model="profile.form.name" :stack-label="$t('label.YourName')" placeholder="John Doe" @blur="$v.profile.form.name.$touch" />
                <div class="q-field-bottom" v-if="profile.form.name.$error">
                  <div class="q-field-error" v-if="!profile.form.name.required">{{ $t('label.PleaseEnterYourName') }}</div>
                </div>
              </q-field>
              <q-field :error="$v.profile.form.email.$error" v-if="profile.userCanChangeEmail">
                <q-input v-model="profile.form.email" :stack-label="$t('label.YourEmail')" :placeholder="$t('label.emailExample')" @blur="$v.profile.form.email.$touch" />
                <div class="q-field-bottom" v-if="profile.form.email.$error">
                  <div class="q-field-error" v-if="!profile.form.email.required">{{ $t('label.PleaseEnterYourEmailAddress') }}</div>
                  <div class="q-field-error" v-if="!profile.form.email.email">{{ $t('label.PleaseEnterAValidEmailAddress') }}</div>
                </div>
              </q-field>
              <q-field :error="$v.profile.form.country.$error">
                <q-select :stack-label="$t('label.YourCountry')" v-model="profile.form.country" :options="profile.countries" />
                <div class="q-field-bottom" v-if="profile.form.country.$error">
                   <div class="q-field-error" v-if="!profile.form.country.required">{{ $t('label.PleaseSelectYourCountry') }}</div>
                </div>
              </q-field>
              <q-field :error="$v.profile.form.zipCode.$error">
                <q-input v-model="profile.form.zipCode" :stack-label="$t('label.YourZipCode')" placeholder="38500"  />
                <div class="q-field-bottom" v-if="profile.form.zipCode.$error">
                  <div class="q-field-error" v-if="!profile.form.zipCode.required">{{ $t('label.PleaseEnterYourZipCode') }}</div>
                </div>
              </q-field> 
              <q-field>
                <q-select :stack-label="$t('label.YourLanguage')" v-model="profile.form.language" :options="languages" @input="changeLanguage" />
              </q-field> 
              <q-btn color="primary" class="full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
            </q-field>
            <q-field icon="lock" :label="$t('label.ChangeYourPassword')" class="padding-medium" v-if="profile.userCanChangePassword">
              <q-field>
                <q-input type="password" v-model="profile.form.oldPassword" :stack-label="$t('label.CurrentPassword')" />
              </q-field>
              <q-field>
                <q-input type="password" v-model="profile.form.newPassword" :stack-label="$t('label.NewPassword')" />
              </q-field>
              <q-btn color="primary" class="full-width" @click="submitProfileChanges()">{{ $t('label.Save') }}</q-btn>
            </q-field>
          </form>
        </q-tab-pane>
        
        <!------------------ FRIENDS TAB ------------------------>
        
        <q-tab-pane name="friends">
          <q-list highlight>
            <q-item v-for="friend in friends.list" :key="friend.friendId" @click.native="openFriendCard(friend.friendId)">
              <q-item-side>
                <q-item-tile avatar>
                  <img v-if="friend.picture && friend.picture !== '' && friend.picture.indexOf('http') !== -1" :src="friend.picture" />
                  <img v-if="friend.picture && friend.picture !== '' && friend.picture.indexOf('http') === -1" :src="serverUrl + '/upload/profile/' + friend.picture" />
                  <img v-if="!friend.picture || friend.picture === ''" src="statics/icons/game/profile-small.png" />
                </q-item-tile>
              </q-item-side>
              <q-item-main>
                <q-item-tile>{{ friend.name }}</q-item-tile>
              </q-item-main>
            </q-item>
            <q-item v-if="friends.list.length === 0">
              <q-item-main>
                <q-item-tile label>{{ $t('label.NoFriend') }}</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-tab-pane>
        
        <!------------------ NEWS TAB ------------------------>
        
        <q-tab-pane name="news">
          <q-infinite-scroll :handler="loadNews">
            <q-list highlight>
              <q-item v-for="(item, index) in friends.news.items" :key="item._id">
                <q-item-side v-if="item.data.picture && item.data.picture.indexOf('http') !== -1" :avatar="item.data.picture" />
                <q-item-side v-if="item.data.picture && item.data.picture.indexOf('http') === -1" :avatar="serverUrl + '/upload/profile/' + item.data.picture" />
                <q-item-side v-if="!item.data.picture" avatar="statics/icons/game/profile-small.png" />
                <q-item-main>
                  <q-item-tile label v-if="item.data && item.data.userId">{{ item.data.name }}</q-item-tile>
                  <q-item-tile label v-if="item.type === 'standard'">
                    {{ item.title }}
                  </q-item-tile>
                  <q-item-tile label v-if="item.type !== 'standard'">
                    <p v-html="$t('news.' + item.type, item.data)"></p>
                    <span v-if="item.type === 'challengeWon'">{{ $t('challenge.' + item.data.name) }}</span>
                  </q-item-tile>
                  <q-item-tile sublabel>
                    {{item.creation.date | formatDate}}
                    <span v-if="item.destination === 'friends'">
                      - 
                      <a style="color: #000" v-if="!isLiked(item)" v-on:click="like(index)">{{ $t('label.Like') }}</a>
                      <a v-if="isLiked(item)" v-on:click="unlike(index)">{{ $t('label.Like') }}</a>
                      <span v-if="item.likes.length > 0">({{ item.likes.length }})</span>
                    </span>
                  </q-item-tile>
                </q-item-main>
              </q-item>
              <q-item v-if="friends.news.items.length === 0">
                <q-item-main>
                  <q-item-tile label>{{ $t('label.NoNews') }}</q-item-tile>
                </q-item-main>
              </q-item>
            </q-list>
            <div slot="message" class="row justify-center" style="margin-bottom: 50px;">
              <q-spinner-dots :size="5" />
            </div>
          </q-infinite-scroll>
        </q-tab-pane>
        
      </q-tabs>

    </q-layout-drawer>
    
    <!--====================== SEARCH PAGE =================================-->
    
    <q-modal v-model="showSearch" class="over-map">
      <div class="column" ref="div-column">
        <div class="row q-pa-md">
          <q-search 
            v-model="search.text" 
            @input="findQuests()" 
            :after="[
              {
                icon: 'close',
                handler () {
                  closeSearch()
                }
              }
            ]"
          />
        </div>
        <div class="row">
          <q-list highlight>
            <q-item v-for="item in search.quests" :key="item._id">
              <q-card inline class="q-ma-sm">
                <q-card-media class="preview" overlay-position="top">
                  <img :src="serverUrl + '/upload/quest/' + item.picture" />

                  <q-card-title slot="overlay" @click.native="$router.push(item.authorUserId === $store.state.user._id ? '/quest/settings/' + item._id : '/quest/play/' + item._id)">
                    {{ getQuestTitle(item, true) }}
                    <q-rating slot="subtitle" v-if="item.rating" v-model="item.rating" color="primary" :max="5" />
                    <span slot="right" class="row items-center text-white" v-if="item.distance && item.distance > 0 && item.distance <= 99">
                      <q-icon color="white" name="place" /> {{ item.distance }} {{ $t('label.km') }}
                    </span>
                    <span slot="right" class="row items-center text-white" v-if="item.distance === 0">
                      <q-icon color="white" name="place" /> <1 {{ $t('label.km') }}
                    </span>
                    <span slot="right" class="row items-center text-white" v-if="item.distance > 99">
                      <q-icon color="white" name="place" /> >99 {{ $t('label.km') }}
                    </span>
                  </q-card-title>
                </q-card-media>
              </q-card>
            </q-item>
          </q-list>
          <q-item v-show='search.quests.length == 0' @click.native="$router.push('/quest/create')">
            <q-item-side>
              <q-icon name="explore" size="2rem" />
            </q-item-side>
            <q-item-main>
              <q-item-tile label>{{ $t('label.NoQuestForThisSearch') }}</q-item-tile>
              <q-item-tile sublabel>
                <a @click="$router.push('/quest/create')">{{ $t('label.WhyDontYouCreateAQuest') }}</a>
              </q-item-tile>
            </q-item-main>
          </q-item>
          
        </div>
        
      </div>
    </q-modal>
    
    <!--====================== FRIEND PAGE =================================-->
    
    <q-modal v-model="friends.show" class="over-map">
       <div class="panel-bottom q-pa-md">
        <a class="float-right no-underline" color="grey" @click="friends.show = false"><q-icon name="close" class="medium-icon" /></a>
        <h1 class="size-3 q-pl-md">{{ friends.selected.name }}</h1>
        <q-tabs two-lines>
          <q-tab slot="title" name="friendranking" icon="star" :label="$t('label.Ranking')" default />
          <q-tab slot="title" name="friendbuilt" icon="add_box" :label="$t('label.QuestsCreated')" />
          <q-tab slot="title" name="friendplayed" icon="play_circle_filled" :label="$t('label.QuestsSuccessful')" />
          <q-tab-pane name="friendranking">
            
          </q-tab-pane>
          <q-tab-pane name="friendbuilt">
            
          </q-tab-pane>
          <q-tab-pane name="friendplayed">
            
          </q-tab-pane>
        </q-tabs>
      </div>
    </q-modal>
    
    <!--====================== SHOP PAGE =================================-->
    
    <q-modal v-model="shop.show" class="over-map">
      <a class="float-right no-underline q-pa-md" color="grey" @click="closeShop"><q-icon name="close" class="medium-icon" /></a>
      <h1 class="size-3 q-pl-md">{{ $t('label.Shop') }}</h1>
      <shop @close="closeShop"></shop>
    </q-modal>
    
    <!--====================== RANKING PAGE =================================-->
    
    <q-modal v-model="ranking.show" class="over-map">
      <a class="float-right no-underline q-pa-md" color="grey" @click="closeRanking"><q-icon name="close" class="medium-icon" /></a>
      <h1 class="size-3 q-pl-md">{{ $t('label.YourRanking') }}</h1>
      <q-list>
        <q-list-header>{{ $t("label.Level") }}</q-list-header>
        <q-item multiline>
          <q-item-side icon="trending_up" color="primary" />
          <q-item-main>
            <q-item-tile label>{{ $t('label.MyLevel') }}: {{ $store.state.user.level }}</q-item-tile>
            <q-item-tile sublabel>{{ $t('label.ReachScoreOf', {score: profile.level.max}) }}</q-item-tile>
          </q-item-main>
          <q-item-side right>
            <q-progress :percentage="profile.level.progress" color="primary" height="18px" style="width: 75px" />
          </q-item-side>
        </q-item>
      </q-list>
      <q-list v-if="$store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings">
        <q-list-header>{{ $t("label.Rankings") }}</q-list-header>
        <q-item>
          <q-item-side icon="public" color="primary" />
          <q-item-main :label="$t('label.YourWorldRanking') + ': ' + $store.state.user.statistics.rankings.world" />
        </q-item>
        <q-item>
          <q-item-side icon="home" color="primary" />
          <q-item-main :label="$t('label.YourCityRanking') + ': ' + $store.state.user.statistics.rankings.town" />
        </q-item>
      </q-list>
      <q-list v-if="success.ranking && success.ranking.length > 0">
        <q-list-header>{{ $t("label.TerritoriesWon") }}</q-list-header>
        <q-item v-for="(item, index) in success.ranking" :key="index">
          <q-item-side v-if="item.playedNb < item.totalNb">
            <q-icon name="flag" size="2rem" color="grey" />
          </q-item-side>
          <q-item-side v-if="item.playedNb >= item.totalNb">
            <q-icon name="flag" size="2rem" color="primary" />
          </q-item-side>
          <q-item-main :label="item.town" />
          <q-item-side right v-if="item.playedNb < item.totalNb">
            <q-progress :percentage="parseInt((item.playedNb / item.totalNb) * 100, 10)" color="primary" height="18px" style="width: 75px" />
          </q-item-side>
        </q-item>
        <q-item>
        {{ $t("label.PlayAllQuestsInACityToWin") }}
        </q-item>
      </q-list>
      
      <p v-if="!($store.state.user && $store.state.user.statistics && $store.state.user.statistics.rankings) && !(success.ranking && success.ranking.length > 0)">
        {{ $t("label.NoRankingYet") }}
      </p>
    </q-modal>
    
    <!--====================== MENU =================================-->
    
    <div class="fixed-bottom over-map">
      <div class="menu-background"></div>
      <div class="menu row" v-touch-swipe.horizontal="swipeMenu">
        <div class="col-4 centered" @click="openSuccessPage()">
          <q-btn icon="fingerprint" round color="primary" />
        </div>
        <div class="col-4 centered" @click="openSearchOptions()">
          <img src="statics/icons/game/menu-main.png" />
        </div>
        <div class="col-4 centered" @click="openProfilePage()">
          <q-btn icon="group" round color="primary" />
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
      <div class="centered bg-warning q-pa-sm" v-if="warnings.noNetwork">
        <q-spinner-radio class="on-left" /> {{ $t('label.WarningNoNetwork') }}
      </div>
    </div>
    
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
import shop from 'components/shop'
import story from 'components/story'
import utils from 'src/includes/utils'
import { required, email } from 'vuelidate/lib/validators'
import { QSpinnerDots, QInfiniteScroll } from 'quasar'
import { gmapApi } from 'vue2-google-maps'

import Notification from 'plugins/NotifyHelper'
import LevelCompute from 'plugins/LevelCompute'

import questLevels from 'data/questLevels.json'
import countriesFR from 'data/countries_fr.json'
import countriesEN from 'data/countries_en.json'
import languages from 'data/languages.json'

export default {
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    shop,
    story
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
        }
      },
      search: {
        quests: [],
        text: ''
      },
      user: {
        position: {
          latitude: 0,
          longitude: 0
        }
      },
      friends: {
        list: [],
        news: {
          limit: 20,
          skip: 0,
          items: []
        },
        show: false,
        selected: {}
      },
      shop: {
        show: false
      },
      currentQuestIndex: null,
      currentQuest: null,
      geolocationIsSupported: false,
      searchText: '',
      questList: [],
      serverUrl: process.env.SERVER_URL,
      showSuccess: false,
      showProfile: false,
      showSearch: false,
      nativeSettingsIsEnabled: true,
      warnings: {
        lowBattery: false,
        noLocation: false,
        noNetwork: false
      },
      success: {
        quests: {
          played: [],
          built: []
        },
        ranking: []
      },
      profile: {
        level: {},
        progress: 10,
        form: {name: "--", picture: "", email: "", zipCode: "", country: "", oldPassword: "", newPassword: "", language: "en"},
        countries: this.$i18n.locale === 'fr' ? countriesFR : countriesEN,
        userCanChangeEmail: true,
        userCanChangePassword: true
      },
      story: {
        step: null,
        data: null
      },
      ranking: {
        show: false
      },
      languages: utils.buildOptionsForSelect(languages, { valueField: 'code', labelField: 'name' }, this.$t),
      isMounted: false,
      innerWidth: window.innerWidth
    }
  },
  computed: {
    // from https://stackoverflow.com/a/13348618/488666
    // adapted because my Android Chrome User Agent contains 'OPR'!
    // (Mozilla/5.0 (Linux; Android 8.0.0; ASUS_Z012D Build/OPR1.170623.026) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.109 Mobile Safari/537.36)
    isChrome() {
      let isChromium = window.chrome,
        winNav = window.navigator,
        vendorName = winNav.vendor,
        //isOpera = winNav.userAgent.indexOf("OPR") > -1,
        isIEedge = winNav.userAgent.indexOf("Edge") > -1,
        isIOSChrome = winNav.userAgent.match("CriOS");
      if (isIOSChrome) {
        return true;
      } else if (
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        //isOpera === false &&
        isIEedge === false
      ) {
        return true;
      } else {
        return false;
      }
    },
    google: gmapApi
  },
  mounted() {
    this.findLocation()
    window.addEventListener("batterylow", this.checkBattery, false);
    this.checkNetwork()
    this.startStory()
    // get current level of user
    this.profile.level = LevelCompute(this.$store.state.user.score)
    
    this.$nextTick(() => {
      this.isMounted = true
    })
  },
  methods: {
    closeInfoWindows() {
      this.map.infoWindow.isOpen = false
    },
    /*
     * Get user location
     */
    findLocation() {
      if (navigator && navigator.geolocation) {
        // getCurrentPosition() is not always reliable (timeouts/fails frequently)
        // see https://stackoverflow.com/q/3397585/488666
        this.$q.loading.show()
        navigator.geolocation.getCurrentPosition(async (position) => {
          this.geolocationIsSupported = true
          // TODO maybe here save current position in 'state' for later use in case of failure
          this.user.position.latitude = position.coords.latitude
          this.user.position.longitude = position.coords.longitude
          
          await this.getQuests()
 
          // adjust zoom / pan to nearest quests, or current user location
          if (this.questList.length > 0) {
            // fix found on https://teunohooijer.com/tag/vue2-google-maps/ to use google library
            this.$refs.mapRef.$mapPromise.then((map) => {
              const bounds = new google.maps.LatLngBounds()
              for (let q of this.questList) {
                bounds.extend({ lng: q.location.coordinates[0], lat: q.location.coordinates[1] })
              }
              map.fitBounds(bounds);
            });
          } else {
            this.CenterMapOnPosition(this.user.position.latitude, this.user.position.longitude)
          }

          this.$q.loading.hide()
          this.warnings.noLocation = false
        }, (err) => {
          console.error('geolocation failed', err)
          this.geolocationIsSupported = false
          this.$q.loading.hide()
          // try again in 10s
          setTimeout(this.findLocation, 10000)
          // TODO maybe here recall position stored in 'state'
          this.warnings.noLocation = true
        }, 
        { 
          timeout: 5000, 
          maximumAge: 10000 
        });
      } else {
        this.warnings.noLocation = true
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
     */
    startStory() {
      if (this.$store.state.user.story.step === 0) {
        this.story.step = 0
      }
      if (this.$store.state.user.story.step === 10) {
        this.story.data = {
          score: this.$store.state.user.score
        }
        this.story.step = 10
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
      setTimeout(this.checkNetwork, 20000)
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
     * Get the list of quests near the location of the user
     */
    async getQuests(type) {
      if (!type) {
        this.map.filter = 'all'
      } else {
        this.map.filter = type
      }
      let response = await QuestService.listNearest({ lng: this.user.position.longitude, lat: this.user.position.latitude }, this.map.filter)
      this.questList = response.data
      
      if (this.$store.state.user.story.step === 16) {
        // get the closest quest not already played
        var closestQuest = this.getClosestQuestUnplayed()
        
        if (closestQuest !== null) {
          this.story.data = {
            questId: closestQuest._id,
            quest: this.getQuestTitle(closestQuest, false)
          }
        } else {
          this.story.data = null
        }
        
        this.story.step = 16
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
     * Open the search menu
     */
    openSearchOptions() {
      if (this.showSuccess) {
        this.showSuccess = false
      } else if (this.showProfile) {
        this.showProfile = false
      } else {
        // define available actions
        var actions = [
          {
            label: this.$t('label.CenterOnYourPosition'),
            icon: 'gps_fixed',
            color: 'primary',
            handler: () => {
              this.findLocation()
            }
          },
          {
            label: this.$t('label.BuildAQuestHere'),
            icon: 'add_location',
            color: 'primary',
            handler: () => {
              this.$router.push('/quest/create')
            }
          },
          {}, // separator
          {
            label: this.map.filter === 'best' ? this.$t('label.DisplayAllQuests') : this.$t('label.BestQuests'),
            icon: this.map.filter === 'best' ? 'place' : 'favorite',
            color: 'primary',
            handler: () => {
              if (this.map.filter === 'best') {
                this.getQuests('all')
              } else {
                this.getQuests('best')
              }
            }
          },
          {
            label: this.map.filter === 'easy' ? this.$t('label.DisplayAllQuests') : this.$t('label.OnlyEasy'),
            icon: this.map.filter === 'easy' ? 'place' : 'child_care',
            color: 'primary',
            handler: () => {
              if (this.map.filter === 'easy') {
                this.getQuests('all')
              } else {
                this.getQuests('easy')
              }
            }
          },
          {
            label: this.$t('label.SearchForAQuest'),
            icon: 'search',
            color: 'primary',
            handler: () => {
              this.openSearch()
            }
          }
        ]
        // if admin user
        if (this.$store.state.user.isAdmin) {
          actions.push({
            label: this.$t('label.Administrate'),
            icon: 'settings',
            color: 'primary',
            handler: () => {
              this.openAdminPage()
            }
          })
        }
        
        this.$q.actionSheet({
          grid: false,
          actions: actions,
          dismiss: {
            label: 'Cancel',
            handler: () => {
              this.$q.notify('Cancelled...')
            }
          }
        })
      }
    },
    /*
     * Open the success page
     */
    openSuccessPage() {
      if (!this.showSuccess) {
        this.listCreatedQuests(this.$store.state.user._id)
        this.listPlayedQuests(this.$store.state.user._id)
      }
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
      let response = await UserService.getRanking()
      this.success.ranking = response.data
    },
    /*
     * Get the list of the quests created by the user
     * @param   {string}    id            ID of the user
     */
    async listCreatedQuests(id) {
      let response = await QuestService.ListCreatedByAUser(id)
      this.success.quests.built = response.data
    },
    /*
     * Get the list of the quests played by the user
     * @param   {string}    id            ID of the user
     */
    async listPlayedQuests(id) {
      let response = await QuestService.ListPlayedByAUser(id)
      this.success.quests.played = response.data
    },
    /*
     * Open the profile page
     */
    async openProfilePage() {
      this.showProfile = !this.showProfile
      this.getProfileChangeData(this.$store.state.user._id)
      
      await this.loadFriends()
      //await this.loadNews()

      if (this.$store.state.user.story.step === 14) {
        this.story.step = 14
      }
    },
    /*
     * List friends
     */
    async loadFriends() {
      let response = await UserService.listFriends()
      this.friends.list = response.data
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
      this.friends.news.items[index].likes.push({userId: this.$store.state.user._id, date: new Date()})
      await UserService.likeNews(this.friends.news.items[index]._id)
    },
    /*
     * Unlike news
     */
    async unlike (index) {
      for (var i = 0; i < this.friends.news.items[index].likes.length; i++) {
        if (this.friends.news.items[index].likes[i].userId === this.$store.state.user._id) {
          this.friends.news.items[index].likes.splice(i, 1)
        }
      }
      await UserService.unlikeNews(this.friends.news.items[index]._id)
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
      // load user data
      let friend = await UserService.getFriend(id)
      this.friends.selected = friend.data
      
      // display user page
      this.friends.show = true
    },
    /*
     * Get the user informations
     * @param   {string}    id            ID of the user
     */
    async getProfileChangeData(id) {
      this.profile.form = {
        name: this.$store.state.user.name,
        email: this.$store.state.user.email,
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
          oldPassword: this.profile.form.oldPassword,
          newPassword: this.profile.form.newPassword,
          zipCode: this.profile.form.zipCode,
          country: this.profile.form.country,
          language: this.profile.form.language
        }
        let modificationStatus = await AuthService.modifyAccount(modifications)
        
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
      let uploadPicture = await AuthService.uploadAccountPicture(data)
      if (uploadPicture) {
        this.$store.state.user.picture = uploadPicture.data.file
      }
    },
    /*
     * Disconnection
     */
    Disconnect() {
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
      if (this.$store.state.user.language && quest.title[this.$store.state.user.language] && this.$store.state.user.language !== quest.mainLanguage) {
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
    setMapIcon(quest) {
      var marker = {
        url: 'statics/icons/game/pointer-inactive.png',
        size: {width: 40, height: 40, f: 'px', b: 'px'},
        scaledSize: {width: 40, height: 40, f: 'px', b: 'px'},
        origin: {x: 0, y: 0},
        anchor: {x: 20, y: 40}
      }
      if (quest) {
        if (quest.authorUserId === this.$store.state.user._id) {
          marker.url = 'statics/icons/game/pointer-myquest.png'
        } else {
          if (quest.status !== 'played') {
            if (quest.type === 'quest') {
              marker.url = 'statics/icons/game/pointer-quest.png'
            } else {
              marker.url = 'statics/icons/game/pointer-' + quest.category + '.png'
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
          this.search.quests = response.data
         
          // compute distance
          if (this.geolocationIsSupported) {
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
    },
    /*
     * Close shop
     */
    closeShop () {
      this.shop.show = false
    },
    openLocationSettings () {
      if (window.cordova && window.cordova.plugins.settings) {
        console.log('openNativeSettings is active')
        window.cordova.plugins.settings.open("location", function() {
          console.log('opened settings')
          this.nativeSettingsIsEnabled = true
        },
        function () {
          console.log('failed to open settings')
          this.nativeSettingsIsEnabled = false
        });
      } else {
        console.log('openNativeSettings is not active!')
        this.nativeSettingsIsEnabled = false
      }
    },
    /*
     * Open the ranking page
     */
    openRanking () {
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
    }
  },
  validations: {
    profile: {
      form: {
        email: { required, email },
        name: { required },
        country: { required },
        zipCode: { required }
      }
    }
  }
}
</script>

<style>
.q-item-label > p { padding: 0; margin: 0; }
</style>
