import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Get the session cookie from the request
    const sessionCookie = cookies().get("appwrite-session");

    // If no session cookie, not authenticated
    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Try to get current account info using the server-side Appwrite client
    // This uses the session cookie automatically
    const user = await account.get();
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Expected error if not logged in
    return NextResponse.json({ isAuthenticated: false });
  }
}
