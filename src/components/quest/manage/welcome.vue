<template>
  
  <div>
    <div class="wrapper">
      <h1>{{ $t('message.YourQuest') }}</h1>
      
      <div class="grow" v-html="$t('message.BuilderWelcomeMessage')"></div>
      
      <q-btn color="primary" class="full-width center" @click="$router.push('/quest/create/settings')">{{ $t('message.Start') }}</q-btn>
    </div>
  </div>
  
</template>

<style scoped>
  
  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #main-view > div.wrapper { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; }
  
</style>