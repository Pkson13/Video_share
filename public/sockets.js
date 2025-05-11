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
