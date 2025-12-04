import { Router } from "express";
import { joinClassroom } from "../join-classroom";
import { fetchClassroom } from "../fetch-classroom";
import { submitQuiz } from "../submit-quiz";
const classroomRouter: Router = Router();

classroomRouter.get("/", fetchClassroom)
classroomRouter.post("/join/:classroomId", joinClassroom)
classroomRouter.post("/submit-quiz/:classroomId", submitQuiz)

export default classroomRouter;
