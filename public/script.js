// document.addEventListener("DOMContentLoaded", () => {
// alert("what");
console.log(io);
console.log(window.location.href);
console.log(window.location.pathname);
const url = new URL(window.location.href);

const socket = io();
socket.on("connect", () => {
  console.log(socket.id);
});
const roomname = document.querySelector(".roomname");
const nameinput = document.querySelector(".nameinput");
const callbtn = document.querySelector("#create-room");
const jionbtn = document.querySelector("#join-room");
const jionbtn2 = document.querySelector(".join-btn");
const modal = document.querySelector(".container");
const joinmodal = document.querySelector(".calls-container");
const btncontainer = document.querySelector(".cbuttons");
const form = document.querySelector(".form");

const hangup = document.querySelector(".hangup-container");
const sharebtn = document.querySelector(".sharebtn");
const pausevid = document.querySelector(".stop-video");
const screenShare = document.querySelector(".share-screen");

//

let didIOffer = false;
let localpc;
let offers = [];
let myicecandidates = [];
let calling = false;
let connections = [];
let stream;
let avatar = document.querySelector(".avatar");
let participants;
remotestream = new MediaStream();

callbtn.addEventListener("click", async () => {
  if (!roomname.value) return;
  modal.classList.remove("show");
  modal.classList.add("hide");
  joinmodal.classList.add("show");
  joinmodal.classList.remove("hide");
  didIOffer = true;
  calling = true;
  stream = await gum();
  // createVIdeoElement(stream, "local");
  const avatar_image = document.querySelector(".avatar-image");
  const avatar = document.querySelector(".avatar");
  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();
  avatar.removeChild(avatar_image);
  avatar.append(video);
  calling = true;
  didIOffer = true;
  socket.emit("createRoom", roomname.value);
});

jionbtn.addEventListener("click", async () => {
  if (!roomname.value) return;
  modal.classList.remove("show");
  modal.classList.add("hide");
  joinmodal.classList.add("show");
  joinmodal.classList.remove("hide");
  stream = await gum();

  // createVIdeoElement(stream, "local");
  const avatar_image = document.querySelector(".avatar-image");

  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();
  avatar.removeChild(avatar_image);
  avatar.append(video);
  calling = false;
  didIOffer = true;

  // didIOffer = true;
});
jionbtn2.addEventListener("click", async () => {
  if (!nameinput.value) {
    alert("you need to provide a name");
    return;
  }
  localpc = await createPeerConnection({ stream });

  avatar.remove();
  createVIdeoElement(stream, "local");
  if (!calling) {
    didIOffer = false;
    console.log("joinroom");
    participants = await socket.emitWithAck("joinroom", {
      roomname: roomname.value,
      username: nameinput.value,
    });
    console.log("participants", participants);
    for (let participant of participants) {
      if (participant.name == nameinput.value) continue;
      console.log("creating peer connection for", participant.name);
      const pc = await createPeerConnection({ offer: participant, stream });
      pc.onicegatheringstatechange = (ev) => {
        console.log(ev.target);
        const connection = ev.target;
        switch (connection.iceGatheringState) {
          case "gathering":
            /* collection of candidates has begun */
            break;
          case "complete":
            participant.answerer_name = nameinput.value;
            participant.answerericecandidates = myicecandidates;
            console.log("mycandidatesxxx", myicecandidates);
            socket.emit("chose-an-offer", roomname.value, participant);
            /* collection of candidates is finished */
            break;
        }
      };

      connections.push(pc);
    }
    // console.log("connections", connections);
  }

  joinmodal.classList.remove("show");
  joinmodal.classList.add("hide");
  btncontainer.classList.add("show");
  btncontainer.classList.remove("hide");
});

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
});
hangup.addEventListener("click", (ev) => {
  ev.stopPropagation();
  window.location.reload();
});

sharebtn.addEventListener("click", async (ev) => {
  console.log(url.href);
  url.searchParams.set("room", roomname.value);
  await navigator.clipboard.writeText(url.href);
  alert("room link copied to clipboard");
});

pausevid.addEventListener("click", () => {
  const video = document.querySelector("video");
  console.log("pause btn");
  video.paused ? video.play() : video.pause();
});

screenShare.addEventListener("click", async () => {
  let tracks = stream.getVideoTracks();
  for (const track of tracks) {
    console.log("removing tracks");
    stream.removeTrack(track);
  }
  const stream2 = await gum({ screen: true });
  tracks = stream2.getVideoTracks();
  for (const track of tracks) {
    console.log("removing tracks");
    stream.addTrack(track);
  }

  const Transceivers = localpc.getTransceivers();
  console.log(Transceivers);
  const res = Transceivers.find((Transceiver) => {
    return (
      Transceiver.sender.track.kind == "video" ||
      Transceiver.receiver.track.kind == "video"
    );
  });

  console.log(res);
  await res.sender.replaceTrack(tracks[0]);
});

let url_room = url.searchParams.get("room");
if (url_room) {
  roomname.value = url_room;
  jionbtn.click();
}
