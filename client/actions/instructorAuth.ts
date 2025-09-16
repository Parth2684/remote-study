import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

interface payload {
    id: string
    email: string
    name: string,
    role: "STUDENT" | "INSTRUCTOR"
}

export const instructorAuth = async(): Promise<payload | undefined> => {
    try {
        const token = (await cookies()).get("session")?.value
        if(!token) {
            throw new Error("Instructor not logged in")
        }
        const verified = jwt.verify(token, JWT_SECRET) as payload
        if(!verified) {
            throw new Error("Invalid token, authorization error")
        }
        if(verified.role != "INSTRUCTOR") {
            throw new Error("You are not a instructor")
        }
        return verified
    } catch (error) {
        console.error(error)
    }
}