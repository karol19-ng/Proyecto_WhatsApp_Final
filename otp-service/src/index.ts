import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import otpRoutes from "./routes/otp";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/otp", otpRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ OTP Service - MongoDB conectado"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🔐 OTP Service corriendo en http://localhost:${PORT}`)
);
