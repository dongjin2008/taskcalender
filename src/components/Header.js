import { useState } from "react";

export function Header({
  viewedClass,
  isTeacherUser,
  isVerified,
  onLogin,
  onLogout,
  onClientLogout,
  children,
}) {
  return (
    <div className="d-flex flex-column mb-4">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center me-auto">
          <h1 className="mb-0 me-3 fs-4 fs-md-3">{viewedClass}반 달력</h1>
          {children}
        </div>
        {isTeacherUser ? (
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
            <div className="d-flex flex-wrap align-items-center">
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
            <button className="btn btn-primary" onClick={onLogin}>
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
