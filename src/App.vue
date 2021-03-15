<template>
  <Game onplay="onPlay()"/>
  <Menu v-if="menu"/>
</template>

<script>
import Game from "@/components/Game";
import Menu from "@/components/Menu";
import emitter from "@/./eventHub"


export default {
  name: 'App',
  components: {
    Game,
    Menu,
  },
  data() {
    return {
      menu: true,
    }
  },
  created() {
    emitter.on("onplay", () => {
      this.onPlay()
    })
  },
  methods: {
    onPlay() {
      this.menu = false
    }
  },
}
</script>
