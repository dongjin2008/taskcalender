import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookiesList = cookies();
    const cookiesWithoutValues = [...cookiesList.getAll()].map((cookie) => {
      // Return cookie names only for security
      return {
        name: cookie.name,
        // Show only first 4 chars of value for debugging
        partialValue: cookie.value ? `${cookie.value.substring(0, 4)}...` : "",
        path: cookie.path || "/",
        secure: !!cookie.secure,
        httpOnly: !!cookie.httpOnly,
      };
    });

    // Find Appwrite session cookie
    const appwriteProjectId = process.env.APPWRITE_PROJECT_ID || "";
    const appwriteCookieName = appwriteProjectId
      ? `a_session_${appwriteProjectId}`
      : "";
    const hasAppwriteCookie = cookiesWithoutValues.some(
      (c) => c.name === appwriteCookieName
    );

    return NextResponse.json({
      cookies: cookiesWithoutValues,
      appwriteProjectId: appwriteProjectId
        ? `${appwriteProjectId.substring(0, 4)}...`
        : "Not set",
      appwriteCookieName,
      hasAppwriteCookie,
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      cookies: [],
    });
  }
}
