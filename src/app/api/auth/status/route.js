import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";
import { cookies } from "next/headers";

export async function GET() {
  try {
    console.log("Auth status check called");

    // Check if account service is initialized
    if (!account) {
      console.error("Appwrite account service not initialized");
      return NextResponse.json({
        isAuthenticated: false,
        error: "Service not initialized",
      });
    }

    // Try to get current account info
    const user = await account.get();
    console.log("User authenticated:", user.$id);

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
    console.log("Auth status check failed:", error.message);

    // Expected error if not logged in
    return NextResponse.json({
      isAuthenticated: false,
    });
  }
}
