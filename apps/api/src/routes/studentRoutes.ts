import { Router } from "express";
import { signupStudentHandler } from "../handlers/student/auth/signup";
import { setPasswordHandler } from "../handlers/student/auth/setPassword";
import { signinStudentHandler } from "../handlers/student/auth/signin";
import { studentAuth } from "../middleware/auth";
import { oauthCallbackHandler, oauthGetCodeHandler } from "../handlers/student/auth/oauth";
import classroomHandler from "../handlers/student/classroomhandler";

const studentRouter: Router = Router();

studentRouter.post("/signup", signupStudentHandler);

studentRouter.post("/set-password", setPasswordHandler);

studentRouter.post("/signin", signinStudentHandler);

studentRouter.get("/auth/google", oauthGetCodeHandler);

studentRouter.get("/auth/google/callback", oauthCallbackHandler);

studentRouter.use(studentAuth);

studentRouter.get("/classroom", classroomHandler);

export default studentRouter;
