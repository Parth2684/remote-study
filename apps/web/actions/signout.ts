"use server"

import { cookies } from "next/headers"
import { NextResponse } from "next/server"


export const signoutAction = async () => {
    (await cookies()).delete("session")
    return new NextResponse(null, {
        status: 204
    })
}   