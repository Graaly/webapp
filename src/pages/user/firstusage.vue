<template>
  <div class="wrapper dark-background">
    <div class="page-content top-padding-middle fit firstusage">
      
      <q-carousel 
        ref="carousel" 
        v-model="firstUsageSlide" 
        animated 
        swipeable 
        navigation 
        class="text-white fit" 
        transition-next="slide-left" 
        transition-prev="slide-right"
      >
      
        <!------------------ INTRO SLIDE ------------------------>
        
        <q-carousel-slide name="intro" class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h3 class="vertical-middle">{{ $t('label.WelcomeInGraalyWorld') }}</h3>
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ DISCOVER SLIDE ------------------------>
        
        <q-carousel-slide name="discover" class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h3 class="vertical-middle">{{ $t('label.DiscoverPlacesAroundYou') }}</h3>
              <img src="statics/images/firstusage1.png" />
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ POINTS SLIDE ------------------------>
        
        <q-carousel-slide name="points" class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h3 class="vertical-middle">{{ $t('label.WinPointsAndUnlockQuests') }}</h3>
              <img src="statics/images/firstusage2.png" />
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ EARN SLIDE ------------------------
        
        <q-carousel-slide name="earn" class="bg-primary">
          <div class="row fit">
            <div class="col centered">
              <h3 class="vertical-middle">{{ $t('label.CreateYourQuestsAndWinMoney') }}</h3>
              <img src="statics/images/firstusage3.png" />
            </div>
          </div>
        </q-carousel-slide>
        
        <!------------------ CUSTOM NAVIGATION BUTTONS ------------------------>
        
        <template v-slot:control>
          <q-carousel-control class="fit" :offset="[0, 0]">
            <q-btn class="q-carousel-left-arrow"
              @click="$refs.carousel.previous()"
              :disable="!canGoToPrevious"
              color="white" text-color="primary"
              icon="fas fa-chevron-left"
              round size="lg"
            />
            <q-btn class="q-carousel-right-arrow"
              @click="nextSlide()"
              color="white" text-color="primary"
              icon="fas fa-chevron-right"
              round size="lg"
            />
          </q-carousel-control>
        </template>
     
      </q-carousel>
      
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      firstUsageSlide: "intro"
    }
  },
  computed: {
    canGoToPrevious: function() {
      console.log(this.firstUsageSlide, this.firstUsageSlide !== "intro")
      return this.firstUsageSlide !== "intro"
    }
  },
  methods: {
    /*
     * Get a quest information
     * @param   {string}    id             Quest ID
     */
    nextSlide() {
      let carousel = this.$refs['carousel']
      //if (carousel.value === 'earn') {
      if (carousel.value === 'points') {
        this.$router.push('/user/login')
      } else {
        carousel.next()
      }
    }
  }
}
</script>
