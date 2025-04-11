// document.addEventListener("DOMContentLoaded", () => {
// alert("what");
console.log(io);

const socket = io();
socket.on("connect", () => {
  console.log(socket.id);
});
const nameinput = document.querySelector(".nameinput");
const callbtn = document.querySelector("#call");
const jionbtn = document.querySelector("#join");
const modal = document.querySelector(".container");
const calls = document.querySelector(".calls-container");
let didIOffer = false;
let pc;
let offers = [];
let myicecandidates = [];
let capturename;

callbtn.addEventListener("click", () => {
  modal.classList.remove("show");
  modal.classList.add("hide");
  didIOffer = true;

  createPeerConnection().then((peerconnection) => {
    pc = peerconnection;
    console.log("pc");
    socket.on("offerAccepted", (offer) => {
      console.log("offer accepted");
      console.log(offer);
      console.log(offer.answerericecandidates);
      // offerericecandidates;
      pc.setRemoteDescription(offer.answer).then(() => {
        offer.answerericecandidates.forEach((candidate) => {
          pc.addIceCandidate(candidate);
        });
      });
    });
    console.log(pc);
  });
});

jionbtn.addEventListener("click", () => {
  modal.classList.remove("show");
  modal.classList.add("hide");
  calls.classList.remove("hide");
  calls.classList.add("show");
  didIOffer = false;
  capturename = nameinput.value;

  // didIOffer = true;
});

// const createOfferAndSetLocalDescription = async (peerconnection) => {
//   const offer = peerconnection.createOffer();
//   peerconnection.setLocalDescription(offer);
// };

const gum = async () => {
  // named the funtion gum coz getUserMedia already exists
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    return stream;
  } catch (error) {
    console.log("something went wrong\n");
    console.log(err);
  }
};

const createVIdeoElement = (stream, type) => {
  const local = document.querySelector(`.${type}`);
  const video = document.createElement("video");
  video.setAttribute("controls", "");
  local.append(video);
  if (type === "remote") {
    remotestream = new MediaStream();
    // stream.forEach((track) => {
    remotestream.addTrack(stream);
    // });
    video.srcObject = remotestream; // note: srcObject, not srcobject
  } else if (type === "local") {
    video.srcObject = stream; // note: srcObject, not srcobject
  }
  video.play();
  console.log(`tracks`);
  // console.log(stream.getTracks());
};

const createPeerConnection = async (offer) => {
  const options = {
    iceCandidatePoolSize: 3,
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ],
  };
  const oname = nameinput.value;
  console.log("name");
  console.log(oname);
  const peerconnection = new RTCPeerConnection(options);
  const stream = await gum();
  stream.getTracks().forEach((track) => {
    peerconnection.addTrack(track, stream);
  });
  createVIdeoElement(stream, "local");

  console.log("conf");
  console.log(peerconnection.getConfiguration());

  peerconnection.onicecandidate = (ev) => {
    console.log("icecandiddates\n");
    myicecandidates.push(ev.candidate);
    console.log(ev.candidate);
    // if (ev.candidate !== null) {
    socket.emit("icecandidate", ev.candidate, oname);
    // }
  };

  // moved this event handler here
  peerconnection.ontrack = (ev) => {
    console.log("ev.strams");
    console.log(ev.streams);
    console.log(ev.track);
    if (ev.track.kind === "video") createVIdeoElement(ev.track, "remote");
  };

  if (didIOffer) {
    const offer = await peerconnection.createOffer();
    await peerconnection.setLocalDescription(offer);

    console.log("offer" + oname);
    console.log(offer);
    socket.emit("offer", offer, oname);
  } else {
    await peerconnection.setRemoteDescription(offer.offer);
    // offer.answer = await pc.createAnswer();
    // console.log("answer");
    // pc.setLocalDescription(offer.answer);
    // console.log(offer.answer);

    console.log("candidates");
    console.log(offer.offerericecandidates);
    await offer.offerericecandidates.forEach((candidate) => {
      peerconnection.addIceCandidate(candidate);
    });
    // anwer = await peerconnection.createAnswer()
    offer.answer = await peerconnection.createAnswer();
    await peerconnection.setLocalDescription(offer.answer);
    console.log("answer");
    console.log(offer.answer);
  }

  return peerconnection;
  //   stats
  //    peerconnection.getStats().then((stats) => {
  //      console.log("stats");
  //      console.log(stats);
  //    });
};

const answer = async (ev) => {
  const element = ev.target;
  const oname = element.value;
  calls.classList.remove("show");
  calls.classList.add("hide");
  const offer = offers.find((offer) => offer.oname === oname);

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
  // socket.emit("mycandidtaes",myicecandidates)

  //update the local offers object
};

const showavAilableOffers = (offersfrmserver) => {
  const offersDiv = document.querySelector(".offers");
  offersfrmserver.forEach((offer) => {
    const button = document.createElement("button");
    button.setAttribute("id", "join");
    button.textContent = offer.oname;
    button.value = offer.oname;
    offersDiv.appendChild(button);
    offers.push(offer);
    // button.addEventListener("click", (ev) => {
    // console.log(ev.target);
    // });
    button.addEventListener("click", answer);
  });
};

socket.on("current-offers", (offers) => {
  console.log("current offers");
  console.log(offers);
  showavAilableOffers(offers);
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
