import { create } from "zustand"
import { authAction, authState } from "./types"
import { axiosInstance } from "../../lib/axiosInstance"
import { toast } from "react-hot-toast"
import { AxiosError } from "axios"

export const useAuthStore = create<authState & authAction>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isSigningIn: false,
    isSigningOut: false,
    isCheckingAuth: false,
    isSettingPassword: false,

   signup: async (data) => {
    set({ isSigningUp: true });
        try {
            let res;

            if (data.role === "STUDENT") {
                // Only send name and email
                res = await axiosInstance.post("/student/signup", {
                    name: data.name,
                    email: data.email,
                });
            } else {
                // Instructor flow may differ — adjust if backend differs
                res = await axiosInstance.post("/instructor/signup", data);
            }

            toast.success(res.data.message || "Signup successful. Check your email.");

            // DO NOT SET AUTH USER — backend does not return user
            // set({ authUser: res.data.user }) ❌ REMOVE

        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isSigningUp: false });
        }
    },

     setPassword: async (data: { token: string; password: string; confirmPassword: string }) => {
        set({ isSettingPassword: true });
        try {
            const res = await axiosInstance.post(`/student/set-password?token=${data.token}`, {
                password: data.password,
                confirmPassword: data.confirmPassword
            });
            set({ authUser: res.data.user });
            toast.success("Password set successfully! Please sign in.");
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Unexpected error");
            }
        } finally {
            set({ isSettingPassword: false });
        }
    },

    signin: async (data) => {
        set({ isSigningIn: true })
        try {
            if(data.role === "STUDENT"){
                const res = await axiosInstance.post("/student/signin", data)
                set({ authUser: res.data.student })
                console.log("auth user: ", get().authUser)
                toast.success("Signed in successfully")
            }
            else {
                const res = await axiosInstance.post("/instructor/signin", data)
                const { user } = res.data 
                set({ authUser: user })
                console.log("auth user: ", get().authUser)
                toast.success("Signed in successfully")
            }
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