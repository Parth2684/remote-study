export interface User {
    id: string
    email: string
    name: string
    role: "STUDENT" | "INSTRUCTOR"
}
  
export function getCurrentUser(): User | null {
try {
    if (typeof window === "undefined") {
    return null // Server-side rendering
    }

    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
    return null
    }

    return JSON.parse(currentUser) as User
} catch (error) {
    console.log("[v0] Error getting current user:", error)
    return null
}
}

export function signOut(): void {
if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
}
}

export function isAuthenticated(): boolean {
return getCurrentUser() !== null
}
