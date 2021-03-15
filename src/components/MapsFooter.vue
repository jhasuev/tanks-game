<template>
  <footer class="maps-footer">
    <div class="maps-footer-buttons">
      <button
        class="maps-footer-buttons-item btn"
        :class="{
          'btn-primary': !canPlay,
          'btn-secondary': canPlay,
        }"
        :disabled="canPlay"
        @click="onPlayClick"
      >Play
      </button>
    </div>
  </footer>
</template>

<script>
import emitter from "@/./eventHub"
import {mapGetters} from "vuex";

export default {
  name: 'MapsFooter',
  computed: {
    ...mapGetters([
      "getSelectedMapIndex",
    ]),

    canPlay(){
      return this.getSelectedMapIndex === -1
    },
  },
  methods: {
    onPlayClick() {
      emitter.emit("onplay")
    },
  },
}
</script>

<style lang="scss">

.maps-footer {
  text-align: center;
  &-buttons {
    &-item {
      margin-top: 30px;
      min-width: 200px;
    }
  }
}

</style>
