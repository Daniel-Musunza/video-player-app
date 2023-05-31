<template>
  <!-- Video player -->
 <div class="container-fluid">
     <header>
         
       <div class="open"  @click="toggleOpenMenu">
             <button class="btn" type="button">
               <strong>New</strong>
               <div id="container-stars">
                   <div id="stars"></div>
               </div>

               <div id="glow">
                   <div class="circle"></div>
                   <div class="circle"></div>
               </div>
             </button>
           </div>
         <div v-if="openMenu" class="open-menu">
             <form >
              <label for="single-file-upload" class="hidden-label">Choose File</label>
              <input
                @change="handleFileUpload"
                class="input"
                name="arquivo"
                id="single-file-upload"
                type="file"
                style="display: none;"
              />

              <label for="folder-upload" class="hidden-label" >Upload Folder</label>
              <input
                @change="handleFolderUpload"
                class="input"
                name="arquivo"
                id="folder-upload"
                type="file"
                multiple
                directory
                webkitdirectory
                style="display: none;"
              />

              </form>
         </div>
    
        
           <div class="profile"  @click="toggleProfileMenu">
             <button class="btn" type="button">
               <strong>Cool</strong>
               <div id="container-stars">
                   <div id="stars"></div>
               </div>

               <div id="glow">
                   <div class="circle"></div>
                   <div class="circle"></div>
               </div>
             </button>
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
       <div v-if="currentVideo">
        <div class="video-player" >
          <video ref="video" @ended="videoEnded" preload="none" class="video" :src="currentVideo.url" autoplay controls></video>
        </div>
        <div class="title" style="color: aliceblue; margin-top: 0;">{{ currentVideo.title }}</div>
      </div>
     </div>

    <!-- Video list -->
    <div class="col2">
      <div class="video-list">
        <div v-for="video in videoList" :key="video.url" class="video-item">
          <div class="thumbnail" @click="playVideo(video)">
            <video :src="video.url" loop autoplay muted></video>
          </div>
          <div class="details">
            <div class="title">{{ video.title }}</div>
          </div>
        </div>
      </div>
    </div>
   </div>
 </div>

</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'HomeView',
  data() {
    return {
      profileMenu: null,
      openMenu: null,
    };
  },
  computed: {
    ...mapState(['videoList']),
    currentVideo() {
      return this.$store.state.currentVideo;
    },
    isPlaying() {
      return !this.$refs.video.paused;
    },
  },
  methods: {
    toggleProfileMenu() {
      this.profileMenu = !this.profileMenu;
    },
    toggleOpenMenu() {
      this.openMenu = !this.openMenu;
    },
    ...mapActions(['getVideoList']),
    handleFileUpload(event) {
      this.file = event.target.files[0];
      const newData = {
        title: this.file.name,
        file: this.file,
        url: URL.createObjectURL(this.file),
      };
      this.$store.commit('setVideoList', [...this.videoList, newData]);
      this.playVideo(newData);
      fetch('http://localhost:3000/addData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })
        .then(response => {
          if (response.ok) {
            console.log('Video added successfully!');
            this.file = null;
            this.playVideo(newData);
          } else {
            console.log('Failed to add video to data.json');
          }
        })
        .catch(error => {
          console.log('An error occurred:', error);
        });
      this.file = null;
      this.openMenu = null;

    },
    handleFolderUpload(event) {
    const files = event.target.files;
    const folderFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if the file is a video file (you can modify this check as per your requirements)
      if (file.type.startsWith('video/')) {
        const newData = {
          title: file.name,
          file: file,
          url: URL.createObjectURL(file),
        };
        folderFiles.push(newData);
      }
    }
    
    if (folderFiles.length > 0) {
      this.$store.commit('setVideoList', [...this.videoList, ...folderFiles]);
      this.playVideo(folderFiles[0]);
      
      // Process and upload folderFiles as needed
      
      // Rest of the code...
    }
    this.openMenu = null;
  },

    togglePlay() {
      const videoElement = this.$refs.video;
      if (this.isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
    },
    playVideo(video) {
      if (!video) {
        return;
      }

      if (video.file) {
        this.$store.commit('setCurrentVideo', video);
      } else {
        const newVideo = {
          ...video,
          file: video.url,
        };
        this.$store.commit('setCurrentVideo', newVideo);
      }
      this.openMenu = null;
    },
    videoEnded() {
      const currentIndex = this.videoList.findIndex(video => video.url === this.currentVideo.url);
      const nextIndex = (currentIndex + 1) % this.videoList.length;
      const nextVideo = this.videoList[nextIndex];
      this.playVideo(nextVideo);
    },
  },
  mounted() {
    this.getVideoList();
    const videoElement = this.$refs.video;
    if (videoElement) {
      videoElement.addEventListener('ended', this.videoEnded);
    }
  },
  beforeUnmount() {
    const videoElement = this.$refs.video;
    if (videoElement) {
      videoElement.removeEventListener('ended', this.videoEnded);
    }
  },
};
</script>
<style scoped>
.btn {
  margin:10px;
  right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: 3rem;
  background-size: 300% 300%;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
  transition: 0.5s;
  animation: gradient_301 5s ease infinite;
  border: double 4px transparent;
  background-image: linear-gradient(#212121, #212121),  linear-gradient(137.48deg, #ffdb3b 10%,#FE53BB 45%, #8F51EA 67%, #0044ff 87%);
  background-origin: border-box;
  background-clip: content-box, border-box;
}

#container-stars {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: 0.5s;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
}

