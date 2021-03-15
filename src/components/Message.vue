<template>
  <div class="message" v-if="value">
    <div class="message__inner">
      <div class="message__text">{{ value }}</div>
      <button class="btn btn-danger" @click="close()">ok</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    value: {type: String}
  },
  methods: {
    close(){
      this.$emit("input", "")
    },
  },
}
</script>

<style lang="scss">

.message {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgba(255, 255, 255, .5);
  color: #000;

  &__inner {
    padding: 20px;
    width: 100%;
    max-width: 300px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,.25);
    text-align: center;
  }
  &__text {
    margin-bottom: 20px;
  }
}

</style>
