import { Router } from "express";
import { joinClassroom } from "../join-classroom";
import { fetchClassroom } from "../fetch-classroom";
import { submitQuiz } from "../submit-quiz";
import { getStudentClassroomByIdHandler } from "./getStudentClassroomByIdHandler";
import { getQuizForStudent } from "../getQuiz";
const classroomRouter: Router = Router();

classroomRouter.get("/", fetchClassroom)
classroomRouter.post("/join/:classroomId", joinClassroom)
classroomRouter.post("/submit-quiz/:classroomId", submitQuiz)
classroomRouter.get("/quiz/:quizId", getQuizForStudent)
classroomRouter.get("/:id", getStudentClassroomByIdHandler)
export default classroomRouter;
