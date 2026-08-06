import express, { type Application } from "express";
import authRoutes from "./modules/auth/auth.route";
import categoryRoutes from "./modules/category/category.route";
import gearRoutes from "./modules/gear/gear.route";
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

app.use("/api/auth", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", gearRoutes);

app.use(globalErrorHandler);

export default app;
