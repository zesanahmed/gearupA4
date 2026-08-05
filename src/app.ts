import express, { type Application } from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GearUp API is running 🚀",
  });
});

app.use(globalErrorHandler);
export default app;
