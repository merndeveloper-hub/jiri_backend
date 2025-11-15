import express from "express";
import bodyParser from "body-parser";
import mongoose from "./config/db/index.js";
// import rateLimit from "express-rate-limit";

import cors from "cors";
import https from "https";
import cookieParser from "cookie-parser";
import { pinoHttpMiddleware, changed, pinoInstance } from "./utils/logger/logger.js";
//import { pinoInstance } from '../logger.js';
const log = pinoInstance.child({ context: 'userService' });
import { apiLogger } from './middleware/apiLogger/index.js';
import routes from "./routes/index.js";
import { PORT } from "./config/index.js";
const app = express();

//Socketf
import http from "http";
import { Server } from "socket.io";
//import { initSocket } from './socket.js';
//import logger from "./logger/index.js";

import errorMiddleware from "./middleware/error-middleware/index.js";



const SERVICE_PORTHTTPS = "5001";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: "*" } });



var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:")),
  db.once("open", async function () {
    console.log("db connected!");
  });

// * Cors
app.use(
  cors({
    origin: "*",
    credentialsL: "*",
    credentials: true
  })
);

// * Body Parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(pinoHttpMiddleware);

// Initialize socket.io
//initSocket(server);

//** Rate Limiter */
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: "Too many requests from this IP, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

//-----logger insert db----/////
app.use(apiLogger);
//app.use(loggerMiddleware);

//app.use(arcjetMiddleware);

///It set false to local run test,when we go prod to set true value for rate limting check//
//app.set("trust proxy", false);

app.use((req, res, next) => {
  console.log(
    "Client IP:",
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  );
  next();
});

//*Cookie **//
app.use(cookieParser());

// * Api routes
app.use("/api/v1", routes);

app.use(errorMiddleware);

app.get("/", async (req, res) => {

  req.log.info("Ping request received");
  return res.status(200).json({ status: 200, message: "Lunebi" });
});


io.on("connection", (socket) => {
  //when connect
  console.log("New client connected with id: ", socket.id);

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!", socket.id);
  });
});

app.use("*", (req, res) => {
  res.status(401).send("Route not found");
});

console.log(PORT, "process.env.PORT ");

let port = process.env.PORT | 5000;



const serverhttps = https
  .createServer(app)
  .listen(SERVICE_PORTHTTPS, function () {
    const port = serverhttps.address().port;
    console.log("HTTPS server started on ", port);
    log.info("HTTPS server started on ", port);
  });

server.listen(port, () => {

  console.log(`Server is running on PORT http://15.207.221.76:${port}`);

  log.info("HTTPS server started on ", port);

});

const closeServer = () => {

};

process.on("SIGTERM", closeServer);
process.on("SIGINT", closeServer);

process.on("uncaughtException", (err) => {
  console.log(err, "uncaughtException");

  log.error(err.stack);
});

process.on("exit", (err) => {
  console.log(err, "exit");
  log.error(err.stack);
});
