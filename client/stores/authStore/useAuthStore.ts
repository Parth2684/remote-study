import { create } from "zustand"
import { authAction, authState } from "./types"
import { axiosInstance } from "@/lib/axiosInstance"
import { toast } from "sonner"
import { AxiosError } from "axios"


export const useAuthStore = create<authState & authAction>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isSigningIn: false,

    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            await axiosInstance.post("/signup", data)
            toast.success("Signup complete please signin to continue")
        } catch (error) {
            console.error(error)
            if(error instanceof AxiosError && error.response?.data.message) {
                toast.error(error.request.data.message as string)
            }else {
                toast.error("An unexpected error occurred")
            }
        } finally {
            set({ isSigningUp: false })
        }
    },
    signin: async (data) => {
        set({ isSigningIn: true })
        try {
            const res = await axiosInstance.post("/signin", data)
            toast.success("Signed in successfully")
            const { user } = res.data 
            set({ authUser: user })
        } catch (error) {
            console.error(error)
            if(error instanceof AxiosError && error.response?.data.message) {
                toast.error(error.request.data.message as string)
            }else {
                toast.error("An unexpected error occurred")
            }
        }
    },
    signout: () => {
        set({ authUser: null })
    },

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/check")
            const { user } = res.data 
            set({ authUser: user })
        } catch (error) {
            console.error(error)
            if(error instanceof AxiosError && error.response?.data.message) {
                toast.error(error.request.data.message as string)
            }else {
                toast.error("An unexpected error occurred")
            }
        }
    }
}))