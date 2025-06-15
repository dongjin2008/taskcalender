import React from "react";

const AddTaskModal = ({
  newTask,
  classOptions,
  onBackdropClick,
  onClose,
  onSubmit,
  onChange
}) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };
  
  const handleClassChange = (classId) => {
    // Check if the class is already included
    const updatedClasses = newTask.class?.includes(classId)
      ? newTask.class.filter(c => c !== classId)
      : [...(newTask.class || []), classId];
      
    onChange({
      ...newTask,
      class: updatedClasses
    });
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
              <h5 className="modal-title">새 일정 추가</h5>
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
                  <label htmlFor="taskTitle" className="form-label">
                    제목
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="taskTitle"
                    value={newTask.title || ""}
                    onChange={(e) =>
                      onChange({ ...newTask, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="taskSubject" className="form-label">
                    과목
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="taskSubject"
                    value={newTask.subject || ""}
                    onChange={(e) =>
                      onChange({ ...newTask, subject: e.target.value })
                    }
                    placeholder="과목을 입력하세요 (예: 수학, 과학)"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="taskDate" className="form-label">
                    날짜
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="taskDate"
                    value={newTask.date || ""}
                    onChange={(e) =>
                      onChange({ ...newTask, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="taskDescription" className="form-label">
                    설명 (선택)
                  </label>
                  <textarea
                    className="form-control"
                    id="taskDescription"
                    rows="3"
                    value={newTask.description || ""}
                    onChange={(e) =>
                      onChange({
                        ...newTask,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">적용 대상 반</label>
                  <div>
                    {classOptions.map((option) => (
                      <div
                        className="form-check form-check-inline"
                        key={option.id}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`class-${option.id}`}
                          value={option.id}
                          checked={newTask.class?.includes(option.id) || false}
                          onChange={() => handleClassChange(option.id)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`class-${option.id}`}
                        >
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    닫기
                  </button>
                  <button type="submit" className="btn btn-primary">
                    추가
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

export default AddTaskModal;