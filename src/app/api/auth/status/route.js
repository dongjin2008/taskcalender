import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function GET() {
  try {
    // Try to get current account info using the server-side Appwrite client
    const user = await account.get();

    // Return authenticated status with minimal user info
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Not authenticated:", error);

    // Expected error if not logged in
    return NextResponse.json({
      isAuthenticated: false,
    });
  }
}
