let currentsong = new Audio();
let songs;
let currFolder;
function secondtoMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
    // Show all the song in the playlist
  let songUL = document
  .querySelector(".songList").getElementsByTagName("ul")[0];
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML +
      `<li><img src="img/music.svg" alt="Music">
       <div class="info">
       <div class="info">${song.replaceAll("%20", " ")}</div>
       <div>Song Artist</div>
       </div>
       <div class="playnow">
       <img class="invert songlistplay" src="img/play.svg" alt="">
       </div></li>`;
  }
  // attach event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}
const playMusic = (track , pause=false) => {
//   let audio = new Audio("/songs/" + track);
currentsong.src = `/${currFolder}/` + track
if (!pause){
currentsong.play()
play.src ="img/paused.svg"
}
document.querySelector(".songinfo").innerHTML = decodeURI(track)
document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
};

async function displayAlbums() {
  console.log("displaying albums")
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".card-container")
  let array = Array.from(anchor)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("/songs/")){
      let folder = e.href.split("/").slice(-2).join("/")
      // Get the metadata of the folder 
      let a = await fetch(`http://127.0.0.1:5500/${folder}/info.json`);
      let response = await a.json();
      console.log(response)
      cardContainer.innerHTML = cardContainer.innerHTML + `
          <div data-folder="${folder}" class="card">
          <div class="play"><img src="img/play.svg" alt="play"></div>
          <img src="/${folder}/coverd.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
          </div>`
          console.log(cardContainer)
    }
  }
    // Load the playlist whenever card is clicked 
  Array.from(document.getElementsByClassName("card")).forEach (e =>{
    e.addEventListener("click", async item =>{
      console.log("Fetching Data", folder)
      songs = await getsongs(`/${item.currentTarget.dataset.folder}`);
    })
  })
}

async function main() {
  // Get the list of all the songs
  await getsongs("songs/ncs");
  playMusic(songs[0], true)

  // Display all the albnums on the page 
  displayAlbums()


  // Attach an event listener to play, next and previous 

  play.addEventListener("click", ()=>{
    if(currentsong.paused){
        currentsong.play()
        play.src ="img/paused.svg"
    }
    else {
        currentsong.pause()
        play.src ="img/circle-play.svg"

    }
  })

  // Listen for timeupdate event
  currentsong.addEventListener("timeupdate",()=>{
   document.querySelector(".songtime").innerHTML = 
  `${secondtoMinutesSeconds(currentsong.currentTime)} / ${secondtoMinutesSeconds(currentsong.duration)}`;
  document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration)*100 + "%";
  })

  // Add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e =>{
    let percent = [e.offsetX/e.target.getBoundingClientRect().width *100];
    document.querySelector(".circle").style.left =  percent + "%";
    currentsong.currentTime = ((currentsong.duration)* percent)/100
  })

  // Add event listner for hamburger
  document.querySelector(".hamburger").addEventListener('click' , ()=>{
    document.querySelector(".left").style.left ="0"
  })

  // Add event listner for close hamburger
  document.querySelector(".closeicon").addEventListener('click' , ()=>{
    document.querySelector(".left").style.left ="-110%"
  })

  // Add event listner for previous
  previous.addEventListener("click", ()=>{
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if((index-1)>= 0){ 
      playMusic(songs[index-1])
    }
  })


  // Add event listner for Next
  next.addEventListener("click", ()=>{
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if((index+1) < songs.length){
      playMusic(songs[index+1])
    }
  })

  // Add event listner for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) =>{
    currentsong.volume = parseInt(e.target.value)/100
  })

  // Load the playlist whenever card is clicked 
  Array.from(document.getElementsByClassName("card")).forEach (e =>{
    e.addEventListener("click", async item =>{
      // console.log(item, item.currentTarget.dataset)
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      
    })
  })
  // Add event listner to mute the volume
  document.querySelector(".volume>img").addEventListener("click", e=>{
    if(e.target.src.includes("img/volume.svg")){
      e.target.src = e.target.src.replace =("img/volume.svg" , "img/mute.svg")
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      e.target.src = e.target.src.replace =("img/mute.svg" , "img/volume.svg")
      currentsong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
      
  })


}
main();
