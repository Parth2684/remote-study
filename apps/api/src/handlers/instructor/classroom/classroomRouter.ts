import { Router } from "express";
import { createClassroomHandler } from "./createClassroom";
import { createQuizHandler } from "./createQuiz";
import { getMyClassrooms } from './get-classrooms';

const classroomRouter: Router = Router();

classroomRouter.post("/create-classroom", createClassroomHandler);

classroomRouter.post("/create-quiz", createQuizHandler);

classroomRouter.get("/my-classrooms", getMyClassrooms);

export default classroomRouter;
