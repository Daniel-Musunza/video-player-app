import { createStore } from 'vuex'

export default createStore({
  state: {
    videoList: [],
    currentVideo: null
  },
  getters: {
  },
  mutations: {
    setVideoList(state, videos) {
      state.videoList = videos
    },
    setCurrentVideo(state, video) {
      state.currentVideo = video
    }
  },
  actions: {
  },
  modules: {
  }
})

