import express from "express";
import { Server } from "socket.io";
import http from "http";
import * as env from "dotenv";
import * as uuid from "uuid";

/* ## Config: Environment values ## */
env.config();
const application_port = process.env.APP_PORT || 3000;
const application_max_loop = parseInt(process.env.MAX_LOOP || 20, 10);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const parties = [];

app.get("/", (req, res) => {
  res.send("");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("createParty", (response) => {
    const partyUuid = uuid.v4();
    let partyExist = parties.find((p) => p.uuid === partyUuid);
    if (partyExist) {
      for (let i = 0; i <= application_max_loop; i++) {
        partyExist = parties.find((p) => p.uuid === partyUuid);
        if (typeof partyExist === "undefined") {
          break;
        }

        if (i === application_max_loop) {
          console.error(
            "Error: unable to generate a uuid for the party (Max Loop)."
          );
          response({
            status: "error",
            message:
              "Error: unable to generate a uuid for the party (Max Loop).",
          });
          return;
        }
      }
    }

    const party = { uuid: partyUuid, owner: socket.id };
    parties.push(party);

    response({
      status: "success",
      data: { party: party },
    });
  });
});

server.listen(application_port, () => {
  console.log(`DEV: http://localhost:${application_port}`);
});
