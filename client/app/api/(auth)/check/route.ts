import { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

function isJwtPayload(token: string | JwtPayload): token is JwtPayload {
    return (token as JwtPayload).id !== undefined;
}

export const GET = async (req: NextRequest) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session");

        if (!token) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 401
            });
        }

        const decodedToken = jwt.verify(token!.value, process.env.JWT_SECRET!);

        if (!isJwtPayload(decodedToken)) {
            throw new Error("Invalid token payload");
        }
        const user = await prisma.student.findUnique({
            where: {
                id: decodedToken.id
            }
        });

        if (!user) {
            return NextResponse.json({
                message: "Unauthorized"
            }, {
                status: 401
            });
        }

        return NextResponse.json({
            message: "Authenticated",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "Invalid or expired token"
        }, {
            status: 401
        });
    }
}