

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
    isCheckingAuth: boolean
}

export type authAction = {
    signup: (data: { name: string, email: string, password: string, role: "STUDENT" | "INSTRUCTOR" }) => void
    signin: (data: { email: string, password: string, role: "STUDENT" | "INSTRUCTOR" }) => void
    signout: () => void,
    checkAuth: () => void
}