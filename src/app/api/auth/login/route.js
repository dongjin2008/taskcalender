import { NextResponse } from "next/server";
import { account } from "@/lib/appwrite";

export async function POST(request) {
  try {
    // Log that the API was called
    console.log("Login API called");

    // Parse the request body
    const { email, password } = await request.json();
    console.log(`Login attempt for email: ${email}`);

    // Validate inputs before proceeding
    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // Try to create a session
    const session = await account.createEmailPasswordSession(email, password);
    console.log("Session created successfully:", session.userId);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "로그인 성공",
      userId: session.userId,
    });
  } catch (error) {
    // Log detailed error information
    console.error("Login API error:", {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
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
