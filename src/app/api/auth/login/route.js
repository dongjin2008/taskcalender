import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function POST(request) {
  try {
    console.log("Login API called");
    const { email, password } = await request.json();

    console.log(`Attempting login for email: ${email}`);

    // Delete any existing sessions first to prevent conflicts
    try {
      await account.deleteSession("current");
      console.log("Deleted existing session");
    } catch (e) {
      // Expected error if no current session
      console.log("No existing session to delete");
    }

    // Create a new session
    const session = await account.createEmailSession(email, password);
    console.log("New session created:", session.userId);

    // Explicitly log cookie information for debugging
    // Note: Appwrite handles cookies automatically, but we want to verify
    // Create success response
    return NextResponse.json({
      success: true,
      message: "로그인 성공",
      userId: session.userId,
    });
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
    });

    // More specific error messages
    let errorMessage = "로그인 실패: 이메일이나 비밀번호가 올바르지 않습니다";
    let statusCode = 401;

    if (error.code === 429) {
      errorMessage = "너무 많은 로그인 시도. 잠시 후 다시 시도하세요.";
    } else if (error.code === 503) {
      errorMessage =
        "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.";
      statusCode = 503;
    } else if (error.code === 400) {
      errorMessage = "유효하지 않은 이메일 또는 비밀번호입니다.";
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
