import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { taskSyncHelper } from "@/lib/taskSyncHelper";

const GoogleCalendarConnect = ({ onConnect, onDisconnect, isConnected }) => {
  const [connectionStatus, setConnectionStatus] = useState(
    isConnected || false
  );
  const [userEmail, setUserEmail] = useState("");
  const [isFirstSync, setIsFirstSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check if user has a stored token on component mount
  useEffect(() => {
    const token = localStorage.getItem("googleCalendarToken");
    const email = localStorage.getItem("googleCalendarEmail");
    const hasCompletedInitialSync = localStorage.getItem(
      "googleCalendarInitialSyncComplete"
    );

    if (token) {
      setConnectionStatus(true);
      setUserEmail(email || "");
      setIsFirstSync(!hasCompletedInitialSync);

      // Notify parent component
      if (onConnect) onConnect(token);
    }
  }, [onConnect]);

  // Google OAuth login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Save token to localStorage
        localStorage.setItem("googleCalendarToken", tokenResponse.access_token);
        setIsSyncing(true);

        // Get user info to display email
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        ).then((res) => res.json());

        if (userInfo.email) {
          localStorage.setItem("googleCalendarEmail", userInfo.email);
          setUserEmail(userInfo.email);
        }

        // Update state
        setConnectionStatus(true);
        setIsFirstSync(true);

        // Notify parent component
        if (onConnect) onConnect(tokenResponse.access_token);

        // Sync existing tasks after connection
        try {
          await taskSyncHelper.syncExistingTasksForSelectedClasses(
            tokenResponse.access_token
          );
          // Mark initial sync as complete
          localStorage.setItem("googleCalendarInitialSyncComplete", "true");
        } catch (syncError) {
          console.error("Error syncing existing tasks:", syncError);
        } finally {
          setIsSyncing(false);
          setIsFirstSync(false);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setIsSyncing(false);
      }
    },
    onError: (error) => {
      console.error("Google Calendar login failed:", error);

      // Check for common errors
      if (
        error.error === "idpiframe_initialization_failed" ||
        error.error === "popup_closed_by_user" ||
        error.error_description?.includes("verification")
      ) {
        alert(
          "Google 로그인 오류: Google Cloud Console에서 테스트 사용자로 등록되지 않았습니다.\n\n" +
            "관리자에게 Google Cloud Console > OAuth 동의 화면 > 테스트 사용자에 이메일을 추가해달라고 요청하세요."
        );
      } else {
        alert("Google 로그인에 실패했습니다. 다시 시도해주세요.");
      }
    },
    // Use the same scopes as configured in your Google Cloud Console
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
    // Flow should match what's configured in Google Cloud Console
    flow: "implicit",
    // Make sure this matches what's configured in your Google Cloud Console
    ux_mode: "popup",
  });

  // Disconnect from Google Calendar
  const handleDisconnect = async () => {
    // Ask user if they want to remove events from Google Calendar
    const shouldCleanup = confirm(
      "구글 캘린더 연결을 해제하시겠습니까? 이 앱에서 생성된 구글 캘린더의 모든 일정을 삭제할까요?"
    );

    if (shouldCleanup) {
      try {
        setIsSyncing(true);

        // Get token before we remove it
        const accessToken = localStorage.getItem("googleCalendarToken");

        // Import required modules for cleanup
        const { googleCalendarUtils } = await import(
          "@/utils/googleCalendarUtils"
        );
        const { databases, AppwriteConfig } = await import("@/lib/appwrite");

        // Clean up all Google Calendar events
        await googleCalendarUtils.cleanupGoogleCalendarEvents({
          accessToken,
          databases,
          databaseId: AppwriteConfig.databaseId,
          collectionId: AppwriteConfig.calendarEventsCollectionId,
        });

        // Show success message
        alert(
          "구글 캘린더에서 모든 일정이 삭제되었으며 연결이 해제되었습니다."
        );
      } catch (error) {
        console.error("Error cleaning up Google Calendar events:", error);
        alert(
          "구글 캘린더 일정 정리 중 오류가 발생했습니다. 연결은 해제되었습니다."
        );
      } finally {
        setIsSyncing(false);
      }
    }

    // Clear saved tokens
    localStorage.removeItem("googleCalendarToken");
    localStorage.removeItem("googleCalendarEmail");
    localStorage.removeItem("googleCalendarInitialSyncComplete");

    // Update state
    setConnectionStatus(false);
    setUserEmail("");
    setIsFirstSync(false);

    // Notify parent component
    if (onDisconnect) onDisconnect();
  };

  return (
    <div className="google-calendar-connect mt-3 mb-3">
      {connectionStatus ? (
        <div className="d-flex align-items-center">
          <span className="me-2">
            <i className="bi bi-calendar-check text-success"></i> 구글 캘린더
            연결됨
            {userEmail && (
              <small className="text-muted ms-2">({userEmail})</small>
            )}
          </span>
          {isSyncing && (
            <span className="text-muted me-2">
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              기존 일정 동기화 중...
            </span>
          )}
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDisconnect}
            disabled={isSyncing}
          >
            연결 해제
          </button>
        </div>
      ) : (
        <div>
          <button className="btn btn-outline-primary" onClick={() => login()}>
            <i className="bi bi-google me-2"></i> 구글 캘린더 연결하기
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
