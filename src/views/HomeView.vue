<template>
    <SideBar></SideBar>

   
    <div class="home-view container">
      <Header></Header>
      <!-- Video player -->
      <div class="row">
         <div class="col-8">
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
            <form>
              <!-- <label for="arquivo"></label> -->
              <input @change="handleFileUpload" class="inpdddut" name="arquivo" id="arquivo" type="file">
              <input value="Add Video"  @click.prevent="addVideo" type="submit" class="inpdddut">
            </form>
        </div>

          <!-- Video list -->
          <div class="col-4">
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


    </div>
</template>
<script>
import Header from '../views/Header.vue'
import SideBar from '../views/SideBar.vue'
export default {
  name: 'HomeView',
  components: {
    Header,
    SideBar,
  },
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
.my-container {
  display: flex;
  flex-direction: row;
  margin-top: 90px;
  padding: 20px;
}
.col-8 {
  margin-left: 100px;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
form {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  background-color: #13121269;
  border-radius: 5px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
}

.inpdddut[type="file"] {
  padding: 10px;
  margin-bottom: 20px;
  border: none;
  background-color: #1aa3bb;
  border-radius: 5px;
  width: 100%;
  cursor: pointer;
}

.inpdddut[type="submit"] {
  padding: 10px 20px;
  background-color: #1c7fe2;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.inpdddut[type="submit"]:hover {
  background-color: #006F8F;
}
    
.video-player {
  position: relative;
  width: 800px;
  height: 460px;
  display: flex;


  /* justify-content: center; */
  /* border-radius: 50px; */
  border-color: rgb(22, 21, 21);
}
.video {
  width: 100%;
  height: 100%;
  /* margin-top: 50px; */
  object-fit: cover;
    border:1px solid #090909;
    border-radius: 10px;
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
.col-4 {
  display: flex;
  flex-wrap: wrap;
  min-width: 640px;
  flex-direction: column;
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
.home-view header{
  
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  box-shadow: 2px 2px 5px rgba(0,0,0, 0.2);
  position: fixed;
  left: 200px;
  right: 0;
  width: calc(100% -200px);
  top: 0;
  z-index: 100;
  transition: left 300ms;

}
.profile-menu {
    position: absolute;
    border-radius: 10px;
    top: 60px;
    right: 0; 
    width: 270px;
    background-color: #fff;
    box-shadow: 0 4px 0px -1px #79aae6;
  }
  .info {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #fff;
  }
  .right {
    flex: 1;
    margin-left: 24;
  }
  i{
    padding-right:10px;
  }
.sidebar {
    width: 200px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    background-color: #fff;
    z-index: 999;
    transition: margin-left 300ms;
}
.sidebar-brand{
    height: 90px;
    padding:1rem 0rem 1rem 2rem; 
}
.sidebar-brand span {
    display: inline-block;
    padding-right: 1rem;
}
.sidebar-menu {
    margin-top: 1rem;
}
.sidebar-menu li {
    width: 100%;
    margin-bottom: 1.3rem;
    padding-left: 2rem;
    font-size: 15px;
}
.sidebar-menu li .available{
    margin-left:3rem ;
}
.sidebar-menu li .available a span{
    margin-left: 3.1rem;
    background: #79aae6;
    border-radius: 50%;
    padding-left: .5rem;
    font-size: 1.5rem;
}
a .li-span{
    margin-left: 0rem;
    background: #79aae6;
    border-radius: 50%;
    font-size: 1.5rem;
    padding-left:.5rem;
}
.sidebar-menu a {
    display: block;
    color: #02060b;
    padding-bottom: 1rem;
}
.sidebar-menu a.active {
    color: #1c68c4;
    padding-top: 1rem;
    padding-bottom: 1rem;
} 
.sidebar-menu a span:first-child {
    font-size: 1.5rem;
    padding-right: 1rem;
} 
#nav-toggle:checked + .sidebar {
    width: 70px;
}
#nav-toggle:checked + .sidebar .sidebar-brand,
#nav-toggle:checked + .sidebar li {
   padding-left: 1rem;
   text-align: center;
}
#nav-toggle:checked + .sidebar li a{
    padding-left: 0rem;
 }
 #nav-toggle:checked + .sidebar li a span{
    padding-right: 1rem;
 }
#nav-toggle:checked + .sidebar .sidebar-brand h3 span:last-child,
#nav-toggle:checked + .sidebar li a span:last-child {
   display: none;
}
#nav-toggle:checked ~ .main-content{
    margin-left: 70px;
 }
#nav-toggle:checked ~ .main-content header{
   width: calc(100% -70px);
   left: 70px;
 }
.homeview {
    transition: margin-left 300ms;
    /* margin-left: 200px; */
   
}


#nav-toggle{
    display: none;
}
header h3 {
    color: #222;
    margin-right: 50px;
}
header label span {
    font-size: 1.7rem;
    padding-left: 1rem ;
}

