import { create } from "zustand"
import { InstructorAction, InstructorState } from './types'


export const useInstructorStore = create<InstructorState & InstructorAction>((set, get) => ({
  
}))