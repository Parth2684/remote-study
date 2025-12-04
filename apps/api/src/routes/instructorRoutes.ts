import { Router } from 'express';
import { signupInstructorHandler } from '../handlers/instructor/auth/signup';
import { setPasswordInstructorHandler } from '../handlers/instructor/auth/setPassword';
import { signinInstructorHandler } from '../handlers/instructor/auth/signin';
import { instructorAuth } from '../middleware/auth';
import classroomRouter from '../handlers/instructor/classroom/classroomRouter';



const instructorRoutes: Router = Router();

instructorRoutes.post("/signup", signupInstructorHandler);

instructorRoutes.post("/set-password", setPasswordInstructorHandler);

instructorRoutes.post("/signin", signinInstructorHandler)

instructorRoutes.use(instructorAuth)

instructorRoutes.use("/classroom", classroomRouter)
export default instructorRoutes