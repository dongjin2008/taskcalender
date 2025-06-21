import GoogleCalendarConnect from "./GoogleCalendarConnect";
import { useState } from "react";

export function Header({
  viewedClass,
  isTeacherUser,
  isVerified,
  onLogin,
  onLogout,
  onClientLogout,
  onGoogleCalendarConnect,
  children,
}) {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const handleGoogleConnect = (token) => {
    setIsGoogleConnected(true);
    if (onGoogleCalendarConnect) {
      onGoogleCalendarConnect(token);
    }
  };

  const handleGoogleDisconnect = () => {
    setIsGoogleConnected(false);
    if (onGoogleCalendarConnect) {
      onGoogleCalendarConnect(null);
    }
  };

  // Helper function to render the Google Calendar connection UI
  const renderGoogleCalendarConnect = () => (
    <div
      className="mt-2 mt-md-0"
      style={{ minWidth: isTeacherUser ? "auto" : "0" }}
    >
      <GoogleCalendarConnect
        onConnect={handleGoogleConnect}
        onDisconnect={handleGoogleDisconnect}
        isConnected={isGoogleConnected}
      />
    </div>
  );

  return (
    <div className="d-flex flex-column mb-4">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center me-auto">
          <h1 className="mb-0 me-3 fs-4 fs-md-3">{viewedClass}반 달력</h1>
          {children}
        </div>
        {isTeacherUser ? (
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
            {renderGoogleCalendarConnect()}
            <div className="d-flex flex-wrap align-items-center mt-2 mt-md-0 ms-md-2">
              <div className="me-2 text-nowrap">
                교사 로그인됨{" "}
                {!isVerified && (
                  <span className="badge bg-warning">관리자 승인 대기중</span>
                )}
              </div>
              <button
                className="btn btn-outline-secondary btn-sm mt-1 mt-md-0"
                // Try the regular logout, but if it fails, use client logout
                onClick={() => {
                  try {
                    onLogout();
                  } catch (error) {
                    console.error(
                      "Regular logout failed, using client logout",
                      error
                    );
                    onClientLogout();
                  }
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center ms-auto">
            {renderGoogleCalendarConnect()}
            <button
              className="btn btn-primary ms-md-2 mt-2 mt-md-0"
              onClick={onLogin}
            >
              교사 로그인
            </button>
          </div>
        )}
      </div>

      {isTeacherUser && !isVerified && (
        <div className="verification-banner alert alert-warning mt-2 py-2 mb-0 text-center">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>
          계정이 관리자의 승인을 기다리고 있습니다. 승인 후에 일정을
          추가/수정/삭제할 수 있습니다.
        </div>
      )}
    </div>
  );
}
