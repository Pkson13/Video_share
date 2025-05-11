const createVIdeoElement = (stream, type) => {
  const streamContainer = document.querySelector(".streams");
  const div = document.createElement("div");
  div.setAttribute(`${type}`, "");
  streamContainer.append(div);
  const video = document.createElement("video");
  // video.setAttribute("controls", "");
  div.append(video);
  if (type === "remote") {
    // stream.forEach((track) => {
    remotestream.addTrack(stream);
    // });
    video.srcObject = remotestream; // note: srcObject, not srcobject
  } else if (type === "local") {
    video.srcObject = stream; // note: srcObject, not srcobject
    video.muted = true;
  }
  video.play();
  console.log(`tracks`);
  // console.log(stream.getTracks());
};

const gum = async ({ screen } = { screen: false }) => {
  // named the funtion gum coz getUserMedia already exists
  try {
    let stream;
    if (screen) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    }

    return stream;
  } catch (error) {
    console.log("something went wrong\n");
    console.log(error);
  }
};

const createPeerConnection = async ({ stream, offer }) => {
  let icecandidates = [];
  const options = {
    iceCandidatePoolSize: 3,
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
      },
    ],
  };

  const peerconnection = new RTCPeerConnection(options);
  console.log(peerconnection);
  //   const stream = await gum();
  stream.getTracks().forEach((track) => {
    peerconnection.addTrack(track, stream);
  });
  //   createVIdeoElement(stream, "local");

  console.log("conf");
  console.log(peerconnection.getConfiguration());

  peerconnection.onicecandidate = (ev) => {
    console.log("icecandiddates\n");
    myicecandidates.push(ev.candidate);
    // console.log("candidatehandler", myicecandidates);
    // if (ev.candidate !== null) {
    socket.emit("icecandidate", ev.candidate, roomname.value, nameinput.value);
    // }
  };

  // moved this event handler here
  peerconnection.ontrack = (ev) => {
    console.log("ev.strams", ev);
    console.log(ev.streams);
    console.log(ev.track);
    if (ev.track.kind === "video") createVIdeoElement(ev.track, "remote");
    else if (ev.track.kind === "audio") remotestream.addTrack(ev.track);
  };

  if (didIOffer) {
    const offer = await peerconnection.createOffer();
    await peerconnection.setLocalDescription(offer);

    console.log("offer " + nameinput.value);
    console.log(offer);
    socket.emit("offer", roomname.value, offer, nameinput.value);
  } else {
    //ontrack gets called after this
    await peerconnection.setRemoteDescription(offer.offer);
    // offer.answer = await pc.createAnswer();
    // console.log("answer");
    // pc.setLocalDescription(offer.answer);
    // console.log(offer.answer);
    console.log("candidates");
    console.log(offer.icecandidates);
    await offer.icecandidates.forEach((candidate) => {
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

// const answer = async (ev) => {
//   const element = ev.target;
//   const oname = element.value;
//   calls.classList.remove("show");
//   calls.classList.add("hide");
//   const offer = offers.find((offer) => offer.oname === oname);

//   offer.answerer_socket_id = socket.id;
//   await createPeerConnection(offer).then((peerconnection) => {
//     pc = peerconnection;
//     console.log("pc");
//     console.log(pc);
//   });

//   const config = pc.remoteDescription;
//   const configl = pc.localDescription;
//   console.log(pc.getConfiguration());
//   console.log("local");
//   console.log(configl);
//   console.log("remote");
//   console.log(config);
//   // console.log("")
//   socket.emit("chose-an-offer", offer, capturename);
//   // socket.emit("mycandidtaes",myicecandidates)

//   //update the local offers object
// };

// const showavAilableOffers = (offersfrmserver) => {
//   const offersDiv = document.querySelector(".offers");
//   offersfrmserver.forEach((offer) => {
//     const button = document.createElement("button");
//     button.setAttribute("id", "join");
//     button.textContent = offer.oname;
//     button.value = offer.oname;
//     offersDiv.appendChild(button);
//     offers.push(offer);
//     // button.addEventListener("click", (ev) => {
//     // console.log(ev.target);
//     // });
//     button.addEventListener("click", answer);
//   });
// };
