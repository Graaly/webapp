<template>
  <div class="step-type-item">
    <i class="fa" :class="'fa-' + stepType.icon"></i>
    <div>
      <h1>{{ $t('stepType.' + stepType.title) }}</h1>
      <p>{{ $t('stepType.' + stepType.description) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    stepType: {
      icon: String,
      title: String,
      description: String
    }
  }
}
</script>

<style lang="styl" scoped>
@import '~variables'

.fa { color: white; background-color: $primary; font-size: 2rem; padding: 0.5rem; width: 3.3rem; border: 1px solid black; display: flex; justify-content: center; align-items: center; }

.step-type-item { display: flex; flex-flow: row nowrap; margin-bottom: 0.3rem; }
.step-type-item div { flex-grow: 1; border: 1px solid black; border-left: 0px none; padding: 0.3rem; }
.step-type-item h1 { padding: 0; margin: 0; }
.step-type-item p { padding: 0; margin: 0; font-size: 0.9rem; color: gray; }

</style>