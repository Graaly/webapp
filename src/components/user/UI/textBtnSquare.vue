<template>
  <q-btn
    :style="cssVars"
    :type="submit ? 'submit' : 'button'"
    class="btn"
    :class="outlined ? 'outlined' : ''"
    :loading="loading"
    :disable="disable"
  >
    <div class="square-shadow"></div>
    <div class="square-icon">
      <q-icon class="btn-icon" :name="icon" />
    </div>
    <p class="btn-title">{{ title }}</p>
    <template v-slot:loading>
      <div class="square-shadow"></div>
      <div class="square-icon flex items-center justify-center">
        <q-spinner-dots class="btn-loading btn-icon" style="width: 35px;height: 35px;"/>
      </div>

      <span class="btn-loading">{{ loadingText }}</span>
    </template>
  </q-btn>
</template>

<script>
import { colors } from 'quasar'

export default {
  name: "textBtnSquare",
  props: {
    color: String,
    icon: String,
    title: String,
    outlined: {
      type: Boolean,
      default: false
    },
    rotation: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: "Loading..."
    },
    submit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

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
    iconRotation() {
      if (this.rotation) {
        return '-135deg'
      } else {
        return '-45deg'
      }
    },
    cssVars() {
      if (this.fill) {
        return {
          "--bg-color": "white",
          "--text-color": this.bgColor,
          "--icon-rotation": this.iconRotation,
          "--bg-darken": colors.lighten("rgb(255,255,255)", -20)
        }
      } else {
        return {
          "--bg-color": this.bgColor,
          "--text-color": "white",
          "--icon-rotation": this.iconRotation,
          "--bg-darken": colors.lighten(this.bgColor, -20)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.btn {
  width: calc(100% - 32px);
  margin-left: 30px;
  height: 50px;
  background: var(--bg-color);
  transition: 500ms;

  &:hover:enabled {
    background: var(--bg-darken);
    .square-shadow {
      background: var(--text-color);
      transform: rotate(45deg) translate(0px, 0px) scale(1.15);
    }
    .square-icon {
      background: var(--bg-color);
    }
    .btn-icon {
      color: var(--text-color);
      transform: rotate(var(--icon-rotation));
    }
  }

  .square-shadow {
    position: absolute;
    height: 50px;
    width: 50px;
    left: -25px;
    top: 0;
    border-radius: 8px;
    transform: rotate(45deg) translate(4px, -4px);
    background: var(--bg-darken);
    transition: 500ms;
  }

  .square-icon {
    position: absolute;
    height: 50px;
    width: 50px;
    left: -25px;
    top: 0;
    border-radius: 8px;
    transform: rotate(45deg);
    background: var(--text-color);
    transition: 500ms;

    .btn-icon {
      font-size: 35px;
      width: 52px;
      height: 52px;
      color: var(--bg-color);
      transform: rotate(-45deg);
      transition: 500ms;
    }
  }

  .btn-title {
    position: relative;
    color: white;
    line-height: 40px;
    font-size: 18px;
    left: 12.5px;
  }
  .btn-loading {
    color: white
  }
}
.btn.outlined{
  background: rgba(0,0,0,0.5);
  border: var(--bg-color) 3px solid;
  &:hover:enabled{
    background: rgba(0,0,0,0.5);
    border: var(--text-color) 3px solid;
    .btn-title{
      color: white;
    }
  }
  .square-shadow, .square-icon{
    top: -3px;
  }
  .btn-title{
    position: relative;
    top: -3px;
    color: var(--bg-color);
  }
  .btn-loading {
    color: var(--bg-color)
  }
}
</style>
