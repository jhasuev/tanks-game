<template>
  <Game/>
  <Menu v-if="menu"/>
  <Message
    :value="message"
    @input="message = $event"
  />
</template>

<script>
import Game from "@/components/Game";
import Menu from "@/components/Menu";
import Message from "@/components/Message";
import emitter from "@/./eventHub"
import {mapGetters} from "vuex"


export default {
  name: 'App',
  components: {
    Game,
    Menu,
    Message,
  },
  data() {
    return {
      menu: true,
      message: "",
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

    emitter.on("onmenutoggle", (cb) => {
      this.menu = !this.menu

      if (cb) {
        cb(this.menu)
      }
    })

    emitter.on("showMessage", (msg) => {
      this.message = msg
    })
  },
  methods: {
    onPlay() {
      this.menu = false
    }
  },
}
</script>
