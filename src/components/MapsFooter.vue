<template>
  <footer class="maps-footer text-center">
    <div class="maps-footer-buttons">
      <button
        class="maps-footer-buttons-item btn btn-primary"
        :disabled="getSelectedMapIndex === -1"
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
  &-buttons {
    &-item {
      margin-top: 30px;
      min-width: 200px;
    }
  }
}

</style>
