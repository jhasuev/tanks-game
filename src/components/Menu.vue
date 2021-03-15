<template>
  <div class="menu  p-5">
    <h2 class="text-center mb-3">Select a map</h2>
    <Maps/>
  </div>
</template>

<script>
import Maps from "./Maps"

export default {
  name: 'Menu',
  components: {
    Maps,
  }
}
</script>

<style lang="scss">

.menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  background-color: rgba(0, 0, 0, .75);
  color: #fff;
}

</style>
