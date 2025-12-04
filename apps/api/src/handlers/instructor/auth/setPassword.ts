import { prisma } from "@repo/db";
import { Request, Response } from "express";
import z from "zod";
import bcrypt from "bcrypt";

const setPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password should be of atleast 6 characters")
    .regex(/[a-z]/, "Must include a lowercase alphabet")
    .regex(/[A-Z]/, "Must include a uppercase alphabet")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
  confirmPassword: z
    .string()
    .min(6, "Password should be of atleast 6 characters")
    .regex(/[a-z]/, "Must include a lowercase alphabet")
    .regex(/[A-Z]/, "Must include a uppercase alphabet")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
});

export const setPasswordInstructorHandler = async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    const body = req.body;

    const parsedBody = setPasswordSchema.safeParse(body);
    if (!parsedBody.success || parsedBody.data.password !== parsedBody.data.confirmPassword) {
      res.status(400).json({
        message: "Please provide correct inputs",
        errors: parsedBody.error?.issues || "Passwords don't match",
      });
      return;
    }

    if (!token) {
      res.status(411).json({
        message: "No token provided",
      });
      return;
    }

    const [existingInstructor, hashedPassword] = await Promise.all([
      prisma.instructor.findUnique({
        where: {
          token: String(token),
        },
      }),
      bcrypt.hash(parsedBody.data.password, 10),
    ]);

    if (!existingInstructor) {
      res.status(404).json({
        message: "Instructor account not found",
      });
      return;
    }

    if (existingInstructor.verified == true) {
      res.status(403).json({
        message: "Account already verified",
      });
      return;
    }

    const currentTime = new Date();
    if (currentTime > existingInstructor.tokenExpiry!) {
      res.status(403).json({
        message: "Please retry the whole process token is expired",
      });
      return;
    }

    await prisma.instructor.update({
      where: {
        token: String(token),
      },
      data: {
        password: hashedPassword,
        verified: true,
        token: null,
      },
    });

    res.json({
      message: "Instructor account verified",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
