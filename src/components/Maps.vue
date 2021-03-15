<template>
  <div class="maps">
    <ul class="maps__list">
      <MapsItem
        v-for="(map, i) in maps"
        :key="i"

        :img="map.preview"
        :label="map.name"
        :selected="i === getSelectedMapIndex"
        @click="onMapClick(i)"
      />
    </ul>

    <MapsFooter/>

  </div>
</template>

<script>
import MapsItem from "@/components/MapsItem";
import MapsFooter from "@/components/MapsFooter";
import Maps from "/public/json/maps.json"
import {mapGetters, mapMutations} from "vuex"

export default {
  name: 'Maps',
  components: {
    MapsItem,
    MapsFooter,
  },
  data() {
    return {
      maps: Maps,
    }
  },
  computed: {
    ...mapGetters([
      "getSelectedMapIndex",
    ]),
  },
  methods: {
    ...mapMutations([
      "setSelectedMapIndex"
    ]),

    onMapClick(mapIndex) {
      this.setSelectedMapIndex(mapIndex)
    },
  }
}
</script>

<style lang="scss">

.maps {
  &__list {
    list-style: none;
    padding: 0;
    margin: 50px auto 0;
    max-width: 777px;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
}

</style>