strong {
  z-index: 2;
  font-family: 'Avalors Personal Use';
  font-size: 12px;
  letter-spacing: 5px;
  color: #FFFFFF;
  text-shadow: 0 0 4px white;
}

#glow {
  position: absolute;
  display: flex;
  width: 12rem;
}

.circle {
  width: 100%;
  height: 30px;
  filter: blur(2rem);
  animation: pulse_3011 4s infinite;
  z-index: -1;
}

.circle:nth-of-type(1) {
  background: rgba(254, 83, 186, 0.636);
}

.circle:nth-of-type(2) {
  background: rgba(142, 81, 234, 0.704);
}

.btn:hover #container-stars {
  z-index: 1;
  background-color: #212121;
}

.btn:hover {
  transform: scale(1.1)
}

.btn:active {
  border: double 4px #FE53BB;
  background-origin: border-box;
  background-clip: content-box, border-box;
  animation: none;
}

.btn:active .circle {
  background: #FE53BB;
}

#stars {
  position: relative;
  background: transparent;
  width: 200rem;
  height: 200rem;
}

#stars::after {
  content: "";
  position: absolute;
  top: -10rem;
  left: -100rem;
  width: 100%;
  height: 100%;
  animation: animStarRotate 90s linear infinite;
}

#stars::after {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
}

#stars::before {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 170%;
  height: 500%;
  animation: animStar 60s linear infinite;
}

#stars::before {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
  opacity: 0.5;
}

@keyframes animStar {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-135rem);
  }
}

@keyframes animStarRotate {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0);
  }
}

@keyframes gradient_301 {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse_3011 {
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
.container-fluid{
  background-color: #676565;
  color: #000;
  height: 100%;
  width: 100%;
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
.row{
  margin-top: 80px;
  display:flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  min-height: 600px;
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
  display: flex;
  flex-direction: column;
}
.open{
  margin-left: 10px;
}
.input[type="file"] {
  margin: 10px;
  background: none;
  border: none;
  outline: none;
  max-width: 250px;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 9999px;
  box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  color: #fff;
}
.input {
  margin: 10px;
  background: none;
  border: none;
  outline: none;
  max-width: 190px;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 9999px;
  box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  color: #fff;
}
label{
  margin: 10px;
  background: none;
  border: none;
  outline: none;
  max-width: 190px;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 9999px;
  box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  color: #fff;
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
    margin: 10px;
    width:100%;
    gap: 10px;
  }
  .video-item {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    height: 20px;
  }
  .video-item:hover {
    opacity: 0.8;
  }
  .thumbnail {
   
    width: 100%;
    height:fit-content;
   
  
  }
  .thumbnail video {
    width: 100%;
    height: fit-content;
 
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
  .open-menu {
    position: absolute;
    border-radius: 10px;
   color: #fff;
    top: 60px;
    left: 0; 
    width: fit-content;
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
/* .profile {
  margin: 10px;
} */
@media only screen and (max-width:1200px){
     .container-fluid{
        margin-left: 70px;
     }
   .container-fluid header{
       width: calc(100% -70px);
       left: 70px;
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
       
        margin: 0;
    }
    header {
        width: 100% !important;
        left: 0 !important;
        
    }
   
    
.row {
  display: flex;
  flex-direction: column;
  
  margin: 0;
}
.col1{
 display: none;
}
.col2{
  width:100%;
right: 0;
}

    #nav-toggle:checked ~ .main-content {
        margin-left: 0rem !important;
    }
  .video-list{
    height: auto;
    margin-top: 73px;;
  }
  .video-item {
    position: relative;
    height: 675px;
    cursor:grab;
   

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

 }

</style>
