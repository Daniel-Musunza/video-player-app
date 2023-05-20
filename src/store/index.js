import { createStore } from 'vuex'

export default createStore({
  state: {
    videoList: [],
    title:null,
    url:null,
    currentVideo: null
  },
  getters: {
    videoList: state => state.videoList,
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
    getVideoList({ commit }) {
      fetch('http://localhost:3000/data.json')
        .then((response) => response.json())  // Parse the JSON response
        .then((data) => {
          commit('setVideoList', data)  // Commit the parsed data to the store
        })
        .catch(error => {
          console.log('An error occurred:', error);
        });
    },
    
  },
  modules: {
  }
})

