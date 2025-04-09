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
https.createServer(options, app).listen(8000);
