import { create } from "zustand"
import { authAction, authState } from "./types"
import { axiosInstance } from "@/lib/axiosInstance"
import { toast } from "react-hot-toast"
import { AxiosError } from "axios"

export const useAuthStore = create<authState & authAction>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isSigningIn: false,
    isSigningOut: false,
    isCheckingAuth: false,

    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/signup", data)
            set({ authUser: res.data.user })
            toast.success("Signed up successfully")
        } catch (error) {
            console.error(error)
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isSigningUp: false })
        }
    },

    signin: async (data) => {
        set({ isSigningIn: true })
        try {
            const res = await axiosInstance.post("/signin", data)
            const { user } = res.data 
            set({ authUser: user })
            toast.success("Signed in successfully")
        } catch (error) {
            console.error(error)
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isSigningIn: false })
        }
    },

    signout: async () => {
        set({ isSigningOut: true })
        try {
            await axiosInstance.post("/signout")
            set({ authUser: null })
            toast.success("Signed out successfully")
        } catch (error) {
            console.error("Error while siging out: ", error)
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isSigningOut: false })
        }

    },

    checkAuth: async () => {
        set({ isCheckingAuth: true })
        try {
            const res = await axiosInstance.get("/check")
            const { user } = res.data 
            set({ authUser: user })
        } catch (error) {
            console.error(error)
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isCheckingAuth: false })
        }
    }
}))