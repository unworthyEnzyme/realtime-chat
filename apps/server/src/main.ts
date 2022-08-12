import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import authRouter from "./auth/auth.router";
import { Pusher } from "./real_time/real_time";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", async (_, res) => {
	res.send("hello my world!!");
});

app.use("/auth", authRouter);
const pusher = new Pusher(server);
pusher.init();

server.listen(8000, () => console.log("http://localhost:8000"));
