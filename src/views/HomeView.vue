<template>
   <!-- Video player -->
  <div class="container">
      <header>
        <div>
          <h3>
            <label for="nav-toggle">
                <span><i class="fa-solid fa-bars"></i></span>
            </label>
          </h3>
        </div>
        <form>
            <input type="url" class="inpdddut" v-model.trim="URL">
            <input @change="handleFileUpload" class="inpdddut" name="arquivo" id="arquivo" type="file">
            <input value="Add Video"  @click.prevent="addVideo" type="submit" class="inpdddut">
          </form>
          <div class="user-wrapper"  @click="toggleProfileMenu">
         
            <div class="profile">
                <span style="font-size:20px; padding-left: 25px;">3,s</span>
            </div>
            <span class="down"><i class="fa-sharp fa-solid fa-angle-down"></i></span>
          </div>
          <div v-if="profileMenu " class="profile-menu">
            <div class="info">
              <div class="right">
                <h4>MR THREE COMMAS </h4>
                <small>Super admin</small>
                <hr>
                <br>
               
                <router-link to="/profile-view"><i class="fa-regular fa-user" ></i>View Profile</router-link>
                
                <hr>
                <br>
                <router-link  to="/"> <i class="fa-solid fa-user-group"></i>Switch Account</router-link>
                
                <hr>
                <br>
                
              </div>
            </div>
          </div> 
  </header>
    <div class="row">
      <div class="col1">
        <div class="my-container d-flex flex-column">
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
   <input type="url" class="inpdddut" v-model.trim="URL">
    <input @change="handleFileUpload" class="inpdddut" name="arquivo" id="arquivo" type="file">
    <input value="Add Video"  @click.prevent="addVideo" type="submit" class="inpdddut">
  </div>
  </div>
 
</template>
<script>

export default {
  name: 'HomeView',
  data(){
    return {
      profileMenu: null,
      URL: ''

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
      this.file = event.target.files[0]
    },
    // Method to add a new video to the video list
    addVideo() {
      if (this.file) {
        const video = {
          title: this.file.name,
          file: this.file,
          url: URL.createObjectURL(this.file),
        };
          
        this.$store.commit('setVideoList', [...this.videoList, video]);
        this.file = null;
            
      } else {
        const video = {
            title: this.URL,
            url: this.URL,
          }
          this.$store.commit('setVideoList', [...this.videoList, video])
          this.title = ''
          this.url = ''
      }
    },
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


}

</script>
<style scoped>

.row{
  margin-top: 100px;
  display:flex;
  justify-content: space-between;
  margin-left: 100px;
  flex-direction: row;
}
.col1{
  width:70%;
}
.col2{

  width:30%;
}
form {
 
  border-radius: 5px;
  display: flex;
  width: auto;
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
.inpdddut[type="url"] {
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  width: 100%;
  cursor: pointer;
}

.inpdddut[type="submit"] {
  padding: 10px;
  margin-bottom: 20px;
  border: none;
  background-color: #a0faa5;
  border-radius: 5px;
  width: 100px;
  cursor: pointer;
}

.inpdddut[type="submit"]:hover {
  background-color: #006F8F;
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
body, html {
    overflow: hidden;
  }
  .video-list {
    max-height: 80vh;
    overflow-y: scroll;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
    width:300px;
    gap: 10px;
  }
  .video-item {
    position: relative;
    width: 100%;
    max-width: 300px;
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
.container header{
  
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



@media only screen and (max-width:1200px){

     .container{
        margin-left: 70px;
     }
   .container header{
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
    .container {
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
