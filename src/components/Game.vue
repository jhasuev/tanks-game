<template>
  <canvas id="game"></canvas>
</template>

<script>
import Game from "@/models/Game";
import emitter from "@/eventHub";
import {mapGetters} from "vuex";

export default {
  name: 'Game',
  data() {
    return {
      Game: undefined,
      inited: false,
    }
  },
  computed: {
    ...mapGetters([
      "getSelectedMapIndex",
    ]),
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.inited) {
        this.Game = new Game()
        this.Game.start()
        this.inited = true
      }
    })

    emitter.on("onplay", () => {
      this.Game.startLevel(this.getSelectedMapIndex)
    })
  },
}
</script>

<style>

canvas {
  position: fixed;
}

</style>
