import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { BACKEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET } from "../../../export";
import { prisma } from "@repo/db";
import { Request, Response } from "express";

const oauth2client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${BACKEND_URL}/api/v1/user/auth/google/callback`,
);

const SCOPES = ["openid", "email", "profile"];

function getGoogleAuthUrl() {
  return oauth2client.generateAuthUrl({
    access_type: "online",
    prompt: "consent",
    scope: SCOPES,
  });
}

async function handleGoogleCallback(code: string) {
  try {
    const { tokens } = await oauth2client.getToken(code);

    if (!tokens.id_token) {
      throw new Error("ID not returned by google");
    }

    const ticket = await oauth2client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.name) {
      throw new Error("No email or name found in Google Profile");
    }

    let student = await prisma.student.findUnique({
      where: { email: payload.email, provider: "GOOGLE" },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          name: payload.name,
          email: payload.email,
          provider: "GOOGLE",
          verified: true,
          profilePic: payload.picture,
        },
      });
    }

    if (!student) {
      throw new Error("Student account couldn't be created");
    }

    const authToken = jwt.sign(
      {
        id: student.id,
        email: student.email,
        name: student.name,
        role: "STUDENT",
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return {
      authToken,
      student,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as string);
  }
}

export const oauthGetCodeHandler = (req: Request, res: Response) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
  return;
};

export const oauthCallbackHandler = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({
        message: "Couldn't retrieve code from google",
      });
      return;
    }

    const { authToken, student } = await handleGoogleCallback(code);
    res.cookie("authToken", authToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : undefined,
      path: "/",
    });

    res.json({
      message: "Signin Success",
      user: student,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
