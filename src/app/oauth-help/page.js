"use client";

import { useState } from "react";

export default function GoogleAuthDevHelp() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="container my-5">
      <h1>Google Calendar 통합 개발자 도움말</h1>

      <div className="alert alert-warning">
        <h4>테스트 계정 설정 필요</h4>
        <p>
          <strong>오류 메시지를 보고 계신가요?</strong>
          <br />
          "taskcalender has not completed the Google verification process..."
        </p>
        <button
          className="btn btn-outline-dark"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? "도움말 닫기" : "해결 방법 보기"}
        </button>
      </div>

      {showHelp && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">테스트 사용자 추가하기</h5>

            <ol className="list-group list-group-numbered mb-4">
              <li className="list-group-item">
                <a
                  href="https://console.cloud.google.com/apis/credentials/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-bold"
                >
                  Google Cloud Console OAuth 동의 화면
                </a>
                으로 이동하세요.
              </li>
              <li className="list-group-item">프로젝트를 선택하세요.</li>
              <li className="list-group-item">
                "테스트 사용자" 섹션을 찾아 "테스트 사용자 추가" 버튼을
                클릭하세요.
              </li>
              <li className="list-group-item">
                현재 사용 중인 Google 계정 이메일을 입력하세요.
              </li>
              <li className="list-group-item">"저장" 버튼을 클릭하세요.</li>
              <li className="list-group-item">
                변경사항이 적용되기까지 몇 분 정도 기다리세요.
              </li>
              <li className="list-group-item">
                브라우저를 새로고침하고 다시 시도하세요.
              </li>
            </ol>

            <div className="alert alert-info">
              <p className="mb-0">
                <i className="bi bi-info-circle me-2"></i>이 과정은 개발
                환경에서만 필요합니다. 프로덕션 환경에서는 Google의 검증
                프로세스를 거쳐야 합니다.
              </p>
            </div>

            <p>
              <small className="text-muted">
                자세한 내용은 <code>/GOOGLE_AUTH_TESTING.md</code> 파일을
                참조하세요.
              </small>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
