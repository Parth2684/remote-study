import { signoutAction } from "@/actions/signout";
import { NextResponse } from "next/server";


export const POST = async () => {
    try {
        await signoutAction();
        
        return NextResponse.json(
            { msg: "Logged out successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error while siging out: ", error)
        return NextResponse.json(
            { msg: "Internal server error" },
            { status: 500 }
        )
    }
}
