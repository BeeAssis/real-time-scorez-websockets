import AgentAPI from "apminsight";
AgentAPI.config();

import "dotenv/config";
import express from "express";
import http from "http";
import { commentaryRouter } from "./routes/commentary.js";
import { matchRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";

import cors from "cors";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Express Server");
});

app.use((req, _res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

// app.use(securityMiddleware());

app.use("/matches", matchRouter);
app.use("/matches/:id/commentary", commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary, broadcastScoreUpdate } =
  attachWebSocketServer(server);

app.locals.broadcastScoreUpdate = broadcastScoreUpdate;
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Server is running on: ${baseUrl}`);
  console.log(
    `Websocket Server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
