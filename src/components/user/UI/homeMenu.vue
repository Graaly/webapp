<template>
<div class="home-menu" :style="cssVars">
  <div class="menu-transparent"></div>
    <q-list class="nav flex justify-between no-wrap">
      <q-item class="q-pa-none menu-btn graaly" clickable manual-focus :active="link === 'graaly'" active-class="active" @click="goToHome()">
        <q-item-section class="flex justify-center items-center">
          <q-icon class="btn-icon" :name="link === 'graaly' ? 'svguse:../../../statics/new/graaly-icon-color.svg#color' : 'svguse:../../../statics/new/graaly-icon-color.svg#white'" />
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none menu-btn" clickable manual-focus :active="link === 'search'" active-class="active" @click="openSearch()">
        <q-item-section class="flex justify-center items-center">
          <q-icon class="btn-icon" name="search" />
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none menu-btn-center" clickable manual-focus :active="link === 'scan'" active-class="active" @click="startScanQRCode()">
        <q-item-section class="flex justify-center items-center">
          <div class="square-shadow"></div>
          <div class="square-icon flex items-center justify-center">
            <q-icon class="btn-icon" name="qr_code_scanner" />
          </div>
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none menu-btn right" clickable manual-focus :active="link === 'create'" active-class="active" @click="buildQuest()">
        <q-item-section class="flex justify-center items-center">
          <q-icon class="btn-icon material-icons-outlined" name="extension" />
        </q-item-section>
      </q-item>
      <q-item class="q-pa-none menu-btn right" clickable manual-focus :active="link === 'profil'" active-class="active" @click="openProfile()">
        <q-item-section class="flex justify-center items-center">
          <q-icon class="btn-icon material-icons-outlined" name="badge" />
        </q-item-section>
      </q-item>
      <q-item class="admin-icon">
        <icon-btn-square v-if="$store.state.user.isAdmin" :color="color" icon="admin_panel_settings" :fill="link !== 'admin'" @click.native="openAdminPage()"/>
      </q-item>
      <q-item class="back-icon">
        <icon-btn-square v-if="link !== 'graaly'" :color="color" icon="arrow_back" fill @click.native="back()"/>
      </q-item>
    </q-list>
</div>
</template>

<script>
import iconBtnSquare from "./iconBtnSquare";
import textBtnSquare from "./textBtnSquare";
import createProfilDialog from "../Dialog/createProfilDialog";
export default {
  name: "homeMenu",
  components: {iconBtnSquare, textBtnSquare, createProfilDialog},
  props: {
    color: {
      type: String,
      default: 'rgb(214,11,81)'
    }
  },
  data() {
    return {
      link: 'graaly',
      offline: {
        available: window.cordova,
        show: false,
        active: false,
        quest: null
      }
    }
  },
  computed: {
    bgColor() {
      if (this.color === 'primary') {
        return 'rgb(238,102,8)'
      } else if (this.color === 'secondary') {
        return 'rgb(243,146,0)'
      } else if (this.color === 'accent') {
        return 'rgb(214,11,81)'
      } else {
        return this.color
      }
    },
    cssVars() {
      return {
        "--bg-color": this.bgColor
      }
    }
  },
  watch: {
    $route (to, from) {
      //console.log('to', to)
      switch (to.name) {
        case 'home':
          this.link = 'graaly'
          break
        case 'search':
          this.link = 'search'
          break
        case 'buildhome':
          this.link = 'create'
          break
        case 'profile':
          this.link = 'profil'
          break
        case 'admin':
          this.link = 'admin'
          break
        case 'camera':
          this.link = 'scan'
          break
        default:
          this.link = 'graaly'
          break
      }
    }
  },
  methods: {
    back() {
      this.$router.go(-1)
    },
    startScanQRCode() {
      if (!this.offline.active) {
        //this.link = 'scan'
        this.$router.push('/scanQrCode')
      }
    },
    openAdminPage() {
      if (!this.offline.active) {
        //this.link = 'admin'
        this.$router.push('/admin')
      }
    },
    openSearch() {
      if (!this.offline.active) {
        //this.link = 'search'
        this.$router.push('/search/quest/around')
      }
    },
    goToHome() {
      //this.link = 'graaly'
      this.$router.push('/home')
    },
    openProfile(id) {
      if (!this.offline.active) {
        if (!id) {
          id = this.$store.state.user.id
        }
        //this.link = 'profil'
        this.$router.push('/profile/' + id)
      }
    },
    openUpdateProfilePage() {
      //this.link = 'create'
      this.$router.push('/user/updateprofile')
    },
    buildQuest() {
      if (this.userIsConnected()) {
        //this.link = 'create'
        this.$router.push('/quest/create/welcome')
      } else {
        this.createProfilDialog()
      }
    },
    userIsConnected() {
      if (this.$store.state.user.name === '-') {
        return false
      } else {
        return true
      }
    },
    createProfilDialog() {
      this.$q.dialog({
        component: createProfilDialog,
        parent: this
      })
      .onOk(() => {
        this.openUpdateProfilePage()
      })
    }
  }
}
</script>

<style scoped lang="scss">
.q-focusable:focus .q-focus-helper,
.q-hoverable:hover .q-focus-helper{
  opacity: 0!important;
  transition: unset;
}
.home-menu{
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgb(4,20,45);

  .menu-transparent{
    height: 60px;
    width: 100%;
    position: absolute;
    bottom: 61px;
    background: linear-gradient(0deg, rgba(4,20,45,1) 0%, rgba(4,20,45,0) 100%);
    pointer-events: none;
  }
  .nav {
    max-width: 400px;
    margin: 0 auto;

    .menu-btn {
      position: relative;
      color: white;
      margin-bottom: 10px;
      font-size: 36px;
      padding: 10px 5px;
      width: 70px;
      &:before{
        content:"";
        border-radius: 1px;
        width: 0;
        position: absolute;
        height: 4px;
        transform: skew(45deg);
        background: var(--bg-color);
        bottom: 0;
        left: 50%;
        right: 0;
        transition: 500ms;
      }
      &.right:before{
        transform: skew(-45deg);
      }
      &:hover{
        &:before{
          width: 100%;
          left: 0;
        }
      }
      &.active{
        color: var(--bg-color);
      }

    }
    .menu-btn-center {
      z-index: 5;
      transform: rotate(-45deg) translate(18px, -18px);
      width: 60px;
      box-shadow: -0px 0px 5px black;
      .square-shadow {
        position: absolute;
        height: 65px;
        width: 65px;
        border-radius: 8px;
        background: white;
        transition: 500ms;
      }
      .square-icon {
        position: absolute;
        height: 60px;
        width: 60px;
        border-radius: 8px;
        background: var(--bg-color);
        transition: 250ms;
        .btn-icon {
          font-size: 36px;
          color: white;
          transform: rotate(-45deg);
          transition: 500ms;
        }
      }
      &:hover, &.active{
        box-shadow: -0px 0px 15px black;
        .square-shadow{
          background: var(--bg-color);
        }
        .square-icon{
          background: white;
          .btn-icon{
            color: var(--bg-color);
            font-size: 48px;
          }
        }
      }
    }
    .admin-icon{
      position: absolute;
      bottom: 70px;
      left: calc(50% + 12px);
    }
    .back-icon{
      position: absolute;
      bottom: 70px;
      right: calc(50% + 20px);
    }
  }
}
</style>
