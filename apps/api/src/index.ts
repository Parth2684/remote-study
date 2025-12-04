import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import instructorRoutes from "./routes/instructorRoutes";
import studentRouter from "./routes/studentRoutes";

const PORT = process.env.PORT;
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
