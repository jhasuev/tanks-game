<template>
  <li
    v-if="img && label"
    class="map"
    :class="{ selected }"
  >
    <i
      class="map-img"
      :style="{
        backgroundImage: `url(${img})`,
      }"
    />
    <div class="map-label">{{ label }}</div>
  </li>
</template>

<script>
export default {
  name: 'MapsItem',
  props: {
    img: {type: String, default: ""},
    label: {type: String, default: ""},
    selected: {type: Boolean, default: false},
  }
}
</script>

<style lang="scss">

.map {
  cursor: pointer;
  width: 120px;
  margin: 15px;

  &-img {
    display: block;
    height: 100px;
    background-position: center;
    background-size: cover;
  }

  &.selected &-img {
    box-shadow: 0 0 10px 5px #fff;
  }

  &-label {
    text-align: center;
    margin-top: 10px;
    word-break: break-word;
  }
}

</style>
