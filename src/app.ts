import express, { type Application } from "express";

const app: Application = express();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GearUp API is running 🚀",
  });
});

// app.get("/cars", async (req, res) => {
//   // const cars = await prisma.car.findMany();
//   res.send("Server is running");
//   // res.json(cars);
// });

export default app;
