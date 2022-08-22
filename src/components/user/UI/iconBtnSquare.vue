<template>
  <div class="relative-position" :class="label ? 'q-mb-lg' : ''" :style="cssVars">
    <q-btn class="btn" flat :disable="disable">
      <div class="square-shadow"></div>
      <div class="square-icon flex items-center justify-center">
        <q-icon class="btn-icon" :name="icon" />
      </div>
    </q-btn>
    <div class="btn-label" v-if="label">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: "iconBtnSquare",
  props: {
    color: String,
    icon: String,
    fill: {
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
    label: {
      type: String,
      default: null
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
          "--icon-rotation": this.iconRotation
        }
      } else {
        return {
          "--bg-color": this.bgColor,
          "--text-color": "white",
          "--icon-rotation": this.iconRotation
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.btn {
  width: 50px;
  height: 50px;
  transform: rotate(45deg);

  &:hover:enabled {
    background: transparent;
    .square-shadow {
      background: var(--text-color);
      transform: translate(0px, 0px) scale(1.15);
    }
    .square-icon {
      background: var(--bg-color);
    }
    .btn-icon {
      color: var(--text-color);
      transform: rotate(var(--icon-rotation));
    }
  }
}
.square-shadow{
  position: absolute;
  height: 45px;
  width: 45px;
  border-radius: 8px;
  transform:translate(4px, -4px);
  background: var(--bg-color);
  transition: 500ms;
}
.square-icon {
  position: absolute;
  height: 45px;
  width: 45px;
  border-radius: 8px;
  background: var(--text-color);
  transition: 250ms;
  .btn-icon {
    font-size: 30px;
    color: var(--bg-color);
    transform: rotate(-45deg);
    transition: 500ms;
  }
}
.btn-label{
  position: absolute;
  overflow: hidden;
  text-align: center;
  top: 58px;
  width: 100px;
  left: calc(50% - 50px);
  color: var(--bg-color);
  white-space: nowrap;
  text-transform: uppercase;
  font-size: 14px;
}
</style>
