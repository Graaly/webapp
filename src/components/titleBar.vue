<template>
  <div class="q-px-md">
    <div class="float-right bar-link">
      <a v-if="link" class="cursor-pointer" @click="clickLink">{{link.text}}</a>
    </div>
    <div :class="'title-bar ' + title.type + '-bar'">
      {{ title.text }}
    </div>
  </div>
</template>

<script>

export default {
  props: ['title', 'link'],
  methods: {
    /*
     * User clicks on the link
     */
    clickLink() {
      this.$emit('click')
    }
  }
}
</script>
