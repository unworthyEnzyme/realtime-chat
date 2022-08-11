import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRouter from "./auth/auth.router";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", async (_, res) => {
	res.send("hello my world!!");
});

app.use("/auth", authRouter);

app.listen(8000, () => console.log("http://localhost:8000"));
