import { createStore } from 'vuex'

const store = createStore({
  state: {
    selectedMapIndex: -1,
  },
  mutations: {
    setSelectedMapIndex(state, payload){
      state.selectedMapIndex = payload
    },
  },
  getters: {
    getSelectedMapIndex(state){
      return state.selectedMapIndex
    },
  },
})
export default store;
