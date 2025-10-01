import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../export";



interface User {
    id: string
    name: string
    email: string
    role: "STUDENT" | "INSTRUCTOR"
}



export const studentAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.authToken;

        if(!token) {
            res.status(401).json({
                message: "Unauthorized"
            })
            return;
        }
    
        const decoded = jwt.verify(token, JWT_SECRET) as User
    
        if(!decoded) {
            res.status(401).json({
                message: "Unauthorized"
            })
            return
        }
    
        req.user = decoded
        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({
            message: "Authorization Error"
        })
    }
}


export const instructorAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.authToken

        if(!token) {
            res.status(401).json({
                message: "Unauthorized"
            })
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as User
        if(!decoded) {
            res.status(401).json({
                message: "Unauthorized"
            })
            return;
        } 

        req.user = decoded
        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({
            message: "Authorization Error"
        })
    }
}