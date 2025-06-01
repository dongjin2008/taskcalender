import { NextResponse } from "next/server";
import { account, ID } from "@/lib/appwrite";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Create a new user account
    const user = await account.create(ID.unique(), email, password, name);

    // Create a session
    await account.createEmailSession(email, password);

    return NextResponse.json({ success: true, userId: user.$id });
  } catch (error) {
    console.error("Registration error:", error);

    // More detailed error message
    let errorMessage = "계정 생성 실패";
    if (error.code === 409) {
      errorMessage = "이미 사용 중인 이메일입니다.";
    } else if (error.code === 400) {
      errorMessage = "유효하지 않은 이메일 또는 비밀번호입니다.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error.code || 500 }
    );
  }
}
