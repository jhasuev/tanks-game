<template>
  <Game onplay="onPlay()"/>
  <Menu v-if="menu"/>
</template>

<script>
import Game from "@/components/Game";
import Menu from "@/components/Menu";
import emitter from "@/./eventHub"
import {mapGetters} from "vuex"


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
  computed: {
    ...mapGetters([
      "getSelectedMapIndex",
    ]),
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
