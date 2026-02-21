import { Router } from "express";
import { joinClassroom } from "../join-classroom";
import { fetchClassroom } from "../fetch-classroom";
import { submitQuiz } from "../submit-quiz";
import { getStudentClassroomByIdHandler } from "./getStudentClassroomByIdHandler";
import { getQuizForStudent } from "../getQuiz";
import { joinLive } from "../join-live";
import { getAllSessions } from "../get-all-sessions";
import { getActiveSession } from "../get-active-sessions";
const classroomRouter: Router = Router();

classroomRouter.get("/", fetchClassroom)
classroomRouter.post("/join/:classroomId", joinClassroom)
classroomRouter.post("/submit-quiz/:classroomId", submitQuiz)
classroomRouter.get("/quiz/:quizId", getQuizForStudent)
classroomRouter.get("/:id", getStudentClassroomByIdHandler)

classroomRouter.post("/live/join", joinLive)
classroomRouter.get("/live/:classId/sessions", getAllSessions)
classroomRouter.get("/live/:classId/active", getActiveSession)
export default classroomRouter;
