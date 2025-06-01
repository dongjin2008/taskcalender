import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function GET() {
  try {
    // Try to get current account info - will fail if not logged in
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
    // Expected error if not logged in
    return NextResponse.json(
      {
        isAuthenticated: false,
        error: "Not authenticated",
      },
      { status: 401 }
    );
  }
}

// In your login handler
console.log("Login form data:", authForm);
