import type { Classroom } from "@repo/db"


export type InstructorState = {
  classrooms: Classroom[] 
}

export type InstructorAction = {
  createClassroom: (name: string, description: string) => Promise<void>
  getClassrooms: () => Promise<void>
}