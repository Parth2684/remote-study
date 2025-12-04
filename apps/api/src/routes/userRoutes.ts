import { Router } from "express";
import { signupStudentHandler } from "../handlers/student/auth/signup";
import { setPasswordHandler } from "../handlers/student/auth/setPassword";
import { signinStudentHandler } from "../handlers/student/auth/signin";
import { studentAuth } from "../middleware/auth";
import { oauthCallbackHandler, oauthGetCodeHandler } from "../handlers/student/auth/oauth";



const userRouter: Router = Router()

userRouter.post("/signup", signupStudentHandler)

userRouter.post("/set-password", setPasswordHandler)

userRouter.post("/signin", signinStudentHandler)

userRouter.get("/auth/google", oauthGetCodeHandler)

userRouter.get("/auth/google/callback", oauthCallbackHandler)

userRouter.use(studentAuth) 

export default userRouter;