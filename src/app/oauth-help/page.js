"use client";

import { useState } from "react";

export default function GoogleAuthDevHelp() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="container my-4 px-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10">
          <h1 className="mb-4 fs-2 fw-bold">Google Calendar 통합 도움말</h1>

          <div className="alert alert-warning p-4 shadow-sm">
            <h4 className="alert-heading mb-3">테스트 계정 설정 필요</h4>
            <p className="mb-3">
              <strong>오류 메시지를 보고 계신가요?</strong>
              <br />
              <span className="text-danger">
                &quot;taskcalender has not completed the Google verification
                process...&quot;
              </span>
            </p>
            <button
              className="btn btn-outline-dark px-4 py-2"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? (
                <>
                  <i className="bi bi-chevron-up me-2"></i>
                  도움말 닫기
                </>
              ) : (
                <>
                  <i className="bi bi-chevron-down me-2"></i>
                  해결 방법 보기
                </>
              )}
            </button>
          </div>

          {showHelp && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-4 border-bottom pb-2">
                  테스트 사용자 추가하기
                </h5>

                <ol className="list-group list-group-numbered mb-4 gap-2">
                  <li className="list-group-item d-flex align-items-start border-start border-4 border-primary ps-3 bg-light">
                    <div className="text-break">
                      <a
                        href="https://console.cloud.google.com/apis/credentials/consent"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fw-bold text-primary"
                      >
                        Google Cloud Console OAuth 동의 화면
                      </a>
                      으로 이동하세요.
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-start bg-light">
                    <div>프로젝트를 선택하세요.</div>
                  </li>
                  <li className="list-group-item d-flex align-items-start bg-light">
                    <div className="text-break">
                      <span className="fw-medium d-inline-block">
                        &quot;테스트 사용자&quot;
                      </span>{" "}
                      섹션을 찾아{" "}
                      <span className="fw-medium d-inline-block">
                        &quot;테스트 사용자 추가&quot;
                      </span>{" "}
                      버튼을 클릭하세요.
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-start bg-light">
                    <div>현재 사용 중인 Google 계정 이메일을 입력하세요.</div>
                  </li>
                  <li className="list-group-item d-flex align-items-start bg-light">
                    <div>
                      <span className="fw-medium">&quot;저장&quot;</span> 버튼을
                      클릭하세요.
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-start bg-light">
                    <div>변경사항이 적용되기까지 몇 분 정도 기다리세요.</div>
                  </li>
                  <li className="list-group-item d-flex align-items-start bg-light">
                    <div>브라우저를 새로고침하고 다시 시도하세요.</div>
                  </li>
                </ol>

                <div className="alert alert-info p-3 d-flex">
                  <i className="bi bi-info-circle fs-4 me-3 text-primary"></i>
                  <p className="mb-0">
                    이 과정은 개발 환경에서만 필요합니다. 프로덕션 환경에서는
                    Google의 검증 프로세스를 거쳐야 합니다.
                  </p>
                </div>

                <p className="mt-4 text-end">
                  <small className="text-muted fst-italic">
                    자세한 내용은{" "}
                    <code className="bg-light px-2 py-1 rounded">
                      /GOOGLE_AUTH_TESTING.md
                    </code>{" "}
                    파일을 참조하세요.
                  </small>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
