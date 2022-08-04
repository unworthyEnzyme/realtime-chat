import express from "express";

const app = express();

app.get("/", async (_, res) => {
  res.send("hello world");
});

app.listen(8000, () => console.log("http://localhost:8000"));
