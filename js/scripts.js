window.addEventListener("load", () => {
   class AudioPlayer {
      static API_KEY = "7f9451dc34msh40dd5dba6adf75ep15ee18jsn6a82f7114f0d";
      static SEARCH_URL = "https://deezerdevs-deezer.p.rapidapi.com/search?q=";
      static DEFAULT_HEADERS = {
         'X-RapidAPI-Key': AudioPlayer.API_KEY,
         'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
      };
      static SECTIONS = {
         main: "main",
         playlist: "playlist",
      };
      static inputArtistName = document.getElementById("inputArtistName");
      static searchBtn = document.getElementById("search-btn");
      static cardsOutput = document.getElementById("cards-output");
      static playlistOutput = document.querySelector(".audioplayer__playlist-output");
      static audioTrack = document.querySelector(".audioplayer-audio");
      static playBtn = document.querySelector(".audioplayer__button--play");
      static prevBtn = document.querySelector(".audioplayer__button--prev");
      static nextBtn = document.querySelector(".audioplayer__button--next");
      static minutesCounter = document.querySelector("#minCount");
      static secondsCounter = document.querySelector("#secCount");
      static trackDuration = document.querySelector(".audioplayer__controls-track-duration"); 
      static trackInPlaylist = document.querySelectorAll(".track-in-playlist");
      static tracksBtn = document.querySelectorAll(".audioplayer__track-button");
      static sortingBtn = document.querySelector(".audioplayer__button--sort");
      static slider = document.querySelector('.slider');
      static progress = document.querySelector('.progress');
      static currentIndex = 0;

      static currentSeconds = 0;
      static currentMinutes = 0;
      static timer = 0;
      constructor (data = []) {
         this.data = data;
         this.currentTrackDuration = 0;
         this.renderPlaylist();
         this.changeTrackSrc();
         
         AudioPlayer.searchBtn.onclick = () => {
            this.getData(AudioPlayer.inputArtistName.value)
            .then(() => this.renderData(this.data));
         };

         AudioPlayer.playBtn.onclick = () => {

            this.playlist = this.getPlaylistData();

            this.currentTrack = this.playlist[AudioPlayer.currentIndex];

            if (!AudioPlayer.audioTrack.src) this.changeTrackSrc(this.currentTrack);
            
            if (this.playlist.length > 0){
               if (AudioPlayer.playBtn.classList.contains("_icon-play-btn")) {
                  AudioPlayer.audioTrack.play(); 
                  this.visualisationCurrentTrack();
                  this.renderTrackDuration(this.currentTrack);
                  this.renderCurrentTrackDuration ();
                  AudioPlayer.playBtn.classList.remove("_icon-play-btn");
                  AudioPlayer.playBtn.classList.add("_icon-pause-btn");
               } else {
                     AudioPlayer.audioTrack.pause();
                     AudioPlayer.playBtn.classList.add("_icon-play-btn");
                     AudioPlayer.playBtn.classList.remove("_icon-pause-btn");

                     clearInterval(AudioPlayer.timer);
                  }

            }


            AudioPlayer.prevBtn.onclick = () => {
               if(!AudioPlayer.audioTrack.paused) {
                  AudioPlayer.audioTrack.pause();
                  this.changePrevTrack(this.playlist, AudioPlayer.currentIndex);
                  this.changeTrackSrc(this.currentTrack);
                  AudioPlayer.audioTrack.play();
                  this.visualisationCurrentTrack();
               } else {
                  this.changePrevTrack(this.playlist, AudioPlayer.currentIndex);
                  this.changeTrackSrc(this.currentTrack);
                  this.visualisationCurrentTrack();
               }

            };

            AudioPlayer.nextBtn.onclick = () => {
               if (!AudioPlayer.audioTrack.paused) {
                  AudioPlayer.audioTrack.pause();
                  this.changeNextTrack(this.playlist, AudioPlayer.currentIndex);
                  this.changeTrackSrc(this.currentTrack);
                  AudioPlayer.audioTrack.play();
                  this.visualisationCurrentTrack();
               } else {
                  this.changeNextTrack(this.playlist, AudioPlayer.currentIndex);
                  this.changeTrackSrc(this.currentTrack);
                  this.visualisationCurrentTrack();
               }
            }
         };

         AudioPlayer.sortingBtn.onclick = () => this.sortingByRating();

         AudioPlayer.slider.oninput = function(e){
            AudioPlayer.progress.style.width = `${e.target.value}%`;
          };
      }

      async getData (trackName = "") {
         try {
            const responseData = await fetch (AudioPlayer.SEARCH_URL + trackName, {
               headers: AudioPlayer.DEFAULT_HEADERS
            });
            const data = await responseData.json();
            this.data = data.data ? data.data : [];
            console.log(this.data);

         } catch (e) {
            console.log (e);
         }
      }

      getPlaylistData() {
         return JSON.parse(localStorage.getItem("Playlist") || "[]");
      }
   
      addPlaylistData(track) {
         const oldPlaylist = this.getPlaylistData();
         localStorage.setItem("Playlist", JSON.stringify([...oldPlaylist, track]));
      }
   
      removePlaylistData(id) {
         const oldPlaylist = this.getPlaylistData();
         localStorage.setItem("Playlist", JSON.stringify([...oldPlaylist].filter((track) => track.id !== id)));
      }
   
      checkIfPlaylistContainsTrack(id) {
         return this.getPlaylistData().find((track) => track.id === id) ? true : false;
      }

      changeTrackSrc (track) {
         if (track) {
           AudioPlayer.audioTrack.src = track.preview;
           return AudioPlayer.audioTrack.src;
         }
      }

      visualisationCurrentTrack() {
        [...AudioPlayer.trackInPlaylist].forEach ((el) => el.style.color = "#fff");
        const findedTrack = [...AudioPlayer.trackInPlaylist].find((el) => +el.id === this.currentTrack.id);
        if (findedTrack) findedTrack.style.color = "#f23005";
      }

      renderData(dataToRender, outputElement = AudioPlayer.cardsOutput, isUsingAsPlayist = false) {
         if (dataToRender.length === 0){
            outputElement.innerHTML = "";
            outputElement.innerHTML = `<div class="audioplayer__alternative-text">
            <p>The number of requests to the server has been exceeded</p>
            <p>Try again</p>
            </div>`;
         } else {
            outputElement.innerHTML = "";

            dataToRender.forEach((track) => {
               const { id, title, artist, album, duration, rank,  preview} = track;
      
               const isTrackAddedToPlaylist = this.checkIfPlaylistContainsTrack(id);
      
               outputElement.innerHTML += `<figure id="${id}" class="audioplayer__track-card">
                  <div class="audioplayer__track-image-block"><img  class="audioplayer__track-image" src="${album.cover_medium}" alt="image"></div>
                  <figcaption class="audioplayer__track-description">
                     <h3>${artist.name}</h3>
                     <p>${title}</p>
                     <h4>album: ${album.title}</h4>
                     <p>rating: ${rank}</p>
                     <button class="audioplayer__track-button" id="btn-${track.id}">${
                        isTrackAddedToPlaylist ? "Delete from playlist" : "Add to playlist"
                      }</button>
                  </figcaption>
               </figure>`
            });
   
            AudioPlayer.tracksBtn = document.querySelectorAll(".audioplayer__track-button");
   
            [...AudioPlayer.tracksBtn].forEach((btn, i) => {
               btn.onclick = () => {
                  this.currentTrack = dataToRender[i] || null;
                  if (this.checkIfPlaylistContainsTrack(this.currentTrack.id)) {
                     this.removePlaylistData(this.currentTrack.id);
                     btn.textContent = "Add to playlist";
                     this.renderPlaylist(this.currentTrack.id);
                  } else {
                     this.addPlaylistData(this.currentTrack);
                     btn.textContent = "Delete from playlist";
                     this.renderPlaylist(this.currentTrack);
                  }
               }
            });
         }

         return AudioPlayer.tracksBtn;
      }

      renderPlaylist () {
         AudioPlayer.playlistOutput.innerHTML = "";
         this.playlist = this.getPlaylistData();
         let trackCounter = 1;
         this.playlist.forEach((track) => {
            AudioPlayer.playlistOutput.innerHTML += `<div class="audioplayer__track">
            <p class="track-in-playlist" id="${track.id}"><span>${trackCounter}. </span><span>${track.artist.name} - ${track.title}</span> </p>
            <button id="btn-${track.id}" class="audioplayer__button-playlist audioplayer__button-playlist--delete _icon-trash-btn"></button>
            
            </div>`;
            trackCounter++;
         })
         AudioPlayer.trackInPlaylist = document.querySelectorAll(".track-in-playlist");
         const deleteBtn = document.querySelectorAll(".audioplayer__button-playlist--delete");

         [...AudioPlayer.trackInPlaylist].forEach((track, i) => {

            track.onclick = (event) => { 
               [...AudioPlayer.trackInPlaylist].forEach((el => el.style.color = "#ffffff"));
               this.currentTrack = this.playlist[i];
               AudioPlayer.currentIndex = i;
               AudioPlayer.playBtn.classList.add("_icon-play-btn");
               AudioPlayer.playBtn.classList.remove("_icon-pause-btn");
               track.style.color = "#f23005";
               this.renderTrackDuration(this.currentTrack);
               
               AudioPlayer.audioTrack.src = this.currentTrack.preview;

               AudioPlayer.playBtn.onclick = () => {
                  if (AudioPlayer.playBtn.classList.contains("_icon-play-btn")) {
                     AudioPlayer.audioTrack.play();
                     AudioPlayer.playBtn.classList.remove("_icon-play-btn");
                     AudioPlayer.playBtn.classList.add("_icon-pause-btn");
                     this.currentTrackDuration = 0;
                     this.renderCurrentTrackDuration();
                  } else {
                        AudioPlayer.audioTrack.pause();
                        AudioPlayer.playBtn.classList.add("_icon-play-btn");
                        AudioPlayer.playBtn.classList.remove("_icon-pause-btn");
                        clearInterval(AudioPlayer.timer)
                     }
               }        

               AudioPlayer.prevBtn.onclick = () => {
                  if (AudioPlayer.audioTrack.paused){
                     this.changePrevTrack(this.playlist, AudioPlayer.currentIndex);
                     this.changeTrackSrc(this.currentTrack);
                     this.visualisationCurrentTrack();
                  } else {
                     AudioPlayer.audioTrack.pause();
                     this.changePrevTrack(this.playlist, AudioPlayer.currentIndex);
                     this.changeTrackSrc(this.currentTrack);
                     this.visualisationCurrentTrack();
                     AudioPlayer.audioTrack.play();
                  }

               };

               AudioPlayer.nextBtn.onclick = () => {
                  if (AudioPlayer.audioTrack.paused){
                     this.changeNextTrack(this.playlist, AudioPlayer.currentIndex);
                     this.changeTrackSrc(this.currentTrack);
                     this.visualisationCurrentTrack();
                  } else {
                     AudioPlayer.audioTrack.pause();
                     this.changeNextTrack(this.playlist, AudioPlayer.currentIndex);
                     this.changeTrackSrc(this.currentTrack);
                     this.visualisationCurrentTrack();
                     AudioPlayer.audioTrack.play();
                  }
               };
            };
         });
      
         [...deleteBtn].forEach ((btn, i) => {
            btn.onclick = () => {
               AudioPlayer.tracksBtn = document.querySelectorAll(".audioplayer__track-button");
               this.currentTrack = this.playlist[i];
               if (this.checkIfPlaylistContainsTrack(this.currentTrack.id)) {
                  this.removePlaylistData(this.currentTrack.id);    
                  if ([...AudioPlayer.tracksBtn].length > 0) {
                     const deletedTrackFromPlaylist = [...AudioPlayer.tracksBtn].find((el) => el.id === `btn-${this.currentTrack.id}`);
                     deletedTrackFromPlaylist ? deletedTrackFromPlaylist.textContent = "Add to playlist" : null;
                  }
                  AudioPlayer.currentIndex--;
               }     
               this.renderPlaylist();  
            }
         });

         return AudioPlayer.trackInPlaylist;
      }

      renderTrackDuration (track) {
         if (track) {
            AudioPlayer.trackDuration.textContent = "";
            const minutes = Math.floor(track.duration / 60).toString();
            const seconds = (track.duration - (Math.floor(track.duration / 60) * 60)).toString();
            const modificatedSeconds = seconds.length === 1 ?  "0" + seconds : seconds;
            AudioPlayer.trackDuration.textContent = `${minutes}:${modificatedSeconds}`
         }
      }

      renderCurrentTrackDuration () {
         let currentSeconds = this.currentTrackDuration - (Math.floor(this.currentTrackDuration / 60) * 60);
         let currentMinutes = Math.floor(this.currentTrackDuration / 60);
         AudioPlayer.secondsCounter.textContent = `${currentSeconds}`;
         AudioPlayer.minutesCounter.textContent = `${currentMinutes}`;
         AudioPlayer.timer = setInterval (() => {
            this.currentTrackDuration++;
            AudioPlayer.secondsCounter.textContent = `${currentSeconds}`
            if (currentSeconds > 59) {
               currentSeconds = 0;
               AudioPlayer.secondsCounter.textContent = `${currentSeconds}`
               currentMinutes++;
               AudioPlayer.minutesCounter.textContent = `${currentMinutes}`;    
            }
            currentSeconds++;
         }, 1000); 
         return this.currentTrackDuration;
      }

      changeNextTrack (tracks) {
         AudioPlayer.currentIndex++;
         if (tracks[AudioPlayer.currentIndex]) {
            this.currentTrack = tracks[AudioPlayer.currentIndex];
         } else {
            AudioPlayer.currentIndex = 0;
            this.currentTrack = tracks[AudioPlayer.currentIndex];
         }
         return this.currentTrack;
      }
      
      changePrevTrack(tracks) {
         AudioPlayer.currentIndex--;
         if (tracks[AudioPlayer.currentIndex]) {
            this.currentTrack = tracks[AudioPlayer.currentIndex];
         } else {
            this.currentTrack = tracks.at(-1);
            AudioPlayer.currentIndex = tracks.length - 1;
         }
         return this.currentTrack;
      }
      
      sortingByRating() {
         if (this.data.length > 1) {
            const newData = [...this.data].sort((track1, track2) => track2.rank - track1.rank);
            this.renderData(newData, AudioPlayer.cardsOutput, false);
         } 
      }


   }

   new AudioPlayer();

});
