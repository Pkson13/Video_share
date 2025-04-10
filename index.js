import https from "https";
import express from "express";
import { Server } from "socket.io";
import { readFileSync } from "node:fs";

const app = express();
// https.createServer(app, (req,res)=>{
// })

const options = {
  key: readFileSync("./cert-key.pem"),
  cert: readFileSync("./cert.pem"),
};

app.use(express.static("./public"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
const httpsServer = https.createServer(options, app).listen(8000);
const io = new Server(httpsServer, {
  cors: {
    origin: ["https://localhost:8000", "https://192.168.88.181:8000"],
  },
});

// type offer = {
//   socketid: string;
//   offer: Offer;
//   offerer_name: string;
//   offerericecandidates: IceCandidate[];
//   answerer_socket_id: string;
//   answer: Answer;
//   answerericecandidates: IceCandidate[];
// }
let offers = [];

io.on("connect", (socket) => {
  console.log(socket.id);
  if (offers.length > 0) {
    const pending_offers = offers.filter((offer) => {
      return offer.answerer_socket_id == null && offer.answer == null;
    });
    socket.emit("current-offers", pending_offers);
  }

  socket.on("offer", (offer, oname) => {
    // console.log("offers");
    // console.log(offers);
    const availableoffer = offers.find((aoffer) => {
      return aoffer.oname == oname;
    });
    if (availableoffer == null) {
      const offerobj = {
        id: socket.id,
        oname: oname,
        offer: offer,
        offerericecandidates: [],
        answerer_socket_id: null,
        answerer_name: null,
        answer: null,
        answerericecandidates: [],
      };
      offers.push(offerobj);
    } else if (availableoffer !== null) {
      availableoffer.offer = offer;
      availableoffer.id = socket.id;
    }
    // console.log("available");
    // console.log(availableoffer);

    // console.log(offers);
  });
  socket.on("icecandidate", (candidate, name) => {
    // console.log(offers);
    // console.log("name");
    // console.log(name);
    const offer = offers.find((offer) => offer.oname === name);
    // offer.offerericecandidates.push(candidate);
    // console.log(offer);
    // console.log(offers);

    // const answersfilter = offers.filter(
    //   (offer) => offer.answerer_name === name
    // );
    if (offer !== null) {
      // answersfilter.forEach((answer) => {
      offer.offerericecandidates.push(candidate);
      // io.to(answer.id).emit(
      //   "answer-candidates",
      //   answer.answerericecandidates
      // );
      // });
    }

    if (offer == null) {
      const offerobj = {
        id: socket.id,
        offer: {},
        oname: name,
        offerericecandidates: [],
        answerer_socket_id: null,
        answer: {},
        answerericecandidates: [],
      };
      offerobj.offerericecandidates.push(candidate);
      offers.push(offerobj);
    }

    // console.log(offer);
  });

  socket.on("chose-an-offer", (offerClient) => {
    console.log("what");
    let offer = offers.find(
      (offerServer) => offerServer.oname === offerClient.oname
    );
    console.log("offer before update");
    console.log(offer);
    offer.answer = offerClient.answer;
    offer.answerer_socket_id = socket.id;
    console.log("offer after update");
    console.log(offer);
    socket.emitWithAck("giveMeyourIceCandidates").then((candidates) => {
      // console.log("answerer candidates");
      console.log(candidates);
      offer.answerericecandidates = candidates;
      // offer.answerer_name = name;
      // console.log(offer);
      socket.to(offer.id).emit("offerAccepted", offer);
    });
  });
});
