import { create } from "zustand"
import { InstructorAction, InstructorState } from './types'
import { axiosInstance } from '../../lib/axiosInstance'
import toast from 'react-hot-toast'


export const useInstructorStore = create<InstructorState & InstructorAction>((set, get) => ({ 
  classrooms: null,
  
  createClassroom: async (name: string, description: string) => {
    try {
      const res = await axiosInstance.post("/instructor/classroom/create-classroom", {
        name,
        description
      })
      set({classrooms: ...res.})
      
    } catch (error) {
      console.error(error)
      toast.error("Error creating classroom")
    }
    
    
  }
}))