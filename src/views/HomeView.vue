<template>
  <div class="home-view">
    <!-- Video player -->
    <div class="video-player">
      <video ref="video" class="video" v-if="currentVideo" :src="currentVideo.url" autoplay controls></video>
      <div class="controls">
        <button class="play-btn" v-if="!$refs.video?.paused" @click.prevent="$refs.video?.pause()"></button>
        <button class="pause-btn" v-else @click.prevent="$refs.video?.play()"></button>
        <div class="progress-bar" @click="seek">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="time">{{ currentTime }} / {{ duration }}</div>
      </div>
    </div>
        <!-- Add video form -->
    <div class="add-video">
      <input type="file" @change="handleFileUpload">
      <button @click.prevent="addVideo">Add Video</button>
    </div>
    <!-- Video list -->
    <div class="video-list">
      <div v-for="video in videoList" :key="video.url" class="video-item" @click.prevent="playVideo(video)">
        <div class="thumbnail">
          <video :src="video.url" autoplay muted loop ></video></div>
        <div class="details">
          <div class="title">{{ video.title }}</div>
          <div class="duration">{{ video.duration }}</div>
        </div>
      </div>
    </div>


  </div>
</template>
<script>
export default {
  name: 'HomeView',
  computed: {
    // Get the current video and video list from Vuex store
    currentVideo() {
      return this.$store.state.currentVideo
    },
    videoList() {
      return this.$store.state.videoList
    },
    // Compute the progress, current time, and duration of the video player
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
  // Defining various methods used in the component
  methods: {
    // Method to handle file upload on selecting a video file
    handleFileUpload(event) {
      // Set the selected file as the current file
      this.file = event.target.files[0]
    },
    // Method to add a new video to the video list
    addVideo() {
      const video = {
        title: this.file.name,
        file: this.file,
        url: URL.createObjectURL(this.file),
        duration: '0:00'
      }
      this.$store.commit('setVideoList', [...this.videoList, video])
      this.file = null // reset the selected file after adding the video
    },
    // Method to play a video
    playVideo(video) {
      // Check if a valid video is provided
      if (!video || !video.file instanceof Blob) return

      // Set the current video as the provided video
      this.$store.commit('setCurrentVideo', video)

      // Set the source of the video element to the video file URL
      this.$refs.video.src = URL.createObjectURL(video.file)

      // Load the video element
      this.$refs.video.load()

      // Play the video element
      this.$refs.video.play()

      // Listen for 'ended' event on the video element
      this.$refs.video.addEventListener('ended', () => {
        // Get the index of the current video
        const currentIndex = this.videos.findIndex(v => v === video)

        // If there is a next video, play it
        if (this.videos[currentIndex + 1]) {
          this.playVideo(this.videos[currentIndex + 1])
        }
      })
},

    seek(event) {
      // Check if the video element exists
      if (!this.$refs.video) return
      // Get the total duration of the video
      const { duration } = this.$refs.video
      // Get the width of the progress bar
      const progressWidth = event.target.offsetWidth
      // Get the x-coordinate of the click event
      const clickX = event.offsetX
      // Calculate the percentage of the progress bar clicked
      const percent = clickX / progressWidth
      // Set the current time of the video to the percentage of the total duration clicked
      this.$refs.video.currentTime = duration * percent
    },
    // Method to extract the video ID from a YouTube video URL
    getVideoId(url) {
      const match = url.match(/youtube\.com\/watch\?v=(\w+)/) ||
                    url.match(/youtu\.be\/(\w+)/)
      return match ? match[1] : null
    },
    // Method to update the duration of the current video
    updateVideoDuration() {
      // Check if the video element exists
      if (!this.$refs.video) return
      // Get the total duration of the video
      const { duration } = this.$refs.video
      // Get the index of the current video in the video list
      const index = this.videoList.findIndex(video => video.url === this.currentVideo.url)
      // Create a new video object with the updated duration
      const updatedVideo = { ...this.currentVideo, duration: this.formatDuration(duration) }
      // Update the video list with the new video object
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
      this.$refs.video.removeEventListener('loadedmetadata', this.updateVideoDuration);
      this.$refs.video.removeEventListener('ended', this.videoEnded);
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
  justify-content:space-around;
  max-width: 640px;
}

.video-item {
  margin-top: 30px;
  margin-bottom: 20px;
  width: calc(28% - 10px);
  cursor: pointer;
  position: relative;
 
  /* width: 200px;
  height: 150px; */
  /* display: flex; */
}

.thumbnail {
  border-radius: 50px;
  position: relative;
  /* width: 150px; */
  height: 100px;
  display: flex;

justify-content:space-around;

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
