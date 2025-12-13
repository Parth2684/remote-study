// commonCheckAuth.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../export";  
import { prisma } from "@repo/db";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
}

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as User;

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    let user;
    if (decoded.role === "STUDENT") {
      user = await prisma.student.findUnique({
        where: {
          id: decoded.id
        }
      });
    } else if (decoded.role === "INSTRUCTOR") {
      user = await prisma.instructor.findUnique({
        where: {
          id: decoded.id
        }
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    return res.status(200).json({
      message: "Authenticated",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Authorization Error"
    });
  }
};
