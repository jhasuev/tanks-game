<template>
  <div class="maps">
    <ul class="maps__list">
      <MapsItem
        v-for="(map, i) in maps"
        :key="i"

        :img="map.preview"
        :label="map.name"
        :selected="i === selectedMapIndex"
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

export default {
  name: 'Maps',
  components: {
    MapsItem,
    MapsFooter,
  },
  data() {
    return {
      maps: Maps,
      selectedMapIndex: -1,
    }
  },
  methods: {
    onMapClick(mapIndex) {
      this.selectedMapIndex = mapIndex
    },
  }
}
</script>

<style lang="scss">

.maps {
  &__list {
    list-style: none;
    padding: 0;
    margin-top: 50px;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
}

</style>
