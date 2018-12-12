<template>
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle fit">
      
      <q-carousel quick-nav class="text-white fit">
      
        <!------------------ INTRO SLIDE ------------------------>
        
        <q-carousel-slide class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h1 class="vertical-middle size1">{{ $t('label.WelcomeInGraalyWorld') }}</h1>
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ DISCOVER SLIDE ------------------------>
        
        <q-carousel-slide class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h2 class="vertical-middle">{{ $t('label.DiscoverPlacesAroundYou') }}</h2>
              <img src="statics/images/firstusage1.png" />
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ POINTS SLIDE ------------------------>
        
        <q-carousel-slide class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h2 class="vertical-middle">{{ $t('label.WinPointsAndUnlockQuests') }}</h2>
              <img src="statics/images/firstusage2.png" />
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ EARN SLIDE ------------------------>
        
        <q-carousel-slide class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h2 class="vertical-middle">{{ $t('label.CreateYourQuestsAndWinMoney') }}</h2>
              <img src="statics/images/firstusage3.png" />
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ CUSTOM NAVIGATION BUTTONS ------------------------>
        
        <q-carousel-control slot="control-nav" slot-scope="carousel" class="fit" :offset="[0, 0]">
          <q-btn class="q-carousel-left-arrow absolute"
            @click="carousel.previous"
            :disable="!carousel.canGoToPrevious"
            color="white" text-color="primary"
            icon="fas fa-chevron-left"
            round size="lg"
          />
          <q-btn class="q-carousel-right-arrow absolute"
            @click="nextSlide(carousel)"
            :disable="hideRightButton"
            color="white" text-color="primary"
            icon="fas fa-chevron-right"
            round size="lg"
          />
        </q-carousel-control>
     
      </q-carousel>
      
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      hideRightButton: false
    }
  },
  methods: {
    /*
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    nextSlide(carousel) {
      if (carousel.slide === 3) {
        this.$router.push('/user/login')
      } else {
        carousel.next()
      }
    }
  }
}
</script>
