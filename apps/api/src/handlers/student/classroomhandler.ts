import { Router } from "express";
import { joinClassroom } from "./join-classroom";
import { fetchClassroom } from "./fetch-classroom";
import { submitQuiz } from "./submit-quiz";
const classroomHandler: Router = Router();

classroomHandler.get("/", fetchClassroom);
classroomHandler.post("/join/:classroomId", joinClassroom);
classroomHandler.post("/submit-quiz/:classroomId", submitQuiz);

export default classroomHandler;
