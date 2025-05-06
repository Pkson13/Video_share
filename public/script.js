// document.addEventListener("DOMContentLoaded", () => {
// alert("what");
console.log(io);
// console.log(window.location.href);
// console.log(window.location.pathname);

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
const form = document.querySelector(".form");
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

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
});

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
});

socket.on("offerAccepted", (offer) => {
  console.log("offer accepted");
  console.log(offer);
  console.log(offer.answerericecandidates);
  // offerericecandidates;
  localpc.setRemoteDescription(offer.answer).then(() => {
    offer.answerericecandidates.forEach((candidate) => {
      localpc.addIceCandidate(candidate);
    });
  });
  console.log(localpc);
});

socket.on("current-offers", async (offers) => {
  console.log("current offers");
  console.log(offers);
  showavAilableOffers(offers);
  const url = new URL(window.location.href);

  const join = url.searchParams.get("join");
  if (join) {
    const offer = offers.find((offer) => offer.oname === join);

    offer.answerer_socket_id = socket.id;
    await createPeerConnection(offer).then((peerconnection) => {
      pc = peerconnection;
      console.log("pc");
      console.log(pc);
    });

    const config = pc.remoteDescription;
    const configl = pc.localDescription;
    console.log(pc.getConfiguration());
    console.log("local");
    console.log(configl);
    console.log("remote");
    console.log(config);
    // console.log("")
    socket.emit("chose-an-offer", offer, capturename);
  }
});
socket.on("answer-candidates", (candidate) => {
  console.log("answer-candidates");
  console.log(candidate);
  // showavAilableOffers(offers);
});

socket.on("giveMeyourIceCandidates", (callback) => {
  console.log("my candidates");
  console.log(myicecandidates);

  callback(myicecandidates);
});
