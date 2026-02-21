import { Router } from "express";
import { createClassroomHandler } from "./createClassroom";
import { createQuizHandler } from "./createQuiz";
import { getMyClassrooms } from './get-classrooms';
import { getClassroomByIdHandler } from "./getClassroomByIdHandler";
import { uploadVideoHandler } from './addVideo';
import { startLive } from "./start-live";
import { endLive } from "./end-live";
import { getAllSessions } from "../../student/get-all-sessions";
import { getActiveSession } from "../../student/get-active-sessions";

const classroomRouter: Router = Router();

classroomRouter.post("/create-classroom", createClassroomHandler);

classroomRouter.post("/create-quiz/:classroomId", createQuizHandler);

classroomRouter.get("/my-classrooms", getMyClassrooms);

classroomRouter.get("/:id", getClassroomByIdHandler)

classroomRouter.post(
  "/upload-video/:classroomId",
  ...uploadVideoHandler
);

classroomRouter.post("/live/start", startLive)

classroomRouter.put("/live/end/:sessionId", endLive)

classroomRouter.get("/live/:classId/sessions", getAllSessions)
classroomRouter.get("/live/:classId/active", getActiveSession)

export default classroomRouter;
