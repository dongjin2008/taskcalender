import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function POST() {
  try {
    // Delete the current session
    await account.deleteSession("current");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
