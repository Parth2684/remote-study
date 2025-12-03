// import prisma from "../../../../lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import z from "zod";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";

// const signupSchema = z.object({
//     name: z.string(),
//     email: z.string(),
//     password: z.string(),
//     role: z.enum(["STUDENT", "INSTRUCTOR"])
// })

// const JWT_SECRET = process.env.JWT_SECRET!

// export const POST = async (req: NextRequest) => {
//     try {
//         const body = await req.json();
//         const parsedBody = signupSchema.safeParse(body);
        
//         if (!parsedBody.success) {
//             return NextResponse.json({
//                 message: "Incorrect or Incomplete details"
//             }, {
//                 status: 411
//             });
//         }

//         const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10);
//         const role = parsedBody.data.role;
        
//         let user;
        
//         if (role === "INSTRUCTOR") {
//             const existingUser = await prisma.instructor.findUnique({
//                 where: {
//                     email: parsedBody.data.email
//                 }
//             });

//             if (existingUser) {
//                 return NextResponse.json({
//                     message: "User already exists"
//                 }, {
//                     status: 409
//                 });
//             }

//             user = await prisma.instructor.create({
//                 data: {
//                     name: parsedBody.data.name,
//                     email: parsedBody.data.email,
//                     password: hashedPassword
//                 }
//             });
//         } else {
//             const existingUser = await prisma.student.findUnique({
//                 where: {
//                     email: parsedBody.data.email
//                 }
//             });

//             if (existingUser) {
//                 return NextResponse.json({
//                     message: "User already exists"
//                 }, {
//                     status: 409
//                 });
//             }

//             user = await prisma.student.create({
//                 data: {
//                     name: parsedBody.data.name,
//                     email: parsedBody.data.email,
//                     password: hashedPassword
//                 }
//             });
//         }

//         const token = jwt.sign({
//             id: user.id,
//             email: user.email,
//             name: user.name,
//             role
//         }, JWT_SECRET, { expiresIn: "7d" });

//         (await cookies()).set("session", token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//             path: "/",
//             maxAge: 60 * 60 * 24 * 7
//         });

//         return NextResponse.json({
//             message: `Created a ${role} account`,
//             user: {
//                 name: parsedBody.data.name,
//                 email: parsedBody.data.email,
//                 role: parsedBody.data.role
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({
//             message: "Error creating account"
//         }, {
//             status: 500
//         });
//     }
// }
