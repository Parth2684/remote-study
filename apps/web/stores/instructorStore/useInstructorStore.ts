import { create } from "zustand";
import { InstructorAction, InstructorState } from "./types";
import { axiosInstance } from "../../lib/axiosInstance";
import toast from "react-hot-toast";

export const useInstructorStore = create<InstructorState & InstructorAction>((set, get) => ({
  classrooms: [],

  getClassrooms: async () => {
    try {
      const res = await axiosInstance.get("/instructor/classroom/my-classrooms");
      set({ classrooms: res.data.classrooms });
    } catch (error) {
      console.error(error);
      toast.error("error fetching classrooms");
    }
  },
  createClassroom: async (name: string, description: string) => {
    try {
      const res = await axiosInstance.post("/instructor/classroom/create-classroom", {
        name,
        description,
      });
      set((state) => ({
        classrooms: [...state.classrooms, res.data.classrooms],
      }));
    } catch (error) {
      console.error(error);
      toast.error("Error creating classroom");
    }
  },
}));
