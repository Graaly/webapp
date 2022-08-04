<template>
  <q-dialog ref="createProfilDialog" style="max-width: 400px">
    <q-card class="login-dialog-card">
      <q-card-section class="row items-center">
        Texte à définir
        <q-space/>
        <icon-btn-square color="accent" icon="close" rotation fill v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        {{ $t('label.DoYouWantToCreateAnAccount') }}
        <div>
          <text-btn-square
            class="q-mb-lg q-mt-lg"
            @click.native="onOKClick()"
            title="Créer(à définir)"
            color="accent"
            icon="done"
          />
        </div>

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import textBtnSquare from "../UI/textBtnSquare";
import iconBtnSquare from "../UI/iconBtnSquare";

export default {
  name: "createProfilDialog",
  components: {textBtnSquare, iconBtnSquare},
  methods: {
    // REQUIRED
    // (don't change its name --> "show")
    show () {
      this.$refs.createProfilDialog.show()
    },
    // (don't change its name --> "hide")
    hide () {
      this.$refs.createProfilDialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    }
  }
}
</script>

<style scoped>

</style>
