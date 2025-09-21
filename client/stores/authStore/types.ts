

export interface User {
    id: string
    name: string
    email: string
    role: "STUDENT" | "INSTRUCTOR"
}


export type authState = {
    authUser: User | null
    isSigningUp: boolean
    isSigningIn: boolean
    isSigningOut: boolean
    isCheckingAuth: boolean
}

export type authAction = {
    signup: (data: { name: string, email: string, password: string, role: "STUDENT" | "INSTRUCTOR" }) => Promise<void>
    signin: (data: { email: string, password: string, role: "STUDENT" | "INSTRUCTOR" }) => Promise<void>
    signout: () => void,
    checkAuth: () => void
}