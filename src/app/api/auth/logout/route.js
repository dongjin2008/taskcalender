import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function POST() {
  try {
    console.log("Logout API called");

    // Check if account is properly initialized
    if (!account) {
      throw new Error("Appwrite account service not initialized");
    }

    try {
      // Try to delete the current session
      await account.deleteSession("current");
      console.log("Session deleted successfully");
    } catch (sessionError) {
      console.log("No active session to delete or error:", sessionError);
      // Continue anyway - we still want to clear client state
    }

    // Create response
    const response = NextResponse.json({ success: true });

    // Get the Appwrite cookie name (based on project ID)
    const cookieName = process.env.APPWRITE_PROJECT_ID
      ? `a_session_${process.env.APPWRITE_PROJECT_ID}`
      : null;

    // Clear the cookie if we know its name
    if (cookieName) {
      // Clear the cookie by setting it to expire in the past
      response.cookies.set({
        name: cookieName,
        value: "",
        expires: new Date(0),
        path: "/",
      });

      console.log(`Cleared cookie: ${cookieName}`);
    } else {
      console.warn("Could not determine Appwrite cookie name for clearing");
    }

    return response;
  } catch (error) {
    console.error("Logout error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
    });

    // Return an error, but with 200 status so the client still "logs out"
    return NextResponse.json(
      {
        success: false,
        error: "서버에서 로그아웃 실패했지만, 로컬 로그아웃은 완료됐습니다.",
      },
      { status: 200 }
    );
  }
}
