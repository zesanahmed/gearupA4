import express, { type Application } from "express";
import authRoutes from "./modules/auth/auth.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import gearRoutes from "./modules/gear/gear.route.js";
import rentalOrderRoutes from "./modules/rentalOrder/rentalOrder.route.js";
import paymentWebhookRoutes from "./modules/payment/payment.webhook.route.js";
import paymentRoutes from "./modules/payment/payment.route.js";
import reviewRoutes from "./modules/review/review.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

const app: Application = express();

app.use("/api", paymentWebhookRoutes);

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
app.use("/api", rentalOrderRoutes);
app.use("/api", paymentRoutes);
app.use("/api", reviewRoutes);
app.use("/api", adminRoutes);

app.use(globalErrorHandler);

export default app;
