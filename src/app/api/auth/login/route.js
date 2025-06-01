import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Create a session
    const session = await account.createEmailSession(email, password);

    // Return success with cookie already handled by Appwrite
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인 실패: 이메일이나 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    );
  }
}
