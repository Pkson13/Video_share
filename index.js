import http from "http";
import express from "express";
import { Server } from "socket.io";
import { readFileSync } from "node:fs";

const app = express();
// https.createServer(app, (req,res)=>{
// })

// const options = {
//   key: readFileSync("./cert-key.pem"),
//   cert: readFileSync("./cert.pem"),
// };

app.use(express.static("./public"));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
const httpsServer = http.createServer(app).listen(8000);
const io = new Server(httpsServer, {
  cors: {
    origin: [
      "https://localhost:8000",
      "https://192.168.88.181:8000",
      //you can enter your local dev ip here to communicate with other devices
    ],
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
// let offers = [];
/*
room ={
name : "string",
participats:[
  {name: "name", socketid: "string", offer: "Offer", icecandidates: IceCandidate[]}
],
}
*/
let rooms = [];
io.on("connect", (socket) => {
  console.log(socket.id);
  // if (offers.length > 0) {
  //   const pending_offers = offers.filter((offer) => {
  //     return offer.answerer_socket_id == null && offer.answer == null;
  //   });
  //   socket.emit("current-offers", pending_offers);
  // }

  socket.on("createRoom", (roomname) => {
    console.log("createroom", roomname);
    const room = {
      name: roomname,
      participants: [
        {
          name: "",
          socketid: socket.id,
          offer: {},
          icecandidates: [],
          admin: true,
        },
      ],
    };
    rooms.push(room);
  });

  socket.on("offer", (roomname, offer, name) => {
    console.log("offer\n", roomname, name);
    const room = rooms.find((room) => room.name == roomname);
    if (!room) {
      console.log("room doesn't exist");
      return;
    }

    const admin = room.participants.find(
      (participant) => participant.socketid == socket.id
    );
    if (admin) {
      console.log("is admin");
      admin.name = name;
      admin.offer = offer;
    } else {
      room.participants.push({ name, socketid: socket.id, offer });
    }
    console.log("rooms", rooms);
  });

  socket.on("icecandidate", (candidate, roomname, name) => {
    console.log("icecandidate");
    // console.log("name");
    // console.log(name);
    const room = rooms.find((room) => room.name === roomname);
    if (!room) {
      console.log("room doesn't exist");
      return;
    }
    const user = room.participants.find((participant) => {
      return participant.name == name || participant.socketid == socket.id;
    });
    if (!user) {
      console.log("user doesn't exist");
      return;
    }
    if (!user.icecandidates) user.icecandidates = [];
    user.icecandidates.push(candidate);
    // console.log("rooms", rooms, "\nroom", room);
  });
  socket.on("joinroom", ({ roomname, username }, callback) => {
    console.log("joinroom\n", roomname, username);
    const room = rooms.find((room) => room.name === roomname);
    if (!room) return;
    callback(room.participants);
  });

  socket.on("chose-an-offer", async (roomname, offer) => {
    console.log("what");
    // const candidates = await socket.emitWithAck("giveMeyourIceCandidates");
    let room = rooms.find((room) => room.name === roomname);
    console.log(offer);
    // offer.answerericecandidates = candidates;

    // console.log("answerer candidates");
    // offer.answerer_name = name;
    // console.log(offer);
    socket.to(offer.socketid).emit("offerAccepted", offer);
  });
  // socket.on("chose-an-offer", (offerClient, name) => {
  //   console.log("what");
  //   let offer = offers.find(
  //     (offerServer) => offerServer.oname === offerClient.oname
  //   );
  //   console.log("offer before update");
  //   console.log(offer);
  //   offer.answer = offerClient.answer;
  //   offer.answerer_socket_id = socket.id;
  //   offer.answerer_name = name;
  //   console.log("offer after update");
  //   console.log(offer);
  //   socket.emitWithAck("giveMeyourIceCandidates").then((candidates) => {
  //     // console.log("answerer candidates");
  //     console.log(candidates);
  //     offer.answerericecandidates = candidates;
  //     // offer.answerer_name = name;
  //     // console.log(offer);
  //     socket.to(offer.id).emit("offerAccepted", offer);
  //   });
  // });
});
