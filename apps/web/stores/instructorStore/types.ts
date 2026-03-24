import type { Classroom } from "@repo/db"


export type InstructorState = {
  classrooms: Classroom[] 
  classroomId: string
  title: string
}

export type InstructorAction = {
  createClassroom: (name: string, description: string) => Promise<void>
  getClassrooms: () => Promise<void>
  uploadVideo: (classroomId: string, formData: FormData) => Promise<void>
}