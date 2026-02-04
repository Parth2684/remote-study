import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import instructorRoutes from "./routes/instructorRoutes";
import studentRouter from "./routes/studentRoutes";
import { checkAuth } from "./handlers/check-auth";
import classroomRoutes from "./routes/classroomRoutes";
import { createWebSocketServer } from "./websocket";

const PORT = process.env.PORT || 4000;
const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTION"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie", "Origin"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.use("/api/instructor", instructorRoutes);
app.use("/api/student", studentRouter);
app.use("/api/classroom", classroomRoutes);

app.get("/api/check", checkAuth);

const server = createServer(app);

createWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
