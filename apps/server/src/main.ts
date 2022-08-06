import express from "express";
import authRouter from "./auth/auth.router";

const app = express();
app.use(express.json());

app.get("/", async (_, res) => {
	res.send("hello world!!");
});

app.use("/auth", authRouter);

app.listen(8000, () => console.log("http://localhost:8000"));
