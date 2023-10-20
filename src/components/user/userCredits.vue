<template>
  <div>
    <div class="title flex justify-between items-center q-mb-md">
      <div style="text-transform:uppercase;" class="flex items-center">
        <q-icon name="savings" class="q-mr-sm material-icons-outlined"/>
        <span>{{ $t('label.Credits') }}</span>
      </div>
    </div>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card class="my-card">
        <q-card-section class="bg-secondary text-white">
          <div class="text-subtitle2">{{ $t('label.CreditsBought') }}</div>
          <div class="text-h6">{{ credits.paid }}</div>
        </q-card-section>
      </q-card>
      <q-card class="my-card">
        <q-card-section class="bg-secondary text-white">
          <div class="text-subtitle2">{{ $t('label.CreditsUsed') }}</div>
          <div class="text-h6">{{ credits.used }}</div>
        </q-card-section>
      </q-card>
      <q-card class="my-card" v-if="credits.toPay && credits.toPay < 0">
        <q-card-section class="bg-secondary text-white">
          <div class="text-subtitle2">{{ $t('label.CreditsRemaining') }}</div>
          <div class="text-h6">{{ credits.toPay * -1 }}</div>
        </q-card-section>
      </q-card>
      <q-card class="my-card" v-if="credits.toPay && credits.toPay > 0">
        <q-card-section class="bg-primary text-white">
          <div class="text-subtitle2">{{ $t('label.CreditsToPay') }}</div>
          <div class="text-h6">{{ credits.toPay }}</div>
        </q-card-section>
      </q-card>
      <q-card class="my-card clickable" v-if="canAdd" @click="addCreditsPopup = true">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 centered">+</div>
          <div class="text-subtitle2">Add credits</div>
        </q-card-section>
      </q-card>
    </div>
    
    <!--====================== ADD CREDITS =================================-->
    
    <q-dialog v-model="addCreditsPopup">
      <div class="bg-white centered q-pa-md">
        <div>
          <q-input
            outlined
            class="q-mb-md"
            type="number"
            label="Credits to add"
            v-model="formData.credits"
          />
        </div>
        <div>
          <q-input
            outlined
            class="q-mb-md"
            label="Invoice number"
            v-model="formData.invoice"
          />
        </div>
        <q-btn class="glossy large-button" color="primary" @click="addCredits()"><div>Add credits</div></q-btn>
        <q-btn color="primary" flat @click="addCreditsPopup = false"><div>{{ $t('label.Close') }}</div></q-btn>
      </div>
    </q-dialog>
    
  </div>
</template>

<script>
import UserService from 'services/UserService'

export default {
  name: "userCredits",
  //components: {userCard, userBadge, iconBtnSquare, newfriend},
  props: {
    credits: {},
    canAdd: Boolean,
    userId: String
  },
  data() {
    return {
      addCreditsPopup: false,
      formData: {
        credits: 0,
        invoice: ""
      }
    }
  },
  methods: {
    async addCredits () {
      await UserService.addCredits(this.userId, this.formData)
      this.$emit('refresh')
      this.addCreditsPopup = false
      this.formData = {
        credits: 0,
        invoice: ""
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
