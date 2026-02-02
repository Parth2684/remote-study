import { Router } from "express";
import { signupStudentHandler } from "../handlers/student/auth/signup";
import { setPasswordHandler } from "../handlers/student/auth/setPassword";
import { signinStudentHandler } from "../handlers/student/auth/signin";
import { studentAuth } from "../middleware/auth";
import { oauthCallbackHandler, oauthGetCodeHandler } from "../handlers/student/auth/oauth";
import classroomRouter from "../handlers/student/classroom/classroom-router";
import { signoutHandler } from "../handlers/signout";

const studentRouter: Router = Router();

studentRouter.post("/signup", signupStudentHandler);

studentRouter.post("/set-password", setPasswordHandler);

studentRouter.post("/signin", signinStudentHandler);

studentRouter.get("/auth/google", oauthGetCodeHandler);

studentRouter.get("/auth/google/callback", oauthCallbackHandler);

studentRouter.use(studentAuth);

studentRouter.use("/classroom", classroomRouter)

studentRouter.post("/signout", signoutHandler);

export default studentRouter;
