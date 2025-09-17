import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { payload } from "./instructorAuth"

const JWT_SECRET = process.env.JWT_SECRET!

export const studentAuth = async(): Promise<payload | undefined>=> {
    try {
        const token = (await cookies()).get("session")?.value
        if(!token) {
            throw new Error("User not logged in")
        }
        const verified = jwt.verify(token, JWT_SECRET) as payload
        if(!verified) {
            throw new Error("Invalid token, authorization error")
        }
        if(verified.role != "STUDENT") {
            throw new Error("You are not a student")
        }
        return verified
    } catch (error) {
        console.error(error)
    }
}