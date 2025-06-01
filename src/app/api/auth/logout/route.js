import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function POST() {
  try {
    // Delete the current session
    await account.deleteSession("current");

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
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