.user-wrapper{
    display: flex;
    align-items: center;
    float: right;
     
}
.user-wrapper span{
    font-size: 25px;
    margin-right: 30px;
     
}
.user-wrapper img{
    border-radius: 50%;
    margin-right: 1rem;
}
.user-wrapper small {
    display: inline-block;
    color:var(--text-grey) ;
    margin-top: -10px !important;
}
main{
    margin-top: 85px;
    padding: 2rem 1.5rem;
    background: #f1f5f9;
    min-height: calc(100vh -90px);

}
.cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 2rem;
    margin-top: 1rem;
}
.card-single {
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    padding: 2rem;
    border-radius: 2px;
}
.card-single div:last-child span{
    color: #1c68c4;
    font-size:3.5rem;
}
.card-single div:first-child span{
    color: var(--text-grey);

}
.card-single:last-child{
    background: #1c68c4;
}
.card-single:last-child div:last-child span{
    color: #fff;
}
.card-single:last-child div:first-child span{
   color: #fff;
}
.recent-grid {
    margin-top: 3.5rem;

}
.card{
   background: #fff; 
}
.card-header,
.card-body {
    padding: 1rem;
    width: 100%;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card-header button {
    background: #1c68c4;
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    padding: .5rem 1rem;
    border: 1px solid #1c68c4;
}
table {
    border-collapse:collapse;
}
thead tr {
    border: 1px solid #1c68c4;;
}
tbody tr {
    border: 1px solid #1c68c4;;
}
thead td {
    font-weight: 700;
}
td {
    padding: .5rem 1rem;
    font-size: 15px;
    color: #222;
    border: 1px solid #1c68c4;;
   
}
td i {
    color: #1c68c4;
    padding-right: 1rem;
}
.table-responsive {
    width: 100%;
    overflow-x: auto;
}

@media only screen and (max-width:1200px){
   .sidebar {
        width: 70px;
    }
    .sidebar .sidebar-brand,
     .sidebar li {
       padding-left: 1rem;
       text-align: center;
    }
 .sidebar li a{
        padding-left: 0rem;
     }
   .sidebar li a span{
        padding-right: 1rem;
     }
 .sidebar .sidebar-brand h3 span:last-child,
  .sidebar li a span:last-child {
       display: none;
    }
     .main-content{
        margin-left: 70px;
     }
   .main-content header{
       width: calc(100% -70px);
       left: 70px;
     }
     .sidebar:hover {
        width: 200px;
        z-index: 200;
    }
    .sidebar:hover .sidebar-brand,
     .sidebar:hover li {
       padding-left: 2rem;
       text-align: left;
    }
 .sidebar:hover li a{
        padding-left: 1rem;
     }
   .sidebar:hover li a span{
        padding-right: 1rem;
     }
 .sidebar:hover .sidebar-brand h3 span:last-child,
  .sidebar:hover li a span:last-child {
       display: inline;
    }
}
 @media only screen and (max-width: 960px) {
    .cards  {
        grid-template-columns:repeat(3, 1fr);
    }
    .recent-grid {
        grid-template-columns: 60% 40%;
    }
 }
 @media only screen and (max-width: 768px) {
    .cards  {
        grid-template-columns:repeat(2, 1fr);
    }
    .recent-grid {
        grid-template-columns: 100%;
    }
    .search-wrapper{
        display: none;
    }
    .sidebar{
        left: -100% !important;
    }
    header h3 {
        display: flex;
        align-items: center;
    }
    header h3 label {
        display:inline-block;
        background:#1c68c4;
        padding-left: 0rem;
        margin-left: 1rem;
        height: 40px;
        width: 40px;
        border-radius: 50%;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center !important;
    }
    header h3 span {
        text-align: center;
        padding-right: 1rem;
      
    }
    header h3 {
        font-size: 30px;
    }
    .main-content {
        width: 100%;
        margin-left: 0rem;
    }
    header {
        width: 100% !important;
        left: 0 !important;
        
    }
    #nav-toggle:checked + .sidebar {
        left: 0 !important;
        z-index: 100;
        width: 200px;
    }
    #nav-toggle:checked + .sidebar {
        width: 200px;
        z-index: 200;
    }
    #nav-toggle:checked + .sidebar .sidebar-brand,
    #nav-toggle:checked + .sidebar li {
       padding-left: 2rem;
       text-align: left;
    }
    #nav-toggle:checked + .sidebar li a{
        padding-left: 1rem;
     }
     #nav-toggle:checked + .sidebar li a span{
        padding-right: 1rem;
     }
     #nav-toggle:checked + .sidebar.sidebar-brand h3 span:last-child,
     #nav-toggle:checked + .sidebar li a span:last-child {
       display: inline;
    }
    #nav-toggle:checked ~ .main-content {
        margin-left: 0rem !important;
    }
 }
 @media only screen and (max-width: 560px) {
    .cards {
        grid-template-columns: 100%;
    }
 }
</style>
