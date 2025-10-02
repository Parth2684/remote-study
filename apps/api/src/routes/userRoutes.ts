import { Router } from "express";
import { signupStudentHandler } from "../handlers/auth/student/signup";
import { setPasswordHandler } from "../handlers/auth/student/setPassword";
import { signinStudentHandler } from "../handlers/auth/student/signin";
import { studentAuth } from "../middleware/auth";
import { oauthCallbackHandler, oauthGetCodeHandler } from "../handlers/auth/student/oauth";



const userRouter: Router = Router()

userRouter.post("/signup", signupStudentHandler)

userRouter.post("/set-password", setPasswordHandler)

userRouter.post("/signin", signinStudentHandler)

userRouter.get("/auth/google", oauthGetCodeHandler)

userRouter.get("/auth/google/callback", oauthCallbackHandler)

userRouter.use(studentAuth) 

export default userRouter;