import { NextResponse } from "next/server";
import { account, ID } from "@/lib/appwrite";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Create a new user account
    const user = await account.create(ID.unique(), email, password, name);

    // Log the successful registration for debugging
    console.log("Registration successful:", user.$id);

    try {
      // Create a session
      const session = await account.createEmailPasswordSession(email, password);

      // Return success
      return NextResponse.json({
        success: true,
        userId: user.$id,
        message: "계정 생성 및 로그인 성공",
      });
    } catch (sessionError) {
      console.error("Session creation error:", sessionError);

      return NextResponse.json({
        success: true,
        userId: user.$id,
        message:
          "계정은 생성되었으나 자동 로그인에 실패했습니다. 로그인 해주세요.",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);

    let errorMessage = "계정 생성 실패";
    let statusCode = 400;

    if (error.code === 409) {
      errorMessage = "이미 사용 중인 이메일입니다.";
      statusCode = 409;
    } else if (error.code === 400) {
      errorMessage = "유효하지 않은 이메일 또는 비밀번호입니다.";
      statusCode = 400;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
