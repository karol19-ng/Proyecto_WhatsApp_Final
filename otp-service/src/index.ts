import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import otpRoutes from "./routes/otp";
import userRoutes from "./routes/users";
import contactRoutes from "./routes/contacts";
import chatRoutes from "./routes/chats";
import messageRoutes from "./routes/messages";
import statusRoutes from "./routes/status";
import mediaRoutes from "./routes/media";
import { setupSocket } from "./socket/socket";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// CORS: origin "*" + credentials:true es inválido en navegadores.
// Usamos una función que refleja el origin del request para permitir
// cualquier origen (necesario en CodeSandbox con puertos distintos).
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    callback(null, origin || "*");
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Responder preflight OPTIONS ANTES que cualquier otra ruta
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/media", mediaRoutes);

setupSocket(io);

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log(" MongoDB conectado"))
  .catch((err) => console.error(" Error MongoDB:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Servidor en http://localhost:${PORT}`));

export { io };
