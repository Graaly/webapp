<template>
  
  <!--
    MP 2018-12-14
    This is the remaining of a failed attempt to show a spinner each time a route changes & part of DOM + assets/images have to be loaded.
    I keep this "page" for any future use since I spent some time on it for the layout / animation.
  -->
  
  <div class="global-spinner">
    <!-- found at https://loading.io/ -->
    <svg width="100px" height="100px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling" style="background: none;"><circle cx="50" cy="50" fill="none" stroke="#ff0000" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" transform="rotate(10 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1.5s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>
    <p>Loading...</p>
  </div>
</template>

<script>
export default {
  // name: 'ComponentName',
  data () {
    return {}
  }
}
</script>

<style>
.global-spinner {
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #fff;
  justify-content: center; /* horizontal centering */
  align-items: center; /* vertical centering */
  z-index: 8000;
}
.global-spinner p {
  padding-top: 5vw;
  color: #f00;
  font-size: 3em;
  animation: glow 1s infinite alternate ease-in;
}

@keyframes glow {
  from {
    color: #f00;
  }
  to {
    color: #fbb;
  }
}
</style>
