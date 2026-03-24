import { Router } from "express";
import { joinClassroom } from "../join-classroom";
import { fetchClassroom } from "../fetch-classroom";
import { submitQuiz } from "../submit-quiz";
import { getStudentClassroomByIdHandler } from "./getStudentClassroomByIdHandler";
import { getQuizForStudent } from "../getQuiz";
import { joinLive } from "../join-live";
import { getAllSessions } from "../get-all-sessions";
import { getActiveSession } from "../get-active-sessions";
import { fetchVideos } from "../../instructor/classroom/fetchVideos";
import { getVideoById } from "../../instructor/classroom/get-video";
import { getQuizzesForStudent } from "./getQuizzesForStudent";
import { getQuizResult } from "./getQuizResult";
import { getQuizAttemptResult } from "./getQuizAttemptResult";
const classroomRouter: Router = Router();

classroomRouter.get("/", fetchClassroom)
classroomRouter.post("/join/:classroomId", joinClassroom)

classroomRouter.post("/submit-quiz/:classroomId", submitQuiz)
classroomRouter.get("/quiz/:quizId", getQuizForStudent)
classroomRouter.get("/:classId/quizzes", getQuizzesForStudent)
classroomRouter.get("/quiz/:quizId/result", getQuizResult)
classroomRouter.get("/quiz/attempt/:attemptId", getQuizAttemptResult)

classroomRouter.get("/:id", getStudentClassroomByIdHandler)

classroomRouter.post("/live/join", joinLive)
classroomRouter.get("/live/:classId/sessions", getAllSessions)
classroomRouter.get("/live/:classId/active", getActiveSession)
classroomRouter.get("/videos/:classroomId", fetchVideos)

classroomRouter.get("/video/:videoId", getVideoById)

export default classroomRouter;
