import cookieParser from "cookie-parser";
import express from "express";
import authRouter from "./auth/auth.router";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", async (_, res) => {
	res.send("hello my world!!");
});

app.use("/auth", authRouter);

app.listen(8000, () => console.log("http://localhost:8000"));
