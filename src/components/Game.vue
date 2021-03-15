<template>
  <canvas id="game"></canvas>
</template>

<script>
import Game from "@/models/Game";

export default {
  name: 'Game',
  data(){
    return {
      Game: undefined,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.Game = new Game()
      this.Game.start()
    })
  }
}
</script>

<style>

canvas {
  position: fixed;
}

</style>
