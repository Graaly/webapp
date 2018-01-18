<template>
  
  <div>
    <div class="wrapper">
      <h1>Votre enquête</h1>
      
      <div class="grow">
        <p>
          Graaly vous permet de créer très simplement des visites ludiques sur téléphone mobile ou tablette.
        </p>
        
        <p>
          Vous allez être guidé au travers de plusieurs étapes pour définir les différentes étapes de votre visite ou votre jeu. Vous pouvez à chaque étape sauvegarder pour continuer plus tard, ou modifier une étape déjà créée.
        </p>
        
        <p>
          Vous pourrez à la fin tester votre enquête avant de la publier, de manière à l'optimiser pour qu'elle  obtienne la meilleure note possible et soit populaire.
        </p>
      </div>
      
      <q-btn color="primary" class="full-width center" @click="$router.push('/quest/create/settings')">Commencer</q-btn>
    </div>
  </div>
  
</template>

<style scoped>
  
  #main-view { padding: 0rem; height: inherit; min-height: inherit; }
  
  #main-view > div.wrapper { height: inherit; min-height: inherit; padding: 1rem; display: flex; flex-flow: column nowrap; }
  
</style>