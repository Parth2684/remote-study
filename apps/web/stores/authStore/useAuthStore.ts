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
                res = await axiosInstance.post("/student/signup", {
                    name: data.name,
                    email: data.email,
                });
            } else {
                res = await axiosInstance.post("/instructor/signup", {
                    name: data.name,
                    email: data.email
                })
            }

            toast.success(res.data.message || "Signup successful. Check your email.");
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

    setPassword: async (data: { token: string; password: string; confirmPassword: string, role: string }) => {
        set({ isSettingPassword: true });
        try {
            const endpoint =
                data.role === "STUDENT"
                    ? "/student/set-password"
                    : "/instructor/set-password"

            const res = await axiosInstance.post(
                `${endpoint}?token=${data.token}`,
                {
                    password: data.password,
                    confirmPassword: data.confirmPassword
                }
            )
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
            const user = get().authUser

            if (!user) {
            throw new Error("No authenticated user")
            }

            const endpoint =
            user.role === "STUDENT"
                ? "/student/signout"
                : "/instructor/signout"

            await axiosInstance.post(endpoint)

            set({ authUser: null })
            toast.success("Signed out successfully")
        } catch (error) {
            console.error("Error while signing out: ", error)
            if (error instanceof AxiosError && error.response?.data?.message) {
            toast.error(error.response.data.message as string)
            } else {
            toast.error("An unexpected error occurred.")
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
            // if (error instanceof AxiosError && error.response?.data?.message) {
            //     toast.error(error.response.data.message as string);
            // } else {
            //     toast.error("An unexpected error occurred.");
            // }
        } finally {
            set({ isCheckingAuth: false })
        }
    }
}))