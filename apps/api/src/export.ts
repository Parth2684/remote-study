import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET!;
export const EMAIL_USER = process.env.EMAIL_USER!;
export const EMAIL_PASS = process.env.EMAIL_PASS!;
export const FRONTEND_URL = process.env.FRONTEND_URL!;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const BACKEND_URL = process.env.BACKEND_URL!;
