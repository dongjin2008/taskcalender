"use client";

import ReactDOM from "react-dom";

export function AuthModal({
  authMode,
  authForm,
  isAuthLoading,
  onBackdropClick,
  onClose,
  onModeChange,
  onFormChange,
  onLogin,
  onRegister
}) {
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onBackdropClick}>
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1040,
        }}
      ></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {authMode === "login" ? "교사 로그인" : "교사 등록"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={authMode === "login" ? onLogin : onRegister}
              >
                {authMode === "register" && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="teacherName" className="form-label">
                        이름
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="teacherName"
                        value={authForm.name}
                        onChange={(e) =>
                          onFormChange({ ...authForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3 small text-muted">
                      가입 후 관리자의 승인이 필요합니다. 승인 전에는 일부 기능이 제한됩니다.
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="teacherEmail" className="form-label">
                    이메일
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="teacherEmail"
                    value={authForm.email}
                    onChange={(e) =>
                      onFormChange({ ...authForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="teacherPassword" className="form-label">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="teacherPassword"
                    value={authForm.password}
                    onChange={(e) =>
                      onFormChange({
                        ...authForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={onModeChange}
                  >
                    {authMode === "login"
                      ? "계정이 없습니까? 등록하세요."
                      : "계정이 이미 있습니까? 로그인하세요."}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isAuthLoading}
                  >
                    {isAuthLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        {authMode === "login"
                          ? "로그인 중..."
                          : "등록 중..."}
                      </>
                    ) : authMode === "login" ? (
                      "로그인"
                    ) : (
                      "등록"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}