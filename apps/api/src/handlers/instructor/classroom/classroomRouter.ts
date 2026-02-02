import { Router } from "express";
import { createClassroomHandler } from "./createClassroom";
import { createQuizHandler } from "./createQuiz";
import { getMyClassrooms } from './get-classrooms';
import { getClassroomByIdHandler } from "./getClassroomByIdHandler";

const classroomRouter: Router = Router();

classroomRouter.post("/create-classroom", createClassroomHandler);

classroomRouter.post("/create-quiz/:classroomId", createQuizHandler);

classroomRouter.get("/my-classrooms", getMyClassrooms);

classroomRouter.get("/:id", getClassroomByIdHandler)

export default classroomRouter;
