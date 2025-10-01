import { Router } from "express";
import { signupStudentHandler } from "../handlers/auth/student/signup";
import { setPasswordHandler } from "../handlers/auth/student/setPassword";
import { signinStudentHandler } from "../handlers/auth/student/signin";
import { studentAuth } from "../middleware/auth";



const userRouter: Router = Router()

userRouter.post("/signup", signupStudentHandler)

userRouter.post("/set-password", setPasswordHandler)

userRouter.post("/signin", signinStudentHandler)

userRouter.use(studentAuth) 

export default userRouter;