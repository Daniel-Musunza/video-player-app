<template>
    <div class="home-view">
    <div class="video-player">
      <video ref="video" class="video" v-if="currentVideo" :src="currentVideo.url" controls></video>
      <div class="controls">
        <button class="play-btn" v-if="!$refs.video?.paused" @click.prevent="$refs.video?.pause()"></button>
        <button class="pause-btn" v-else @click.prevent="$refs.video?.play()"></button>
        <div class="progress-bar" @click="seek">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="time">{{ currentTime }} / {{ duration }}</div>
      </div>
    </div>
    <div class="video-list">
      <div v-for="video in videoList" :key="video.url" class="video-item" @click.prevent="playVideo(video)">
        <div class="thumbnail" :style="{ backgroundImage: 'url(' + video.thumbnail + ')' }"></div>
        <div class="details">
          <div class="title">{{ video.title }}</div>
          <div class="duration">{{ video.duration }}</div>
        </div>
      </div>
    </div>
    <div class="add-video">
      <input type="text" v-model.trim="title" placeholder="Title">
      <!-- <input type="text" v-model.trim="url" placeholder="YouTube URL"> -->
      <input type="file" @change="handleFileUpload">
      <button @click.prevent="addVideo">Add Video</button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'HomeView',
  computed: {
    currentVideo() {
      return this.$store.state.currentVideo
    },
    videoList() {
      return this.$store.state.videoList
    },
    progress() {
      if (!this.$refs.video) return 0
      const { currentTime, duration } = this.$refs.video
      return (currentTime / duration) * 100
    },
    currentTime() {
    if (!this.$refs.video) return '0:00'
    const { currentTime } = this.$refs.video
    const minutes = Math.floor(currentTime / 60)
    const seconds = Math.floor(currentTime % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  },
  duration() {
    if (!this.$refs.video) return '0:00'
    const { duration } = this.$refs.video
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  },
  methods: {
    handleFileUpload(event) {
    this.file = event.target.files[0]
  },
  addVideo() {
    const video = {
      title: this.title,
      file: this.file,
      thumbnail: URL.createObjectURL(this.file),
      duration: '0:00'
    }
    this.$store.commit('setVideoList', [...this.videoList, video])
    this.title = ''
    this.file = null // reset the selected file after adding the video
  },
    playVideo(video) {
      if (!video || !video.file instanceof Blob) return
      this.$store.commit('setCurrentVideo', video)
      this.$refs.video.src = URL.createObjectURL(video.file)
      this.$refs.video.load()
      this.$refs.video.play()
    },
    seek(event) {
      if (!this.$refs.video) return
      const { duration } = this.$refs.video
      const progressWidth = event.target.offsetWidth
      const clickX = event.offsetX
      const percent = clickX / progressWidth
      this.$refs.video.currentTime = duration * percent
    },
    getVideoId(url) {
      const match = url.match(/youtube\.com\/watch\?v=(\w+)/) ||
                    url.match(/youtu\.be\/(\w+)/)
      return match ? match[1] : null
    },
    updateVideoDuration() {
      if (!this.$refs.video) return
      const { duration } = this.$refs.video
      const index = this.videoList.findIndex(video => video.url === this.currentVideo.url)
      const updatedVideo = { ...this.currentVideo, duration: this.formatDuration(duration) }
      this.$store.commit('updateVideoInList', { index, updatedVideo })
    },
    formatDuration(duration) {
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    videoEnded() {
      const currentIndex = this.videoList.findIndex(video => video.url === this.currentVideo.url)
      const nextIndex = (currentIndex + 1) % this.videoList.length
      const nextVideo = this.videoList[nextIndex]
      this.$store.commit('setCurrentVideo', nextVideo)
      this.$refs.video.load()
      this.$refs.video.play()
    },
  },
//   mounted() {
//   this.$nextTick(() => {
//     this.$refs.video.addEventListener('loadedmetadata', this.updateVideoDuration)
//     this.$refs.video.addEventListener('ended', this.videoEnded)
//   })
// },

    beforeUnmount() {
      this.$refs.video.removeEventListener('loadedmetadata', this.updateVideoDuration)
      this.$refs.video.removeEventListener('ended', this.videoEnded)
    }
  
}

</script>
<style scoped>
.video-player {
  position: relative;
  width: 640px;
  height: 360px;
  display: flex;
  justify-content: center;
}
.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.controls {
  position: absolute;
  bottom: -20px;
  width: 100%;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}
.play-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-image: url('@/assets/logo.png');
  background-size: cover;
  cursor: pointer;
}
.progress-bar {
  width: 60%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 10px;
  position: relative;
  cursor: pointer;
}
.progress {
  width: 0%;
  height: 100%;
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
}
.time {
  color: white;
  font-size: 14px;
  font-family: Arial, sans-serif;
}

/* Video List */
.video-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.video-item {
  margin-bottom: 20px;
  width: calc(33.33% - 10px);
  cursor: pointer;
}

.thumbnail {
  height: 0;
  padding-bottom: 56.25%;
  background-size: cover;
  background-color:rgb(96, 96, 241);
}

.details {
  margin-top: 5px;
  font-size: 14px;
}

.title {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.duration {
  margin-left: 5px;
}

.add-video {
  margin-top: 20px;
}

.add-video input {
  margin-right: 10px;
}

.add-video button {
  border: none;
  background-color: rgb(0, 255, 0);
  color: #fff;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
