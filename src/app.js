import express from "express";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Auth Routes
app.use("/api/v1/auth", authRouter);

export default app;