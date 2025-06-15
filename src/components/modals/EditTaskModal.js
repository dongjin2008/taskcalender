import React from "react";

const EditTaskModal = ({
  editTask,
  onBackdropClick,
  onClose,
  onSubmit,
  onChange
}) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };
  
  return (
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
              <h5 className="modal-title">일정 수정</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label htmlFor="editTaskTitle" className="form-label">
                    제목
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTaskTitle"
                    value={editTask.title || ""}
                    onChange={(e) =>
                      onChange({ ...editTask, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editTaskSubject" className="form-label">
                    과목
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTaskSubject"
                    value={editTask.subject || ""}
                    onChange={(e) =>
                      onChange({ ...editTask, subject: e.target.value })
                    }
                    placeholder="과목을 입력하세요 (예: 수학, 과학)"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editTaskDate" className="form-label">
                    날짜
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="editTaskDate"
                    value={editTask.date || ""}
                    onChange={(e) =>
                      onChange({ ...editTask, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editTaskDescription" className="form-label">
                    설명 (선택)
                  </label>
                  <textarea
                    className="form-control"
                    id="editTaskDescription"
                    rows="3"
                    value={editTask.description || ""}
                    onChange={(e) =>
                      onChange({
                        ...editTask,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    저장
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

export default EditTaskModal;