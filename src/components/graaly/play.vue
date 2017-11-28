<template>
  
  <div>
    <p>Graaly ID {{ $route.params.id }}</p>
    
    <p>[[image alignée à gauche]]</p>
    
    <p>[[Titre du Graaly]]</p>
    <p>[[Auteur (personne physique ou morale)]]</p>
    <p>[[Note sous forme d'étoiles, au moins par demi étoiles]]</p>
    <p>[[XX]] points à gagner</p>
    <p><button @click="$router.push('/graaly/play/' + $route.params.id + '/step/1')">Résoudre l'énigme</button></p>
    <hr />
    <p>[[Description]]</p>
    <p>Langue: [[langue]]</p>
    <p>Lieu de départ: [[Ville, Département]]</p>
    <p>Difficulté: [[diff]]</p>
  </div>
  
</template>

<script>
export default {
  data () {
    return {
      title: 'Résoudre un Graaly'
    }
  },
  mounted() {
    // dispatch specific title for other app components
    this.$store.dispatch('setTitle', this.$data.title);
  }
}
</script>