import React, { useState } from "react";

const BulkTaskUpload = ({ classOptions, onBulkAdd, onClose }) => {
  const [tasks, setTasks] = useState("");
  const [selectedClass, setSelectedClass] = useState(classOptions[0].id);
  const [subject, setSubject] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleTasksChange = (e) => {
    setTasks(e.target.value);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Parse tasks from text area
      // Format: 제목|날짜(YYYY-MM-DD)|설명(optional)
      const taskList = tasks
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split("|");
          return {
            title: parts[0]?.trim() || "제목 없음",
            date: parts[1]?.trim() || new Date().toISOString().split("T")[0],
            description: parts[2]?.trim() || "",
            subject,
            class: [selectedClass],
          };
        });

      // Create all tasks
      const createdTasks = [];
      const failedTasks = [];

      for (const task of taskList) {
        try {
          await onBulkAdd(task);
          createdTasks.push(task);
        } catch (error) {
          failedTasks.push({ task, error: error.message });
        }
      }

      // Show results
      setResults({
        total: taskList.length,
        created: createdTasks.length,
        failed: failedTasks.length,
        failedItems: failedTasks,
      });

      // Clear form if everything succeeded
      if (failedTasks.length === 0) {
        setTasks("");
      }
    } catch (error) {
      console.error("Error processing bulk tasks:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">일정 일괄 추가</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">적용 대상 반</label>
                  <select
                    className="form-select"
                    value={selectedClass}
                    onChange={handleClassChange}
                  >
                    {classOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">과목 (모든 일정에 적용)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="과목명 (예: 수학)"
                    value={subject}
                    onChange={handleSubjectChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">일정 목록</label>
                  <div className="form-text mb-2">
                    각 줄에 하나의 일정을 입력하세요. 형식:
                    제목|날짜(YYYY-MM-DD)|설명(선택)
                    <br />
                    예시: <code>수학 시험|2025-06-25|1학기 기말고사</code>
                  </div>
                  <textarea
                    className="form-control font-monospace"
                    rows="10"
                    value={tasks}
                    onChange={handleTasksChange}
                    placeholder="수학 숙제|2025-06-22|연습문제 1-10번&#10;영어 단어 시험|2025-06-23|&#10;과학 프로젝트 제출|2025-06-30|조별 활동 결과물"
                    required
                  ></textarea>
                </div>

                {results && (
                  <div
                    className={`alert ${
                      results.failed > 0 ? "alert-warning" : "alert-success"
                    }`}
                  >
                    <h6>처리 결과</h6>
                    <div>전체: {results.total}개</div>
                    <div>성공: {results.created}개</div>
                    <div>실패: {results.failed}개</div>

                    {results.failed > 0 && (
                      <div className="mt-2">
                        <h6>실패한 항목:</h6>
                        <ul>
                          {results.failedItems.map((item, index) => (
                            <li key={index}>
                              {item.task.title} ({item.error})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isProcessing || !tasks.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        처리중...
                      </>
                    ) : (
                      "일괄 추가"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkTaskUpload;
