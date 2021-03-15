<template>
  <canvas id="game"></canvas>
</template>

<script>
import Game from "@/models/Game";
export default {
  name: 'App',
  mounted() {
    Game.start()
  }
}
</script>

<style>

canvas {
  position: fixed;
}

</style>
