<template>
   <!-- Video player -->
  <div class="container-fluid">
      <header>
        <div>
        
        </div>
        <form>
          
            <input @change="handleFileUpload" class="inpdddut" name="arquivo" id="arquivo" type="file">
          </form>
         
            <div class="profile"  @click="toggleProfileMenu">
                <span >cool</span>
            </div>
          
          <div v-if="profileMenu " class="profile-menu">
            <div class="info">
              <div class="right">
                <h4>Musunza Festus</h4>
                <small>Developer</small>
                <hr>
     
               
                <a href="https://musunzaportfolio.web.app"><i class="fa-regular fa-user" ></i>View Profile</a>
                
          
                
              </div>
            </div>
          </div> 
      </header>
    <div class="row">
      <div class="col1">
     
          <div class="video-player">
            <video ref="video" class="video" v-if="currentVideo" :src="currentVideo.url" autoplay  controls></video>
            <div class="controls">
              <button class="play-btn" v-if="!$refs.video?.paused" @click.prevent="$refs.video?.pause()">Cool</button>
              <button class="pause-btn" v-else @click.prevent="$refs.video?.play()"></button>
              <div class="progress-bar" @click="seek">
                <div class="progress" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="time">{{ currentTime }} / {{ duration }}</div>
            </div>
     
          <!-- Add video form -->
     
        </div>
      </div>

      <!-- Video list -->
      <div class="col2">
        <div class="video-list">
          <div v-for="video in videoList" :key="video.url" class="video-item" @click="playVideo(video)">
            <div class="thumbnail">
              <video :src="video.url" autoplay muted loop ></video>
            </div>
            <div class="details">
              <div class="title">{{ video.title }}</div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="form">
      <input @change="handleFileUpload" class="inpdddut" name="arquivo" id="arquivo" type="file">
   </div>
  </div>
 
</template>
<script>

export default {
  name: 'HomeView',
  data(){
    return {
      profileMenu: null,

    }
  },
  computed: {
    // Get the current video and video list from Vuex store
    currentVideo() {
      return this.$store.state.currentVideo
    },
    isPlaying() {
      return !this.$refs.video.paused
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
    toggleProfileMenu(){
      this.profileMenu =!this.profileMenu
    },
    // Method to handle file upload on selecting a video file
    handleFileUpload(event) {
      // Set the selected file as the current file
      this.file = event.target.files[0];
      const video = {
          title: this.file.name,
          file: this.file,
          url: URL.createObjectURL(this.file),
        };
          
        this.$store.commit('setVideoList', [...this.videoList, video]);
        this.file = null;
    },
    // Method to add a new video to the video list

    togglePlay() {
      if (this.isPlaying) {
        this.$refs.video.pause()
      } else {
        this.$refs.video.play()
      }
    },
    // Method to play a video
    playVideo(video) {
      if (!video) {
        return;
      }

      if (video.file instanceof Blob) {
        this.$store.commit('setCurrentVideo', video);
      } else {
        this.$store.commit('setCurrentVideo', video);
        this.$refs.video.currentTime = 0
        this.$refs.video.play()
      }
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


}

</script>
<style scoped>

.row{
  margin-top: 90px;
  display:flex;
  justify-content: space-between;
  flex-direction: row;
  min-height: 578px;
}
.col1{
  width:70%;
  box-shadow: 2px 2px 7px rgba(0,0,0, 0.2);
}
.col2{
  box-shadow: 2px 2px 7px rgba(0,0,0, 0.2);
  width:30%;
}
form {
  border-radius: 5px;
  display: flex;
  width: auto;
}
.inpdddut[type="file"] {
  padding: 10px;
  margin-bottom: 20px;
  border: none;
  background-color: #2dcfeb;
  border-radius: 5px;
  width: 100%;
  cursor: pointer;
}
.video-player {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 aspect ratio */
    margin-bottom: 20px;
  }
  .video {
    position: absolute;
    top: 0;
    left: 0;
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
 
   font-size: 25px;
  border-radius: 50%;
  padding: 10px;
  background-color: #2dcfeb; 
  cursor: pointer;
}
.progress-bar {
  width: 60%;
  height:5px;
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
    max-height: 80vh;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
    width:400px;
    gap: 10px;
  }
  .video-item {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
    display: flex;
    flex-direction: column;

  }
  .video-item:hover {
    opacity: 0.8;
  }
  .thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .thumbnail video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .details {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 8px;
    box-sizing: border-box;
    color: #fff;
    font-size: 14px;
  }
  .title {
    font-weight: bold;
    margin-bottom: 4px;
  }
  .duration {
    font-style: italic;
  }



.container-fluid{
  background-color: #676565;
  color: #000;
  height: 100%;
  overflow: hidden;
}
.container-fluid header{
  display: flex;
  justify-content: space-between;
  box-shadow: 2px 2px 5px rgba(0,0,0, 0.2);
  position: fixed;
  height: fit-content;
  right: 10px;
  width: 100%;
  z-index: 999;
  transition: left 300ms;

}
.profile-menu {
    position: absolute;
    border-radius: 10px;
   color: #fff;
    top: 60px;
    right: 0; 
    width: 270px;
    background-color: #232222;
    box-shadow: 0 4px 0px -1px #ffffff;
  }
  a{
  text-decoration: none;
  }
  .info {
    display: flex;
    align-items: center;
    padding: 5px;
    border-bottom: 1px solid #787777;
  }
  .right {
    flex: 1;
    margin-left: 24;
  }
  i{
    padding-right:10px;
  }
#nav-toggle:checked ~ .main-content{
    margin-left: 70px;
 }
#nav-toggle:checked ~ .main-content header{
   width: calc(100% -70px);
   left: 70px;
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
.profile {
  margin: 10px;
}
.profile span {
  font-size: 25px;
  border-radius: 50%;
  padding: 10px;
  background-color: #2dcfeb;
}
@media only screen and (max-width:1200px){
     .container-fluid{
        margin-left: 70px;
     }
   .container-fluid header{
       width: calc(100% -70px);
       left: 70px;
     }
     .form{
      display:none;
    }

}

@media only screen and (min-width:800px){
.form{
display:none;
}

}

 @media only screen and (max-width: 768px) {
  
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
    .container-fluid {
        width: 100%;
        margin-left: 0rem;
    }
    header {
        width: 100% !important;
        left: 0 !important;
        
    }
    form{
      display: none;
    }
    .form{
      display:flow-root;
    position: fixed;
      bottom: 0;
    }
.row {
  display: flex;
  flex-direction: column;
  margin-left: 0;
}
.col1{
  width: 100%;

}
.col2{
  width:100%;

}
.video-list{
  width:100%;
}
    #nav-toggle:checked ~ .main-content {
        margin-left: 0rem !important;
    }
 }

</style>
