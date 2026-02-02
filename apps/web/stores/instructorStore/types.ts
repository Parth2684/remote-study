import type { Classroom } from "@repo/db"


export type InstructorState {
  classroom: Classroom
}

export type InstructorAction {
  createClassroom: (name: string, description: string, instructorId: string) => Promise<void>
  
}