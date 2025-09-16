import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const signupSchema = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR"])
})

export const POST = async (req: NextRequest) => {
    const body = await req.json();
    const parsedBody = signupSchema.safeParse(body)
    if(!parsedBody.success) {
        return NextResponse.json({
            message: "Incorrect or Incomplete details"
        }, {
            status: 411
        })
    }
    const role = (parsedBody.data.role == "INSTRUCTOR") ? "instructor" : "student";
    if(role == "instructor") {
        await prisma
    }
} 