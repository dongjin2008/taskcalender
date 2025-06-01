import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Create a session using the Appwrite SDK
    const session = await account.createEmailSession(email, password);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "로그인 성공",
      userId: session.userId,
    });
  } catch (error) {
    console.error("Login error:", error);

    // More specific error messages
    let errorMessage = "로그인 실패: 이메일이나 비밀번호가 올바르지 않습니다";
    let statusCode = 401;

    if (error.code === 429) {
      errorMessage = "너무 많은 로그인 시도. 잠시 후 다시 시도하세요.";
    } else if (error.code === 503) {
      errorMessage =
        "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.";
      statusCode = 503;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
