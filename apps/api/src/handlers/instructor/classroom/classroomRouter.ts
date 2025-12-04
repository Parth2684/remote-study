import { Router } from "express";
import { createClassroomHandler } from "./createClassroom";
import { createQuizHandler } from "./createQuiz";

const classroomRouter: Router = Router();

classroomRouter.post("/create-classroom", createClassroomHandler);

classroomRouter.post("/create-quiz", createQuizHandler);

export default classroomRouter;
